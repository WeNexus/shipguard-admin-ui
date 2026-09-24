import {
  Badge,
  BlockStack,
  Checkbox,
  ChoiceList,
  Divider,
  FormLayout,
  Icon,
  InlineGrid,
  InlineStack,
  RangeSlider,
  Select,
  Tag,
  Text,
  TextField,
} from "@shopify/polaris";
import {
  AppsFilledIcon,
  ButtonIcon,
  ButtonPressIcon,
  CartIcon,
  ChartPopularIcon,
  CheckIcon,
  CodeIcon,
  HideIcon,
  LocationIcon,
  LockIcon,
  PlusCircleIcon,
  ShieldCheckMarkIcon,
  ViewIcon,
} from "@shopify/polaris-icons";
import { useState } from "react";
import SettingCard from "./shared/setting-card";
import TwoColumnLayout from "./shared/two-column-layout";
import InsurancePricing from "./shared/insurance-pricing";
import FulfillmentRule from "./shared/fulfillment-rule";
import ProductExclusions from "./shared/product-exclusions";
import ClassicContent from "./shared/classic-content";
import IconPicker from "./shared/icon-picker";
import ColorField from "./shared/color-field";
import CollapsibleSection from "./shared/collapsible-section";
import type { ButtonStyle, WidgetSettingsData } from "./dummy-data";

const FONT_WEIGHT_OPTIONS = [
  { label: "Normal", value: "normal" },
  { label: "Bold", value: "bold" },
  { label: "Light", value: "lighter" },
];

const TEMPLATES = [
  {
    value: "template-2",
    label: "Standard widgets",
    tag: "Button",
    image:
      "https://res.cloudinary.com/derskbgjq/image/upload/q_auto/f_auto/v1775553525/Screenshot_from_2026-04-07_15-17-57-removebg-preview_n389fz.png",
  },
  {
    value: "template-1",
    label: "Classic widgets",
    tag: "Toggle",
    image:
      "https://res.cloudinary.com/derskbgjq/image/upload/q_auto/f_auto/v1775543614/Screenshot_from_2026-04-07_12-07-09_py6lj6.png",
  },
] as const;

const FontFields = ({
  fontSize,
  fontWeight,
}: {
  fontSize: string;
  fontWeight: string;
}) => (
  <InlineGrid columns={2} gap="300">
    <TextField
      label="Font Size"
      type="number"
      suffix="px"
      value={fontSize}
      autoComplete="off"
      readOnly
    />
    <Select
      label="Font Weight"
      options={FONT_WEIGHT_OPTIONS}
      value={fontWeight}
      disabled
    />
  </InlineGrid>
);

const RadiusSlider = ({ value, max }: { value: number; max: number }) => (
  <RangeSlider
    label="Button Radius"
    value={value}
    min={0}
    max={max}
    prefix="0px"
    suffix={`${max === 100 ? 40 : max}px`}
    output
    onChange={() => {}}
    disabled
  />
);

const ButtonColors = ({ button }: { button: ButtonStyle }) => (
  <>
    <InlineGrid columns={2} gap="300">
      <ColorField label="Button Color" value={button.buttonColor ?? ""} />
      <ColorField label="Border Color" value={button.borderColor ?? ""} />
    </InlineGrid>
    <RadiusSlider value={button.borderRadius ?? 0} max={24} />
  </>
);

const TemplateSelector = ({ value }: { value: string }) => (
  <SettingCard
    icon={AppsFilledIcon}
    title="Choose a widget template"
    subtitle="Select how protection appears at checkout"
  >
    <InlineGrid columns={2} gap="300">
      {TEMPLATES.map((template) => {
        const selected = template.value === value;
        return (
          <div
            key={template.value}
            className={`relative overflow-hidden rounded-lg border-2 ${
              selected ? "border-green-500" : "border-gray-200"
            }`}
          >
            {selected && (
              <div className="absolute right-2 top-2 rounded bg-green-500 text-white">
                <Icon source={CheckIcon} />
              </div>
            )}
            <div className="flex h-28 items-center justify-center bg-gray-50 p-2">
              <img
                src={template.image}
                alt={template.label}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 p-2">
              <Text as="span" fontWeight="semibold">
                {template.label}
              </Text>
              <Badge>{template.tag}</Badge>
            </div>
          </div>
        );
      })}
    </InlineGrid>
  </SettingCard>
);

type StandardSection = "protected" | "regular" | "viewCart";

