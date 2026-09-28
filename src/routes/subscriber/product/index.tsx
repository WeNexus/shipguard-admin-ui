import { useEffect, useState, type ReactNode } from "react";
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  Collapsible,
  DataTable,
  Divider,
  InlineGrid,
  InlineStack,
  Link,
  SkeletonBodyText,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import { apiFetch } from "../../../lib/api-client";
import { formatDate } from "../app-subscription/copy";
import { CHECK_COPY, PRICE_TYPE_LABEL, SYNC_STATUS } from "./copy";
import type { StoreProduct, StoreProductDetail, StoreProductResync } from "./types";

/**
 * Product tab — the ShipGuard protection product as Shopify, the storefront and our records each
 * see it, for "protection isn't being added to the cart". Read live; "Re-sync product" queues the
 * same repair job the merchant's own saves trigger.
 */
const Product = ({ domain }: { domain?: string }) => {
  const [data, setData] = useState<StoreProduct | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!domain) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    apiFetch<StoreProduct>("admin/subscribers/product", {
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
        <SkeletonBodyText lines={8} />
      </Card>
    );
  }

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

  return (
    <BlockStack gap="400">
      <ChecksBanner data={data} loading={loading} onRecheck={recheck} />
      <Resync domain={domain!} data={data} onQueued={recheck} />
      <InlineGrid columns={{ xs: 1, md: 2 }} gap="400" alignItems="start">
        {data.product ? (
          <ProductCard product={data.product} expected={data.expected} />
        ) : (
          <NoProductCard data={data} />
        )}
        <BlockStack gap="400">
          <StatsCard data={data} />
          <SettingsCard data={data} />
          <LastSyncCard data={data} />
        </BlockStack>
      </InlineGrid>
      {data.product && (
        <VariantsCard
          product={data.product}
          currency={data.config.currencyCode}
          expectedSku={data.expected.sku}
        />
      )}
      <TechnicalDetails data={data} />
    </BlockStack>
  );
};

const ChecksBanner = ({
  data,
  loading,
  onRecheck,
}: {
  data: StoreProduct;
  loading: boolean;
  onRecheck: () => void;
}) => {
  const footer = (
    <InlineStack gap="200" blockAlign="center">
      <Text as="span" variant="bodySm" tone="subdued">
        Checked with Shopify at {new Date(data.checkedAt).toLocaleTimeString()}
      </Text>
      <Button size="slim" loading={loading} onClick={onRecheck}>
        Check again
      </Button>
    </InlineStack>
  );

  if (data.checks.length === 0) {
    return (
      <Banner tone="success" title="Protection product looks healthy">
        <BlockStack gap="200">
          <Text as="p">
            The product exists, is active on the Online Store, and matches what
            the storefront was given. If protection still isn't added, the
            cause is likely in the theme (see Widget Settings).
          </Text>
          {footer}
        </BlockStack>
      </Banner>
    );
  }

  const worst = data.checks[0].severity;
  return (
    <Banner
      tone={worst}
      title={`${data.checks.length} thing${data.checks.length === 1 ? "" : "s"} to look at`}
    >
      <BlockStack gap="300">
        {data.checks.map((check) => {
          const copy = CHECK_COPY[check.code];
          return (
            <BlockStack gap="100" key={check.code}>
              <InlineStack gap="200" blockAlign="center">
                <Badge tone={check.severity}>{check.severity}</Badge>
                <Text as="span" fontWeight="semibold">
                  {copy?.title ?? check.code}
                </Text>
              </InlineStack>
              {copy && (
                <>
                  <Text as="p">{copy.body}</Text>
                  <Text as="p" tone="subdued">
                    What to do: {copy.action}
                  </Text>
                </>
              )}
            </BlockStack>
          );
        })}
        {footer}
      </BlockStack>
    </Banner>
  );
};

/**
 * Two-step on purpose: a re-sync deletes and recreates every variant, so carts holding the old
 * protection line lose it. Worth one extra click to confirm.
 */
