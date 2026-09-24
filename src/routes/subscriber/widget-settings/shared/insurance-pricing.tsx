import {
  BlockStack,
  Divider,
  Icon,
  InlineGrid,
  InlineStack,
  Link,
  Text,
  TextField,
  Tooltip,
} from "@shopify/polaris";
import { InfoIcon, ShieldCheckMarkIcon } from "@shopify/polaris-icons";
import type { ReactNode } from "react";
import SettingCard from "./setting-card";
import InfoCallout from "./info-callout";
import type { PricingSettings } from "../dummy-data";

const PRICING_DOCS =
  "https://help.shipguard.app/portal/en/kb/articles/shipping-protection-pricing";

const LabelWithTooltip = ({ label, tip }: { label: string; tip: string }) => (
  <InlineStack gap="100" blockAlign="center">
    <span>{label}</span>
    <Tooltip content={tip}>
      <Icon source={InfoIcon} tone="subdued" />
    </Tooltip>
  </InlineStack>
);

const PriceTypeTile = ({
  title,
  description,
  selected,
}: {
  title: string;
  description: string;
  selected: boolean;
}) => (
  <div
    className={`rounded-lg border-2 p-3 ${
      selected ? "border-green-500 bg-green-50" : "border-gray-200"
    }`}
  >
    <Text as="p" variant="headingSm">
      {title}
    </Text>
    <Text as="p" variant="bodySm" tone="subdued">
      {description}
    </Text>
  </div>
);

const InsurancePricing = ({
  pricing,
  currency,
}: {
  pricing: PricingSettings;
  currency: string;
}) => {
  const isPercentage = pricing.insurancePriceType === "PERCENTAGE";
  const isFixed =
    pricing.insurancePriceType === "FIXED_PRICE" ||
    pricing.insurancePriceType === "FIXED_MULTIPLE";

  let fixedBody: ReactNode = null;
  if (pricing.insurancePriceType === "FIXED_PRICE") {
    fixedBody = (
      <TextField
        label="Fixed price"
        prefix={currency}
        value={pricing.price}
        autoComplete="off"
        readOnly
      />
    );
  } else if (pricing.insurancePriceType === "FIXED_MULTIPLE") {
    fixedBody = (
      <BlockStack gap="200">
        {pricing.fixedMultiplePlan.map((tier, i) => (
          <InlineGrid key={i} columns={3} gap="200">
            <TextField
              label="Protection Fees"
              prefix={currency}
              value={tier.protectionFees}
              autoComplete="off"
              readOnly
            />
            <TextField
              label="Cart Min Price"
              prefix={currency}
              value={tier.cartMinPrice}
              autoComplete="off"
              readOnly
            />
            <TextField
              label="Cart Max Price"
              prefix={currency}
              value={tier.cartMaxPrice}
              autoComplete="off"
              readOnly
            />
          </InlineGrid>
        ))}
      </BlockStack>
    );
  }

  return (
    <SettingCard
      icon={ShieldCheckMarkIcon}
      title="ShipGuard — Insurance Pricing"
      subtitle="Choose how protection orders are calculated"
    >
      <InlineGrid columns={2} gap="300">
        <PriceTypeTile
          title="Percentage"
          description="% of cart value"
          selected={isPercentage}
        />
        <PriceTypeTile
          title="Fixed"
          description="Flat fee per order"
          selected={isFixed}
        />
      </InlineGrid>
      <Divider />

      {isPercentage && (
        <BlockStack gap="300">
          <TextField
            label="Percentage"
            suffix="%"
            value={pricing.percentage}
            autoComplete="off"
            readOnly
          />
          <InlineGrid columns={2} gap="300">
            <TextField
              label={
                <LabelWithTooltip
                  label="Minimum Fee"
                  tip="The Initial Cost of Protection."
                />
              }
              prefix={currency}
              value={pricing.minimumFee}
              autoComplete="off"
              readOnly
            />
            <TextField
              label={
                <LabelWithTooltip
                  label="Maximum Fee"
                  tip="The Maximum Cost of Protection."
                />
              }
              prefix={currency}
              value={pricing.maximumFee}
              autoComplete="off"
              readOnly
            />
          </InlineGrid>
          <InfoCallout
            title="How variants are generated"
            body="100 options created between min and max using (Max − Min) ÷ 99. Example: $0.75 → $74.99 gives $0.75, $1.50, $2.25 ... $74.99"
          />
        </BlockStack>
      )}

      {isFixed && (
        <BlockStack gap="300">
          <Text as="p" variant="headingMd">
            {pricing.insurancePriceType === "FIXED_PRICE"
              ? "1 Single Plan Added"
              : `${pricing.fixedMultiplePlan.length} Multiple Plan Added`}
          </Text>
          {fixedBody}
          <InfoCallout
            title="Cart value tiers"
            body="Charge a single flat rate per order regardless of cart size, or apply tiered pricing based on cart value thresholds you define."
          />
        </BlockStack>
      )}

      <Text as="p">
        👉 See our{" "}
        {isPercentage ? (
          <Link url={`${PRICING_DOCS}#1__Percentage_Pricing`} target="_blank">
            How Percentage Pricing Works
          </Link>
        ) : (
          <Link url={`${PRICING_DOCS}#2__Single_Fixed_Plan`} target="_blank">
            How Fixed Pricing Works
          </Link>
        )}{" "}
        for more details.
      </Text>
    </SettingCard>
  );
};

export default InsurancePricing;