const StandardContent = ({ cart }: { cart: WidgetSettingsData["cart"] }) => {
  const [open, setOpen] = useState<StandardSection | null>(null);
  const toggle = (section: StandardSection) =>
    setOpen((current) => (current === section ? null : section));
  const { protectedCheckoutButton: protectedBtn } = cart;
  const regular = cart.regularCheckoutButton;
  const viewCart = cart.viewCartButton;

  return (
    <SettingCard
      icon={ButtonPressIcon}
      title="Content"
      subtitle="Customize Standard Widget Content"
    >
      <BlockStack gap="300">
        <CollapsibleSection
          id="standard-protected-checkout"
          icon={ShieldCheckMarkIcon}
          title="Protected Checkout Button"
          open={open === "protected"}
          onToggle={() => toggle("protected")}
        >
          <FormLayout>
            <TextField
              label="Button Text"
              value={protectedBtn.buttonText}
              maxLength={60}
              showCharacterCount
              helpText="Use the {{price}} variable to show real Shipping Protection price"
              autoComplete="off"
              readOnly
            />
            <TextField
              label="Upsell Description (Optional)"
              value={protectedBtn.description}
              maxLength={70}
              showCharacterCount
              autoComplete="off"
              readOnly
            />
            <Divider />
            <FontFields
              fontSize={protectedBtn.fontSize}
              fontWeight={protectedBtn.fontWeight}
            />
            <FontFields
              fontSize={protectedBtn.descriptionFontSize}
              fontWeight={protectedBtn.descriptionFontWeight}
            />
            <InlineGrid columns={2} gap="300">
              <ColorField label="Text Color" value={protectedBtn.textColor} />
              <ColorField
                label="Background Color"
                value={protectedBtn.backgroundColor}
              />
            </InlineGrid>
            <RadiusSlider value={protectedBtn.borderRadius} max={100} />
          </FormLayout>
        </CollapsibleSection>

        <CollapsibleSection
          id="standard-regular-checkout"
          icon={LockIcon}
          title="Regular Checkout Button"
          open={open === "regular"}
          onToggle={() => toggle("regular")}
        >
          <FormLayout>
            <FontFields
              fontSize={regular.fontSize}
              fontWeight={regular.fontWeight}
            />
            <ColorField label="Text Color" value={regular.textColor} />
            <ButtonColors button={regular} />
          </FormLayout>
        </CollapsibleSection>

        <CollapsibleSection
          id="standard-view-cart"
          icon={CartIcon}
          title="View Cart"
          open={open === "viewCart"}
          onToggle={() => toggle("viewCart")}
          action={
            <Icon source={viewCart.show ? ViewIcon : HideIcon} tone="subdued" />
          }
        >
          <FormLayout>
            <FontFields
              fontSize={viewCart.fontSize}
              fontWeight={viewCart.fontWeight}
            />
            <Select
              label="Button Type"
              options={[
                { label: "Outline", value: "outline" },
                { label: "Button", value: "button" },
              ]}
              value={viewCart.buttonType}
              disabled
            />
            <ColorField label="Text Color" value={viewCart.textColor} />
            {viewCart.buttonType === "button" && (
              <ButtonColors button={viewCart} />
            )}
          </FormLayout>
        </CollapsibleSection>
      </BlockStack>
    </SettingCard>
  );
};

const ClassicStyle = ({
  style,
}: {
  style: WidgetSettingsData["cart"]["classicStyle"];
}) => (
  <SettingCard
    icon={ButtonIcon}
    title="Customize Style"
    subtitle="Control the visual appearance of your widget"
  >
    <FormLayout>
      <Select
        label="Choose a Widget Style"
        options={[
          { label: "Default", value: "default" },
          { label: "Style-2", value: "style-2" },
          { label: "Style-3", value: "style-3" },
          { label: "Style-4", value: "style-4" },
        ]}
        value={style.widgetStyle}
        disabled
      />
      <ColorField
        label="Widget Background Color"
        value={style.backgroundColor}
      />
      <InlineGrid columns={2} gap="300">
        <ColorField label="Widget Border Color" value={style.borderColor} />
        <TextField
          label="Border Width"
          type="number"
          suffix="px"
          value={style.borderWidth}
          autoComplete="off"
          readOnly
        />
      </InlineGrid>
      <IconPicker selected={style.icon} />
      <ColorField label="Insurance switch color" value={style.switchColor} />
    </FormLayout>
  </SettingCard>
);

