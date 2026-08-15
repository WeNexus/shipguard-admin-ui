// Nested store info
export interface StoreInfo {
  name: string;
  moneyFormat: string; // e.g. "${{amount}}"
  currencyCode: string; // e.g. "USD", "BDT"
  timezoneId: string; // e.g. "America/New_York"
}

// Nested claim order (only present when hasClaimRequest is true)
export interface PackageProtectionClaimOrder {
  id: number;
  orderId: string; // Shopify GID for the order
  storeId: string; // Shopify GID for the shop
  issue: string; // e.g. "DAMAGED"
  requestedResulation: string; // e.g. "RESHIP"
  hasClaimRequest: boolean;
  claimStatus: string; // e.g. "REQUESTED"
  comments: string;
  images: string; // image identifier
  fulfillmentLineItemId: string; // Shopify GID for the line item
  fulfillmentId: string; // Shopify GID for the fulfillment
  claimStatusMessage: string | null;
  fulfillClaim: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// Main order record
export interface ProtectionOrder {
  id: number;
  orderId: string; // Shopify GID for the order
  customerId: string; // Shopify GID for the customer
  storeId: string; // Shopify GID for the shop
  customerFirstName: string | null;
  customerLastName: string | null;
  customerEmail: string;
  protectionFee: string; // e.g. "11.24"
  orderAmount: string; // e.g. "163.79"
  hasClaimRequest: boolean;
  fulfillmentStatus: string; // e.g. "ON_HOLD", "UNFULFILLED"
  claimStatus: string | null; // e.g. "REQUESTED" or null
  orderName: string; // e.g. "#1002"
  refundAmount: string; // e.g. "0"
  hasPackageProtection: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  claimDate: string | null; // ISO timestamp or null
  orderDate: string; // ISO timestamp
  channelName: string | null;

  PackageProtectionClaimOrder: PackageProtectionClaimOrder[];
  Store: StoreInfo;
}

// Array of orders
export type ProtectionOrderList = ProtectionOrder[];

/**
 * `packageProtection` as the backend actually returns it (`GET admin/api/subscriber-detail`).
 *
 * Two members were renamed in Phase 42 to match the response: `insuranceDisplayButton` →
 * `cartWidgetPreselected` and `checkoutWidgetButton` → `checkoutWidgetPreselected`. The backend has
 * emitted the new names since Phase 14 (they follow the Phase 19/28 schema renames) — the old names
 * were never present in the payload, so reading them yielded `undefined`.
 *
 * ⚠️ The components that *send* these fields still post the OLD names; Phase 43 fixes that. Having the
 * correct names declared here is what makes that a mechanical rename.
 *
 * Nullable members are nullable in the response: a store may have no widget row or no selector set.
 */
export interface IPackagePackageProtection {
  cartWidgetPreselected: boolean | null;
  checkoutWidgetPreselected: boolean | null;
  productHideSelector: string | null;
  productHideSwitch: boolean;
  checkoutEnable: boolean;
  storeFrontLog: boolean;
  defaultSetting: boolean;
  cssSelector: string | null;
  position: "BEFORE" | "AFTER" | null;

  enabled: boolean;
  storeId: string;
}
