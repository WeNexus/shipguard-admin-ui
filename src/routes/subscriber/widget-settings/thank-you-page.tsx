import {
  Badge,
  Banner,
  BlockStack,
  Button,
  ButtonGroup,
  Divider,
  FormLayout,
  Icon,
  InlineGrid,
  InlineStack,
  Link,
  Select,
  Text,
  TextField,
  Tooltip,
} from "@shopify/polaris";
import {
  ButtonIcon,
  ButtonPressIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  ContentIcon,
  InfoIcon,
  LinkIcon,
  NoteIcon,
  TextIcon,
} from "@shopify/polaris-icons";
import { useState } from "react";
import SettingCard from "./shared/setting-card";
import TwoColumnLayout from "./shared/two-column-layout";
import InsurancePricing from "./shared/insurance-pricing";
import FulfillmentRule from "./shared/fulfillment-rule";
import ProductExclusions from "./shared/product-exclusions";
import IconPicker from "./shared/icon-picker";
import PolicyFields from "./shared/policy-fields";
import CollapsibleSection from "./shared/collapsible-section";
import type {
  ThankYouButtonStyle,
  ThankYouPageSettings,
  ThankYouTextStyle,
  WidgetSettingsData,
} from "./dummy-data";

const UNPAID_FLOW_DOCS =
  "https://help.shipguard.app/portal/en/kb/articles/unpaid-package-protection-flow";

const TEXT_STYLE_OPTIONS = [
  { label: "Default", value: "generic" },
  { label: "Strong (bold)", value: "strong" },
  { label: "Small", value: "small" },
  { label: "Emphasis (italic)", value: "emphasis" },
];
const EMPHASIS_OPTIONS = [
  { label: "Default", value: "base" },
  { label: "Subdued", value: "subdued" },
];
const TONE_OPTIONS = [
  { label: "Automatic", value: "auto" },
  { label: "Neutral", value: "neutral" },
  { label: "Info", value: "info" },
  { label: "Success", value: "success" },
  { label: "Warning", value: "warning" },
  { label: "Critical", value: "critical" },
];
const BUTTON_TONE_OPTIONS = [
  { label: "Automatic", value: "auto" },
  { label: "Neutral", value: "neutral" },
  { label: "Critical", value: "critical" },
];
const BUTTON_STYLE_OPTIONS = [
  { label: "Primary (filled)", value: "primary" },
  { label: "Secondary (outlined)", value: "secondary" },
];
const ICON_SIZE_OPTIONS = [
  { label: "Small", value: "small" },
  { label: "Default", value: "base" },
  { label: "Large", value: "large" },
];
const TONE_HELP = "Tones carry meaning as well as colour.";

const TextStyleFields = ({ style }: { style: ThankYouTextStyle }) => (
  <>
    <Divider />
    <InlineGrid columns={2} gap="300">
      <Select
        label="Text style"
        helpText="Size and weight are one setting — checkout treats them as a single style."
        options={TEXT_STYLE_OPTIONS}
        value={style.type}
        disabled
      />
      <Select
        label="Emphasis"
        options={EMPHASIS_OPTIONS}
        value={style.color}
        disabled
      />
      <Select
        label="Tone"
        helpText={TONE_HELP}
        options={TONE_OPTIONS}
        value={style.tone}
        disabled
      />
    </InlineGrid>
  </>
);

const ButtonStyleFields = ({ style }: { style: ThankYouButtonStyle }) => (
  <>
    <Divider />
    <InlineGrid columns={2} gap="300">
      <Select
        label="Button style"
        helpText="Checkout styles buttons from your brand settings, so colours are not set here."
        options={BUTTON_STYLE_OPTIONS}
        value={style.variant}
        disabled
      />
      <Select
        label="Tone"
        helpText={TONE_HELP}
        options={BUTTON_TONE_OPTIONS}
        value={style.tone}
        disabled
      />
    </InlineGrid>
  </>
);

type ContentSection =
  "title" | "description" | "confirmation" | "button" | "policy";

