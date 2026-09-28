/**
 * Mirrors the backend `StoreProductResponseDto`
 * (ShipGuard_2.0_Backend/apps/main-api/src/modules/admin/admin-store-product/dto/store-product.dto.ts).
 */

export type ProductCheckCode =
  | "UNINSTALLED"
  | "SHOPIFY_UNREACHABLE"
  | "NOT_SET_UP"
  | "PRICING_NOT_SELECTED"
  | "PRODUCT_MISSING"
  | "DUPLICATE_PRODUCTS"
  | "HANDLE_CHANGED"
  | "PRODUCT_NOT_ACTIVE"
  | "NOT_ON_ONLINE_STORE"
  | "NO_PRICE_VARIANTS"
  | "WRONG_SKU"
  | "VARIANTS_UNAVAILABLE"
  | "STOREFRONT_VARIANTS_EMPTY"
  | "WIDGETS_OFF"
  | "SAVED_ID_MISSING"
  | "SAVED_ID_MISMATCH"
  | "VARIANT_TITLE_NOT_PRICE"
  | "STOREFRONT_VARIANTS_STALE"
  | "STOREFRONT_FLAGS_OUT_OF_SYNC"
  | "LAST_SYNC_FAILED"
  | "SYNC_IN_PROGRESS";

export type ProductCheckSeverity = "critical" | "warning" | "info";

export interface ProductCheck {
  code: ProductCheckCode;
  severity: ProductCheckSeverity;
}

export interface StoreProductVariant {
  id: string;
  numericId: string;
  title: string;
  price: string;
  sku: string | null;
  availableForSale: boolean;
  inventoryPolicy: string;
  tracked: boolean | null;
  requiresShipping: boolean | null;
  taxable: boolean;
  inStorefrontMetafield: boolean;
}

export interface StoreProductDetail {
  id: string;
  numericId: string;
  title: string;
  handle: string;
  status: string;
  vendor: string;
  productType: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  imageUrl: string | null;
  adminUrl: string;
  onlineStoreUrl: string | null;
  onlineStorePublished: boolean;
  seoHidden: boolean;
  channels: { name: string; published: boolean }[];
  variantsCount: number;
  hasOnlyDefaultVariant: boolean;
  variants: StoreProductVariant[];
}

export interface StoreProduct {
  domain: string;
  checkedAt: string;
  uninstalled: boolean;
  shopifyError: string | null;
  checks: ProductCheck[];
  expected: { handle: string; sku: string; productType: string };
  config: {
    setUp: boolean;
    savedProductId: string | null;
    productTitle: string;
    insurancePriceType: string;
    price: string;
    percentage: string;
    minimumFee: string;
    maximumFee: string;
    fixedMultiplePlan: {
      protectionFees: string;
      cartMinPrice: string;
      cartMaxPrice: string;
    }[];
    cartWidgetPublished: boolean;
    checkoutWidgetPublished: boolean;
    thankYouWidgetPublished: boolean;
    currencyCode: string;
  };
  product: StoreProductDetail | null;
  lookups: {
    savedIdFound: boolean | null;
    byHandleId: string | null;
    matches: { id: string; title: string; handle: string; status: string }[];
  } | null;
  storefrontMetafields: {
    variantIds: string[] | null;
    variantsUpdatedAt: string | null;
    cartEnabled: boolean | null;
    checkoutEnabled: boolean | null;
  } | null;
  lastSync: {
    jobId: string;
    status: string;
    createdAt: string;
    completedAt: string | null;
    attempts: number;
    maxAttempts: number;
    lastError: string | null;
  } | null;
  stats: {
    ordersLast30Days: number;
    protectedOrdersLast30Days: number;
    lastProtectedOrder: { name: string; date: string; fee: string } | null;
  };
}

export interface StoreProductResync {
  jobId: string;
  alreadyQueued: boolean;
}
