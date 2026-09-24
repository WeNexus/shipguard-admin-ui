import {
  Button,
  Card,
  Frame,
  Select,
  SkeletonBodyText,
  Text,
  Toast,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api-client";

type SettingsData = {
  showFounderToMerchant: boolean;
  newUserSubscriptionPlan: "Free" | "Monthly" | "Usage";
};

const SETTINGS_PATH = "admin/api/global-settings/subscription-config";

const Settings = () => {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    apiFetch(SETTINGS_PATH)
      .then((json) => {
        setData({
          showFounderToMerchant: json.data.showFounderToMerchant,
          newUserSubscriptionPlan: json.data.newUserSubscriptionPlan,
        });
      })
      .catch(() => {
        setLoadError(true);
        setToastMessage("Something went wrong");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSave = () => {
    if (!data) return;
    setSaving(true);
    apiFetch(SETTINGS_PATH, { method: "POST", body: data })
      .then(() => {
        setToastMessage("Settings saved");
      })
      .catch(() => {
        setToastMessage("Something went wrong");
      })
      .finally(() => {
        setSaving(false);
      });
  };

  return (
    <Frame>
      <div className={"p-5"}>
        <Card>
          <Text as={"h3"} variant={"headingMd"}>
            Global Settings
          </Text>

          {loading ? (
            <div className={"grid grid-cols-2 gap-2 mt-4"}>
              <div>
                <SkeletonBodyText lines={3} />
              </div>
              <div>
                <SkeletonBodyText lines={3} />
              </div>
            </div>
          ) : loadError || !data ? (
            <div className={"mt-4"}>
              <Text as={"p"} tone={"critical"}>
                Failed to load data
              </Text>
            </div>
          ) : (
            <>
              <div className={"grid grid-cols-2 gap-2 mt-4"}>
                <div>
                  <Select
                    label="Show Founder to merchant"
                    options={[
                      { label: "Show", value: "show" },
                      { label: "Hide", value: "hide" },
                    ]}
                    value={data.showFounderToMerchant ? "show" : "hide"}
                    onChange={(value) =>
                      setData({
                        ...data,
                        showFounderToMerchant: value === "show",
                      })
                    }
                  />
                </div>

                <div>
                  <Select
                    label="New store plan"
                    helpText="What plan will user see if they install for the first time"
                    options={[
                      { label: "Free", value: "Free" },
                      { label: "Monthly", value: "Monthly" },
                      { label: "Usage", value: "Usage" },
                    ]}
                    value={data.newUserSubscriptionPlan}
                    onChange={(value) =>
                      setData({
                        ...data,
                        newUserSubscriptionPlan:
                          value as SettingsData["newUserSubscriptionPlan"],
                      })
                    }
                  />
                </div>
              </div>

              <div className={"flex justify-end mt-4"}>
                <Button variant="primary" loading={saving} onClick={handleSave}>
                  Save
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>

      {toastMessage && (
        <Toast
          content={toastMessage}
          error
          onDismiss={() => setToastMessage(null)}
        />
      )}
    </Frame>
  );
};

export default Settings;
