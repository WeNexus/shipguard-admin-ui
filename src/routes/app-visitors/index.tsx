import {
  Badge,
  Banner,
  Card,
  EmptyState,
  InlineStack,
  Modal,
  Page,
  SkeletonBodyText,
  Text,
} from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch } from "../../lib/api-client";
import type { AppVisitor, AppVisitorClearResult, AppVisitorList } from "./type";

const formatTime = (iso: string) => new Date(iso).toLocaleString();

function fullName(visitor: AppVisitor): string {
  const name = [visitor.firstName, visitor.lastName].filter(Boolean).join(" ");
  return name || "—";
}

// The flags are three-state on the backend; null means Shopify never told us, not "staff".
function RoleBadge({ visitor }: { visitor: AppVisitor }) {
  if (visitor.accountOwner) return <Badge tone="success">Owner</Badge>;
  if (visitor.collaborator) return <Badge tone="info">Collaborator</Badge>;
  if (visitor.accountOwner === false) return <Badge>Staff</Badge>;
  return <Badge tone="attention">Unknown</Badge>;
}

/**
 * Merchant-side admin users who opened the app.
 *
 * The backend keeps this in memory only, so the list is wiped by every deploy or restart — `since`
 * is shown up front so an empty or short list isn't mistaken for "nobody visited".
 */
export default function AppVisitors() {
  const [data, setData] = useState<AppVisitorList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirming, setConfirming] = useState(false);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch<AppVisitorList>("admin/app-visitors")
      .then(setData)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Failed to load visitors.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const runClear = () => {
    setConfirming(false);
    setClearing(true);
    apiFetch<AppVisitorClearResult>("admin/app-visitors", { method: "DELETE" })
      .then(load)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Failed to clear visitors.",
        ),
      )
      .finally(() => setClearing(false));
  };

  const visitors = data?.visitors ?? [];

  return (
    <Page
      fullWidth
      title="App visitors"
      subtitle="Merchant admin users who opened ShipGuard — kept in server memory only"
      primaryAction={{
        content: "Refresh",
        onAction: load,
        loading,
        disabled: clearing,
      }}
      secondaryActions={[
        {
          content: "Clear list",
          destructive: true,
          onAction: () => setConfirming(true),
          disabled: loading || clearing || visitors.length === 0,
        },
      ]}
    >
      {error && (
        <div className="mb-3">
          <Banner tone="critical">{error}</Banner>
        </div>
      )}

      <Card>
        {loading && !data ? (
          <SkeletonBodyText lines={6} />
        ) : visitors.length === 0 ? (
          <EmptyState heading="No visitors yet" image="">
            <p>
              Nobody has opened the app
              {data ? ` since ${formatTime(data.since)}` : ""}.
            </p>
          </EmptyState>
        ) : (
          <>
            <InlineStack align="space-between" blockAlign="center">
              <Text as="h2" variant="headingSm">
                {visitors.length} visitor{visitors.length === 1 ? "" : "s"}
              </Text>
              {data && (
                <Text as="span" tone="subdued" variant="bodySm">
                  Tracking since {formatTime(data.since)}
                </Text>
              )}
            </InlineStack>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 text-gray-600">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Store</th>
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Email</th>
                    <th className="py-2 pr-4 font-medium">Role</th>
                    <th className="py-2 pr-4 font-medium">Visits</th>
                    <th className="py-2 pr-4 font-medium">Last seen</th>
                    <th className="py-2 font-medium">First seen</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((visitor) => (
                    <tr
                      key={`${visitor.shop}:${visitor.userId}`}
                      className="border-b border-gray-100 align-top"
                    >
                      <td className="py-2 pr-4 font-mono text-xs">
                        {visitor.shop}
                      </td>
                      <td className="py-2 pr-4">{fullName(visitor)}</td>
                      <td className="py-2 pr-4 break-all text-gray-700">
                        {visitor.email ?? "—"}
                      </td>
                      <td className="py-2 pr-4">
                        <RoleBadge visitor={visitor} />
                      </td>
                      <td className="py-2 pr-4">{visitor.visitCount}</td>
                      <td className="py-2 pr-4 text-xs text-gray-600">
                        {formatTime(visitor.lastSeenAt)}
                      </td>
                      <td className="py-2 text-xs text-gray-600">
                        {formatTime(visitor.firstSeenAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Clear the visitor list?"
        primaryAction={{
          content: "Clear list",
          destructive: true,
          onAction: runClear,
        }}
        secondaryActions={[
          { content: "Cancel", onAction: () => setConfirming(false) },
        ]}
      >
        <Modal.Section>
          <Text as="p">
            This forgets all <b>{visitors.length}</b> recorded visitor
            {visitors.length === 1 ? "" : "s"}. It can't be undone — tracking
            starts again from now.
          </Text>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