const ConditionalRules = ({
  rules,
  currency,
}: {
  rules: WidgetSettingsData["cart"]["conditionalRules"];
  currency: string;
}) => (
  <SettingCard
    icon={PlusCircleIcon}
    title={
      <InlineStack gap="200" blockAlign="center">
        <span>Conditional Rules</span>
        <Badge tone="success">New</Badge>
      </InlineStack>
    }
    subtitle="Requires shipping protection to be enabled before checkout."
    action={
      <Badge tone={rules.isEnabled ? "success" : undefined}>
        {rules.isEnabled ? "Enabled" : "Disabled"}
      </Badge>
    }
  >
    <Text as="p" tone="subdued">
      Define rules that require customers to enable shipping protection before
      they can checkout. If the condition is met and protection is off the
      checkout button is disabled.
    </Text>
    {rules.isEnabled && (
      <FormLayout>
        <Text as="h4" variant="headingSm">
          When:
        </Text>
        <InlineGrid columns={3} gap="300">
          <Select
            label="Condition"
            options={[{ label: "Cart value", value: "cart_value" }]}
            value="cart_value"
            disabled
          />
          <Select
            label="Operator"
            options={[{ label: "is greater than", value: "gt" }]}
            value="gt"
            disabled
          />
          <TextField
            label="Value"
            type="number"
            prefix={currency}
            value={rules.thresholdValue}
            autoComplete="off"
            readOnly
          />
        </InlineGrid>
        <Divider />
        <TextField
          label={<b>Warning Message</b>}
          value={rules.warningMessage}
          multiline={3}
          helpText="Use {{price}} to display the customer's total cart value in your message."
          autoComplete="off"
          readOnly
        />
      </FormLayout>
    )}
  </SettingCard>
);

const CartPage = ({ data }: { data: WidgetSettingsData }) => {
  const { cart } = data;
  const isClassic = cart.widgetTemplate === "template-1";

  return (
    <TwoColumnLayout>
      <BlockStack gap="400">
        <InsurancePricing
          pricing={data.pricing}
          currency={data.currencySymbol}
        />
        <TemplateSelector value={cart.widgetTemplate} />
        {isClassic ? (
          <>
            <ClassicStyle style={cart.classicStyle} />
            <ClassicContent content={cart.classicContent} />
          </>
        ) : (
          <StandardContent cart={cart} />
        )}
      </BlockStack>
      <BlockStack gap="400">
        <FulfillmentRule value={data.fulfillmentRule} />
        <ProductExclusions products={data.excludedProducts} />
        {isClassic && (
          <ConditionalRules
            rules={cart.conditionalRules}
            currency={data.currencySymbol}
          />
        )}

        <SettingCard
          icon={ChartPopularIcon}
          title="Protection Upsell"
          subtitle="Setup reminder popup that upsell protection"
        >
          <Checkbox
            label={
              <b>Show reminder popup if package protection isn’t selected</b>
            }
            checked={cart.upsellPopup}
            disabled
          />
          <Text as="p" tone="subdued">
            Enable the Protection Upsell popup to remind customers to add
            package protection before completing the checkout.
          </Text>
          <Text as="p" tone="subdued">
            This helps reduce post-purchase claim and ensure customers are aware
            of the coverage benefits.
          </Text>
        </SettingCard>

        <SettingCard
          icon={LocationIcon}
          title="Geo Location Target"
          subtitle="Block a specific country from using the widget"
        >
          <Text as="p" variant="bodySm" tone="subdued">
            Show the Shipping Protection widget to all countries by default, or
            choose specific countries where it should appear.
          </Text>
          <ChoiceList
            title="Countries"
            titleHidden
            choices={[
              { label: "All World", value: "all" },
              { label: "Specific Countries", value: "specific" },
            ]}
            selected={[cart.geoLocation.length ? "specific" : "all"]}
            onChange={() => {}}
            disabled
          />
          {cart.geoLocation.length > 0 && (
            <BlockStack gap="200">
              <Text as="span" fontWeight="bold">
                Countries
              </Text>
              <InlineStack gap="200">
                {cart.geoLocation.map((country) => (
                  <Tag key={country.value}>{country.label}</Tag>
                ))}
              </InlineStack>
            </BlockStack>
          )}
        </SettingCard>

        <SettingCard icon={CodeIcon} title="CSS" subtitle="Add additional CSS">
          <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 text-sm text-gray-100">
            {cart.css || "/* add your css style */"}
          </pre>
        </SettingCard>
      </BlockStack>
    </TwoColumnLayout>
  );
};

export default CartPage;
