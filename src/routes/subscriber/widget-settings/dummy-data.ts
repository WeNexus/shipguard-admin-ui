// Placeholder data for the read-only Widget Settings view. There is no admin API for this yet;
// shapes and defaults follow ShipGuard_2.0_Frontend's widgetSetupCart / CheckoutPage / ThankYouPage
// loaders so the real response can be dropped in later.

import { WIDGET_ICONS } from "./shared/widget-icons";

export type InsurancePriceType =
  "PERCENTAGE" | "FIXED_PRICE" | "FIXED_MULTIPLE" | "NOT_SELECTED";

export type PolicyType = "NONE" | "TOOLTIP" | "FOOTER_LINK";

export interface PricingSettings {
  insurancePriceType: InsurancePriceType;
  percentage: string;
  minimumFee: string;
  maximumFee: string;
  price: string;
  fixedMultiplePlan: {
    protectionFees: string;
    cartMinPrice: string;
    cartMaxPrice: string;
  }[];
}

export interface ExcludedProduct {
  id: string;
  title: string;
  image?: string;
  totalVariants: number;
  selectedVariants: number;
}

export interface ClassicContent {
  title: string;
  enabledDescription: string;
  disabledDescription: string;
  policyType: PolicyType;
  policyText: string;
  policyUrl: string;
}

export interface ButtonStyle {
  fontSize: string;
  fontWeight: "normal" | "bold" | "lighter";
  textColor: string;
  buttonColor?: string;
  borderColor?: string;
  borderRadius?: number;
}

export interface CartPageSettings {
  widgetTemplate: "template-1" | "template-2";
  protectedCheckoutButton: {
    buttonText: string;
    description: string;
    fontSize: string;
    fontWeight: ButtonStyle["fontWeight"];
    descriptionFontSize: string;
    descriptionFontWeight: ButtonStyle["fontWeight"];
    textColor: string;
    backgroundColor: string;
    borderRadius: number;
  };
  regularCheckoutButton: ButtonStyle;
  viewCartButton: ButtonStyle & {
    show: boolean;
    buttonType: "outline" | "button";
  };
  classicStyle: {
    widgetStyle: "default" | "style-2" | "style-3" | "style-4";
    backgroundColor: string;
    borderColor: string;
    borderWidth: string;
    icon: string;
    switchColor: string;
  };
  classicContent: ClassicContent;
  conditionalRules: {
    isEnabled: boolean;
    thresholdValue: string;
    warningMessage: string;
  };
  upsellPopup: boolean;
  geoLocation: { label: string; value: string }[];
  css: string;
}

export interface CheckoutPageSettings {
  enabled: boolean;
  widgetStyle: "style-1" | "style-2";
  actionType: "toggle" | "checkbox";
  icon: string;
  content: ClassicContent;
}

export type ThankYouTone =
  "auto" | "neutral" | "info" | "success" | "warning" | "critical";

export interface ThankYouTextStyle {
  type: "generic" | "strong" | "small" | "emphasis";
  color: "base" | "subdued";
  tone: ThankYouTone;
}

export interface ThankYouButtonStyle {
  variant: "primary" | "secondary";
  tone: ThankYouTone;
}

export interface ThankYouPageSettings {
  widgetStyle: "thank-you-style-1" | "thank-you-style-2";
  backgroundColor: "base" | "subdued" | "transparent";
  borderWidth: "none" | "base" | "large";
  icon: string;
  title: string;
  description: string;
  confirmationMessage: string;
  addToCartText: string;
  dismissText: string;
  policyType: PolicyType;
  policyText: string;
  policyUrl: string;
  unpaidOrderFlow: "LEAVE_IT" | "REMOVE_AFTER";
  removeProtectionAfterMinutes: number;
  styles: {
    title: ThankYouTextStyle;
    description: ThankYouTextStyle;
    confirmation: ThankYouTextStyle;
    addToCart: ThankYouButtonStyle;
    dismiss: ThankYouButtonStyle;
    policy: {
      size: "small" | "base" | "large";
      color: "base" | "subdued";
      tone: ThankYouTone;
    };
  };
}

export interface WidgetSettingsData {
  currencySymbol: string;
  isShopifyPlus: boolean;
  pricing: PricingSettings;
  fulfillmentRule: string;
  excludedProducts: ExcludedProduct[];
  cart: CartPageSettings;
  checkout: CheckoutPageSettings;
  thankYou: ThankYouPageSettings;
}

