import { useEffect, useState } from "react";
import {Button, Collapsible, Modal, TextContainer, TextField} from "@shopify/polaris";
import SwitchWithLoading from "../common/switch-with-loading";
import type { IPackagePackageProtection } from "./type";
import {BASE_URL, DEFAULT_SUSPEND_REASON} from "../../config";

const AppControlCard = ({
  packageProtection,
  setReFetch = () => {},
store
}: {
  packageProtection: IPackagePackageProtection;
  setReFetch: any;
  store:any;
}) => {
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);

  const [storeFrontLogLoading, setStoreFrontLogLoading] = useState(false);
  const [productHideLoading, setProductHideLoading] = useState(false);
  const [checkoutWidgetEnableLoading, setCheckoutWidgetEnableLoading] =
    useState(false);
  const [
    checkoutWidgetAutoProtectionLoading,
    setCheckoutWidgetAutoProtectionLoading,
  ] = useState(false);

  const [hideSelector, setHideSelector] = useState("");

  const [open, setOpen] = useState(false);

  // Access control start here

  const [suspendLoading, setSuspendLoading] = useState(false);

  const [uninstallLoading, setUninstallLoading] = useState(false);

  // View/Edit suspension reason states
  const [showSuspendReason, setShowSuspendReason] = useState(false);
  const [editSuspendReasonModalOpen, setEditSuspendReasonModalOpen] = useState(false);
  const [editSuspendReasonText, setEditSuspendReasonText] = useState("");
  const [editSuspendReasonError, setEditSuspendReasonError] = useState<string | null>(null);
  const [editSuspendReasonLoading, setEditSuspendReasonLoading] = useState(false);

  // SUSPEND MODAL STATE
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendModalReason, setSuspendModalReason] = useState(DEFAULT_SUSPEND_REASON);
  const [suspendModalError, setSuspendModalError] = useState<string | null>(
    null
  );

  // LOCAL UI STATE (so we don't depend only on props)
  const [localAppStatus, setLocalAppStatus] = useState<string | undefined>(
    store?.appStatus
  );

  const [suspendReasonDisplay, setSuspendReasonDisplay] = useState(
    store?.suspendReason ?? "Your account has been temporarily suspended due to a Shopify policy violation.\n" +
    "If you believe this is a mistake, please contact our support team."
  );

  const isBlocked = localAppStatus === "BLOCKED";


  // keep local state in sync when parent `store` changes (e.g. after reload or parent refetch)
  useEffect(() => {
    setSuspendLoading(false);
    setUninstallLoading(false);
    setLocalAppStatus(store?.appStatus);
    setSuspendReasonDisplay(store?.suspendReason ?? "");
  }, [
    store?.id,
    store?.appStatus,
    store?.development,
    store,
    store?.suspendReason,
    store?.appReview,
  ]);

  const callAdminAppControl = async (
    payload: any,
    setLoading: (val: boolean) => void
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
        }
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


  // SUSPEND SWITCH CLICK
  const handleSuspendToggle = () => {
    if (!store) return;

    if (isBlocked) {
      // Already blocked -> unsuspend directly
      callAdminAppControl(
        {
          type: "ready",
          storeId: store.id,
        },
        setSuspendLoading
      ).then((ok) => {
        if (ok) {
          setLocalAppStatus("READY");
          setSuspendReasonDisplay("");
        }
      });
    } else {
      // Not blocked yet -> open modal to collect reason
      setSuspendModalReason(DEFAULT_SUSPEND_REASON);
      setSuspendModalError(null);
      setSuspendModalOpen(true);
    }
  };

  // CONFIRM SUSPEND FROM MODAL
  const handleConfirmSuspend = async () => {
    if (!store) return;

    if (!suspendModalReason.trim()) {
      setSuspendModalError("Please enter a reason for suspending this store.");
      return;
    }

    setSuspendModalError(null);

    const ok = await callAdminAppControl(
      {
        type: "block",
        storeId: store.id,
        suspendReason: suspendModalReason.trim(),
      },
      setSuspendLoading
    );

    if (ok) {
      setLocalAppStatus("BLOCKED");
      setSuspendReasonDisplay(suspendModalReason.trim());
      setSuspendModalOpen(false);
    }
  };

  const handleCloseSuspendModal = () => {
    if (suspendLoading) return; // prevent closing while request in-flight
    setSuspendModalOpen(false);
  };

  // EDIT SUSPEND REASON HANDLERS
  const handleOpenEditSuspendReason = () => {
    setEditSuspendReasonText(suspendReasonDisplay);
    setEditSuspendReasonError(null);
    setEditSuspendReasonModalOpen(true);
  };

  const handleCloseEditSuspendReason = () => {
    if (editSuspendReasonLoading) return;
    setEditSuspendReasonModalOpen(false);
  };

  const handleConfirmEditSuspendReason = async () => {
    if (!store) return;

    if (!editSuspendReasonText.trim()) {
      setEditSuspendReasonError("Please enter a reason for suspending this store.");
      return;
    }

    setEditSuspendReasonError(null);

    const ok = await callAdminAppControl(
      {
        type: "block",
        storeId: store.id,
        suspendReason: editSuspendReasonText.trim(),
      },
      setEditSuspendReasonLoading
    );

    if (ok) {
      setSuspendReasonDisplay(editSuspendReasonText.trim());
      setEditSuspendReasonModalOpen(false);
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
      setUninstallLoading
    ).then((ok) => {
      if (ok) {
        // you could also optimistically update status here if you want
        console.log("Uninstall initiated for store", store.id);
      }
    });
  };


  // Access control end here


  // const handleToggle = useCallback(() => setOpen((open) => !open), []);

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
  };

  const handleCheckoutWidgetEnable = () => {
    setCheckoutWidgetEnableLoading(true);
    const formData = new FormData();
    formData.append("storeId", packageProtection.storeId);
    formData.append("checkoutEnable", packageProtection.checkoutEnable as any);
    formData.append("action", "checkoutEnable");

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

  const handleCheckoutAutoProtection = () => {
    setCheckoutWidgetAutoProtectionLoading(true);
    const formData = new FormData();
    formData.append("storeId", packageProtection.storeId);
    formData.append(
      "checkoutWidgetButton",
      packageProtection.checkoutWidgetButton as any
    );
    formData.append("action", "checkoutWidgetButton");

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
  };

  const handleProductHide = () => {
    setProductHideLoading(true);
    const formData = new FormData();
    formData.append("action", "productHide");
    formData.append("storeId", packageProtection.storeId);
    formData.append("hideSelector", hideSelector as any);
    formData.append(
      "productHideSwitch",
      !packageProtection.productHideSwitch as any
    );

    fetch(`${BASE_URL}/admin/api/subscriber`, {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
        const data = await res.json();
        if (data.success) {
          setReFetch((prev: boolean) => !prev);
          setOpen(false);
        } else {
          console.error(data.error);
        }
      })
      .catch((err) => {
        console.error("Error updating store status:", err);
      });
  };

  useEffect(() => {
    setLoading(false);
    setAutoLoading(false);
    setProductHideLoading(false);
    setStoreFrontLogLoading(false);
    setCheckoutWidgetEnableLoading(false);
    setCheckoutWidgetAutoProtectionLoading(false);

    setHideSelector(packageProtection?.productHideSelector || "");
  }, [packageProtection]);

  console.log(packageProtection);

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
            handleSwitch={handleProductHide}
            isLoading={productHideLoading}
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
              onClick={handleProductHide}
              disabled={!hideSelector}
              loading={productHideLoading}
            >
              Save
            </Button>
          </div>
        </Collapsible>
      </div>
      {/* <Button tone="success" variant="primary" size="large" fullWidth>
        Add Custom JavaScript Code
      </Button> */}

      <div className="flex flex-col my-3">
        <div className="flex justify-between items-center">
          <span className="text-lg">Suspend</span>
          {store && (
            <SwitchWithLoading
              switchOn={isBlocked}
              handleSwitch={handleSuspendToggle}
              isLoading={suspendLoading}
            />
          )}
        </div>

        {isBlocked && suspendReasonDisplay && (
          <div className="mt-2 flex gap-2">
            <Button
              size="slim"
              onClick={() => setShowSuspendReason(true)}
              icon={() => (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              )}
            >
              View Suspension Reason
            </Button>
            <Button
              size="slim"
              onClick={handleOpenEditSuspendReason}
              icon={() => (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              )}
            >
              Edit
            </Button>
          </div>
        )}
      </div>


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


  {/* Suspend modal */}
  <Modal
    open={suspendModalOpen}
    onClose={handleCloseSuspendModal}
    title="Suspend this store"
    primaryAction={{
      content: "Suspend",
      destructive: true,
      onAction: handleConfirmSuspend,
      loading: suspendLoading,
    }}
    secondaryActions={[
      {
        content: "Cancel",
        onAction: handleCloseSuspendModal,
        disabled: suspendLoading,
      },
    ]}
  >
    <Modal.Section>
      <TextContainer>
        <p>
          This will set the app status to <b>BLOCKED</b> for this store and
          prevent it from using your app.
        </p>
        <TextField
          label="Suspend reason (HTML supported)"
          placeholder="Enter suspension reason with HTML/CSS"
          autoComplete="off"
          value={suspendModalReason}
          maxLength={250}
          multiline={3}
          showCharacterCount
          onChange={(value) => {
            setSuspendModalReason(value);
            if (suspendModalError) setSuspendModalError(null);
          }}
          error={suspendModalError || undefined}
        />
      </TextContainer>
    </Modal.Section>
  </Modal>

  {/* Suspension Reason Display Modal */}
  <Modal
    open={showSuspendReason}
    onClose={() => setShowSuspendReason(false)}
    title="Suspension Reason"
    primaryAction={{
      content: "Close",
      onAction: () => setShowSuspendReason(false),
    }}
  >
    <Modal.Section>
      <div
        className="text-sm"
        dangerouslySetInnerHTML={{ __html: suspendReasonDisplay }}
      />
    </Modal.Section>
  </Modal>

  {/* Edit Suspension Reason Modal */}
  <Modal
    open={editSuspendReasonModalOpen}
    onClose={handleCloseEditSuspendReason}
    title="Edit Suspension Reason"
    primaryAction={{
      content: "Update",
      onAction: handleConfirmEditSuspendReason,
      loading: editSuspendReasonLoading,
    }}
    secondaryActions={[
      {
        content: "Cancel",
        onAction: handleCloseEditSuspendReason,
        disabled: editSuspendReasonLoading,
      },
    ]}
  >
    <Modal.Section>
      <TextContainer>
        <p>
          Update the suspension reason for this store. You can use HTML tags for formatting.
        </p>
        <TextField
          label="Suspension reason (HTML supported)"
          placeholder="Enter the suspension reason with HTML/CSS"
          autoComplete="off"
          value={editSuspendReasonText}
          maxLength={250}
          multiline={3}
          showCharacterCount
          onChange={(value) => {
            setEditSuspendReasonText(value);
            if (editSuspendReasonError) setEditSuspendReasonError(null);
          }}
          error={editSuspendReasonError || undefined}
        />
      </TextContainer>
    </Modal.Section>
  </Modal>

    </div>
  );
};

export default AppControlCard;
