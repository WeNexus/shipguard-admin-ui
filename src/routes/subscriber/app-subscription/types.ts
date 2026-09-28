/**
 * `GET admin/subscribers/billing?shop=` — read live from Shopify, not from our cached copy.
 * Every amount is USD: app charges are always created in USD.
 */
export type BillingVerdict =
  | "UNINSTALLED"
  | "SHOPIFY_UNREACHABLE"
  | "ACTIVE"
  | "FOUNDER_SETUP_INCOMPLETE"
  | "FREE_GROUP"
  | "FREE_ACCESS_LIST"
  | "AWAITING_APPROVAL"
  | "FROZEN"
  | "DECLINED"
  | "EXPIRED"
  | "CANCELLED"
  | "NO_SUBSCRIPTION";

export interface StoreBillingSubscription {
  id: string;
  planName: string;
  status: string;
  test: boolean;
  monthlyPrice: number;
  listPrice: number;
  interval: string | null;
  hasUsageCharge: boolean;
  usageUsed: number;
  usageCap: number | null;
  createdAt: string | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  restrictsCheckoutWidget: boolean;
}

export interface StoreBillingHistoryEntry {
  id: string;
  name: string;
  status: string;
  test: boolean;
  createdAt: string;
}

export interface StoreBilling {
  verdict: BillingVerdict;
  checkedAt: string;
  shopifyError: string | null;
  store: {
    appStatus: string;
    installedAt: string;
    uninstalledAt: string | null;
  };
  pricingGroup: string;
  subscription: StoreBillingSubscription | null;
  history: StoreBillingHistoryEntry[];
}