export const widgetSettingsDummy: WidgetSettingsData = {
  currencySymbol: "$",
  isShopifyPlus: true,
  pricing: {
    insurancePriceType: "PERCENTAGE",
    percentage: "2.5",
    minimumFee: "1.99",
    maximumFee: "9.99",
    price: "4.99",
    fixedMultiplePlan: [
      { protectionFees: "2.99", cartMinPrice: "0", cartMaxPrice: "100" },
      { protectionFees: "4.99", cartMinPrice: "100", cartMaxPrice: "300" },
    ],
  },
  fulfillmentRule: "Mark as fulfilled immediately after purchase",
  excludedProducts: [
    {
      id: "gid://shopify/Product/1",
      title: "Limited Edition Glass Rig",
      totalVariants: 3,
      selectedVariants: 1,
    },
    {
      id: "gid://shopify/Product/2",
      title: "Gift Card",
      totalVariants: 4,
      selectedVariants: 4,
    },
  ],
  cart: {
    widgetTemplate: "template-2",
    protectedCheckoutButton: {
      buttonText: "Checkout + {{price}} Shipping Protection",
      description: "100% Covers Damage, Lost & Theft",
      fontSize: "16",
      fontWeight: "bold",
      descriptionFontSize: "12",
      descriptionFontWeight: "normal",
      textColor: "#ffffff",
      backgroundColor: "#2ba33d",
      borderRadius: 5,
    },
    regularCheckoutButton: {
      fontSize: "14",
      fontWeight: "normal",
      textColor: "#000000",
      buttonColor: "#ffffff",
      borderColor: "#000000",
      borderRadius: 5,
    },
    viewCartButton: {
      show: true,
      buttonType: "button",
      fontSize: "16",
      fontWeight: "normal",
      textColor: "#000000",
      buttonColor: "#ffffff",
      borderColor: "#cdcdcd",
      borderRadius: 5,
    },
    classicStyle: {
      widgetStyle: "default",
      backgroundColor: "#f9f9f9",
      borderColor: "#f9f9f9",
      borderWidth: "1",
      icon: WIDGET_ICONS[2],
      switchColor: "#6bce6a",
    },
    classicContent: {
      title: "Package Protection",
      enabledDescription: "100% Covers Damage, Lost & Theft",
      disabledDescription:
        "By deselecting we are not liable for lost, damaged, or stolen items.",
      policyType: "TOOLTIP",
      policyText: "We cover lost, damaged, and stolen packages.",
      policyUrl: "example.com/shipping-protection-policy",
    },
    conditionalRules: {
      isEnabled: true,
      thresholdValue: "100",
      warningMessage:
        "Your order is over {{price}} and requires shipping protection to proceed to checkout.",
    },
    upsellPopup: true,
    geoLocation: [
      { label: "United States", value: "US" },
      { label: "Canada", value: "CA" },
    ],
    css: ".shipguard-widget { margin-top: 12px; }",
  },
  checkout: {
    enabled: true,
    widgetStyle: "style-1",
    actionType: "toggle",
    icon: WIDGET_ICONS[2],
    content: {
      title: "Package Protection",
      enabledDescription: "100% Covers Damage, Lost & Theft",
      disabledDescription:
        "By deselecting we are not liable for lost, damaged, or stolen items.",
      policyType: "TOOLTIP",
      policyText: "We cover lost, damaged, and stolen packages.",
      policyUrl: "example.com/shipping-protection-policy",
    },
  },
  thankYou: {
    widgetStyle: "thank-you-style-1",
    backgroundColor: "base",
    borderWidth: "base",
    icon: WIDGET_ICONS[0],
    title: "Package Protection",
    description:
      "100% Payment guaranteed. Protect your order from damage, loss, or theft while in transit.",
    confirmationMessage:
      "Successfully added to order, please complete the payment",
    addToCartText: "Add to order",
    dismissText: "Dismiss",
    policyType: "FOOTER_LINK",
    policyText: "Refund Policy",
    policyUrl: "yourstore.com/policies/refund-policy",
    unpaidOrderFlow: "REMOVE_AFTER",
    removeProtectionAfterMinutes: 1440,
    styles: {
      title: { type: "strong", color: "base", tone: "auto" },
      description: { type: "small", color: "subdued", tone: "auto" },
      confirmation: { type: "small", color: "base", tone: "auto" },
      addToCart: { variant: "primary", tone: "auto" },
      dismiss: { variant: "secondary", tone: "auto" },
      policy: { size: "base", color: "base", tone: "auto" },
    },
  },
};