const Resync = ({
  domain,
  data,
  onQueued,
}: {
  domain: string;
  data: StoreProduct;
  onQueued: () => void;
}) => {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<
    { tone: "success" | "info" | "critical"; text: string } | null
  >(null);

  const suggested = data.checks.some((c) => CHECK_COPY[c.code]?.resyncFixes);
  const blocked = data.uninstalled || !data.config.setUp;

  const run = () => {
    setBusy(true);
    apiFetch<StoreProductResync>("admin/subscribers/product/resync", {
      method: "POST",
      query: { shop: domain },
    })
      .then((res) => {
        setResult(
          res.alreadyQueued
            ? { tone: "info", text: "A sync was already queued — no new one started. Check again in a minute." }
            : { tone: "success", text: "Re-sync queued. It usually finishes within a minute — then click “Check again”." },
        );
        onQueued();
      })
      .catch((err) =>
        setResult({ tone: "critical", text: err?.message ?? "Re-sync failed to start" }),
      )
      .finally(() => {
        setBusy(false);
        setConfirming(false);
      });
  };

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center" gap="200">
          <BlockStack gap="100">
            <Text as="h3" variant="headingMd">
              Re-sync product
            </Text>
            <Text as="p" tone="subdued">
              Rebuilds the protection product in Shopify from the merchant's
              saved settings: recreates price options, fixes SKU, status, tags
              and image, removes duplicates. It does not fix a changed handle or
              a missing Online Store channel.
            </Text>
          </BlockStack>
          {!confirming && (
            <Button
              variant={suggested ? "primary" : "secondary"}
              disabled={blocked}
              onClick={() => {
                setResult(null);
                setConfirming(true);
              }}
            >
              Re-sync product
            </Button>
          )}
        </InlineStack>
        {confirming && (
          <Banner tone="warning" title="Re-sync this store's protection product?">
            <BlockStack gap="200">
              <Text as="p">
                Every price option is recreated with a new id. Shoppers who
                already have protection in their cart may need to add it again.
              </Text>
              <InlineStack gap="200">
                <Button variant="primary" loading={busy} onClick={run}>
                  Yes, re-sync
                </Button>
                <Button disabled={busy} onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </InlineStack>
            </BlockStack>
          </Banner>
        )}
        {result && (
          <Banner tone={result.tone} onDismiss={() => setResult(null)}>
            <p>{result.text}</p>
          </Banner>
        )}
      </BlockStack>
    </Card>
  );
};

const ProductCard = ({
  product,
  expected,
}: {
  product: StoreProductDetail;
  expected: StoreProduct["expected"];
}) => {
  const handleOk = product.handle === expected.handle;
  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack gap="300" blockAlign="center" wrap={false}>
          {product.imageUrl && (
            <Thumbnail source={product.imageUrl} alt="" size="small" />
          )}
          <BlockStack gap="100">
            <InlineStack gap="200" blockAlign="center">
              <Text as="h3" variant="headingMd">
                {product.title}
              </Text>
              <Badge tone={product.status === "ACTIVE" ? "success" : "critical"}>
                {product.status}
              </Badge>
            </InlineStack>
            <InlineStack gap="300">
              <Link url={product.adminUrl} target="_blank">
                Open in Shopify admin
              </Link>
              {product.onlineStoreUrl && (
                <Link url={product.onlineStoreUrl} target="_blank">
                  View on store
                </Link>
              )}
            </InlineStack>
          </BlockStack>
        </InlineStack>
        <Divider />
        <Row label="Handle">
          {product.handle}{" "}
          {handleOk ? (
            <Badge tone="success">correct</Badge>
          ) : (
            <Badge tone="critical">{`expected ${expected.handle}`}</Badge>
          )}
        </Row>
        <Row label="Online Store">
          {product.onlineStorePublished ? (
            <Badge tone="success">Published</Badge>
          ) : (
            <Badge tone="critical">Not published</Badge>
          )}
        </Row>
        <Row label="Sales channels">
          {product.channels.length === 0
            ? "—"
            : product.channels
                .map((c) => `${c.name}${c.published ? "" : " (off)"}`)
                .join(", ")}
        </Row>
        <Row label="Hidden from search">
          {product.seoHidden ? "Yes (normal)" : "No"}
        </Row>
        <Row label="Product type">{product.productType || "—"}</Row>
        <Row label="Vendor">{product.vendor || "—"}</Row>
        <Row label="Tags">{product.tags.join(", ") || "—"}</Row>
        <Row label="Price options">{product.variantsCount}</Row>
        <Row label="Published">{formatDate(product.publishedAt)}</Row>
        <Row label="Created">{formatDate(product.createdAt)}</Row>
        <Row label="Last updated">{formatDate(product.updatedAt)}</Row>
      </BlockStack>
    </Card>
  );
};

