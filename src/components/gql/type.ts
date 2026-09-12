/**
 * Shared shapes and constants for the GraphQL runner.
 *
 * Kept out of `index.tsx` because the panes need them and `index.tsx` imports the panes — reading
 * them from there would make the module graph circular. It happens to work today (nothing touches
 * these at module-evaluation time), which is exactly the kind of accident that breaks later.
 */

/** Both panes share it so they line up. */
export const EDITOR_HEIGHT = "420px";

/**
 * Row of `GET admin/gql/stores`.
 *
 * Re-exported, not declared: the webhook-reset screen picks a store from the same endpoint, so the
 * shape moved to `components/common/type.ts` alongside the shared `StoreSelect`. The alias stays so
 * this feature's own files keep reading in its own vocabulary.
 */
export type { StoreOption as GqlStoreOption } from "../common/type";

/**
 * Body of `POST admin/gql/run`, always at HTTP 200.
 *
 * `ok: false` is a failed *run*, not a failed request — see the backend's `AdminGqlService.run`.
 * Notably a merchant store needing re-auth arrives here rather than as a 401, which would otherwise
 * make `apiFetch` clear this admin's own session and bounce them to the login screen.
 *
 * `data` and `errors` are not exclusive: Shopify throws on a partial success, so a run can be
 * `ok: false` and still carry the fields that did resolve.
 */
export interface GqlRunResult {
  ok: boolean;
  data: unknown;
  errors: unknown;
  error?: string;
}
