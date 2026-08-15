import { Button, Modal, TextContainer, TextField } from "@shopify/polaris";
import SwitchWithLoading from "../../common/switch-with-loading";
import { useEffect, useState } from "react";
import { DEFAULT_SUSPEND_REASON } from "../../../config";
import { blockStore, unblockStore } from "../../../lib/store-control";

const Suspend = ({ store, setReFetch }: { store: any; setReFetch: any }) => {
  const [suspendLoading, setSuspendLoading] = useState(false);
  // LOCAL UI STATE (so we don't depend only on props)
  const [localAppStatus, setLocalAppStatus] = useState<string | undefined>(
    store?.appStatus,
  );
  const [showSuspendReason, setShowSuspendReason] = useState(false);
  const [suspendModalReason, setSuspendModalReason] = useState(
    DEFAULT_SUSPEND_REASON,
  );
  const [suspendModalError, setSuspendModalError] = useState<string | null>(
    null,
  );
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editSuspendReasonText, setEditSuspendReasonText] = useState("");
  const [editSuspendReasonError, setEditSuspendReasonError] = useState<
    string | null
  >(null);
  const [editSuspendReasonLoading, setEditSuspendReasonLoading] =
    useState(false);
  const [editSuspendReasonModalOpen, setEditSuspendReasonModalOpen] =
    useState(false);

  const [suspendReasonDisplay, setSuspendReasonDisplay] = useState(
    store?.suspendReason ??
      "Your account has been temporarily suspended due to a Shopify policy violation.\n" +
        "If you believe this is a mistake, please contact our support team.",
  );

  const isBlocked = localAppStatus === "BLOCKED";

  // keep local state in sync when parent `store` changes (e.g. after reload or parent refetch)
  useEffect(() => {
    setSuspendLoading(false);
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

  // SUSPEND SWITCH CLICK
  const handleSuspendToggle = () => {
    if (!store) return;

    if (isBlocked) {
      // Already blocked -> unsuspend directly
      setSuspendLoading(true);
      unblockStore({ storeId: store.id })
        .then(() => {
          setLocalAppStatus("READY");
          setSuspendReasonDisplay("");
          setReFetch((prev: boolean) => !prev);
        })
        .catch((err) => {
          console.error("Failed to lift suspension:", err);
          setActionError("Could not lift the suspension. Please try again.");
        })
        .finally(() => setSuspendLoading(false));
    } else {
      // Not blocked yet -> open modal to collect reason
      setSuspendModalReason(DEFAULT_SUSPEND_REASON);
      setSuspendModalError(null);
      setSuspendModalOpen(true);
    }
  };

  const handleOpenEditSuspendReason = () => {
    setEditSuspendReasonText(suspendReasonDisplay);
    setEditSuspendReasonError(null);
    setEditSuspendReasonModalOpen(true);
  };

  const handleCloseSuspendModal = () => {
    if (suspendLoading) return; // prevent closing while request in-flight
    setSuspendModalOpen(false);
  };

  // CONFIRM SUSPEND FROM MODAL
  const handleConfirmSuspend = async () => {
    if (!store) return;

    if (!suspendModalReason.trim()) {
      setSuspendModalError("Please enter a reason for suspending this store.");
      return;
    }

    setSuspendModalError(null);
    setSuspendLoading(true);
    try {
      await blockStore({ storeId: store.id }, suspendModalReason.trim());
      setLocalAppStatus("BLOCKED");
      setSuspendReasonDisplay(suspendModalReason.trim());
      setSuspendModalOpen(false);
      setReFetch((prev: boolean) => !prev);
    } catch (err) {
      console.error("Failed to suspend store:", err);
      setSuspendModalError("Could not suspend this store. Please try again.");
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleCloseEditSuspendReason = () => {
    if (editSuspendReasonLoading) return;
    setEditSuspendReasonModalOpen(false);
  };

  const handleConfirmEditSuspendReason = async () => {
    if (!store) return;

    if (!editSuspendReasonText.trim()) {
      setEditSuspendReasonError(
        "Please enter a reason for suspending this store.",
      );
      return;
    }

    setEditSuspendReasonError(null);
    setEditSuspendReasonLoading(true);
    try {
      // Re-issues `block` with the new reason — the store is already BLOCKED, so this is an
      // idempotent reason update (upsert on BlockedShop), matching the old behaviour.
      await blockStore({ storeId: store.id }, editSuspendReasonText.trim());
      setSuspendReasonDisplay(editSuspendReasonText.trim());
      setEditSuspendReasonModalOpen(false);
      setReFetch((prev: boolean) => !prev);
    } catch (err) {
      console.error("Failed to update suspension reason:", err);
      setEditSuspendReasonError("Could not update the reason. Please try again.");
    } finally {
      setEditSuspendReasonLoading(false);
    }
  };

  return (
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

      {actionError && (
        <div className="mt-1 text-sm text-red-600">{actionError}</div>
      )}

      {isBlocked && suspendReasonDisplay && (
        <div className="mt-2 flex gap-2">
          <Button
            size="slim"
            onClick={() => setShowSuspendReason(true)}
            icon={() => (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            )}
          >
            View Suspension Reason
          </Button>
          <Button
            size="slim"
            onClick={handleOpenEditSuspendReason}
            icon={() => (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            )}
          >
            Edit
          </Button>
        </div>
      )}

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
              Update the suspension reason for this store. You can use HTML tags
              for formatting.
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

export default Suspend;
