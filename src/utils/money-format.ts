/**
 * Format an amount with its currency code.
 *
 * `currencyCode` comes from `StoreShopifyProfile.currency_code`, which is nullable — a store whose
 * Shopify profile has not synced has none. Unguarded template interpolation rendered the literal
 * string `"null 1234.00"` in the Subscribers table (Secured Revenue / Insurance Earning). Guarded
 * here rather than at each call site so every caller degrades the same way.
 *
 * `Number(null)` is `0`, so a null *amount* already rendered `0.00` — only the prefix was broken.
 */
export const moneyFormater = (
  amount: string | number | null | undefined,
  currencyCode?: string | null,
) => {
  const value = Number(amount ?? 0);
  const formatted = (Number.isFinite(value) ? value : 0).toFixed(2);
  const prefix = currencyCode?.trim();
  return prefix ? `${prefix} ${formatted}` : formatted;
};
