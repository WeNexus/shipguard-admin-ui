import { Text } from "@shopify/polaris";
import { CodeIcon, ConnectIcon, EmailIcon, SettingsIcon } from "@shopify/polaris-icons";
import { useNavigate } from "react-router";
import ActionCard from "../../components/common/action-card";

/**
 * Landing page. It used to carry hardcoded placeholder analytics (subscriber counts, MRR, order and
 * claim charts) wired to no data; they were removed rather than left showing fake numbers. Add real
 * metrics back only with a backend behind them.
 */
const Dashboard = () => {
  const navigate = useNavigate();

  return (
    // None of these tools has a sidebar entry — these cards are their only entry points.
    <div className="p-4 md:p-8 bg-gray-50">
      <div className="mb-5">
        <Text as="h2" variant="headingLg">
          Support tools
        </Text>
        <div className="mt-1">
          <Text as="p" tone="subdued">
            Fix common merchant problems without needing engineering.
          </Text>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ActionCard
          icon={EmailIcon}
          title="Merchant emails"
          hint="A merchant or customer says claim emails aren't arriving? Check whether a store's emails are working and what to tell the merchant."
          label="Check emails"
          onClick={() => navigate("/notification-settings")}
        />
        <ActionCard
          icon={ConnectIcon}
          title="Shopify webhooks"
          hint="A store isn't receiving new orders or updates from Shopify? Reconnect its webhooks so Shopify sends them to ShipGuard again."
          label="Re-register webhooks"
          onClick={() => navigate("/webhooks")}
        />
        <ActionCard
          icon={SettingsIcon}
          title="App subscription settings"
          hint="Choose which plan new stores start on, and whether merchants can see the Founder plan. Changes apply to every store."
          label="Open settings"
          onClick={() => navigate("/settings")}
        />
        <ActionCard
          icon={CodeIcon}
          title="GraphQL runner"
          badge="Only for dev"
          hint="Run any Shopify Admin API query or mutation against a store. Mutations change live store data — developers only."
          label="Open GraphQL"
          onClick={() => navigate("/gql")}
        />
      </div>
    </div>
  );
};

export default Dashboard;
