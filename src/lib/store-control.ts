import { apiFetch } from "./api-client";

/**
 * Store lifecycle actions (suspend / unsuspend / uninstall / dev flag / review flag / sessions).
 *
 * Replaces `callAdminAppControl`, which was copy-pasted verbatim into both `app-control-card.tsx` and
 * `suspend.tsx` and built a `?type=…` query for a mutating GET. These are POST routes now, so the
 * suspension-reason HTML travels in a body instead of a URL that lands in logs and browser history.
 *
 * Errors are thrown (as `ApiError`) rather than swallowed into a `false` return — the old helper
 * logged to the console and returned false, so a failed suspend looked identical to a successful one.
 */

export type StoreTarget = { storeId?: string; domain?: string };

const post = <T = unknown,>(path: string, body: unknown) =>
  apiFetch<T>(`admin/store-control/${path}`, { method: "POST", body });

/** Suspend a store. `reason` may contain HTML — it is what the merchant is shown. */
export const blockStore = (target: StoreTarget, reason: string) =>
  post("block", { ...target, reason });

/** Lift a suspension. */
export const unblockStore = (target: StoreTarget) => post("unblock", target);

/** Toggle the Shopify-development flag. */
export const setStoreDevelopment = (target: StoreTarget, enabled: boolean) =>
  post("development", { ...target, enabled });

/** Toggle the app-review flag. */
export const setStoreReviewed = (target: StoreTarget, reviewed: boolean) =>
  post("reviewed", { ...target, reviewed });

/** Drop all offline sessions, forcing the merchant to re-auth. */
export const deleteStoreSessions = (target: StoreTarget) =>
  post("sessions/delete", target);

/**
 * Uninstall the app from a store.
 *
 * `confirmDomain` must equal the store's domain or the backend rejects with 400 — a typed
 * confirmation for an irreversible action. Note the backend writes **no** local state: the
 * `app/uninstalled` webhook applies it moments later, so the UI should show a pending state rather
 * than expect `uninstalledAt` to be set on return.
 */
export const uninstallStore = (target: StoreTarget, confirmDomain: string) =>
  post("uninstall", { ...target, confirmDomain });
