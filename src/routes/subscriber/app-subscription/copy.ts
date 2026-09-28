import type { StoreBilling } from "./types";

/**
 * Every sentence support reads on this tab lives here. The readers are not developers: say what the
 * merchant experiences and what to do about it, never what the system is doing. The backend decides
 * WHICH verdict applies; this file only words it.
 */

type Tone = "success" | "info" | "warning" | "critical";

export interface VerdictCopy {
  tone: Tone;
  title: string;
  body: string;
  /** What support should do next. Omitted when nothing needs doing. */
  action?: string;
}

const CHOOSE_PLAN = "Ask the merchant to open the app and choose a plan.";

export function describeVerdict(data: StoreBilling): VerdictCopy {
  const plan = data.subscription?.planName ?? data.history[0]?.name ?? "";

  switch (data.verdict) {
    case "UNINSTALLED":
      return {
        tone: "critical",
        title: "App is uninstalled",
        body: `The merchant removed ShipGuard from their store${
          data.store.uninstalledAt
            ? ` on ${formatDate(data.store.uninstalledAt)}`
            : ""
        }. Nothing works until they install it again.`,
        action:
          "Ask the merchant to reinstall ShipGuard from the Shopify App Store.",
      };
    case "SHOPIFY_UNREACHABLE":
      return {
        tone: "warning",
        title: "Couldn't check with Shopify",
        body:
          "Shopify didn't answer for this store, so we can't tell whether the merchant is subscribed. " +
          "This does NOT mean they have no subscription.",
        action:
          "Press Check again. If it keeps failing, send this page to a developer.",
      };
    case "ACTIVE":
      return {
        tone: "success",
        title: `Subscribed — ${plan} plan`,
        body: "The merchant has an active subscription and can use the app.",
      };
    case "FOUNDER_SETUP_INCOMPLETE":
      return {
        tone: "warning",
        title: "Founder Club setup not finished",
        body:
          "The merchant bought Founder Club but hasn't approved the Founder Usage plan yet. " +
          "The app will keep asking them to finish this step.",
        action:
          "Ask the merchant to open the app and complete the Founder setup.",
      };
    case "FREE_GROUP":
      return {
        tone: "success",
        title: "Free access — no subscription needed",
        body:
          "This store is in the Free pricing group, so it can use the app without paying. " +
          "It has no subscription, and that is expected.",
        action:
          "To change this, use Pricing Group in the App Control card on the Order tab.",
      };
    case "FREE_ACCESS_LIST":
      return {
        tone: "success",
        title: "Free access — special exception",
        body:
          "This store is on our built-in free access list, so it can use the app without paying. " +
          "It has no subscription, and that is expected.",
        action: "Changing this needs a developer.",
      };
    case "AWAITING_APPROVAL":
      return {
        tone: "warning",
        title: "No subscription — waiting for the merchant to approve",
        body: `The merchant picked the ${plan} plan but hasn't pressed Approve on Shopify's charge page. The app stays locked until they do.`,
        action: "Ask the merchant to open the app and approve the plan.",
      };
    case "FROZEN":
      return {
        tone: "critical",
        title: "No subscription — on hold because a Shopify bill is unpaid",
        body: `Shopify paused the merchant's ${plan} subscription because their Shopify bill isn't paid. The app is locked. It turns back on by itself once they pay.`,
        action:
          "Ask the merchant to pay their outstanding Shopify bill (Shopify admin → Settings → Billing).",
      };
    case "DECLINED":
      return {
        tone: "critical",
        title: "No subscription — the merchant declined the charge",
        body: `The merchant was asked to approve the ${plan} plan and pressed Decline. The app is locked.`,
        action: CHOOSE_PLAN,
      };
    case "EXPIRED":
      return {
        tone: "critical",
        title: "No subscription — the charge was never approved",
        body: `The merchant started choosing the ${plan} plan but didn't approve it within 2 days, so Shopify dropped the request. The app is locked.`,
        action: CHOOSE_PLAN,
      };
    case "CANCELLED":
      return {
        tone: "critical",
        title: "No subscription — it was cancelled",
        body: `The merchant's ${plan} subscription ended and they haven't subscribed again. The app is locked and shows them the pricing page.`,
        action: CHOOSE_PLAN,
      };
    case "NO_SUBSCRIPTION":
      return {
        tone: "critical",
        title: "No subscription",
        body:
          "This store has never subscribed to ShipGuard. The app is locked and shows the merchant " +
          "the pricing page.",
        action: CHOOSE_PLAN,
      };
  }
}

/** Shopify's statuses in words a merchant would use. */
export const HISTORY_STATUS: Record<
  string,
  {
    label: string;
    tone: "success" | "attention" | "warning" | "critical" | undefined;
  }
> = {
  ACTIVE: { label: "Active", tone: "success" },
  PENDING: { label: "Waiting for approval", tone: "attention" },
  FROZEN: { label: "On hold — bill unpaid", tone: "warning" },
  DECLINED: { label: "Declined by merchant", tone: "critical" },
  EXPIRED: { label: "Never approved", tone: "critical" },
  CANCELLED: { label: "Ended", tone: undefined },
};

const usdFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const usd = (amount: number) => usdFormat.format(amount);

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, { dateStyle: "medium" });
}
