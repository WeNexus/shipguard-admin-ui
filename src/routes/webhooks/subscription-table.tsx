import {
  Badge,
  Card,
  EmptyState,
  SkeletonBodyText,
  Text,
} from "@shopify/polaris";
import type { WebhookSubscriptionView, WebhookTransport } from "./type";
import { transportLabel } from "./type";

interface SubscriptionTableProps {
  subscriptions: WebhookSubscriptionView[];
  transport: WebhookTransport | null;
  loading: boolean;
  /** Set when the store could not be read — shown instead of an empty table. */
  error: string | null;
  title: string;
}

/**
 * What the store has registered right now.
 *
 * A plain table rather than IndexTable: nothing here is selectable or sortable, and IndexTable's
 * selection chrome would imply you can act on individual rows. You cannot — the reset is all-or-
 * nothing by design.
 */
export default function SubscriptionTable({
  subscriptions,
  transport,
  loading,
  error,
  title,
}: SubscriptionTableProps) {
  if (loading) {
    return (
      <Card>
        <Text as="h2" variant="headingSm">
          {title}
        </Text>
        <div className="mt-3">
          <SkeletonBodyText lines={5} />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Text as="h2" variant="headingSm">
          {title}
        </Text>
        <div className="mt-2">
          <Text as="p" tone="critical">
            {error}
          </Text>
        </div>
      </Card>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <EmptyState heading="No webhook subscriptions" image="">
          {/* Not an error state: a store with nothing registered is exactly what this screen fixes,
              so the action stays available rather than being disabled behind a warning. */}
          <p>
            This store has no webhook subscriptions registered for the app.
            Re-registering will create them.
          </p>
        </EmptyState>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <Text as="h2" variant="headingSm">
          {title}
        </Text>
        <Text as="span" tone="subdued" variant="bodySm">
          {subscriptions.length} registered
          {transport ? ` · app is on ${transportLabel(transport)}` : ""}
        </Text>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-gray-600">
            <tr>
              <th className="py-2 pr-4 font-medium">Topic</th>
              <th className="py-2 pr-4 font-medium">Delivery</th>
              <th className="py-2 pr-4 font-medium">Destination</th>
              <th className="py-2 pr-4 font-medium">Filter</th>
              <th className="py-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => (
              <tr
                key={subscription.id}
                className="border-b border-gray-100 align-top"
              >
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">
                      {subscription.topic}
                    </span>
                    {subscription.isCompliance && (
                      <Badge tone="info">Protected</Badge>
                    )}
                  </div>
                </td>
                <td className="py-2 pr-4">
                  {/* The signal the screen exists for: a row whose delivery method no longer matches
                      the active transport is one nothing on our side is listening to. */}
                  <Badge
                    tone={
                      subscription.matchesActiveTransport
                        ? "success"
                        : "warning"
                    }
                  >
                    {subscription.kind}
                  </Badge>
                </td>
                <td className="py-2 pr-4 break-all font-mono text-xs text-gray-700">
                  {subscription.destination || "—"}
                </td>
                <td className="py-2 pr-4 font-mono text-xs text-gray-700">
                  {subscription.filter || "—"}
                </td>
                <td className="py-2 text-xs text-gray-600">
                  {subscription.createdAt
                    ? new Date(subscription.createdAt).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
