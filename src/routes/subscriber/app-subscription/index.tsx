import { useEffect, useState, type ReactNode } from "react";
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  Collapsible,
  Divider,
  InlineGrid,
  InlineStack,
  ProgressBar,
  SkeletonBodyText,
  Text,
} from "@shopify/polaris";
import { apiFetch } from "../../../lib/api-client";
import { describeVerdict, formatDate, HISTORY_STATUS, usd } from "./copy";
import type { StoreBilling, StoreBillingSubscription } from "./types";

/**
 * App Subscription tab — tells support, in plain words, whether this merchant can use the app and
 * what to do if not. Everything comes live from Shopify; "Check again" asks Shopify again.
 */
const AppSubscription = ({ domain }: { domain?: string }) => {
  const [data, setData] = useState<StoreBilling | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!domain) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    apiFetch<StoreBilling>("admin/subscribers/billing", {
      query: { shop: domain },
      signal: controller.signal,
    })
      .then(setData)
      .catch((err) => {
        if (err?.name !== "AbortError")
          setError(err?.message ?? "Request failed");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [domain, reloadKey]);

  const recheck = () => setReloadKey((k) => k + 1);

  if (loading && !data) {
    return (
      <Card>
        <SkeletonBodyText lines={6} />
      </Card>
    );
  }

  // The request itself failed — distinct from "Shopify didn't answer", which arrives as a verdict.
  if (error || !data) {
    return (
      <Banner
        tone="critical"
        title="Couldn't load this page"
        action={{ content: "Try again", onAction: recheck }}
      >
        <p>{error}</p>
      </Banner>
    );
  }

  // Unreachable has no plan to show either way, so let the right column take the full width
  // rather than leave an empty half.
  const main = data.subscription ? (
    <PlanCard subscription={data.subscription} />
  ) : data.verdict === "SHOPIFY_UNREACHABLE" ? null : (
    <NoSubscriptionCard />
  );

  return (
    <BlockStack gap="400">
      <VerdictBanner data={data} loading={loading} onRecheck={recheck} />
      <InlineGrid
        columns={{ xs: 1, md: main ? 2 : 1 }}
        gap="400"
        alignItems="start"
      >
        {main}
        <BlockStack gap="400">
          <HistoryCard data={data} />
          <TechnicalDetails data={data} />
        </BlockStack>
      </InlineGrid>
    </BlockStack>
  );
};

const VerdictBanner = ({
  data,
  loading,
  onRecheck,
}: {
  data: StoreBilling;
  loading: boolean;
  onRecheck: () => void;
}) => {
  const copy = describeVerdict(data);
  return (
    <Banner tone={copy.tone} title={copy.title}>
      <BlockStack gap="200">
        <Text as="p">{copy.body}</Text>
        {copy.action && (
          <Text as="p" fontWeight="semibold">
            What to do: {copy.action}
          </Text>
        )}
        <InlineStack gap="200" blockAlign="center">
          <Text as="span" variant="bodySm" tone="subdued">
            Checked with Shopify at{" "}
            {new Date(data.checkedAt).toLocaleTimeString()}
          </Text>
          <Button size="slim" loading={loading} onClick={onRecheck}>
            Check again
          </Button>
        </InlineStack>
      </BlockStack>
    </Banner>
  );
};

/** Things that are true of an active plan but read like bugs to anyone who doesn't know billing. */
const PlanWarnings = ({
  subscription,
}: {
  subscription: StoreBillingSubscription;
}) => {
  const inTrial =
    subscription.trialEndsAt &&
    new Date(subscription.trialEndsAt).getTime() > Date.now();

  return (
    <>
      {subscription.test && (
        <Banner tone="warning" title="This is a test charge">
          <p>
            Shopify is not billing the merchant real money for this
            subscription. Normal for development stores; on a live store it
            needs a developer to look.
          </p>
        </Banner>
      )}
      {subscription.restrictsCheckoutWidget && (
        <Banner tone="info" title="Standard plan limits">
          <p>
            The checkout widget and location-based settings are turned off on
            the Standard plan. If the merchant says these don't work, this is
            why — they need Plus or Pay As You Go.
          </p>
        </Banner>
      )}
      {inTrial && (
        <Banner tone="info" title="In free trial">
          <p>
            Free trial until {formatDate(subscription.trialEndsAt)}. The first
            bill comes after that.
          </p>
        </Banner>
      )}
    </>
  );
};

