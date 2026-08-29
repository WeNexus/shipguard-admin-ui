import { Select } from "@shopify/polaris";
import type { GqlStoreOption } from "./type";

interface StoreSelectProps {
  stores: GqlStoreOption[];
  selected: string;
  onChange: (domain: string) => void;
  disabled?: boolean;
}

/**
 * Store picker. The value is the DOMAIN — that is what `POST admin/gql/run` targets, and what the
 * label falls back to for an unnamed store, so the option is never blank.
 */
export default function StoreSelect({
  stores,
  selected,
  onChange,
  disabled,
}: StoreSelectProps) {
  const options = stores.map((store) => ({
    label: store.name === store.domain ? store.domain : `${store.name} — ${store.domain}`,
    value: store.domain,
  }));

  return (
    <Select
      label="Store"
      options={options}
      value={selected}
      onChange={onChange}
      disabled={disabled || options.length === 0}
      placeholder={options.length === 0 ? "No installed stores" : undefined}
    />
  );
}
