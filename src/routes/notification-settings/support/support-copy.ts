/**
 * Every sentence the support team reads on the notification screens. Wording only — the backend
 * decides WHAT is wrong (verdict.ts problem codes); this file decides how to say it.
 *
 * Rules (see .speclet/plans/admin-notification-settings-support-ux.md):
 *  - `happening` is for support: everyday words, no codes, never "SMTP" on its own.
 *  - `steps` are copied to the merchant verbatim: numbered, one action each, and **bold** is the
 *    exact label the merchant sees in their ShipGuard app.
 *  - `escalate` means "don't send the merchant anything — it's ours to fix".
 */
import type {
  AdminTestEmailResult,
  EmailTemplateName,
  Problem,
  StoreSenderDetail,
  VerdictState,
} from "../type";

export interface SupportMessage {
  happening: string;
  steps?: string[];
  link?: { label: string; url: string };
  escalate?: boolean;
}

const OPEN_SETTINGS = "Open the ShipGuard app → **Settings** → **Notification**.";
const SAVE = "Click **Save**.";

const GOOGLE_GUIDE = {
  label: "How to connect Google SMTP",
  url: "https://help.shipguard.app/portal/en/kb/articles/how-to-connect-google-smtp-in-shipguard",
};

const RECONNECT_GOOGLE = [
  OPEN_SETTINGS,
  "Under **Notify customer**, find the Google account box and click **Connect**.",
  "Sign in with Google and allow access.",
];

// The labels the merchant sees for the three fields a mail server can't run without.
const FIELD_LABEL: Record<string, string> = {
  host: "**SMTP Host**",
  port: "**SMTP Port**",
  from: "**Mail From**",
};

/** Plain names support reads. */
export const EMAIL_NAME: Record<EmailTemplateName, string> = {
  CLAIM_REQUEST_EMAIL_FOR_CUSTOMER: "Claim received",
  CLAIM_REFUND_EMAIL_FOR_CUSTOMER: "Refund issued",
  CLAIM_REORDER_EMAIL_FOR_CUSTOMER: "Replacement order sent",
  CLAIM_CANCEL_EMAIL_FOR_CUSTOMER: "Claim cancelled",
  CLAIM_REQUEST_EMAIL_FOR_ADMIN: "New claim alert",
};

const listNames = (names: EmailTemplateName[] = []) =>
  names.map((n) => `"${EMAIL_NAME[n]}"`).join(", ");