const ThankYouContent = ({ settings }: { settings: ThankYouPageSettings }) => {
  const [open, setOpen] = useState<ContentSection | null>(null);
  const section = (id: ContentSection) => ({
    open: open === id,
    onToggle: () => setOpen((current) => (current === id ? null : id)),
  });
  const { styles } = settings;

  return (
    <SettingCard
      icon={ContentIcon}
      title="Content"
      subtitle="Configure what customers see on the widget"
    >
      <Text as="p" variant="bodySm" tone="subdued">
        Shopify renders this widget in your store's own checkout branding, so
        styling is chosen from set options rather than exact colours and sizes.
        Text size and weight are one setting because checkout treats them as
        one, and button colours come from your brand settings.
      </Text>
      <BlockStack gap="400">
        <CollapsibleSection
          id="ty-title"
          icon={TextIcon}
          title="Add-on title (Name of the insurance)"
          {...section("title")}
        >
          <FormLayout>
            <TextField
              label={<b>Add-on title (Name of the insurance)</b>}
              value={settings.title}
              maxLength={25}
              showCharacterCount
              autoComplete="off"
              readOnly
            />
            <TextStyleFields style={styles.title} />
          </FormLayout>
        </CollapsibleSection>

        <CollapsibleSection
          id="ty-description"
          icon={NoteIcon}
          title="Description"
          {...section("description")}
        >
          <FormLayout>
            <TextField
              label="Description"
              value={settings.description}
              multiline={2}
              maxLength={170}
              showCharacterCount
              autoComplete="off"
              readOnly
            />
            <TextStyleFields style={styles.description} />
          </FormLayout>
        </CollapsibleSection>

        <CollapsibleSection
          id="ty-confirmation"
          icon={CheckCircleIcon}
          title="Confirmation Message"
          {...section("confirmation")}
        >
          <FormLayout>
            <TextField
              label="Confirmation Message"
              value={settings.confirmationMessage}
              multiline={2}
              maxLength={170}
              showCharacterCount
              autoComplete="off"
              readOnly
            />
            <TextStyleFields style={styles.confirmation} />
          </FormLayout>
        </CollapsibleSection>

        <CollapsibleSection
          id="ty-button"
          icon={ButtonPressIcon}
          title="Button"
          {...section("button")}
        >
          <FormLayout>
            <TextField
              label={<b>Add to Cart (Button Text)</b>}
              value={settings.addToCartText}
              maxLength={20}
              showCharacterCount
              autoComplete="off"
              readOnly
            />
            <ButtonStyleFields style={styles.addToCart} />
            {settings.widgetStyle === "thank-you-style-1" && (
              <>
                <TextField
                  label={<b>Dismiss (Button Text)</b>}
                  value={settings.dismissText}
                  maxLength={20}
                  showCharacterCount
                  autoComplete="off"
                  readOnly
                />
                <ButtonStyleFields style={styles.dismiss} />
              </>
            )}
          </FormLayout>
        </CollapsibleSection>

        <CollapsibleSection
          id="ty-policy"
          icon={LinkIcon}
          title="Policy Link Placement"
          {...section("policy")}
        >
          <FormLayout>
            <PolicyFields
              policyType={settings.policyType}
              policyText={settings.policyText}
              policyUrl={settings.policyUrl}
              titleHidden
              tooltipExtra={
                <>
                  <Divider />
                  <InlineGrid columns={2} gap="300">
                    <Select
                      label="Icon size"
                      options={ICON_SIZE_OPTIONS}
                      value={styles.policy.size}
                      disabled
                    />
                    <Select
                      label="Icon emphasis"
                      options={EMPHASIS_OPTIONS}
                      value={styles.policy.color}
                      disabled
                    />
                    <Select
                      label="Tone"
                      helpText={TONE_HELP}
                      options={TONE_OPTIONS}
                      value={styles.policy.tone}
                      disabled
                    />
                  </InlineGrid>
                </>
              }
              footerExtra={
                <>
                  <Divider />
                  <InlineGrid columns={2} gap="300">
                    <Select
                      label="Tone"
                      helpText={TONE_HELP}
                      options={TONE_OPTIONS}
                      value={styles.policy.tone}
                      disabled
                    />
                  </InlineGrid>
                </>
              }
            />
          </FormLayout>
        </CollapsibleSection>
      </BlockStack>
    </SettingCard>
  );
};