const PlanCard = ({
  subscription,
}: {
  subscription: StoreBillingSubscription;
}) => {
  const discounted = subscription.monthlyPrice < subscription.listPrice;
  const cap = subscription.usageCap;

  return (
    <BlockStack gap="400">
      <PlanWarnings subscription={subscription} />
      <Card>
        <BlockStack gap="300">
          <InlineStack gap="200" blockAlign="center">
            <Text as="h3" variant="headingMd">
              {subscription.planName} plan
            </Text>
            <Badge tone="success">Active</Badge>
          </InlineStack>
          <Divider />
          <Row label="Monthly price">
            {usd(subscription.monthlyPrice)}
            {discounted && (
              <Text as="span" tone="subdued">
                {" "}
                (discounted from {usd(subscription.listPrice)})
              </Text>
            )}
          </Row>
          <Row label="Per-order fee">
            {subscription.hasUsageCharge ? "Yes" : "No"}
          </Row>
          {subscription.hasUsageCharge && (
            <Row label="Per-order fees this cycle">
              <BlockStack gap="100">
                <span>
                  {usd(subscription.usageUsed)}
                  {cap !== null && ` of ${usd(cap)} limit`}
                </span>
                {cap !== null && cap > 0 && (
                  <ProgressBar
                    size="small"
                    progress={Math.min(
                      100,
                      (subscription.usageUsed / cap) * 100,
                    )}
                    tone={
                      subscription.usageUsed >= cap ? "critical" : "primary"
                    }
                  />
                )}
                {cap !== null && subscription.usageUsed >= cap && (
                  <Text as="span" tone="critical">
                    Limit reached — Shopify won't allow more per-order fees
                    until the next cycle.
                  </Text>
                )}
              </BlockStack>
            </Row>
          )}
          <Row label="Next bill">
            {formatDate(subscription.currentPeriodEnd)}
          </Row>
          <Row label="Subscribed since">
            {formatDate(subscription.createdAt)}
          </Row>
        </BlockStack>
      </Card>
    </BlockStack>
  );
};

/** Said out loud, not left as an empty card — "nothing here" is the finding. */
const NoSubscriptionCard = () => {
  return (
    <Card>
      <BlockStack gap="200">
        <InlineStack gap="200" blockAlign="center">
          <Text as="h3" variant="headingMd">
            No active subscription
          </Text>
          <Badge tone="critical">None</Badge>
        </InlineStack>
        <Text as="p" tone="subdued">
          Shopify has no active subscription for this store right now. See the
          message above for what that means for this merchant.
        </Text>
      </BlockStack>
    </Card>
  );
};

const HistoryCard = ({ data }: { data: StoreBilling }) => {
  if (data.verdict === "UNINSTALLED" || data.verdict === "SHOPIFY_UNREACHABLE")
    return null;

  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingMd">
          Recent subscriptions
        </Text>
        {data.history.length === 0 ? (
          <Text as="p" tone="subdued">
            Shopify has no record of this store ever subscribing.
          </Text>
        ) : (
          data.history.map((entry) => {
            const status = HISTORY_STATUS[entry.status] ?? {
              label: entry.status,
              tone: undefined,
            };
            return (
              <InlineStack
                key={entry.id}
                align="space-between"
                blockAlign="center"
              >
                <InlineStack gap="200" blockAlign="center">
                  <Text as="span" fontWeight="semibold">
                    {entry.name}
                  </Text>
                  <Badge tone={status.tone}>{status.label}</Badge>
                  {entry.test && <Badge tone="warning">Test</Badge>}
                </InlineStack>
                <Text as="span" tone="subdued">
                  Started {formatDate(entry.createdAt)}
                </Text>
              </InlineStack>
            );
          })
        )}
      </BlockStack>
    </Card>
  );
};

/** For escalating to a developer — support never needs to read this. */
const TechnicalDetails = ({ data }: { data: StoreBilling }) => {
  // When Shopify didn't answer, the error text is the only thing a developer will ask for.
  const [open, setOpen] = useState(data.verdict === "SHOPIFY_UNREACHABLE");
  return (
    <Card>
      <BlockStack gap="300">
        <Button
          variant="plain"
          disclosure={open ? "up" : "down"}
          onClick={() => setOpen((o) => !o)}
        >
          Technical details (for developers)
        </Button>
        <Collapsible id="billing-technical-details" open={open}>
          <BlockStack gap="200">
            <Row label="Verdict">{data.verdict}</Row>
            <Row label="Pricing group">{data.pricingGroup}</Row>
            <Row label="App status">{data.store.appStatus}</Row>
            <Row label="Installed">{formatDate(data.store.installedAt)}</Row>
            {data.store.uninstalledAt && (
              <Row label="Uninstalled">
                {formatDate(data.store.uninstalledAt)}
              </Row>
            )}
            {data.subscription && (
              <>
                <Row label="Subscription ID">{data.subscription.id}</Row>
                <Row label="Shopify status">{data.subscription.status}</Row>
                <Row label="Interval">{data.subscription.interval ?? "—"}</Row>
              </>
            )}
            {data.shopifyError && (
              <Row label="Shopify error">{data.shopifyError}</Row>
            )}
            <Row label="Checked at">
              {new Date(data.checkedAt).toLocaleString()}
            </Row>
          </BlockStack>
        </Collapsible>
      </BlockStack>
    </Card>
  );
};

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <InlineStack gap="400" wrap={false} blockAlign="start">
    <Box minWidth="140px">
      <Text as="span" tone="subdued">
        {label}
      </Text>
    </Box>
    <div className="break-words min-w-0">{children}</div>
  </InlineStack>
);

export default AppSubscription;
