import { Badge, BlockStack, Button, Card, Icon, Text } from "@shopify/polaris";
import type { IconSource } from "@shopify/polaris";

interface ActionCardProps {
  icon: IconSource;
  /** Optional bold line above the hint; the hub cards omit it. */
  title?: string;
  /** Short warning beside the title, e.g. "Only for dev". */
  badge?: string;
  /** Why this tool exists, in words a non-technical support agent can act on. */
  hint: string;
  label: string;
  onClick: () => void;
}

/** Icon · explanation · button. The entry-point card for admin tools with no sidebar entry. */
export default function ActionCard({ icon, title, badge, hint, label, onClick }: ActionCardProps) {
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <Icon source={icon} tone="base" />
          </span>
          <BlockStack gap="050">
            {title && (
              <div className="flex flex-wrap items-center gap-2">
                <Text as="h3" variant="headingSm">
                  {title}
                </Text>
                {badge && <Badge tone="warning">{badge}</Badge>}
              </div>
            )}
            <Text as="p" tone="subdued">
              {hint}
            </Text>
          </BlockStack>
        </div>
        <Button variant="primary" onClick={onClick}>
          {label}
        </Button>
      </div>
    </Card>
  );
}