/** "Nothing here" is the finding — say so, and show what the SKU search did turn up. */
const NoProductCard = ({ data }: { data: StoreProduct }) => (
  <Card>
    <BlockStack gap="200">
      <InlineStack gap="200" blockAlign="center">
        <Text as="h3" variant="headingMd">
          No protection product found
        </Text>
        <Badge tone="critical">Missing</Badge>
      </InlineStack>
      <Text as="p" tone="subdued">
        {data.lookups === null
          ? "Shopify couldn't be asked, so the product wasn't checked."
          : data.lookups.matches.length > 0
            ? "Nothing uses the expected handle, but these products carry the protection SKU:"
            : `No product has the handle “${data.expected.handle}” or the SKU “${data.expected.sku}”.`}
      </Text>
      {data.lookups?.matches.map((m) => (
        <Text as="p" key={m.id}>
          {m.title} — handle “{m.handle}” ({m.status})
        </Text>
      ))}
    </BlockStack>
  </Card>
);

const StatsCard = ({ data }: { data: StoreProduct }) => {
  const { stats, config } = data;
  const rate =
    stats.ordersLast30Days > 0
      ? Math.round((stats.protectedOrdersLast30Days / stats.ordersLast30Days) * 100)
      : null;
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingMd">
          Last 30 days
        </Text>
        <Row label="Orders">{stats.ordersLast30Days}</Row>
        <Row label="With protection">
          {stats.protectedOrdersLast30Days}
          {rate !== null && ` (${rate}%)`}
        </Row>
        <Row label="Last protected order">
          {stats.lastProtectedOrder
            ? `${stats.lastProtectedOrder.name} on ${formatDate(stats.lastProtectedOrder.date)} — ${stats.lastProtectedOrder.fee} ${config.currencyCode}`
            : "Never"}
        </Row>
      </BlockStack>
    </Card>
  );
};

const SettingsCard = ({ data }: { data: StoreProduct }) => {
  const c = data.config;
  const onOff = (on: boolean) => (
    <Badge tone={on ? "success" : undefined}>{on ? "On" : "Off"}</Badge>
  );
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingMd">
          Merchant settings
        </Text>
        <Row label="Cart widget">{onOff(c.cartWidgetPublished)}</Row>
        <Row label="Checkout widget">{onOff(c.checkoutWidgetPublished)}</Row>
        <Row label="Thank-you widget">{onOff(c.thankYouWidgetPublished)}</Row>
        <Row label="Pricing">
          {PRICE_TYPE_LABEL[c.insurancePriceType] ?? c.insurancePriceType}
        </Row>
        {c.insurancePriceType === "FIXED_PRICE" && (
          <Row label="Price">{`${c.price} ${c.currencyCode}`}</Row>
        )}
        {c.insurancePriceType === "PERCENTAGE" && (
          <Row label="Rate">
            {`${c.percentage}% (min ${c.minimumFee}, max ${c.maximumFee} ${c.currencyCode})`}
          </Row>
        )}
        {c.insurancePriceType === "FIXED_MULTIPLE" && (
          <Row label="Tiers">
            <BlockStack gap="050">
              {c.fixedMultiplePlan.map((t, i) => (
                <span key={i}>
                  {`${t.cartMinPrice}–${t.cartMaxPrice} → ${t.protectionFees} ${c.currencyCode}`}
                </span>
              ))}
            </BlockStack>
          </Row>
        )}
      </BlockStack>
    </Card>
  );
};

