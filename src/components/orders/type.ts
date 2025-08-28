// Nested Store info
interface StoreInfo {
  name: string;
  moneyFormat: string;
  currencyCode: string;
}

// Nested claim order entries
interface PackageProtectionClaimOrder {
  id: number;
  orderId: string;
  storeId: string;
  issue: string;
  requestedResulation: string;
  hasClaimRequest: boolean;
  claimStatus: string | null;
  comments: string;
  images: string;
  fulfillmentLineItemId: string;
  fulfillmentId: string;
  claimStatusMessage: string | null;
  fulfillClaim: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// Main order record
export interface ProtectionOrder {
  id: number;
  orderId: string;
  customerId: string;
  storeId: string;
  customerFirstName: string | null;
  customerLastName: string | null;
  customerEmail: string;
  protectionFee: string; // e.g. "23.41"
  orderAmount: string; // e.g. "44.56"
  hasClaimRequest: boolean;
  fulfillmentStatus: string;
  claimStatus: string | null;
  orderName: string;
  refundAmount: string;
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
export type ProtectionOrders = ProtectionOrder[];
