import { BlockStack, Text } from "@shopify/polaris";

const InfoCallout = ({ title, body }: { title: string; body: string }) => (
  <div className="rounded-lg border border-green-200 bg-green-50 p-3">
    <BlockStack gap="100">
      <Text as="p" variant="headingSm">
        {title}
      </Text>
      <Text as="p" variant="bodySm" tone="subdued">
        {body}
      </Text>
    </BlockStack>
  </div>
);

export default InfoCallout;