const joinLabels = (labels: string[]) =>
  labels.length <= 1
    ? labels.join("")
    : `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;

export function problemMessage(problem: Problem, detail: StoreSenderDetail): SupportMessage {
  switch (problem.code) {
    case "gmail_revoked":
      return {
        happening:
          "Google account disconnected, probably from the Google console. The store sends its " +
          "emails through Gmail, but Google no longer lets ShipGuard use that account.",
        steps: RECONNECT_GOOGLE,
        link: GOOGLE_GUIDE,
      };
    case "gmail_not_connected":
      return {
        happening:
          "The store is set to send its emails through Gmail, but no Google account is connected.",
        steps: RECONNECT_GOOGLE,
        link: GOOGLE_GUIDE,
      };
    case "smtp_no_config":
      return {
        happening:
          '"Use custom domain email" is switched on, but the merchant never set up their email ' +
          "server. Nothing can be sent.",
        steps: [
          OPEN_SETTINGS,
          "Choose **Use default email** (the easiest option), or finish setting up your email server.",
          SAVE,
        ],
      };
    case "smtp_incomplete": {
      const labels = (problem.fields ?? []).map((f) => FIELD_LABEL[f] ?? f);
      return {
        happening:
          "The merchant started setting up their own email server but left some fields empty, so " +
          `nothing can be sent. Missing: ${joinLabels(labels).replace(/\*\*/g, "")}.`,
        steps: [
          OPEN_SETTINGS,
          `Fill in ${joinLabels(labels)}. Your email provider can tell you what to enter.`,
          SAVE,
          "Not sure what to enter? Choose **Use default email** instead and click **Save**.",
        ],
      };
    }
    case "smtp_no_login":
      return {
        happening:
          "Emails go through the merchant's own email server, but no login is saved. Most email " +
          "servers refuse to send without one. Send a test email to check.",
        steps: [
          OPEN_SETTINGS,
          "Fill in **Username** and **Password** (your email provider gives you these).",
          SAVE,
        ],
      };
    case "smtp_untested":
      return {
        happening:
          "Emails go through the merchant's own email server. The settings look complete, but " +
          "only a test email can prove they work — send one below.",
      };
    case "system_sender_unconfigured":
      return {
        happening:
          detail.kind === "DEFAULT"
            ? "ShipGuard's own email sender is not set up on our server, so none of this store's " +
              "emails can be sent. This is our problem, not the merchant's."
            : "ShipGuard's own email sender is not set up on our server, so new-claim alerts to the " +
              "merchant can't be sent. This is our problem, not the merchant's.",
        escalate: true,
      };
    case "template_missing":
      return {
        happening:
          `These emails are not being sent because they don't exist for this store: ` +
          `${listNames(problem.templates)}.`,
        steps: [OPEN_SETTINGS, "That's all — opening the page puts the missing emails back."],
      };
    case "no_merchant_recipient":
      return {
        happening:
          "New-claim alerts to the merchant are not being sent — there's no email address to send " +
          "them to.",
        steps: [
          "Open the ShipGuard app → **Settings** → **Notification** → **Notify merchant**.",
          "Fill in **Recipient email address**.",
          SAVE,
        ],
      };
    case "uninstalled":
      return { happening: "This store has uninstalled ShipGuard, so no emails are sent." };
  }
}

/** A few words per problem, for list rows. The store page has the full message. */
export function problemShort(problem: Problem): string {
  switch (problem.code) {
    case "gmail_revoked":
      return "Google account disconnected";
    case "gmail_not_connected":
      return "Gmail chosen, but no Google account connected";
    case "smtp_no_config":
      return "Own email server switched on, but never set up";
    case "smtp_incomplete": {
      const labels = (problem.fields ?? []).map((f) => FIELD_LABEL[f]?.replace(/\*\*/g, "") ?? f);
      return `Email server setup unfinished (missing ${joinLabels(labels)})`;
    }
    case "smtp_no_login":
      return "Email server has no login saved";
    case "smtp_untested":
      return "Own email server — send a test to confirm";
    case "system_sender_unconfigured":
      return "ShipGuard's own sender is down — engineering";
    case "template_missing": {
      const n = problem.templates?.length ?? 0;
      return `${n} email${n === 1 ? "" : "s"} missing: ${listNames(problem.templates)}`;
    }
    case "no_merchant_recipient":
      return "No email address for merchant claim alerts";
    case "uninstalled":
      return "Store uninstalled";
  }
}

/** Badge wording/colour per state, shared by the list and the overview. */
export const STATE_META: Record<
  VerdictState,
  { label: string; tone: "success" | "attention" | "critical" | undefined }
> = {
  working: { label: "Working", tone: "success" },
  attention: { label: "Needs attention", tone: "attention" },
  not_working: { label: "Not working", tone: "critical" },
  inactive: { label: "Uninstalled", tone: undefined },
};

// Problems that stop the store's customer emails entirely (vs. one email or merchant alerts only).
function senderBroken(detail: StoreSenderDetail): boolean {
  return detail.verdict.problems.some(
    (p) =>
      p.code === "gmail_revoked" ||
      p.code === "gmail_not_connected" ||
      p.code === "smtp_no_config" ||
      p.code === "smtp_incomplete" ||
      (p.code === "system_sender_unconfigured" && detail.kind === "DEFAULT"),
  );
}

export function customerEmailsBlocked(detail: StoreSenderDetail): boolean {
  return detail.uninstalled || senderBroken(detail);
}

