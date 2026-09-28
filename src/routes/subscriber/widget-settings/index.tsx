import {
  Banner,
  BlockStack,
  Button,
  Card,
  Divider,
  SkeletonBodyText,
  Tabs,
  Text,
} from "@shopify/polaris";
import { useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "../../../lib/api-client";
import CartPage from "./cart-page";
import CheckoutPage from "./checkout-page";
import ThankYouPage from "./thank-you-page";
import {
  DEFAULTS_PREVIEW,
  NOT_SET_UP,
  UNINSTALLED,
  type StatusCopy,
  type WidgetPage,
} from "./copy";
import StoreStatusCard from "./shared/store-status-card";
import type { WidgetSettingsData } from "./types";

/**
 * Widget Settings tab — read-only view of the merchant's cart, checkout and thank-you widgets, so
 * support can see what the merchant's customers see without asking for screenshots.
 */
const WidgetSettings = ({ domain }: { domain?: string }) => {
  const [data, setData] = useState<WidgetSettingsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState(0);
  const [showDefaults, setShowDefaults] = useState(false);

  useEffect(() => {
    if (!domain) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    apiFetch<WidgetSettingsData>("admin/subscribers/widget-settings", {
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

  if (loading && !data) {
    return (
      <Card>
        <SkeletonBodyText lines={6} />
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Banner
        tone="critical"
        title="Couldn't load this page"
        action={{
          content: "Try again",
          onAction: () => setReloadKey((k) => k + 1),
        }}
      >
        <p>{error}</p>
      </Banner>
    );
  }

  // Checkout Page is Shopify Plus only in the storefront app, so hide it the same way here.
  const tabs: { id: WidgetPage; content: string; panelID: string }[] = [
    { id: "cart", content: "Cart Page", panelID: "cart-page-panel" },
    ...(data.isShopifyPlus
      ? [
          {
            id: "checkout" as const,
            content: "Checkout Page",
            panelID: "checkout-page-panel",
          },
        ]
      : []),
    {
      id: "thankYou",
      content: "Thank You Page",
      panelID: "thank-you-page-panel",
    },
  ];
  const page = tabs[selected]?.id ?? "cart";

  return (
    <BlockStack gap="400">
      {data.uninstalled && <StatusBanner copy={UNINSTALLED} />}

      {!data.setUp && (
        <StatusBanner copy={NOT_SET_UP}>
          <div>
            <Button onClick={() => setShowDefaults((v) => !v)}>
              {showDefaults
                ? "Hide starting settings"
                : "Show starting settings"}
            </Button>
          </div>
        </StatusBanner>
      )}

      {(data.setUp || showDefaults) && (
        <Tabs tabs={tabs} selected={selected} onSelect={setSelected}>
          <div className="mt-4">
            <BlockStack gap="400">
              {!data.setUp && (
                <Banner tone="info">
                  <p>{DEFAULTS_PREVIEW}</p>
                </Banner>
              )}
              <StoreStatusCard data={data} page={page} />
              {/* Set the status apart from the settings, so it reads as the answer, not one more card. */}
              <div className="py-2">
                <Divider />
              </div>
              {page === "cart" && <CartPage data={data} />}
              {page === "checkout" && <CheckoutPage data={data} />}
              {page === "thankYou" && <ThankYouPage data={data} />}
            </BlockStack>
          </div>
        </Tabs>
      )}
    </BlockStack>
  );
};

const StatusBanner = ({
  copy,
  children,
}: {
  copy: StatusCopy;
  children?: ReactNode;
}) => (
  <Banner tone={copy.tone} title={copy.title}>
    <BlockStack gap="200">
      <Text as="p">{copy.body}</Text>
      {copy.action && (
        <Text as="p" fontWeight="semibold">
          What to do: {copy.action}
        </Text>
      )}
      {children}
    </BlockStack>
  </Banner>
);

export default WidgetSettings;
