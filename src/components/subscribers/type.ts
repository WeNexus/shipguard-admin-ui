// Nested country info
interface Country {
  id: string;
  name: string;
}

// Timezone wrapper
interface Timezone {
  Country: Country;
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
  Timezone: Timezone;
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
