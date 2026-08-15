// Nested country info
interface Country {
  id: string;
  name: string;
}

// Timezone wrapper.
// The new backend flattened the old Country/Timezone tables onto `Store.country`, and a store with
// no synced Shopify profile has none — so `Country` is genuinely nullable. Typed that way so callers
// are forced to guard instead of discovering it as a render-time TypeError.
interface Timezone {
  Country: Country | null;
}

// Package protection settings
interface PackageProtection {
  enabled: boolean;
}

// Individual protection order summary
export interface PackageProtectionOrderSummary {
  hasPackageProtection: boolean;
  id: number;
  protectionFee: string; // e.g. "11.24"
  orderAmount: string; // e.g. "163.79"
}

// Main store record
export interface StoreRecord {
  createdAt: string; // ISO timestamp
  name: string;
  domain: string;
  plan: string;
  development: boolean;
  id: string; // Shopify GID
  uninstalledAt: string | null; // ISO timestamp or null
  currencyCode: string; // e.g. "USD", "BDT"
  PackageProtection: PackageProtection;
  Timezone?: Timezone | null;
  PackageProtectionOrders: PackageProtectionOrderSummary[];
}

// Array of stores
export type StoreRecordList = StoreRecord[];

export interface IStats {
  totalActive: number;
  totalInactive: number;
  totalStore: number;
  trial?: number;
}
