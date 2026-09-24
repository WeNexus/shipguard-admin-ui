import {
  BlockStack,
  Card,
  Divider,
  Icon,
  InlineStack,
  Text,
  type IconSource,
} from "@shopify/polaris";
import type { ReactNode } from "react";

// Mirrors the storefront app's `WidgetSettingHeadingComp`: green icon tile, title, subtitle, divider.
const SettingCard = ({
  icon,
  title,
  subtitle,
  action,
  children,
}: {
  icon: IconSource;
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <Card>
    <BlockStack gap="400">
      <InlineStack align="space-between" blockAlign="center" wrap={false}>
        <InlineStack gap="300" blockAlign="center" wrap={false}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100">
            <Icon source={icon} tone="success" />
          </div>
          <BlockStack gap="050">
            <Text as="h3" variant="headingSm">
              {title}
            </Text>
            {subtitle && (
              <Text as="p" variant="bodySm" tone="subdued">
                {subtitle}
              </Text>
            )}
          </BlockStack>
        </InlineStack>
        {action}
      </InlineStack>
      <Divider />
      {children}
    </BlockStack>
  </Card>
);

export default SettingCard;
