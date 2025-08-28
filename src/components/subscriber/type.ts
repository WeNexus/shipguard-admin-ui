// Nested store info
export interface StoreInfo {
  name: string;
  moneyFormat: string; // e.g. "${{amount}}"
  currencyCode: string; // e.g. "USD", "BDT"
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

export interface IPackagePackageProtection {
  insuranceDisplayButton: boolean;
  checkoutWidgetButton: boolean;
  productHideSelector: string;
  productHideSwitch: boolean;
  checkoutEnable: boolean;
  storeFrontLog: boolean;

  enabled: boolean;
  storeId: string;
}