export function verdictHeadline(state: VerdictState, detail: StoreSenderDetail): string {
  switch (state) {
    case "working":
      return "Emails are working";
    case "attention":
      return "Emails should be working — worth a check";
    case "not_working":
      return senderBroken(detail) ? "Emails are NOT being sent" : "Some emails are NOT being sent";
    case "inactive":
      return "Store has uninstalled ShipGuard";
  }
}

/** Where customer emails come from, in one line. */
export function senderLine(detail: StoreSenderDetail): string {
  switch (detail.kind) {
    case "DEFAULT":
      return "Customer emails are sent from ShipGuard's address, no-reply@shipguard.app.";
    case "GMAIL":
      return `Customer emails are sent from the merchant's Gmail${
        detail.google.user?.email ? `, ${detail.google.user.email}` : ""
      }.`;
    case "GMAIL_DISCONNECTED":
      return "Customer emails are set to go through the merchant's Gmail.";
    default:
      return `Customer emails go through the merchant's own email server${
        detail.smtp?.from ? `, sending as ${detail.smtp.from}` : ""
      }.`;
  }
}

// ── Test email ───────────────────────────────────────────────────────────────

type Diagnosis = NonNullable<AdminTestEmailResult["error"]>["diagnosis"];

const TEST_FAILURE: Record<Diagnosis, SupportMessage> = {
  "auth-rejected": {
    happening: "The email server rejected the Username or Password.",
    steps: [
      OPEN_SETTINGS,
      "Type the **Username** and **Password** again. Gmail and Outlook usually need an " +
        '"app password" here, not your normal login password.',
      SAVE,
    ],
  },
  "dns-failure": {
    happening: "The SMTP Host address doesn't exist — probably a typo.",
    steps: [
      OPEN_SETTINGS,
      "Check the spelling of **SMTP Host** (for example smtp.gmail.com).",
      SAVE,
    ],
  },
  "connection-refused": {
    happening: "The email server refused the connection — the SMTP Host or SMTP Port is wrong.",
    steps: [
      "Ask your email provider for the correct **SMTP Host** and **SMTP Port**.",
      OPEN_SETTINGS,
      "Enter them and click **Save**.",
    ],
  },
  "tls-failure": {
    happening: "The SMTP Protocol and SMTP Port don't match what the email server expects.",
    steps: [
      OPEN_SETTINGS,
      "Most providers use **SMTPS** with port **465**, or **SMTP** with port **587**. Pick the " +
        "pair your provider lists.",
      SAVE,
    ],
  },
  "egress-blocked-or-filtered": {
    happening: "The email server didn't answer in time. This may be a problem on our side.",
    escalate: true,
  },
  "server-rejected": {
    happening:
      "The email server connected but refused to send. Usually the Mail From address isn't allowed " +
      "for that login.",
    steps: [
      OPEN_SETTINGS,
      "Make sure **Mail From** is the same email address as the **Username** (or one your " +
        "provider allows).",
      SAVE,
    ],
  },
  unknown: {
    happening: "Something unexpected went wrong.",
    escalate: true,
  },
};

export function testFailureMessage(
  result: AdminTestEmailResult,
  detail: StoreSenderDetail,
): SupportMessage {
  // Nothing was attempted — the settings themselves are unusable, which the verdict already explains.
  if (result.transport === null) {
    const top = detail.verdict.problems.find((p) => p.code !== "uninstalled");
    return top
      ? problemMessage(top, detail)
      : { happening: result.message, escalate: true };
  }
  if (result.transport === "gmail") {
    return {
      happening: "Gmail refused to send the test email. The Google account probably needs reconnecting.",
      steps: RECONNECT_GOOGLE,
      link: GOOGLE_GUIDE,
    };
  }
  return TEST_FAILURE[result.error?.diagnosis ?? "unknown"];
}

/** `1. step\n2. step\n\nGuide: url` — what the Copy button puts on the clipboard. */
export function stepsAsPlainText(message: SupportMessage): string {
  const steps = (message.steps ?? []).map((s, i) => `${i + 1}. ${s.replace(/\*\*/g, "")}`);
  if (message.link) steps.push("", `Guide: ${message.link.url}`);
  return steps.join("\n");
}
