import { BlockStack, Page } from "@shopify/polaris";
import { ChartVerticalIcon, EmailIcon, StoreIcon } from "@shopify/polaris-icons";
import { useNavigate } from "react-router";
import ActionCard from "../../components/common/action-card";

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
          <ActionCard
            key={action.to}
            icon={action.icon}
            hint={action.hint}
            label={action.label}
            onClick={() => navigate(action.to)}
          />
        ))}
      </BlockStack>
    </Page>
  );
}
