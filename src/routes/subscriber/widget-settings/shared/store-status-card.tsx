import { BlockStack, Card, InlineGrid, InlineStack, Text } from "@shopify/polaris";
import StatusToggle from "./status-toggle";
import {
  describeAppEmbed,
  describeCheckoutValidation,
  describeGeoLocation,
  describePublished,
  type StatusCellCopy,
  type WidgetPage,
} from "../copy";
import type { WidgetSettingsData } from "../types";

// Modelled on the merchant dashboard's StoreStatusCard, so support and merchant read the same
// facts. Cells vary by tab: the app embed and geo location only affect the cart widget.
const StoreStatusCard = ({
  data,
  page,
}: {
  data: WidgetSettingsData;
  page: WidgetPage;
}) => {
  const isCart = page === "cart";
  const cells: { title: string; copy: StatusCellCopy }[] = [
    {
      title: "Widget published",
      copy: describePublished(
        page,
        data[page].live,
        isCart ? data.appEmbedEnabled : undefined,
      ),
    },
    ...(isCart
      ? [
          {
            title: "App embed status",
            copy: describeAppEmbed(data.appEmbedEnabled),
          },
        ]
      : []),
    {
      title: "Checkout validation",
      copy: describeCheckoutValidation(data.checkoutValidation),
    },
    ...(isCart
      ? [
          {
            title: "Geo location",
            copy: describeGeoLocation(data.cart.geoLocation),
          },
        ]
      : []),
  ];

  return (
    <Card>
      <InlineGrid columns={{ xs: 1, md: 2, xl: cells.length }} gap="400">
        {cells.map((cell, i) => (
          // Dividers only when the cells sit in one row; in the 2×2 layout they'd float mid-grid.
          <div
            key={cell.title}
            className={
              i > 0 ? "xl:border-l xl:border-[var(--p-color-border)] xl:pl-5" : ""
            }
          >
            <StatusCell title={cell.title} copy={cell.copy} />
          </div>
        ))}
      </InlineGrid>
    </Card>
  );
};

const StatusCell = ({
  title,
  copy,
}: {
  title: string;
  copy: StatusCellCopy;
}) => (
  <BlockStack gap="200">
    <InlineStack gap="200" blockAlign="center">
      <Text as="h3" variant="headingMd">
        {title}
      </Text>
      {copy.on !== null && <StatusToggle on={copy.on} label={title} />}
    </InlineStack>
    <Text as="p" tone="subdued">
      {copy.body}
    </Text>
    {copy.alert && (
      <Text as="p" tone="critical" fontWeight="bold">
        {copy.alert}
      </Text>
    )}
    {copy.action && (
      <Text as="p" fontWeight="semibold">
        What to do: {copy.action}
      </Text>
    )}
  </BlockStack>
);

export default StoreStatusCard;
