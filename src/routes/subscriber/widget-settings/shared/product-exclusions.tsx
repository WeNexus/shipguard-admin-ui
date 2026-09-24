import {
  BlockStack,
  IndexTable,
  InlineStack,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import { DisabledIcon, ImageIcon } from "@shopify/polaris-icons";
import SettingCard from "./setting-card";
import type { ExcludedProduct } from "../dummy-data";

const variantSubtext = (product: ExcludedProduct) => {
  const selected = product.selectedVariants;
  if (selected === product.totalVariants) return null;
  return `${selected} ${selected === 1 ? "Variant" : "Variants"} Selected`;
};

const ProductExclusions = ({ products }: { products: ExcludedProduct[] }) => (
  <SettingCard
    icon={DisabledIcon}
    title="Product Exclusions"
    subtitle="Products excluded from insurance coverage"
  >
    <Text as="p">
      Set conditions to exclude products from the insurance widget
    </Text>
    {products.length === 0 ? (
      <Text as="p" tone="subdued">
        No products excluded.
      </Text>
    ) : (
      <IndexTable
        itemCount={products.length}
        headings={[{ title: "Product" }]}
        selectable={false}
      >
        {products.map((product, i) => (
          <IndexTable.Row id={product.id} key={product.id} position={i}>
            <IndexTable.Cell>
              <InlineStack gap="300" blockAlign="center" wrap={false}>
                <Thumbnail
                  size="small"
                  source={product.image ?? ImageIcon}
                  alt={product.title}
                />
                <BlockStack gap="050">
                  <Text as="span" fontWeight="bold">
                    {product.title}
                  </Text>
                  {variantSubtext(product) && (
                    <Text as="span" variant="bodySm" tone="subdued">
                      {variantSubtext(product)}
                    </Text>
                  )}
                </BlockStack>
              </InlineStack>
            </IndexTable.Cell>
          </IndexTable.Row>
        ))}
      </IndexTable>
    )}
  </SettingCard>
);

export default ProductExclusions;
