import {
  Badge,
  Banner,
  BlockStack,
  Button,
  Card,
  EmptyState,
  Icon,
  Page,
  SkeletonBodyText,
  Tabs,
  Text,
  TextField,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ApiError, apiFetch } from "../../lib/api-client";
import { problemShort, STATE_META } from "./support/support-copy";
import type { StoreVerdictListItem } from "./type";

const TABS = [
  {
    id: "not_working",
    content: "Not working",
    filter: (s: StoreVerdictListItem) => s.verdict.state === "not_working",
    empty: "No store has emails that aren't being sent.",
  },
  {
    id: "attention",
    content: "Needs attention",
    filter: (s: StoreVerdictListItem) => s.verdict.state === "attention",
    empty: "No store needs attention.",
  },
  {
    id: "custom",
    content: "All custom senders",
    filter: (s: StoreVerdictListItem) => s.kind !== "DEFAULT",
    empty: "Every store uses ShipGuard's default sender.",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

/**
 * "Find stores with email problems". The tab lives in `?tab=` so the overview's numbers can link
 * straight to their list.
 */
export default function ProblemStores() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tabIndex = Math.max(
    0,
    TABS.findIndex((t) => t.id === (params.get("tab") as TabId)),
  );
  const tab = TABS[tabIndex];

  const [stores, setStores] = useState<StoreVerdictListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiFetch<StoreVerdictListItem[]>("admin/notification-settings/stores")
      .then(setStores)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "The store list could not be loaded."),
      );
  }, []);

  const counts = useMemo(
    () => TABS.map((t) => stores?.filter(t.filter).length ?? 0),
    [stores],
  );

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (stores ?? [])
      .filter(tab.filter)
      .filter(
        (s) =>
          !needle ||
          s.name.toLowerCase().includes(needle) ||
          s.domain.toLowerCase().includes(needle),
      );
  }, [stores, tab, search]);

  return (
    <Page
      fullWidth
      title="Stores with email problems"
      subtitle="Every installed store, checked from its saved settings"
      backAction={{
        content: "Notification settings",
        onAction: () => navigate("/notification-settings"),
      }}
    >
      <BlockStack gap="400">
        {error && <Banner tone="critical">{error}</Banner>}

        <Card>
          <BlockStack gap="300">
            <Tabs
              tabs={TABS.map((t, i) => ({
                id: t.id,
                content: stores ? `${t.content} (${counts[i]})` : t.content,
              }))}
              selected={tabIndex}
              onSelect={(i) => setParams({ tab: TABS[i].id })}
            />
            <TextField
              label="Search stores"
              labelHidden
              placeholder="Search by store name or domain"
              prefix={<Icon source={SearchIcon} />}
              value={search}
              onChange={setSearch}
              clearButton
              onClearButtonClick={() => setSearch("")}
              autoComplete="off"
            />

            {!stores && !error && <SkeletonBodyText lines={6} />}

            {stores && rows.length === 0 && (
              <EmptyState heading={search ? "No matching stores" : "Nothing here"} image="">
                <p>{search ? "Try a different name or domain." : tab.empty}</p>
              </EmptyState>
            )}

            {rows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 text-gray-600">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Store</th>
                      <th className="py-2 pr-4 font-medium">Status</th>
                      <th className="py-2 pr-4 font-medium">What's wrong</th>
                      <th className="py-2 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((store) => {
                      const meta = STATE_META[store.verdict.state];
                      return (
                        <tr key={store.domain} className="border-b border-gray-100 align-top">
                          <td className="py-3 pr-4">
                            <div className="font-medium">{store.name}</div>
                            <div className="text-xs text-gray-500">{store.domain}</div>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge tone={meta.tone}>{meta.label}</Badge>
                          </td>
                          <td className="py-3 pr-4">
                            {store.verdict.problems.length ? (
                              <ul className="space-y-0.5">
                                {store.verdict.problems.map((p) => (
                                  <li key={p.code}>{problemShort(p)}</li>
                                ))}
                              </ul>
                            ) : (
                              <Text as="span" tone="subdued">
                                Nothing found
                              </Text>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <Button
                              onClick={() =>
                                navigate(
                                  `/notification-settings/store?domain=${encodeURIComponent(store.domain)}`,
                                )
                              }
                            >
                              Check store
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <Text as="p" variant="bodySm" tone="subdued">
              Gmail connections are only checked live on the store page — a Gmail store listed as
              working can still turn out to be disconnected there.
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
