import { useEffect, useState } from "react";
import { Button } from "@shopify/polaris";
import SwitchWithLoading from "../common/switch-with-loading";
import type { IPackagePackageProtection } from "./type";
import { BASE_URL } from "../../config";

const AppControlCard = ({
  packageProtection,
  setReFetch = () => {},
}: {
  packageProtection: IPackagePackageProtection;
  setReFetch: any;
}) => {
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [storeFrontLogLoading, setStoreFrontLogLoading] = useState(false);

  const handleWidgetEnable = () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("storeId", packageProtection.storeId);
    formData.append("enabledSwitch", packageProtection.enabled as any);
    formData.append("action", "widgetEnable");

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

    // fetcher.submit(formData, {
    //   method: 'POST',
    //   action: '/admin/subscribers',
    // });
  };
  const handleAutoProtection = () => {
    setAutoLoading(true);
    const formData = new FormData();
    formData.append("storeId", packageProtection.storeId);
    formData.append(
      "insuranceDisplayButton",
      packageProtection.insuranceDisplayButton as any
    );
    formData.append("action", "autoProtection");

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

    // fetcher.submit(formData, {
    //   method: 'POST',
    //   action: '/admin/subscribers',
    // });
  };

  const handleStoreFrontLog = () => {
    setStoreFrontLogLoading(true);
    const formData = new FormData();
    formData.append("storeId", packageProtection.storeId);
    formData.append("storeFrontLog", packageProtection.storeFrontLog as any);
    formData.append("action", "storeFrontLog");

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

    // fetcher.submit(formData, {
    //   method: 'POST',
    //   action: '/admin/subscribers',
    // });
  };

  useEffect(() => {
    setLoading(false);
    setAutoLoading(false);
    setStoreFrontLogLoading(false);
  }, [packageProtection]);

  console.log("AppControlCard packageProtection:", packageProtection);

  return (
    <div
      className=" rounded-lg shadow-sm p-4 h-full"
      style={{ backgroundColor: "#b6d6ff" }}
    >
      <span className="text-lg font-bold">App Control</span>

      <div className="flex justify-between mt-2">
        <span className="text-lg">Widget Enable</span>
        {packageProtection && (
          <SwitchWithLoading
            switchOn={packageProtection?.enabled}
            handleSwitch={handleWidgetEnable}
            isLoading={loading}
          />
        )}
      </div>
      <div className="flex justify-between my-3">
        <span className="text-lg">Auto Protection</span>
        {packageProtection && (
          <SwitchWithLoading
            switchOn={packageProtection?.insuranceDisplayButton}
            handleSwitch={handleAutoProtection}
            isLoading={autoLoading}
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
      <div className="my-2">
        <Button size="large" fullWidth>
          Customize Widget
        </Button>
      </div>
      <Button tone="success" variant="primary" size="large" fullWidth>
        Add Custom JavaScript Code
      </Button>
    </div>
  );
};

export default AppControlCard;
