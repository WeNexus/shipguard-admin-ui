import { useEffect, useState } from "react";
import { Banner, BlockStack, Modal, Select, TextField } from "@shopify/polaris";
import { apiFetch } from "../../../lib/api-client";
import {
  CATEGORY_SELECT_OPTIONS,
  FEATURE_REQUESTS_PATH,
  errorText,
} from "../types";
import type { AdminFeatureRequest, FeatureRequestCategory } from "../types";

const DEFAULT_CATEGORY: FeatureRequestCategory = "OTHER";

/** A team roadmap request: no store, shown on the merchant board like any other. */
export function CreateFeatureRequestModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (row: AdminFeatureRequest) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] =
    useState<FeatureRequestCategory>(DEFAULT_CATEGORY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDescription("");
    setCategory(DEFAULT_CATEGORY);
    setError(null);
  }, [open]);

  // Same bounds as the backend's CreateFeatureRequestDto.
  const valid = title.trim().length >= 4 && description.trim().length > 0;

  const submit = async () => {
    if (!valid) return;
    setSaving(true);
    setError(null);
    try {
      const created = await apiFetch<AdminFeatureRequest>(
        FEATURE_REQUESTS_PATH,
        {
          method: "POST",
          body: {
            title: title.trim(),
            description: description.trim(),
            category,
          },
        },
      );
      onCreated(created);
      onClose();
    } catch (e) {
      setError(errorText(e, "Could not create the request"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New roadmap request"
      primaryAction={{
        content: "Create",
        onAction: submit,
        loading: saving,
        disabled: !valid,
      }}
      secondaryActions={[{ content: "Cancel", onAction: onClose }]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          {error ? <Banner tone="critical">{error}</Banner> : null}
          <TextField
            label="Title"
            autoComplete="off"
            maxLength={120}
            helpText="At least 4 characters."
            value={title}
            onChange={setTitle}
          />
          <TextField
            label="Description"
            autoComplete="off"
            multiline={4}
            maxLength={2000}
            value={description}
            onChange={setDescription}
          />
          <Select
            label="Category"
            options={CATEGORY_SELECT_OPTIONS}
            value={category}
            onChange={(value) => setCategory(value as FeatureRequestCategory)}
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
