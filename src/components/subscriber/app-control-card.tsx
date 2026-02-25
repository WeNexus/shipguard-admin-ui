import { useEffect, useState } from "react";
import { Button } from "@shopify/polaris";
import SwitchWithLoading from "../common/switch-with-loading";
import type { IPackagePackageProtection } from "./type";
import { BASE_URL } from "../../config";
import CustomWidgetSelector from "./app-controls/custom-widget-selector";
import HideProduct from "./app-controls/hide-product";
import Suspend from "./app-controls/suspend";

const AppControlCard = ({
  packageProtection,
  setReFetch = () => {},
  store,
}: {
  packageProtection: IPackagePackageProtection;
  setReFetch: any;
  store: any;
}) => {
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

  // keep local state in sync when parent `store` changes (e.g. after reload or parent refetch)
  useEffect(() => {
    setUninstallLoading(false);
  }, [store]);

  const callAdminAppControl = async (
    payload: any,
    setLoading: (val: boolean) => void,
  ) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const res = await fetch(
        `${BASE_URL}/admin-app-control?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const data = await res.json();

      if (data.ok || data.success) {
        // let parent optionally refetch
        setReFetch((prev: boolean) => !prev);
        return true;
      } else {
        console.error("Admin app control error:", data.error || data);
        return false;
      }
    } catch (err) {
      console.error("Error calling admin-app-control:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // APP UNINSTALL
  const handleAppUninstalled = () => {
    if (!store) return;

    // optional: confirm in UI
    if (!window.confirm("Are you sure you want to uninstall this app?")) {
      return;
    }

    callAdminAppControl(
      {
        type: "uninstall",
        storeId: store.id,
      },
      setUninstallLoading,
    ).then((ok) => {
      if (ok) {
        console.log("Uninstall initiated for store", store.id);
      }
    });
  };

  const submitApi = (formData: any) => {
    fetch(`${BASE_URL}/admin/api/subscriber`, {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
        const data = await res.json();
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
    formData.append(
      "insuranceDisplayButton",
      packageProtection.insuranceDisplayButton as any,
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
    formData.append(
      "checkoutWidgetButton",
      packageProtection.checkoutWidgetButton as any,
    );
    formData.append("action", "checkoutWidgetButton");

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
      <span className="text-lg font-bold">App Control</span>

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
            switchOn={packageProtection?.insuranceDisplayButton}
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
            switchOn={packageProtection?.checkoutWidgetButton}
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
          // disabled={!!store.uninstalledAt}
          size="slim"
          variant="primary"
          tone="critical"
          onClick={handleAppUninstalled}
          loading={uninstallLoading}
        >
          {store?.uninstalledAt ? "Uninstalled" : "Uninstall app"}
        </Button>
      </div>
    </div>
  );
};

export default AppControlCard;
