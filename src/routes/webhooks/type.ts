/**
 * Contract shapes for `/api/v1/admin/webhooks`. Mirrors the backend's `webhook-reset.service.ts`.
 */

/** Which delivery method the BACKEND resolved from `WEBHOOK_TRANSPORT`. Never assumed client-side. */
export type WebhookTransport = "http" | "pubsub";

/** One subscription as Shopify currently holds it. */
export interface WebhookSubscriptionView {
  id: string;
  topic: string;
  kind: "http" | "pubsub" | "eventbridge" | "unknown";
  /** Callback URL, `pubsub://project:topic`, or an ARN — where deliveries actually go today. */
  destination: string;
  filter: string | null;
  createdAt: string | null;
  /** The three GDPR topics. Rendered as protected; the reset refuses to delete them. */
  isCompliance: boolean;
  /** False is the interesting case: a row delivering somewhere this app no longer listens. */
  matchesActiveTransport: boolean;
}

/**
 * `GET admin/webhooks/subscriptions`.
 *
 * `ok: false` arrives at HTTP 200 on purpose. A merchant store needing re-auth would otherwise be a
 * 401, and `apiFetch` treats any 401 as THIS admin's session dying — it would clear the admin's own
 * token and bounce them to the login screen because some merchant's token expired.
 */
export interface WebhookSubscriptionListResult {
  ok: boolean;
  transport: WebhookTransport;
  subscriptions: WebhookSubscriptionView[];
  error?: string;
}

/** `POST admin/webhooks/reset`. Same `ok: false`-at-200 contract, for the same reason. */
export interface WebhookResetReport {
  ok: boolean;
  transport: WebhookTransport;
  /** Server configuration stopped the run before it started. Nothing was deleted. */
  refused?: string;
  /** The store could not be reached (no offline token, re-auth required). */
  error?: string;
  before: WebhookSubscriptionView[];
  after: WebhookSubscriptionView[];
  deleted: { id: string; topic: string; destination: string }[];
  deleteFailures: { id: string; topic: string; error: string }[];
  skipped: { topic: string; reason: string }[];
  /** Expected topics absent afterwards — read back from Shopify, not inferred from the calls. */
  missing: string[];
}

/** Human label for the resolved transport. The screen must never hardcode "Pub/Sub". */
export function transportLabel(transport: WebhookTransport): string {
  return transport === "pubsub" ? "Google Pub/Sub" : "HTTPS callbacks";
}
