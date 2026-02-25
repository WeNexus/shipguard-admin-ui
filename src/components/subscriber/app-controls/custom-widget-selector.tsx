import { Button, Collapsible, Select, TextField } from "@shopify/polaris";
import SwitchWithLoading from "../../common/switch-with-loading";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../../config";
import type { IPackagePackageProtection } from "../type";

const CustomWidgetSelector = ({
  packageProtection,
  setReFetch = () => {},
}: {
  packageProtection: IPackagePackageProtection;
  setReFetch: any;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cssSelector, setCssSelector] = useState(
    packageProtection.cssSelector || " ",
  );
  const [position, setPosition] = useState<"BEFORE" | "AFTER">(
    packageProtection.position || "BEFORE",
  );

  const handleCustomWidgetSelector = (switchClick = false) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("action", "customSelector");
    formData.append("storeId", packageProtection.storeId);
    formData.append("cssSelector", cssSelector as any);
    formData.append("widgetPosition", position);
    if (switchClick) {
      formData.append(
        "customSelector",
        !packageProtection.defaultSetting as any,
      );
    }

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
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error updating store status:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    setCssSelector(packageProtection.cssSelector || " ");
    setPosition(packageProtection.position || "BEFORE");
  }, [packageProtection]);
  return (
    <>
      <div className="flex justify-between my-3">
        <span
          className="text-lg cursor-pointer"
          onClick={() => setOpen((p) => !p)}
        >
          Use custom widget selector
        </span>
        {packageProtection && (
          <SwitchWithLoading
            switchOn={!packageProtection?.defaultSetting}
            handleSwitch={() => handleCustomWidgetSelector(true)}
            isLoading={loading}
          />
        )}
      </div>

      <div className="my-2">
        <Collapsible
          open={open}
          id="basic-collapsible"
          transition={{ duration: "500ms", timingFunction: "ease-in-out" }}
          expandOnPrint
        >
          <TextField
            label="Widget Placement Selector"
            placeholder=".cart__ctas"
            helpText={`Enter the CSS class to place shipping protection widget on your store (e.g., .cart__ctas).`}
            autoComplete="off"
            maxLength={70}
            showCharacterCount
            value={cssSelector}
            onChange={(value) => setCssSelector(value)}
          />
          <br />
          <Select
            label="Widget Position"
            value={position}
            onChange={(value) => setPosition(value as "BEFORE" | "AFTER")}
            options={[
              { label: "Before element", value: "BEFORE" },
              { label: "After element", value: "AFTER" },
            ]}
          />
          <br />

          <div className="flex justify-end ">
            <Button
              size="slim"
              variant="primary"
              onClick={() => handleCustomWidgetSelector(false)}
              disabled={!cssSelector}
              loading={loading}
            >
              Save
            </Button>
          </div>
        </Collapsible>
      </div>
    </>
  );
};

export default CustomWidgetSelector;
