import { Banner, BlockStack, Tabs } from "@shopify/polaris";
import { useState } from "react";
import CartPage from "./cart-page";
import CheckoutPage from "./checkout-page";
import ThankYouPage from "./thank-you-page";
import { widgetSettingsDummy } from "./dummy-data";

const WidgetSettings = () => {
  // TODO: replace with the subscriber's real widget settings once the admin API exists.
  const data = widgetSettingsDummy;

  // Checkout Page is Shopify Plus only in the storefront app, so hide it the same way here.
  const tabs = [
    { id: "cart-page", content: "Cart Page", panelID: "cart-page-panel" },
    ...(data.isShopifyPlus
      ? [
          {
            id: "checkout-page",
            content: "Checkout Page",
            panelID: "checkout-page-panel",
          },
        ]
      : []),
    {
      id: "thank-you-page",
      content: "Thank You Page",
      panelID: "thank-you-page-panel",
    },
  ];
  const [selected, setSelected] = useState(0);
  const tabId = tabs[selected]?.id;

  return (
    <BlockStack gap="400">
      <Banner tone="info" title="Preview with sample data">
        These settings are read-only and show sample values. Live store data is
        coming soon.
      </Banner>
      <Tabs tabs={tabs} selected={selected} onSelect={setSelected}>
        <div className="mt-4">
          {tabId === "cart-page" && <CartPage data={data} />}
          {tabId === "checkout-page" && <CheckoutPage data={data} />}
          {tabId === "thank-you-page" && <ThankYouPage data={data} />}
        </div>
      </Tabs>
    </BlockStack>
  );
};

export default WidgetSettings;
