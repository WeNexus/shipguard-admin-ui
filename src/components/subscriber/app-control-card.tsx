import { useEffect, useState } from "react";
import {Button, ButtonGroup} from "@shopify/polaris";
import SwitchWithLoading from "../common/switch-with-loading";
import type { IPackagePackageProtection } from "./type";
import { apiFetch } from "../../lib/api-client";
import { uninstallStore } from "../../lib/store-control";
import { Modal, TextContainer, TextField } from "@shopify/polaris";
import CustomWidgetSelector from "./app-controls/custom-widget-selector";
import HideProduct from "./app-controls/hide-product";
import Suspend from "./app-controls/suspend";
import Subscription from "./app-controls/subscription";

type AppControlTab = "basic" | "subscription";

const AppControlCard = ({
  packageProtection,
  setReFetch = () => {},
  store,
}: {
  packageProtection: IPackagePackageProtection;
  setReFetch: any;
  store: any;
}) => {
  const [selectedTab, setSelectedTab] = useState<AppControlTab>("basic");

  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);

  const [storeFrontLogLoading, setStoreFrontLogLoading] = useState(false);

  const [checkoutWidgetEnableLoading, setCheckoutWidgetEnableLoading] =
    useState(false);
  const [
    checkoutWidgetAutoProtectionLoading,
    setCheckoutWidgetAutoProtectionLoading,
  ] = useState(false);

  // Access control start here

  const [uninstallLoading, setUninstallLoading] = useState(false);
  const [uninstallModalOpen, setUninstallModalOpen] = useState(false);
  const [confirmDomainInput, setConfirmDomainInput] = useState("");
  const [uninstallError, setUninstallError] = useState<string | null>(null);
  // Set once the uninstall POST succeeds; cleared when a refetch shows the webhook has landed.
  const [uninstallPending, setUninstallPending] = useState(false);

  // keep local state in sync when parent `store` changes (e.g. after reload or parent refetch)
  useEffect(() => {
    setUninstallLoading(false);
    // The webhook has landed — stop showing the pending label.
    if (store?.uninstalledAt) setUninstallPending(false);
  }, [store]);

  // APP UNINSTALL — irreversible, so it requires typing the store domain to confirm.
  // Replaces window.confirm(), which one stray Enter key defeated.
  const handleConfirmUninstall = async () => {
    if (!store) return;

    if (confirmDomainInput.trim() !== store.domain) {
      setUninstallError(`Type "${store.domain}" exactly to confirm.`);
      return;
    }

    setUninstallError(null);
    setUninstallLoading(true);
    try {
      await uninstallStore({ storeId: store.id }, confirmDomainInput.trim());
      // The backend intentionally writes NO local state (D8) — the app/uninstalled webhook applies
      // it moments later. So show a pending state instead of expecting uninstalledAt to be set,
      // and let the parent refetch pick up the real value.
      setUninstallPending(true);
      setUninstallModalOpen(false);
      setReFetch((prev: boolean) => !prev);
    } catch (err) {
      console.error("Uninstall failed:", err);
      setUninstallError("Uninstall failed. Please try again.");
    } finally {
      setUninstallLoading(false);
    }
  };

  /**
   * POST a toggle to `admin/api/subscriber`.
   *
   * ⚠️ CONTRACT: every toggle sends its **CURRENT** value and the backend writes the NEGATION
   * (`admin-subscriber-mutations.service.ts`). So do NOT pre-negate here — passing `!value` would
   * make the switch a no-op. Inherited from the old Remix route and preserved deliberately.
   *
   * Two call sites DO pre-negate, on purpose: `hide-product.tsx` and `custom-widget-selector.tsx`
   * send `!productHideSwitch` / `!defaultSetting`. Those two fields are OPTIONAL on the backend
   * (handled by a `!== undefined` check rather than the negating `bool()` path), so their value is
   * written as-is. Inconsistent, but correct — do not "fix" either side in isolation.
   */
  const submitApi = (formData: any) => {
    apiFetch("admin/api/subscriber", { method: "POST", body: formData })
      .then((data) => {
        if (data.success) {
          setReFetch((prev: boolean) => !prev);
        } else {
          console.error(data.error);
        }
      })
      .catch((err) => {
        console.error("Error updating store status:", err);
      });
  };

  const handleWidgetEnable = () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("storeId", packageProtection.storeId);
    formData.append("enabledSwitch", packageProtection.enabled as any);
    formData.append("action", "widgetEnable");
    submitApi(formData);
  };
  const handleAutoProtection = () => {
    setAutoLoading(true);
    const formData = new FormData();
    formData.append("storeId", packageProtection.storeId);
    // Sends the CURRENT value — the backend writes its negation (see submitApi).
    formData.append(
      "cartWidgetPreselected",
      packageProtection.cartWidgetPreselected as any,
    );
    formData.append("action", "autoProtection");

    submitApi(formData);
  };

  const handleCheckoutWidgetEnable = () => {
    setCheckoutWidgetEnableLoading(true);
    const formData = new FormData();
    formData.append("storeId", packageProtection.storeId);
    formData.append("checkoutEnable", packageProtection.checkoutEnable as any);
    formData.append("action", "checkoutEnable");

    submitApi(formData);
  };

  const handleCheckoutAutoProtection = () => {
    setCheckoutWidgetAutoProtectionLoading(true);
    const formData = new FormData();
    formData.append("storeId", packageProtection.storeId);
    // Sends the CURRENT value — the backend writes its negation (see submitApi).
    formData.append(
      "checkoutWidgetPreselected",
      packageProtection.checkoutWidgetPreselected as any,
    );
    formData.append("action", "checkoutWidgetPreselected");

    submitApi(formData);
  };

  const handleStoreFrontLog = () => {
    setStoreFrontLogLoading(true);
    const formData = new FormData();
    formData.append("storeId", packageProtection.storeId);
    formData.append("storeFrontLog", packageProtection.storeFrontLog as any);
    formData.append("action", "storeFrontLog");

    submitApi(formData);
  };

  useEffect(() => {
    setLoading(false);
    setAutoLoading(false);
    setStoreFrontLogLoading(false);
    setCheckoutWidgetEnableLoading(false);
    setCheckoutWidgetAutoProtectionLoading(false);
  }, [packageProtection]);

  return (
    <div
      className=" rounded-lg shadow-sm p-4 h-full"
      style={{ backgroundColor: "#b6d6ff" }}
    >
      <div className={'flex justify-between'}>
        <span className="text-lg font-bold">App Control</span>

        <ButtonGroup variant={'segmented'}>
          <Button
            pressed={selectedTab === "basic"}
            onClick={() => setSelectedTab("basic")}
          >
            Basic
          </Button>

          <Button
            pressed={selectedTab === "subscription"}
            onClick={() => setSelectedTab("subscription")}
          >
            Subscription
          </Button>
        </ButtonGroup>
      </div>

      {selectedTab === "basic" && (
      <>
      <div className="flex justify-between mt-2">
        <span className="text-lg">Cart Widget Enable</span>
        {packageProtection && (
          <SwitchWithLoading
            switchOn={packageProtection?.enabled}
            handleSwitch={handleWidgetEnable}
            isLoading={loading}
          />
        )}
      </div>

      <div className="flex justify-between my-3">
        <span className="text-lg">Cart Auto Protection</span>
        {packageProtection && (
          <SwitchWithLoading
            switchOn={!!packageProtection?.cartWidgetPreselected}
            handleSwitch={handleAutoProtection}
            isLoading={autoLoading}
          />
        )}
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-lg">Checkout Widget Enable</span>
        {packageProtection && (
          <SwitchWithLoading
            switchOn={packageProtection?.checkoutEnable}
            handleSwitch={handleCheckoutWidgetEnable}
            isLoading={checkoutWidgetEnableLoading}
          />
        )}
      </div>

      <div className="flex justify-between my-3">
        <span className="text-lg">Checkout Auto Protection</span>
        {packageProtection && (
          <SwitchWithLoading
            switchOn={!!packageProtection?.checkoutWidgetPreselected}
            handleSwitch={handleCheckoutAutoProtection}
            isLoading={checkoutWidgetAutoProtectionLoading}
          />
        )}
      </div>

      <div className="flex justify-between my-3">
        <span className="text-lg">Store Front Log</span>
        {packageProtection && (
          <SwitchWithLoading
            switchOn={packageProtection?.storeFrontLog}
            handleSwitch={handleStoreFrontLog}
            isLoading={storeFrontLogLoading}
          />
        )}
      </div>

      <HideProduct
        packageProtection={packageProtection}
        setReFetch={setReFetch}
      />

      <CustomWidgetSelector
        packageProtection={packageProtection}
        setReFetch={setReFetch}
      />

      <Suspend store={store} setReFetch={setReFetch} />

      {/* Uninstall */}
      <div className="flex justify-between my-1 items-center">
        <span className="text-lg">Uninstall</span>
        <Button
          size="slim"
          variant="primary"
          tone="critical"
          onClick={() => {
            setConfirmDomainInput("");
            setUninstallError(null);
            setUninstallModalOpen(true);
          }}
          loading={uninstallLoading}
          disabled={uninstallPending || !!store?.uninstalledAt}
        >
          {store?.uninstalledAt
            ? "Uninstalled"
            : uninstallPending
              ? "Uninstalling…"
              : "Uninstall app"}
        </Button>
      </div>

      <Modal
        open={uninstallModalOpen}
        onClose={() => !uninstallLoading && setUninstallModalOpen(false)}
        title="Uninstall this app"
        primaryAction={{
          content: "Uninstall",
          destructive: true,
          onAction: handleConfirmUninstall,
          loading: uninstallLoading,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setUninstallModalOpen(false),
            disabled: uninstallLoading,
          },
        ]}
      >
        <Modal.Section>
          <TextContainer>
            <p>
              This uninstalls the app from <b>{store?.domain}</b> on Shopify. It cannot be undone from
              here — the merchant would have to reinstall.
            </p>
            <TextField
              label={`Type "${store?.domain}" to confirm`}
              autoComplete="off"
              value={confirmDomainInput}
              onChange={(value) => {
                setConfirmDomainInput(value);
                if (uninstallError) setUninstallError(null);
              }}
              error={uninstallError || undefined}
            />
          </TextContainer>
        </Modal.Section>
      </Modal>
      </>
      )}

      {selectedTab === "subscription" && (
        <Subscription
          packageProtection={packageProtection}
          store={store}
          setReFetch={setReFetch}
        />
      )}
    </div>
  );
};

export default AppControlCard;
