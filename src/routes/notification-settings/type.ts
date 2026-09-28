/**
 * Contract shapes for `/api/v1/admin/notification-settings`. Mirrors the backend's
 * `admin-notification-settings.service.ts` and `sender-classification.ts`.
 */

/** How a store's customer emails go out. Classified server-side — never re-derived here. */
export type SenderKind =
  | "DEFAULT"
  | "GMAIL"
  | "GMAIL_DISCONNECTED"
  | "CUSTOM_SMTP"
  | "CUSTOM_SMTP_INCOMPLETE"
  | "CUSTOM_NO_CONFIG";

type BadgeTone = "success" | "info" | "critical" | undefined;

export const SENDER_KIND_META: Record<SenderKind, { label: string; tone: BadgeTone }> = {
  DEFAULT: { label: "System default", tone: undefined },
  GMAIL: { label: "Gmail", tone: "info" },
  GMAIL_DISCONNECTED: { label: "Gmail · not connected", tone: "critical" },
  CUSTOM_SMTP: { label: "Custom SMTP", tone: "success" },
  CUSTOM_SMTP_INCOMPLETE: { label: "Custom SMTP · incomplete", tone: "critical" },
  CUSTOM_NO_CONFIG: { label: "Custom · no SMTP saved", tone: "critical" },
};

/** Stable codes from the backend's verdict.ts — wording lives in support-copy.ts. */
export type ProblemCode =
  | "gmail_not_connected"
  | "gmail_revoked"
  | "smtp_no_config"
  | "smtp_incomplete"
  | "smtp_no_login"
  | "smtp_untested"
  | "system_sender_unconfigured"
  | "template_missing"
  | "no_merchant_recipient"
  | "uninstalled";

export type VerdictState = "working" | "attention" | "not_working" | "inactive";

export interface Problem {
  code: ProblemCode;
  fields?: string[];
  templates?: EmailTemplateName[];
}

export interface Verdict {
  state: VerdictState;
  /** Worst first. */
  problems: Problem[];
}

/**
 * One row of `GET admin/notification-settings/stores` — every installed store. Settings-based: a
 * revoked Gmail grant only shows once the store page runs its live Google lookup.
 */
export interface StoreVerdictListItem {
  domain: string;
  name: string;
  kind: SenderKind;
  verdict: Verdict;
}

/** `GET admin/notification-settings/smtp/store?domain=`. Passwords are never sent, only `has*`. */
export interface StoreSenderDetail {
  /** The support-facing answer; everything else is the evidence behind it. */
  verdict: Verdict;
  domain: string;
  name: string;
  uninstalled: boolean;
  kind: SenderKind;
  summary: string;
  issues: string[];
  dormantCustomConfig: boolean;
  gmailConnected: boolean;
  /** Store name/email — the merchant screen's defaults when sender name, reply-to or recipient is unsaved. */
  storeInfo: { name: string | null; email: string | null };
  /**
   * Live Google lookup, attempted only when a connected credential row exists. `failed` means the
   * DB says connected but Google refused — usually revoked from the Google account side.
   */
  google: {
    lookup: "ok" | "failed" | "skipped";
    user: { email: string; name: string; picture: string } | null;
  };
  notification: {
    senderFrom: "DEFAULT" | "CUSTOM";
    senderName: string | null;
    replyTo: string | null;
    merchantEmail: string | null;
    updatedAt: string | null;
  } | null;
  smtp: {
    provider: string | null;
    from: string | null;
    protocol: string | null;
    host: string | null;
    port: number | null;
    tlsVersion: string | null;
    timeout: number;
    useProxy: boolean;
    proxyHost: string | null;
    proxyPort: number | null;
    proxyUsername: string | null;
    username: string | null;
    hasPassword: boolean;
    hasProxyPassword: boolean;
    createdAt: string;
  } | null;
}

export type EmailTemplateName =
  | "CLAIM_REQUEST_EMAIL_FOR_ADMIN"
  | "CLAIM_REQUEST_EMAIL_FOR_CUSTOMER"
  | "CLAIM_REFUND_EMAIL_FOR_CUSTOMER"
  | "CLAIM_REORDER_EMAIL_FOR_CUSTOMER"
  | "CLAIM_CANCEL_EMAIL_FOR_CUSTOMER";

/** The single merchant-facing template; every other one goes to the customer. */
export const ADMIN_TEMPLATE: EmailTemplateName = "CLAIM_REQUEST_EMAIL_FOR_ADMIN";

export interface EmailTemplate {
  name: EmailTemplateName;
  subject: string;
  body: string;
  enable: boolean;
  channel: string;
}

/**
 * `GET admin/notification-settings/email-templates?domain=`. Read raw — the backend does NOT seed
 * missing defaults the way the merchant GET does. A `missing` template is one whose email is skipped.
 */
export interface StoreEmailTemplates {
  templates: EmailTemplate[];
  missing: EmailTemplateName[];
  logo: {
    /** Public CDN URL, or null when unset / storage has no CDN base. */
    logo: string | null;
    file: { id: string; name: string | null; size: number; mimeType: string } | null;
  };
}

/**
 * `POST admin/notification-settings/test-email`. A failed send is a 200 with `success: false` and,
 * for SMTP, the server's own error — a result to read, not a request failure.
 */
export interface AdminTestEmailResult {
  success: boolean;
  transport: "smtp" | "gmail" | null;
  from: string | null;
  message: string;
  durationMs: number;
  error: {
    diagnosis:
      | "egress-blocked-or-filtered"
      | "connection-refused"
      | "dns-failure"
      | "auth-rejected"
      | "tls-failure"
      | "server-rejected"
      | "unknown";
    message: string;
    code?: string;
    command?: string;
    responseCode?: number;
    response?: string;
  } | null;
}

/** `GET admin/notification-settings/stats`. Installed stores only. */
export interface SenderStats {
  totalStores: number;
  /** Same verdict as the problem list, so each number matches its tab. */
  byState: Record<VerdictState, number>;
  bySender: { shipguard: number; gmail: number; ownServer: number };
  byKind: Record<SenderKind, number>;
  /** DEFAULT stores still holding a filled custom SMTP row — already counted inside DEFAULT. */
  dormantCustomConfig: number;
}
