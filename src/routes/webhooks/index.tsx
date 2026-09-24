import {
  Badge,
  Banner,
  Button,
  InlineStack,
  Modal,
  Page,
  Text,
} from "@shopify/polaris";
import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, apiFetch } from "../../lib/api-client";
import StoreSelect from "../../components/common/store-select";
import type { StoreOption } from "../../components/common/type";
import ResetReport from "./reset-report";
import SubscriptionTable from "./subscription-table";
import type {
  WebhookResetReport,
  WebhookSubscriptionListResult,
  WebhookSubscriptionView,
  WebhookTransport,
} from "./type";
import { transportLabel } from "./type";

/**
 * Webhook re-registration for one store.
 *
 * Why it exists: nothing in production re-points an already-installed store. The prune that clears
 * stale subscriptions runs only inside the install-time registration pass, so a store installed
 * before the Pub/Sub cutover keeps its old HTTP subscriptions — pointing at hosts the app stopped
 * serving — until it happens to re-run OAuth. This is the manual lever for that.
 *
 * Flow: pick a store → its live subscriptions load immediately → read them → re-register. The read
 * is what makes the destructive action reviewable: the admin sees the dead destination before
 * deleting it, rather than trusting that one is there.
 */
export default function Webhooks() {
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [selected, setSelected] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [subscriptions, setSubscriptions] = useState<WebhookSubscriptionView[]>(
    [],
  );
  const [transport, setTransport] = useState<WebhookTransport | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [listing, setListing] = useState(false);

  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [report, setReport] = useState<WebhookResetReport | null>(null);

  /** Aborts the in-flight read when the selection changes — see the race note in `load`. */
  const inFlight = useRef<AbortController | null>(null);

  useEffect(() => {
    apiFetch<StoreOption[]>("admin/gql/stores")
      .then((data) => {
        setStores(data);
        // An empty list leaves the picker disabled rather than crashing, same as the GraphQL screen.
        setSelected(data[0]?.domain ?? "");
        setLoadError(null);
      })
      .catch((err) => {
        console.error("Failed to load stores:", err);
        setLoadError("Failed to load the store list.");
      });
  }, []);

  /**
   * Read the selected store's subscriptions.
   *
   * This is a live Admin API call per selection, not a database read, so two responses can land out
   * of order when someone clicks through stores quickly. Painting store B's subscriptions under store
   * A's name is the worst failure this screen has — the next click deletes against that impression —
   * so the previous request is aborted AND the resolved domain is re-checked before any state is set.
   */
  const load = useCallback((domain: string) => {
    if (!domain) {
      return;
    }

    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;

    setListing(true);
    setListError(null);

    apiFetch<WebhookSubscriptionListResult>("admin/webhooks/subscriptions", {
      query: { domain },
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) {
          return;
        }
        setTransport(result.transport);
        setSubscriptions(result.subscriptions);
        setListError(
          result.ok ? null : (result.error ?? "The store could not be read."),
        );
      })
      .catch((err) => {
        if (
          controller.signal.aborted ||
          (err as Error)?.name === "AbortError"
        ) {
          return;
        }
        setSubscriptions([]);
        setListError(
          err instanceof ApiError
            ? err.message
            : "The subscriptions could not be loaded.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setListing(false);
        }
      });
  }, []);

  useEffect(() => {
    setReport(null);
    setSubscriptions([]);
    load(selected);
    return () => inFlight.current?.abort();
  }, [selected, load]);

  const runReset = () => {
    setConfirming(false);
    setResetting(true);
    // Only the domain goes up. The ids on screen were fetched seconds ago; the server re-reads the
    // list and deletes what IT sees, so a subscription created in between cannot survive the wipe.
    apiFetch<WebhookResetReport>("admin/webhooks/reset", {
      method: "POST",
      body: { domain: selected },
    })
      .then((result) => {
        setReport(result);
        // Re-read rather than trusting `result.after`, so the table shows the store's real state.
        load(selected);
      })
      .catch((err) => {
        setReport({
          ok: false,
          transport: transport ?? "pubsub",
          error:
            err instanceof ApiError
              ? err.message
              : "The request could not be sent.",
          before: [],
          after: [],
          deleted: [],
          deleteFailures: [],
          skipped: [],
          missing: [],
        });
      })
      .finally(() => setResetting(false));
  };

  const deletable = subscriptions.filter(
    (subscription) => !subscription.isCompliance,
  );
  const busy = listing || resetting;

  return (
    <Page
      fullWidth
      title="Webhooks"
      subtitle="Delete a store's webhook subscriptions and register them again"
    >
      {loadError && (
        <div className="mb-3">
          <Banner tone="critical">{loadError}</Banner>
        </div>
      )}

      <StoreSelect
        stores={stores}
        selected={selected}
        onChange={setSelected}
        disabled={resetting}
      />

      <div className="mt-4">
        <SubscriptionTable
          title="Currently registered"
          subscriptions={subscriptions}
          transport={transport}
          loading={listing}
          error={listError}
        />
      </div>

      <div className="mt-4">
        <InlineStack gap="300" blockAlign="center">
          <Button
            variant="primary"
            tone="critical"
            // Disabled until the list resolves: the confirmation counts what is on screen, and a
            // count taken before the read would be a guess.
            disabled={!selected || busy || Boolean(listError)}
            loading={resetting}
            onClick={() => setConfirming(true)}
          >
            Delete all &amp; re-register
          </Button>
          {transport && (
            <Text as="span" tone="subdued" variant="bodySm">
              Will register on {transportLabel(transport)} — whatever the
              server's WEBHOOK_TRANSPORT resolves to, exactly as app install
              does.
            </Text>
          )}
        </InlineStack>
      </div>

      {report && (
        <div className="mt-4">
          <ResetReport report={report} />
        </div>
      )}

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Delete every webhook subscription?"
        primaryAction={{
          content: "Delete and re-register",
          destructive: true,
          onAction: runReset,
        }}
        secondaryActions={[
          { content: "Cancel", onAction: () => setConfirming(false) },
        ]}
      >
        <Modal.Section>
          <div className="flex flex-col gap-3">
            <Text as="p">
              This deletes <b>{deletable.length}</b> subscription
              {deletable.length === 1 ? "" : "s"} on{" "}
              <span className="font-mono text-sm">{selected}</span>, then
              registers the standard set again on{" "}
              {transport ? transportLabel(transport) : "the active transport"}.
            </Text>
            <Text as="p" tone="subdued">
              The three GDPR compliance topics are never touched.
              PRODUCTS_UPDATE is deleted and not re-created —{" "}
              <code>products/update</code> will stop arriving for this store.
            </Text>
            {subscriptions.some(
              (subscription) => subscription.isCompliance,
            ) && (
              <Badge tone="info">
                Compliance subscriptions will be left in place
              </Badge>
            )}
          </div>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
