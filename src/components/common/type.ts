/**
 * Shapes shared by more than one feature folder.
 *
 * Kept separate from each feature's own `type.ts`: a type that two features import should not live
 * inside one of them, or the second feature ends up depending on the first for no reason.
 */

/**
 * One row of `GET admin/gql/stores` — installed stores holding an offline token.
 *
 * `name` is display-ready: the backend falls back to the domain when a store has no name, so this is
 * never null and never blank.
 *
 * The endpoint is `gql`-scoped by path only. It is the store list for any admin screen that acts on a
 * single store — the GraphQL runner and the webhook reset both use it — because "installed and holding
 * a token" is exactly "a store we can call Shopify for". Renaming the route would mean editing a
 * working endpoint for a label, so the misnomer stays documented instead.
 */
export interface StoreOption {
  domain: string;
  name: string;
}
