import { BlockStack, ChoiceList, FormLayout, Select } from "@shopify/polaris";
import { IconsIcon } from "@shopify/polaris-icons";
import SettingCard from "./shared/setting-card";
import TwoColumnLayout from "./shared/two-column-layout";
import InsurancePricing from "./shared/insurance-pricing";
import FulfillmentRule from "./shared/fulfillment-rule";
import ProductExclusions from "./shared/product-exclusions";
import ClassicContent from "./shared/classic-content";
import IconPicker from "./shared/icon-picker";
import type { WidgetSettingsData } from "./dummy-data";

const CheckoutPage = ({ data }: { data: WidgetSettingsData }) => {
  const { checkout } = data;

  return (
    <TwoColumnLayout>
      <BlockStack gap="400">
        <InsurancePricing
          pricing={data.pricing}
          currency={data.currencySymbol}
        />

        <SettingCard
          icon={IconsIcon}
          title="Customized insurance style"
          subtitle="Set up your checkout widget"
        >
          <FormLayout>
            <Select
              label={<b>Choose a Widget Style</b>}
              options={[
                { label: "Style-1", value: "style-1" },
                { label: "Style-2", value: "style-2" },
              ]}
              value={checkout.widgetStyle}
              disabled
            />
            <ChoiceList
              title={<b>Select Action Type</b>}
              choices={[
                { label: "Toggle", value: "toggle" },
                { label: "Checkbox", value: "checkbox" },
              ]}
              selected={[checkout.actionType]}
              onChange={() => {}}
              disabled
            />
            <IconPicker selected={checkout.icon} />
          </FormLayout>
        </SettingCard>
      </BlockStack>

      <BlockStack gap="400">
        <ClassicContent content={checkout.content} />
        <FulfillmentRule value={data.fulfillmentRule} />
        <ProductExclusions products={data.excludedProducts} />
      </BlockStack>
    </TwoColumnLayout>
  );
};

export default CheckoutPage;
