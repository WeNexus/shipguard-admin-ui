import { Banner, Button, InlineStack, Layout, Page } from "@shopify/polaris";
import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "../../lib/api-client";
import StoreSelect from "../common/store-select";
import QueryEditor from "./query-editor";
import ResultView from "./result-view";
import type { GqlRunResult, GqlStoreOption } from "./type";

const DEFAULT_QUERY = `{
  shop {
    plan {
      partnerDevelopment
    }
  }
}`;

/**
 * Ad-hoc Admin GraphQL runner (port of the old Remix `analytics.gql` route).
 *
 * Runs any Admin API document — mutations included — against any installed store. Access is the
 * admin JWT that gates this whole console; the old route's hardcoded two-shop allowlist is gone, and
 * every run is audited server-side against the admin who fired it.
 */
export default function Gql() {
  const [stores, setStores] = useState<GqlStoreOption[]>([]);
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [result, setResult] = useState<GqlRunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<GqlStoreOption[]>("admin/gql/stores")
      .then((data) => {
        setStores(data);
        // Preselect like the old `useState(storeList[0].domain)` — which crashed outright on an
        // empty list. Here an empty list just leaves the picker disabled.
        setSelected(data[0]?.domain ?? "");
        setLoadError(null);
      })
      .catch((err) => {
        console.error("Failed to load stores:", err);
        setLoadError("Failed to load the store list.");
      });
  }, []);

  const run = () => {
    if (!selected || running) {
      return;
    }
    setRunning(true);
    apiFetch<GqlRunResult>("admin/gql/run", {
      method: "POST",
      body: { domain: selected, query },
    })
      .then(setResult)
      .catch((err) => {
        // 400/404 land here (bad document length, unknown domain). Rendered in the same pane as a
        // failed run so there is one place to look.
        const message =
          err instanceof ApiError ? err.message : "The request could not be sent.";
        setResult({ ok: false, data: null, errors: null, error: message });
      })
      .finally(() => setRunning(false));
  };

  return (
    <Page fullWidth title="GraphQL">
      {loadError && (
        <div className="mb-3">
          <Banner tone="critical">{loadError}</Banner>
        </div>
      )}

      <StoreSelect
        stores={stores}
        selected={selected}
        onChange={setSelected}
        disabled={running}
      />

      <div className="mt-4">
        <Layout>
          <Layout.Section variant="oneHalf">
            <QueryEditor value={query} onChange={setQuery} disabled={running} />
          </Layout.Section>

          <Layout.Section variant="oneHalf">
            <ResultView result={result} />
          </Layout.Section>
        </Layout>
      </div>

      <div className="mt-4">
        <InlineStack gap="300" blockAlign="center">
          <Button variant="primary" onClick={run} loading={running} disabled={!selected}>
            Run
          </Button>
        </InlineStack>
      </div>
    </Page>
  );
}
