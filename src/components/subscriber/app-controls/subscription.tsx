import { useEffect, useState } from "react";
import { Button, Divider, RadioButton, Select } from "@shopify/polaris";
import type { IPackagePackageProtection } from "../type";
import { apiFetch } from "../../../lib/api-client";

const MIN_SKELETON_MS = 400;

type StoreSubscriptionType = "Free" | "Monthly" | "Usage" | "PayAsYouGoOnly";

type SubscriptionState = {
  /** The STORED per-store flag — not effective eligibility. See globalShowFounder. */
  eligibleForFounder: boolean;
  storeSubscriptionType: StoreSubscriptionType;
  /**
   * True when the global "Show Founder to merchant" setting is on, in which case every store sees the
   * Founder plan regardless of the per-store flag. Surfaced so this control can say so, instead of
   * looking like it refuses to save.
   */
  globalShowFounder: boolean;
};

const Subscription = ({
  packageProtection,
  store,
  setReFetch,
}: {
  packageProtection: IPackagePackageProtection;
  store: any;
  setReFetch?: any;
}) => {
  const storeId = packageProtection?.storeId ?? store?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [state, setState] = useState<SubscriptionState>({
    eligibleForFounder: false,
    storeSubscriptionType: "Free",
    globalShowFounder: false,
  });
  const [saved, setSaved] = useState(false);

  /* load initial data */
  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      const startedAt = Date.now();
      try {
        setLoading(true);
        setLoadError(null);
        const json = await apiFetch("admin/subscribers/subscription", {
          query: { shop: store?.domain },
          signal: controller.signal,
        });

        // The old contract puts a statusCode in the BODY; a real HTTP status may accompany it.
        const apiStatus = json?.statusCode;
        const apiOk = apiStatus === undefined ? true : apiStatus >= 200 && apiStatus < 300;

        if (!apiOk || !json?.data) {
          console.error("Failed to load subscription:", json);
          setLoadError(json?.message ?? "Failed to load data");
          return;
        }

        setState({
          eligibleForFounder: !!json.data.eligibleForFounder,
          storeSubscriptionType:
            (json.data.storeSubscriptionType as StoreSubscriptionType) ?? "Free",
          globalShowFounder: !!json.data.globalShowFounder,
        });
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Failed to load subscription:", err);
          setLoadError("Failed to load data");
        }
      } finally {
        const elapsed = Date.now() - startedAt;
        const remaining = MIN_SKELETON_MS - elapsed;
        if (remaining > 0) {
          setTimeout(() => {
            if (!controller.signal.aborted) setLoading(false);
          }, remaining);
        } else {
          setLoading(false);
        }
      }
    };

    load();
    return () => controller.abort();
    // Depend on the domain too — it is what the request is keyed on, so a store change with the
    // same/absent storeId would otherwise never refetch.
  }, [storeId, store?.domain]);

  const handlePricingGroupChange = (value: "Free" | "Paid") => {
    if (value === "Free") {
      setState((s) => ({ ...s, storeSubscriptionType: "Free" }));
    } else {
      setState((s) => ({ ...s, storeSubscriptionType: "Monthly" }));
    }
  };

  const handlePaidPlanChange = (value: string) => {
    setState((s) => ({
      ...s,
      storeSubscriptionType: value as StoreSubscriptionType,
    }));
  };

  const handleFounderChange = (value: string) => {
    setState((s) => ({ ...s, eligibleForFounder: value === "show" }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // `storeId` is deliberately NOT sent: the old API ignored it (deriving the store from
      // ?shop=), and the backend's global ValidationPipe runs `forbidNonWhitelisted: true`, so an
      // undeclared extra property would come back as a confusing 400.
      const json = await apiFetch("admin/subscribers/subscription", {
        method: "POST",
        query: { shop: store?.domain },
        body: {
          eligibleForFounder: state.eligibleForFounder,
          storeSubscriptionType: state.storeSubscriptionType,
        },
      });
      if (json?.statusCode && json.statusCode !== 200) {
        console.error("Failed to save subscription:", json);
        setSaveError("Failed to save. Please try again.");
        return;
      }
      setSaveError(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      if (typeof setReFetch === "function") {
        setReFetch((prev: boolean) => !prev);
      }
    } catch (err) {
      console.error("Error saving subscription:", err);
      setSaveError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isPaid = state.storeSubscriptionType !== "Free";

  return (
    <div className="mt-3">
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold">Subscription</span>
      </div>

      {loadError ? (
        <div className="mt-2 p-3 rounded-md bg-white/60">
          <div className="py-4 text-sm text-red-600">
            Failed to load data{loadError && loadError !== "Failed to load data"
              ? `: ${loadError}`
              : ""}
          </div>
        </div>
      ) : (
        <>
          <div className="mt-2 p-3 rounded-md bg-white/60">
            <p className="text-sm font-medium mb-2">Pricing Group</p>
            {loading ? (
              /* show skeleton while loading */
              <div className="animate-pulse">
                <div className="flex gap-4">
                  <div className="h-5 w-20 bg-gray-300 rounded" />
                  <div className="h-5 w-20 bg-gray-300 rounded" />
                </div>
                <div className="mt-3 h-9 w-full bg-gray-300 rounded" />
              </div>
            ) : (
              <>
                <div className="flex gap-4">
                  <RadioButton
                    label="Free"
                    checked={!isPaid}
                    id="pricing-free"
                    name="pricing-group"
                    onChange={() => handlePricingGroupChange("Free")}
                  />
                  <RadioButton
                    label="Paid"
                    checked={isPaid}
                    id="pricing-paid"
                    name="pricing-group"
                    onChange={() => handlePricingGroupChange("Paid")}
                  />
                </div>

                {isPaid && (
                  <div className="mt-2">
                    <Select
                      label="Paid plan"
                      labelHidden
                      options={[
                        { label: "Monthly (no usage fee)", value: "Monthly" },
                        {
                          label: "Usage (Monthly with usage fee)",
                          value: "Usage",
                        },
                        {
                          label: "Pas As You Go Only",
                          value: "PayAsYouGoOnly",
                        },
                      ]}
                      value={state.storeSubscriptionType}
                      onChange={handlePaidPlanChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="my-3">
            <Divider />
          </div>

          <div className="p-3 rounded-md bg-white/60">
            <p className="text-sm font-medium mb-2">Show Founder</p>
            {loading ? (
              <div className="animate-pulse h-9 w-full bg-gray-300 rounded" />
            ) : (
              <Select
                label="Show Founder"
                labelHidden
                options={[
                  { label: "Show", value: "show" },
                  { label: "Hide", value: "hide" },
                ]}
                value={state.eligibleForFounder ? "show" : "hide"}
                onChange={handleFounderChange}
              />
            )}

            {/* Without this, an admin who sets Hide while the global flag is ON sees the merchant
                still getting the Founder plan and assumes this control is broken. The value above is
                the STORED per-store flag; effective eligibility is `global OR per-store`. */}
            {!loading && state.globalShowFounder && (
              <div className="mt-2 text-xs text-amber-700">
                Global “Show Founder to merchant” is ON — every store sees the Founder plan regardless
                of this setting. Change it in Settings.
              </div>
            )}
          </div>
        </>
      )}

      {saveError && <div className="mt-3 text-sm text-red-600">{saveError}</div>}
      {saved && !saveError && (
        <div className="mt-3 text-sm text-green-700">Saved.</div>
      )}

      <div className="flex justify-end mt-3">
        <Button
          variant="primary"
          loading={saving}
          disabled={loading || !!loadError}
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default Subscription;
