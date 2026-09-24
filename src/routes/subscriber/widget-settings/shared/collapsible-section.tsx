import {
  Box,
  Button,
  Collapsible,
  Icon,
  InlineStack,
  Text,
  type IconSource,
} from "@shopify/polaris";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
import type { ReactNode } from "react";

// Accordion row used by the Standard-template and Thank-you "Content" cards.
const CollapsibleSection = ({
  id,
  icon,
  title,
  open,
  onToggle,
  action,
  children,
}: {
  id: string;
  icon: IconSource;
  title: string;
  open: boolean;
  onToggle: () => void;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <div
    className={`rounded-lg border ${
      open ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"
    }`}
  >
    <div className="cursor-pointer p-3" onClick={onToggle}>
      <InlineStack align="space-between" blockAlign="center" wrap={false}>
        <InlineStack gap="200" blockAlign="center" wrap={false}>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white">
            <Icon source={icon} tone="subdued" />
          </div>
          <Text as="h4" variant="headingMd">
            {title}
          </Text>
        </InlineStack>
        <InlineStack gap="100" blockAlign="center">
          {action}
          <Button
            variant="tertiary"
            icon={open ? ChevronUpIcon : ChevronDownIcon}
            accessibilityLabel={open ? "Collapse" : "Expand"}
            ariaExpanded={open}
            ariaControls={id}
          />
        </InlineStack>
      </InlineStack>
    </div>
    <Collapsible id={id} open={open}>
      <div className="rounded-b-lg bg-white p-3">
        <Box>{children}</Box>
      </div>
    </Collapsible>
  </div>
);

export default CollapsibleSection;
