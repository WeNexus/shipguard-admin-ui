import {
  Badge,
  Banner,
  BlockStack,
  Card,
  Page,
  SkeletonBodyText,
  Text,
} from "@shopify/polaris";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ApiError, apiFetch } from "../../lib/api-client";
import StoreSelect from "../../components/common/store-select";
import type { StoreOption } from "../../components/common/type";
import SenderSettingsCard, { SmtpConnectionFields } from "./sender-settings-card";
import EmailTemplatesCard from "./email-templates/email-templates-card";
import TestEmailCard from "./test-email-card";
import VerdictCard, { applyTestResult } from "./support/verdict-card";
import EmailDeliveryCard from "./support/email-delivery-card";
import { TechnicalDetails } from "./support/support-message";
import type { AdminTestEmailResult, StoreEmailTemplates, StoreSenderDetail } from "./type";
import { SENDER_KIND_META } from "./type";

const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString() : null;

/** Everything the support-facing cards replaced — kept, collapsed, for engineers. */
function EngineerDetails({ detail }: { detail: StoreSenderDetail }) {
  const meta = SENDER_KIND_META[detail.kind];
  const dates = [
    formatDate(detail.notification?.updatedAt) &&
      `Sender saved ${formatDate(detail.notification?.updatedAt)}`,
    formatDate(detail.smtp?.createdAt) && `SMTP created ${formatDate(detail.smtp?.createdAt)}`,
  ].filter(Boolean);

  return (
    <Card>
      <TechnicalDetails>
        <BlockStack gap="300">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={meta.tone}>{meta.label}</Badge>
            {detail.uninstalled && <Badge tone="warning">Uninstalled</Badge>}
            <span className="font-mono text-xs">{detail.summary}</span>
          </div>
          <Text as="p" variant="bodySm" tone="subdued">
            kind: {detail.kind} · verdict: {detail.verdict.state} · problems:{" "}
            {detail.verdict.problems.map((p) => p.code).join(", ") || "none"}
          </Text>
          {detail.issues.map((issue) => (
            <Text as="p" key={issue} variant="bodySm">
              {issue}
            </Text>
          ))}
          {dates.length > 0 && (
            <Text as="p" tone="subdued" variant="bodySm">
              {dates.join(" · ")}
            </Text>
          )}
          {/* A DEFAULT store can still hold a custom SMTP row from before it switched back. The
              merchant app hides it; it is irrelevant to delivery, so it lives only here. */}
          {detail.dormantCustomConfig && detail.smtp && (
            <BlockStack gap="100">
              <Text as="p" tone="subdued">
                Saved but inactive SMTP settings — the store is on the default sender.
              </Text>
              <SmtpConnectionFields smtp={detail.smtp} />
            </BlockStack>
          )}
        </BlockStack>
      </TechnicalDetails>
    </Card>
  );
}

/**
 * One store, top to bottom in the order support uses it: the answer, a way to prove it, which
 * emails go out, then the merchant's own screen for walking them through it, then raw details.
 * Keyed by domain so switching stores resets the tab and the test result.
 */
function StoreView({ detail }: { detail: StoreSenderDetail }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [test, setTest] = useState<AdminTestEmailResult | null>(null);
  const [templates, setTemplates] = useState<StoreEmailTemplates | null>(null);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    apiFetch<StoreEmailTemplates>("admin/notification-settings/email-templates", {
      query: { domain: detail.domain },
      signal: controller.signal,
    })
      .then((result) => {
        if (!controller.signal.aborted) setTemplates(result);
      })
      .catch((err) => {
        if (controller.signal.aborted || (err as Error)?.name === "AbortError") return;
        setTemplatesError(
          err instanceof ApiError ? err.message : "The email templates could not be loaded.",
        );
      });
    return () => controller.abort();
  }, [detail.domain]);

  return (
    <>
      <VerdictCard detail={detail} verdict={applyTestResult(detail.verdict, test)} test={test} />
      {!detail.uninstalled && <TestEmailCard detail={detail} onResult={setTest} />}
      <EmailDeliveryCard detail={detail} data={templates} />

      <BlockStack gap="100">
        <Text as="h2" variant="headingMd">
          What the merchant sees in their app
        </Text>
        <Text as="p" tone="subdued">
          A read-only copy of the merchant's ShipGuard → Settings → Notification page. Use it to
          walk them through the steps.
        </Text>
      </BlockStack>
      <SenderSettingsCard detail={detail} selectedTab={selectedTab} onSelectTab={setSelectedTab} />
      <EmailTemplatesCard data={templates} error={templatesError} selectedTab={selectedTab} />

      <EngineerDetails detail={detail} />
    </>
  );
}

/**
 * Check one store. The domain lives in `?domain=` so the problem list can deep-link here and a
 * support agent can paste the URL into a ticket.
 */
export default function StoreSenderSettings() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const selected = params.get("domain") ?? "";

  const [stores, setStores] = useState<StoreOption[]>([]);
  const [detail, setDetail] = useState<StoreSenderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inFlight = useRef<AbortController | null>(null);

  useEffect(() => {
    apiFetch<StoreOption[]>("admin/gql/stores")
      .then(setStores)
      .catch(() => setError("Failed to load the store list."));
  }, []);

  useEffect(() => {
    setDetail(null);
    if (!selected) {
      setLoading(false);
      return;
    }

    // Clicking through stores fast can land responses out of order (the Google lookup makes this
    // call slow); abort so store A's settings never paint under store B's name.
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;

    setLoading(true);
    setError(null);
    apiFetch<StoreSenderDetail>("admin/notification-settings/smtp/store", {
      query: { domain: selected },
      signal: controller.signal,
    })
      .then((data) => {
        if (!controller.signal.aborted) setDetail(data);
      })
      .catch((err) => {
        if (controller.signal.aborted || (err as Error)?.name === "AbortError") return;
        setError(
          err instanceof ApiError ? err.message : "The settings could not be loaded.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [selected]);

  return (
    <Page
      title="Check one store"
      subtitle="Are this store's emails working, and what should the merchant do?"
      backAction={{
        content: "Notification settings",
        onAction: () => navigate("/notification-settings"),
      }}
    >
      <BlockStack gap="400">
        <StoreSelect
          stores={stores}
          selected={selected}
          onChange={(domain) => setParams({ domain })}
        />

        {error && <Banner tone="critical">{error}</Banner>}

        {!selected && !error && (
          <Text as="p" tone="subdued">
            Pick a store above to check its emails.
          </Text>
        )}

        {loading && (
          <Card>
            <SkeletonBodyText lines={8} />
          </Card>
        )}

        {detail && !loading && <StoreView key={detail.domain} detail={detail} />}
      </BlockStack>
    </Page>
  );
}
