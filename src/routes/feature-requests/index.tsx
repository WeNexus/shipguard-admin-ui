import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Banner,
  Button,
  Card,
  IndexTable,
  InlineStack,
  Page,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { apiFetch } from "../../lib/api-client";
import useDebounce from "../../hooks/debounce";
import {
  CATEGORY_SELECT_OPTIONS,
  FEATURE_REQUESTS_PATH,
  STATUS_SELECT_OPTIONS,
  badgeTone,
  categoryLabel,
  errorText,
  formatDate,
  statusLabel,
  storeLabel,
  userLabel,
} from "./types";
import type { AdminFeatureRequest, AdminFeatureRequestPage } from "./types";
import { FeatureRequestDetailModal } from "./components/detail-modal";
import { CreateFeatureRequestModal } from "./components/create-modal";

const PAGE_SIZE = 25;

const STATUS_FILTER_OPTIONS = [
  { label: "All statuses", value: "" },
  ...STATUS_SELECT_OPTIONS,
];
const CATEGORY_FILTER_OPTIONS = [
  { label: "All categories", value: "" },
  ...CATEGORY_SELECT_OPTIONS,
];
const VISIBILITY_OPTIONS = [
  { label: "Visible and hidden", value: "" },
  { label: "Visible only", value: "false" },
  { label: "Hidden only", value: "true" },
];
const SORT_OPTIONS = [
  { label: "Most voted", value: "votes" },
  { label: "Newest", value: "newest" },
];

/** Every merchant feature request, hidden ones included, for the team to triage. */
export default function FeatureRequests() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [hidden, setHidden] = useState("");
  const [sort, setSort] = useState("votes");

  const [rows, setRows] = useState<AdminFeatureRequest[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const fetchPage = useCallback(
    (cursor?: string) =>
      apiFetch<AdminFeatureRequestPage>(FEATURE_REQUESTS_PATH, {
        query: {
          q: debouncedSearch.trim() || undefined,
          status: status || undefined,
          category: category || undefined,
          hidden: hidden || undefined,
          sort,
          limit: PAGE_SIZE,
          cursor,
        },
      }),
    [debouncedSearch, status, category, hidden, sort],
  );

  useEffect(() => {
    // A filter change while the previous page is in flight must not land the stale rows.
    let active = true;
    setLoading(true);
    setError(null);
    fetchPage()
      .then((page) => {
        if (!active) return;
        setRows(page.items);
        setNextCursor(page.nextCursor);
      })
      .catch((e) => {
        if (active) setError(errorText(e, "Could not load feature requests"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchPage]);

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    setError(null);
    try {
      const page = await fetchPage(nextCursor);
      // Vote-sorted pages can shift between requests; drop rows we already show.
      setRows((prev) => {
        const seen = new Set(prev.map((row) => row.id));
        return [...prev, ...page.items.filter((row) => !seen.has(row.id))];
      });
      setNextCursor(page.nextCursor);
    } catch (e) {
      setError(errorText(e, "Could not load more requests"));
    } finally {
      setLoadingMore(false);
    }
  };

  const replaceRow = useCallback((updated: AdminFeatureRequest) => {
    setRows((prev) =>
      prev.map((row) => (row.id === updated.id ? { ...row, ...updated } : row)),
    );
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }, []);

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setCategory("");
    setHidden("");
  };

  const isFiltered = !!(search || status || category || hidden);

  return (
    <Page fullWidth title="Feature Requests">
      <div className="flex flex-col gap-3">
        <Card padding="300">
          <InlineStack gap="300" wrap blockAlign="end">
            <div className="min-w-56 flex-1">
              <TextField
                label="Search"
                placeholder="title or description"
                autoComplete="off"
                value={search}
                onChange={setSearch}
                clearButton
                onClearButtonClick={() => setSearch("")}
              />
            </div>
            <div className="min-w-44">
              <Select
                label="Status"
                options={STATUS_FILTER_OPTIONS}
                value={status}
                onChange={setStatus}
              />
            </div>
            <div className="min-w-44">
              <Select
                label="Category"
                options={CATEGORY_FILTER_OPTIONS}
                value={category}
                onChange={setCategory}
              />
            </div>
            <div className="min-w-44">
              <Select
                label="Visibility"
                options={VISIBILITY_OPTIONS}
                value={hidden}
                onChange={setHidden}
              />
            </div>
            <div className="min-w-36">
              <Select
                label="Sort"
                options={SORT_OPTIONS}
                value={sort}
                onChange={setSort}
              />
            </div>
            {isFiltered ? (
              <Button variant="tertiary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : null}
            <Button variant="primary" onClick={() => setCreating(true)}>
              New request
            </Button>
          </InlineStack>
        </Card>

        <Card padding="0">
          {error ? (
            <div style={{ padding: 12 }}>
              <Banner tone="critical">{error}</Banner>
            </div>
          ) : null}

          <IndexTable
            resourceName={{
              singular: "feature request",
              plural: "feature requests",
            }}
            itemCount={rows.length}
            selectable={false}
            loading={loading}
            headings={[
              { title: "Request" },
              { title: "Status" },
              { title: "Votes", alignment: "end" },
              { title: "Comments", alignment: "end" },
              { title: "Created by" },
              { title: "Created" },
            ]}
          >
            {rows.map((row, i) => (
              <IndexTable.Row
                id={row.id}
                key={row.id}
                position={i}
                onClick={() => setOpenId(row.id)}
              >
                <IndexTable.Cell>
                  <div style={{ maxWidth: 360, whiteSpace: "normal" }}>
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="span" variant="bodySm" fontWeight="medium">
                        {row.title}
                      </Text>
                      {row.hidden ? (
                        <Badge tone="critical">Hidden</Badge>
                      ) : null}
                    </InlineStack>
                    <Text as="span" variant="bodyXs" tone="subdued">
                      {categoryLabel(row.category)}
                    </Text>
                  </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Badge tone={badgeTone(row.status)}>
                    {statusLabel(row.status)}
                  </Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text as="span" variant="bodySm" alignment="end" numeric>
                    {row.vote_count}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text as="span" variant="bodySm" alignment="end" numeric>
                    {row.comment_count}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  {row.is_team ? <Badge tone="info">Team</Badge> : null}
                  {storeLabel(row.store) ? (
                    <div>
                      <Text as="span" variant="bodySm" fontWeight="medium">
                        {storeLabel(row.store)}
                      </Text>
                    </div>
                  ) : null}
                  {userLabel(row.user) ? (
                    <div>
                      <Text as="span" variant="bodyXs" tone="subdued">
                        {userLabel(row.user)}
                      </Text>
                    </div>
                  ) : null}
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text as="span" variant="bodySm">
                    {formatDate(row.created_at)}
                  </Text>
                </IndexTable.Cell>
              </IndexTable.Row>
            ))}
          </IndexTable>

          {!loading && rows.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center" }}>
              <Text as="p" tone="subdued">
                {isFiltered
                  ? "No requests match these filters."
                  : "No feature requests yet."}
              </Text>
            </div>
          ) : null}

          {nextCursor ? (
            <div className="flex justify-center p-3">
              <Button onClick={loadMore} loading={loadingMore}>
                Load more
              </Button>
            </div>
          ) : null}
        </Card>
      </div>

      <FeatureRequestDetailModal
        id={openId}
        onClose={() => setOpenId(null)}
        onChanged={replaceRow}
        onDeleted={removeRow}
      />

      <CreateFeatureRequestModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(row) => setRows((prev) => [row, ...prev])}
      />
    </Page>
  );
}
