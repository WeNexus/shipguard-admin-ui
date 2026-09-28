import type { ProductCheckCode } from "./types";

/**
 * Every sentence support reads on this tab. The backend decides WHICH checks apply; this file only
 * words them. Say what the shopper experiences and what to do, not what the system is doing.
 *
 * `resyncFixes` is true only where the storefront migration actually repairs the cause — offering
 * the button for anything else sends support round in circles.
 */

export interface CheckCopy {
  title: string;
  body: string;
  action: string;
  resyncFixes: boolean;
}

const RESYNC = "Click “Re-sync product”, wait a minute, then “Check again”.";

export const CHECK_COPY: Record<ProductCheckCode, CheckCopy> = {
  UNINSTALLED: {
    title: "App is uninstalled",
    body: "ShipGuard is not installed on this store, so protection cannot be added anywhere.",
    action: "Ask the merchant to reinstall ShipGuard.",
    resyncFixes: false,
  },
  SHOPIFY_UNREACHABLE: {
    title: "Couldn't read the product from Shopify",
    body: "Shopify didn't answer, so the product itself could not be checked. The items below only cover our own records.",
    action:
      "Check again in a few minutes. If it keeps failing, send the technical details to a developer.",
    resyncFixes: false,
  },
  NOT_SET_UP: {
    title: "Protection was never set up",
    body: "The merchant has never saved their protection settings, so no product exists for the cart.",
    action: "Ask the merchant to open ShipGuard and save the cart widget settings.",
    resyncFixes: false,
  },
  PRICING_NOT_SELECTED: {
    title: "No price is chosen",
    body: "Without a pricing type the product can't be priced, and syncing skips this store.",
    action: "Ask the merchant to choose a protection price in ShipGuard and save.",
    resyncFixes: false,
  },
  PRODUCT_MISSING: {
    title: "The protection product doesn't exist in Shopify",
    body: "It was deleted or never created. Nothing can be added to the cart until it exists.",
    action: RESYNC,
    resyncFixes: true,
  },
  DUPLICATE_PRODUCTS: {
    title: "More than one protection product",
    body: "Several products carry the protection SKU or handle. The storefront may pick the wrong one.",
    action: `${RESYNC} Re-sync deletes all copies and creates one clean product.`,
    resyncFixes: true,
  },
  HANDLE_CHANGED: {
    title: "The product's URL handle was changed",
    body: "The cart widget finds the product only by its handle. With a different handle the widget can't see it, so nothing gets added.",
    action:
      "In Shopify admin → Products, open the protection product and set its URL handle back to the expected one (see Product details). If another product already uses that handle, rename that one first.",
    resyncFixes: false,
  },
  PRODUCT_NOT_ACTIVE: {
    title: "Product is not active",
    body: "A draft or archived product can't be put in the cart.",
    action: RESYNC,
    resyncFixes: true,
  },
  NOT_ON_ONLINE_STORE: {
    title: "Product isn't on the Online Store channel",
    body: "The product is active but not published to the Online Store, so the storefront can't add it. Re-sync does NOT fix this one.",
    action:
      "In Shopify admin → Products, open the protection product → Publishing → tick Online Store and save.",
    resyncFixes: false,
  },
  NO_PRICE_VARIANTS: {
    title: "Product has no price options",
    body: "It only has Shopify's “Default Title” variant, which the cart widget refuses to use.",
    action: RESYNC,
    resyncFixes: true,
  },
  WRONG_SKU: {
    title: "A variant has the wrong SKU",
    body: "Someone edited the SKU. Orders with it won't count as protected, and the widget can't remove it from the cart.",
    action: RESYNC,
    resyncFixes: true,
  },
  VARIANTS_UNAVAILABLE: {
    title: "Some price options can't be bought",
    body: "Shopify marks some variants as unavailable — usually inventory tracking was switched on and stock is 0.",
    action: RESYNC,
    resyncFixes: true,
  },
  STOREFRONT_VARIANTS_EMPTY: {
    title: "Storefront never received the product",
    body: "The settings the cart widget reads have no price options, so the widget won't add protection.",
    action: RESYNC,
    resyncFixes: true,
  },
  WIDGETS_OFF: {
    title: "Cart and checkout widgets are both off",
    body: "With both off, protection is intentionally not offered and the product is kept as a draft.",
    action: "If the merchant wants protection, ask them to turn the cart widget on in ShipGuard.",
    resyncFixes: false,
  },
  SAVED_ID_MISSING: {
    title: "Our records don't know the product",
    body: "Checkout and thank-you page widgets look the product up by the id we saved. Without it they stay hidden.",
    action: RESYNC,
    resyncFixes: true,
  },
  SAVED_ID_MISMATCH: {
    title: "Our saved product is not the live one",
    body: "The id we saved points to a deleted or different product. Checkout and thank-you widgets may stay hidden.",
    action: RESYNC,
    resyncFixes: true,
  },
  VARIANT_TITLE_NOT_PRICE: {
    title: "A variant was renamed",
    body: "The cart widget reads each option's price from its name. A renamed option can make it pick the wrong price or none.",
    action: RESYNC,
    resyncFixes: true,
  },
  STOREFRONT_VARIANTS_STALE: {
    title: "Storefront has out-of-date product data",
    body: "The price options the widget was given don't match the product's current ones.",
    action: RESYNC,
    resyncFixes: true,
  },
  STOREFRONT_FLAGS_OUT_OF_SYNC: {
    title: "Storefront settings are out of date",
    body: "The widget on/off switches the storefront sees don't match what the merchant saved.",
    action: RESYNC,
    resyncFixes: true,
  },
  LAST_SYNC_FAILED: {
    title: "The last sync failed",
    body: "The most recent attempt to update the product in Shopify failed. See the error under Last sync.",
    action: `${RESYNC} If it fails again, send the error to a developer.`,
    resyncFixes: true,
  },
  SYNC_IN_PROGRESS: {
    title: "A sync is running",
    body: "The product is being updated in Shopify right now. Results may change in a minute.",
    action: "Wait a minute, then click “Check again”.",
    resyncFixes: false,
  },
};

export const SYNC_STATUS: Record<
  string,
  { label: string; tone?: "success" | "critical" | "warning" | "info" }
> = {
  DONE: { label: "Succeeded", tone: "success" },
  FAILED: { label: "Failed", tone: "critical" },
  STUCK: { label: "Stuck", tone: "critical" },
  RUNNING: { label: "Running", tone: "info" },
  PENDING: { label: "Queued", tone: "info" },
  SCHEDULED: { label: "Scheduled", tone: "info" },
  CANCELLED: { label: "Cancelled", tone: "warning" },
};

export const PRICE_TYPE_LABEL: Record<string, string> = {
  PERCENTAGE: "Percentage of cart",
  FIXED_PRICE: "Fixed price",
  FIXED_MULTIPLE: "Fixed price by cart value",
  NOT_SELECTED: "Not selected",
};
