import { useEffect, useState } from "react";
import type { IPackagePackageProtection } from "../type";
import SwitchWithLoading from "../../common/switch-with-loading";
import { Button, Collapsible, TextField } from "@shopify/polaris";
import { BASE_URL } from "../../../config";

const HideProduct = ({
  packageProtection,
  setReFetch = () => {},
}: {
  packageProtection: IPackagePackageProtection;
  setReFetch: any;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hideSelector, setHideSelector] = useState("");

  const handleProductHide = (switchClick = false) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("action", "productHide");
    formData.append("storeId", packageProtection.storeId);
    formData.append("hideSelector", hideSelector as any);
    if (switchClick) {
      formData.append(
        "productHideSwitch",
        !packageProtection.productHideSwitch as any,
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
      })
      .catch((err) => {
        console.error("Error updating store status:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setHideSelector(packageProtection.productHideSelector || "");
  }, [packageProtection]);

  return (
    <>
      <div className="flex justify-between my-3">
        <span
          className="text-lg cursor-pointer"
          onClick={() => setOpen((p) => !p)}
        >
          Hide Product From Store{" "}
        </span>
        {packageProtection && (
          <SwitchWithLoading
            switchOn={packageProtection?.productHideSwitch}
            handleSwitch={() => handleProductHide(true)}
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
            label="Search Class Selector"
            placeholder=".grid-item"
            helpText={`Enter the CSS class to hide the shipping protection product on your store (e.g., .grid-item).`}
            autoComplete="off"
            maxLength={70}
            showCharacterCount
            value={hideSelector}
            onChange={(value) => setHideSelector(value)}
          />
          <div className="flex justify-end ">
            <Button
              size="slim"
              variant="primary"
              onClick={() => handleProductHide(false)}
              disabled={!hideSelector}
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

export default HideProduct;
