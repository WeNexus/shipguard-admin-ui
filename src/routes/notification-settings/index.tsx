import { BlockStack, Button, Card, Icon, Page, Text } from "@shopify/polaris";
import { ChartVerticalIcon, EmailIcon, StoreIcon } from "@shopify/polaris-icons";
import { useNavigate } from "react-router";

const ACTIONS = [
  {
    to: "/notification-settings/problems",
    icon: EmailIcon,
    label: "Find stores with email problems",
    hint: "Every store whose emails aren't going out, or need a check.",
  },
  {
    to: "/notification-settings/store",
    icon: StoreIcon,
    label: "Check one store",
    hint: "Are one store's emails working? What should the merchant do?",
  },
  {
    to: "/notification-settings/stats",
    icon: ChartVerticalIcon,
    label: "Email setup overview",
    hint: "How many stores are working, not working, or need a check.",
  },
];

/** Support's entry to "are merchants' emails working?". Reached from the dashboard; no sidebar entry. */
export default function NotificationSettings() {
  const navigate = useNavigate();

  return (
    <Page
      title="Notification settings"
      subtitle="Check whether merchants' emails are being sent"
      backAction={{ content: "Dashboard", onAction: () => navigate("/") }}
    >
      <BlockStack gap="300">
        {ACTIONS.map((action) => (
          <Card key={action.to}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <Icon source={action.icon} tone="base" />
                </span>
                <Text as="p" tone="subdued">
                  {action.hint}
                </Text>
              </div>
              <Button variant="primary" onClick={() => navigate(action.to)}>
                {action.label}
              </Button>
            </div>
          </Card>
        ))}
      </BlockStack>
    </Page>
  );
}
