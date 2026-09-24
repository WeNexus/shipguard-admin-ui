import { ChoiceList } from "@shopify/polaris";
import { OrderFulfilledIcon } from "@shopify/polaris-icons";
import SettingCard from "./setting-card";

// The storefront app stores the label itself as the value.
const FULFILLMENT_OPTIONS = [
  "Mark as fulfilled immediately after purchase",
  "Mark as fulfilled when first item(s) are fulfilled",
  "Mark as fulfilled when other items fulfilled",
];

const FulfillmentRule = ({ value }: { value: string }) => (
  <SettingCard
    icon={OrderFulfilledIcon}
    title="Fulfillment Rule"
    subtitle="Select when the shipping protection item should be marked as fulfilled"
  >
    <ChoiceList
      title="Fulfillment rule"
      titleHidden
      choices={FULFILLMENT_OPTIONS.map((label) => ({ label, value: label }))}
      selected={[value]}
      onChange={() => {}}
      disabled
    />
  </SettingCard>
);

export default FulfillmentRule;