const UnpaidOrderFlow = ({ settings }: { settings: ThankYouPageSettings }) => {
  const name = settings.title || "Package Protection";
  const removeAfter = settings.unpaidOrderFlow === "REMOVE_AFTER";
  const total = settings.removeProtectionAfterMinutes;
  const days = Math.floor(total / 1440);
  const hours = Math.floor((total % 1440) / 60);
  const minutes = total % 60;

  return (
    <SettingCard
      icon={ClockIcon}
      title={
        <InlineStack gap="100" blockAlign="center">
          <span>Unpaid {name} flow</span>
          <Tooltip content="Click to learn more">
            <Link url={UNPAID_FLOW_DOCS} target="_blank">
              <Icon source={InfoIcon} tone="subdued" />
            </Link>
          </Tooltip>
        </InlineStack>
      }
      subtitle={`What happens to unpaid ${name} left for a long time`}
    >
      <ButtonGroup variant="segmented" fullWidth>
        {(
          [
            ["LEAVE_IT", "Leave it"],
            ["REMOVE_AFTER", "Remove protection"],
          ] as const
        ).map(([value, label]) => {
          const selected = settings.unpaidOrderFlow === value;
          return (
            <Button
              key={value}
              variant={selected ? "primary" : "secondary"}
              pressed={selected}
              icon={selected ? CheckIcon : undefined}
              disabled={!selected}
            >
              {label}
            </Button>
          );
        })}
      </ButtonGroup>

      {removeAfter && (
        <BlockStack gap="200">
          <InlineStack gap="200" blockAlign="center">
            <Text as="span" fontWeight="semibold">
              Remove After:
            </Text>
            <Badge tone="warning">Beta</Badge>
          </InlineStack>
          <InlineGrid columns={3} gap="200">
            {(
              [
                ["Days:", days],
                ["Hours:", hours],
                ["Minutes:", minutes],
              ] as const
            ).map(([prefix, value]) => (
              <TextField
                key={prefix}
                label={prefix}
                labelHidden
                prefix={prefix}
                type="number"
                value={String(value)}
                autoComplete="off"
                readOnly
              />
            ))}
          </InlineGrid>
        </BlockStack>
      )}

      <Text as="p" tone="subdued">
        {removeAfter ? (
          <>
            ShipGuard automatically removes the unpaid protection product,
            allowing merchants to focus on fulfillment and delivery without
            having to clean up unpaid orders.{" "}
            <Link url={UNPAID_FLOW_DOCS} target="_blank">
              Learn More
            </Link>
          </>
        ) : (
          "The order stays partially paid—the merchant decides whether to follow up or leave it as is. Best suited for stores that operate with Cash on Delivery."
        )}
      </Text>

      {removeAfter && (
        <Banner tone="warning">
          <Text as="p" variant="bodySm">
            Not recommended for stores that offer Cash on Delivery (COD).
          </Text>
        </Banner>
      )}
    </SettingCard>
  );
};

const ThankYouPage = ({ data }: { data: WidgetSettingsData }) => {
  const { thankYou } = data;

  return (
    <TwoColumnLayout>
      <BlockStack gap="400">
        <InsurancePricing
          pricing={data.pricing}
          currency={data.currencySymbol}
        />

        <SettingCard
          icon={ButtonIcon}
          title="Customize Style"
          subtitle="Control the visual appearance of your widget"
        >
          <FormLayout>
            <Select
              label="Choose a Widget Style"
              options={[
                { label: "Style - 1", value: "thank-you-style-1" },
                { label: "Style - 2", value: "thank-you-style-2" },
              ]}
              value={thankYou.widgetStyle}
              disabled
            />
            <Select
              label="Widget Background"
              helpText="Checkout draws the widget in your store's brand colours, so these are set as levels rather than exact colours."
              options={[
                { label: "Default", value: "base" },
                { label: "Subdued", value: "subdued" },
                { label: "Transparent", value: "transparent" },
              ]}
              value={thankYou.backgroundColor}
              disabled
            />
            <Select
              label="Border Width"
              helpText="Border colour comes from your store's checkout branding and can't be set here."
              options={[
                { label: "None", value: "none" },
                { label: "Default", value: "base" },
                { label: "Thick", value: "large" },
              ]}
              value={thankYou.borderWidth}
              disabled
            />
            <Divider />
            <IconPicker selected={thankYou.icon} />
          </FormLayout>
        </SettingCard>

        <ThankYouContent settings={thankYou} />
      </BlockStack>

      <BlockStack gap="400">
        <FulfillmentRule value={data.fulfillmentRule} />
        <UnpaidOrderFlow settings={thankYou} />
        <ProductExclusions products={data.excludedProducts} />
      </BlockStack>
    </TwoColumnLayout>
  );
};

export default ThankYouPage;