const LastSyncCard = ({ data }: { data: StoreProduct }) => {
  const sync = data.lastSync;
  const status = sync ? (SYNC_STATUS[sync.status] ?? { label: sync.status }) : null;
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingMd">
          Last sync
        </Text>
        {!sync || !status ? (
          <Text as="p" tone="subdued">
            No sync has run for this store yet.
          </Text>
        ) : (
          <>
            <Row label="Result">
              <Badge tone={status.tone}>{status.label}</Badge>
            </Row>
            <Row label="Started">{new Date(sync.createdAt).toLocaleString()}</Row>
            <Row label="Finished">
              {sync.completedAt ? new Date(sync.completedAt).toLocaleString() : "—"}
            </Row>
            <Row label="Attempts">{`${sync.attempts} of ${sync.maxAttempts}`}</Row>
            {sync.lastError && <Row label="Error">{sync.lastError}</Row>}
          </>
        )}
      </BlockStack>
    </Card>
  );
};

const VariantsCard = ({
  product,
  currency,
  expectedSku,
}: {
  product: StoreProductDetail;
  currency: string;
  expectedSku: string;
}) => {
  const yesNo = (v: boolean | null) => (v === null ? "—" : v ? "Yes" : "No");
  const rows = product.variants.map((v) => [
    v.title,
    `${v.price} ${currency}`,
    v.sku === expectedSku ? v.sku : <Text as="span" tone="critical">{v.sku || "(none)"}</Text>,
    v.availableForSale ? "Yes" : <Text as="span" tone="critical">No</Text>,
    v.tracked ? `Tracked, ${v.inventoryPolicy === "DENY" ? "stop at 0" : "continue"}` : "Not tracked",
    yesNo(v.requiresShipping),
    yesNo(v.taxable),
    v.inStorefrontMetafield ? "Yes" : <Text as="span" tone="caution">No</Text>,
    v.numericId,
  ]);
  return (
    <Card padding="0">
      <Box padding="400">
        <Text as="h3" variant="headingMd">
          Price options ({product.variants.length})
        </Text>
      </Box>
      <DataTable
        columnContentTypes={["text", "text", "text", "text", "text", "text", "text", "text", "text"]}
        headings={[
          "Title",
          "Price",
          "SKU",
          "Can buy",
          "Inventory",
          "Needs shipping",
          "Taxable",
          "Storefront knows it",
          "Variant ID",
        ]}
        rows={rows}
      />
    </Card>
  );
};

/** For escalating to a developer — support never needs to read this. */
const TechnicalDetails = ({ data }: { data: StoreProduct }) => {
  const [open, setOpen] = useState(data.shopifyError !== null);
  const sf = data.storefrontMetafields;
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
        <Collapsible id="product-technical-details" open={open}>
          <BlockStack gap="200">
            <Row label="Checks">
              {data.checks.map((c) => c.code).join(", ") || "none"}
            </Row>
            <Row label="Saved product id">{data.config.savedProductId ?? "—"}</Row>
            <Row label="Saved id found">
              {data.lookups?.savedIdFound === null || !data.lookups
                ? "—"
                : data.lookups.savedIdFound
                  ? "Yes"
                  : "No"}
            </Row>
            <Row label="Found by handle">{data.lookups?.byHandleId ?? "—"}</Row>
            <Row label="SKU/handle matches">
              {data.lookups?.matches.map((m) => m.id).join(", ") || "—"}
            </Row>
            <Row label="Expected">
              {`handle ${data.expected.handle}, SKU ${data.expected.sku}, type ${data.expected.productType}`}
            </Row>
            <Row label="Storefront variant ids">
              {sf?.variantIds?.join(", ") || "—"}
            </Row>
            <Row label="Storefront data updated">
              {sf?.variantsUpdatedAt ? new Date(sf.variantsUpdatedAt).toLocaleString() : "—"}
            </Row>
            <Row label="Storefront switches">
              {sf
                ? `cart ${String(sf.cartEnabled)}, checkout ${String(sf.checkoutEnabled)}`
                : "—"}
            </Row>
            {data.lastSync && <Row label="Last sync job">{data.lastSync.jobId}</Row>}
            {data.shopifyError && <Row label="Shopify error">{data.shopifyError}</Row>}
            <Row label="Checked at">{new Date(data.checkedAt).toLocaleString()}</Row>
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

export default Product;
