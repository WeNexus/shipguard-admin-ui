/**
 * Every status sentence support reads on this tab lives here. The readers are not developers: say
 * what the merchant's customers see and what to do about it, never what the system is doing.
 */

import type { CheckoutValidationState } from "./types";

type Tone = "success" | "info" | "warning" | "critical";

export interface StatusCopy {
  tone: Tone;
  title: string;
  body: string;
  /** What support should do next. Omitted when nothing needs doing. */
  action?: string;
}

export type WidgetPage = "cart" | "checkout" | "thankYou";

// Names as the merchant sees them in their own app, so support can read the path out loud.
const PAGE = {
  cart: { name: "Cart", where: "on the cart page", menu: "Cart Page" },
  checkout: { name: "Checkout", where: "at checkout", menu: "Checkout Page" },
  thankYou: {
    name: "Thank you page",
    where: "on the order confirmation (thank you) page",
    menu: "Thank You Page",
  },
} as const;

export const NOT_SET_UP: StatusCopy = {
  tone: "warning",
  title: "ShipGuard isn't set up on this store yet",
  body: "The merchant installed the app but has never saved their widget settings. No protection widget shows on their store, so customers can't add protection to orders.",
  action:
    "Ask the merchant to open ShipGuard, go to Widget Setup, choose a price, and click Save.",
};

export const UNINSTALLED: StatusCopy = {
  tone: "critical",
  title: "App is uninstalled",
  body: "These are the settings the merchant last saved. Nothing shows on their store until they install ShipGuard again.",
};

export const DEFAULTS_PREVIEW =
  "These are the starting settings the merchant will see when they first open ShipGuard — not settings they chose.";

// The merchant's dashboard has an "Activate app embed" button that opens the theme editor.
const ACTIVATE_EMBED =
  "Ask the merchant to open ShipGuard → Dashboard, click “Activate app embed”, then click Save in the theme editor.";

/** One cell of the status card. `on: null` = we couldn't check, so show no switch. */
export interface StatusCellCopy {
  on: boolean | null;
  body: string;
  /** Red line for the state that's easy to miss. */
  alert?: string;
  action?: string;
}

/**
 * The cart widget is drawn by the theme app embed, so it needs BOTH the publish switch and the
 * embed. Checkout and thank-you are Shopify checkout extensions and ignore the embed — pass
 * `appEmbed` for the cart only.
 */
export function describePublished(
  page: WidgetPage,
  live: boolean,
  appEmbed?: boolean | null,
): StatusCellCopy {
  const p = PAGE[page];
  if (!live) {
    return {
      on: false,
      body: `Customers don't see ShipGuard protection ${p.where}. The settings below are saved but not showing.`,
      action: `If the merchant expects to see it, ask them to open ShipGuard → Widget Setup → ${p.menu} and turn the widget on.`,
    };
  }
  if (appEmbed === false) {
    return {
      on: true,
      body: `The merchant turned the widget on ${p.where}.`,
      alert:
        "But customers can't see it — the app embed is off, and this widget only shows when it's on.",
      action: ACTIVATE_EMBED,
    };
  }
  return {
    on: true,
    body: `Customers see ShipGuard protection ${p.where}, set up as shown below.`,
  };
}

export function describeAppEmbed(appEmbed: boolean | null): StatusCellCopy {
  if (appEmbed === null) {
    return {
      on: null,
      body: "Couldn't check the store's theme. The cart page widget only shows when the app embed is on.",
      action:
        "Ask the merchant to open ShipGuard → Dashboard and check that “App embed status” says Active.",
    };
  }
  return appEmbed
    ? {
        on: true,
        body: "ShipGuard is turned on in the store's theme, so the cart page widget can show.",
      }
    : {
        on: false,
        body: "ShipGuard is turned off in the store's theme, so the cart page widget can't show. Checkout and thank you page widgets don't need it.",
        action: ACTIVATE_EMBED,
      };
}

const VALIDATION_MEANING =
  "Shipping protection can only be purchased alongside other products.";

export function describeCheckoutValidation(
  state: CheckoutValidationState,
): StatusCellCopy {
  switch (state) {
    case "ACTIVE":
      return { on: true, body: VALIDATION_MEANING };
    case "ADDED_NOT_ON":
      return {
        on: false,
        body: VALIDATION_MEANING,
        alert: "The merchant added the rule in Shopify but didn't turn it on.",
        action:
          "Ask the merchant to open Shopify admin → Settings → Checkout → Checkout rules and turn on the ShipGuard rule.",
      };
    case "NOT_ADDED":
      return {
        on: false,
        body: `${VALIDATION_MEANING} Right now it's not set up, so customers can buy protection on its own.`,
        action:
          "Ask the merchant to open ShipGuard → Dashboard and click “Activate Fraud Protection”.",
      };
    default:
      return {
        on: null,
        body: `Couldn't check with Shopify. When on: ${VALIDATION_MEANING.toLowerCase()}`,
      };
  }
}

export function describeGeoLocation(
  countries: { label: string }[],
): StatusCellCopy {
  if (countries.length === 0) {
    return {
      on: false,
      body: "The cart widget shows to customers in every country.",
    };
  }
  return {
    on: true,
    body: `The cart widget only shows to customers shopping from: ${countries
      .map((c) => c.label)
      .join(", ")}. Customers anywhere else don't see it.`,
    action:
      "If a customer says they can't see protection, check which country they're shopping from.",
  };
}

/** "$" for USD etc. Falls back to the code itself, and to "" when the store has none on record. */
export function currencySymbol(code: string): string {
  if (!code) return "";
  try {
    return (
      new Intl.NumberFormat("en", { style: "currency", currency: code })
        .formatToParts(0)
        .find((part) => part.type === "currency")?.value ?? code
    );
  } catch {
    return code;
  }
}
