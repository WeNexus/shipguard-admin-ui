import { ActionList, Button, Popover } from "@shopify/polaris";
import { useState } from "react";

export const SUBSCRIBER_TABS = [
  { id: "order", label: "Order" },
  { id: "app-subscription", label: "App-Subscription" },
  { id: "widget-settings", label: "Widget Settings" },
  { id: "diagnosis", label: "Diagnosis" },
] as const;

export type SubscriberTabId = (typeof SUBSCRIBER_TABS)[number]["id"];

const SubscriberTabSelect = ({
  selectedTab,
  onSelect,
}: {
  selectedTab: SubscriberTabId;
  onSelect: (tab: SubscriberTabId) => void;
}) => {
  const [active, setActive] = useState(false);

  return (
    // <div className="my-4 w-full min-[766px]:w-1/2">
    <div className="w-full min-[766px]:w-1/6">
      <Popover
        active={active}
        onClose={() => setActive(false)}
        fullWidth
        activator={
          <Button
            size="large"
            fullWidth
            textAlign="left"
            disclosure={active ? "up" : "down"}
            onClick={() => setActive((prev) => !prev)}
          >
            {SUBSCRIBER_TABS.find((tab) => tab.id === selectedTab)?.label}
          </Button>
        }
      >
        <ActionList
          actionRole="menuitem"
          items={SUBSCRIBER_TABS.map((tab) => ({
            content: tab.label,
            active: selectedTab === tab.id,
            onAction: () => {
              onSelect(tab.id);
              setActive(false);
            },
          }))}
        />
      </Popover>
    </div>
  );
};

export default SubscriberTabSelect;
