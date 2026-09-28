// Response of `GET admin/subscribers/widget-settings?shop=`. Mirrors the backend's
// admin-widget-settings/dto/widget-settings-response.dto.ts — keep the two in step.

export type InsurancePriceType =
  "PERCENTAGE" | "FIXED_PRICE" | "FIXED_MULTIPLE" | "NOT_SELECTED";

export type PolicyType = "NONE" | "TOOLTIP" | "FOOTER_LINK";

/** ShipGuard's checkout rule (Shopify admin → Settings → Checkout → Rules). */
export type CheckoutValidationState =
  "ACTIVE" | "ADDED_NOT_ON" | "NOT_ADDED" | "UNKNOWN";

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
  image: string | null;
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
  fontWeight: string;
  textColor: string;
  buttonColor?: string;
  borderColor?: string;
  borderRadius?: number;
}

export interface CartPageSettings {
  live: boolean;
  widgetTemplate: string;
  protectedCheckoutButton: {
    buttonText: string;
    description: string;
    fontSize: string;
    fontWeight: string;
    descriptionFontSize: string;
    descriptionFontWeight: string;
    textColor: string;
    backgroundColor: string;
    borderRadius: number;
  };
  regularCheckoutButton: ButtonStyle;
  viewCartButton: ButtonStyle & {
    show: boolean;
    buttonType: string;
  };
  classicStyle: {
    widgetStyle: string;
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
  live: boolean;
  widgetStyle: string;
  actionType: string;
  icon: string;
  content: ClassicContent;
}

export interface ThankYouTextStyle {
  type: string;
  color: string;
  tone: string;
}

export interface ThankYouButtonStyle {
  variant: string;
  tone: string;
}

export interface ThankYouPageSettings {
  live: boolean;
  widgetStyle: string;
  backgroundColor: string;
  borderWidth: string;
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
  // The backend merges stored styles over defaults, so every group is present.
  styles: {
    title: ThankYouTextStyle;
    description: ThankYouTextStyle;
    confirmation: ThankYouTextStyle;
    addToCart: ThankYouButtonStyle;
    dismiss: ThankYouButtonStyle;
    policy: { size: string; color: string; tone: string };
  };
}

export interface WidgetSettingsData {
  domain: string;
  uninstalled: boolean;
  /** False = the merchant never saved their widget settings; every value is a default. */
  setUp: boolean;
  /** Gates the cart widget only. null = couldn't check the theme. */
  appEmbedEnabled: boolean | null;
  checkoutValidation: CheckoutValidationState;
  currencyCode: string;
  isShopifyPlus: boolean;
  pricing: PricingSettings;
  fulfillmentRule: string;
  excludedProducts: ExcludedProduct[];
  cart: CartPageSettings;
  checkout: CheckoutPageSettings;
  thankYou: ThankYouPageSettings;
}
