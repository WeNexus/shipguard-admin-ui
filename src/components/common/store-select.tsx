import { Combobox, Icon, Listbox } from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { StoreOption } from "./type";

/**
 * Rendered ceiling, not a search ceiling — the filter always runs over every store. Past this many
 * options the dropdown stops being something you can read, and the browser pays to lay out rows
 * nobody will scroll to.
 */
const MAX_VISIBLE = 50;

function labelFor(store: StoreOption): string {
  return store.name === store.domain ? store.domain : `${store.name} — ${store.domain}`;
}

interface StoreSelectProps {
  stores: StoreOption[];
  selected: string;
  onChange: (domain: string) => void;
  disabled?: boolean;
}

/**
 * Searchable store picker, shared by every admin screen that acts on one store. The value is the
 * DOMAIN — that is what the endpoints target (`POST admin/gql/run`, `POST admin/webhooks/reset`).
 *
 * A Combobox rather than a Select: the list is every installed store, which a native dropdown makes
 * you scroll blind. Filtering is client-side over the already-loaded list, so it is instant and
 * costs no extra round trip; it matches on the shop name AND the myshopify domain, because which
 * one you remember depends on where you came from (a support ticket names the shop, a log line names
 * the domain).
 */
export default function StoreSelect({
  stores,
  selected,
  onChange,
  disabled,
}: StoreSelectProps) {
  const selectedLabel = useMemo(() => {
    const store = stores.find((candidate) => candidate.domain === selected);
    return store ? labelFor(store) : "";
  }, [stores, selected]);

  const [inputValue, setInputValue] = useState(selectedLabel);

  // The store list arrives after the first render, so the field's text has to catch up once the
  // preselected store actually resolves to a label.
  useEffect(() => setInputValue(selectedLabel), [selectedLabel]);

  const matches = useMemo(() => {
    const needle = inputValue.trim().toLowerCase();
    // An untouched field holds the current selection, not a search. Treating it as one would show a
    // dropdown containing only the store you already picked, every time you opened it.
    if (!needle || needle === selectedLabel.toLowerCase()) {
      return stores;
    }
    return stores.filter(
      (store) =>
        store.name.toLowerCase().includes(needle) ||
        store.domain.toLowerCase().includes(needle),
    );
  }, [inputValue, selectedLabel, stores]);

  const handleSelect = useCallback(
    (domain: string) => {
      onChange(domain);
      const store = stores.find((candidate) => candidate.domain === domain);
      setInputValue(store ? labelFor(store) : domain);
    },
    [onChange, stores],
  );

  const visible = matches.slice(0, MAX_VISIBLE);
  const options = visible.map((store) => (
    <Listbox.Option
      key={store.domain}
      value={store.domain}
      selected={store.domain === selected}
    >
      {labelFor(store)}
    </Listbox.Option>
  ));

  if (matches.length > visible.length) {
    // Disabled, so it can never be selected — it is a count, not an option.
    options.push(
      <Listbox.Option key="__more" value="" disabled>
        {`${matches.length - visible.length} more — keep typing to narrow`}
      </Listbox.Option>,
    );
  }

  return (
    <Combobox
      activator={
        <Combobox.TextField
          label="Store"
          value={inputValue}
          onChange={setInputValue}
          // A half-typed search left in the field would misrepresent which store is armed — the
          // selection never changed. Snap back to what Run will actually target.
          onBlur={() => setInputValue(selectedLabel)}
          prefix={<Icon source={SearchIcon} />}
          placeholder="Search by store name or myshopify domain"
          autoComplete="off"
          disabled={disabled || stores.length === 0}
        />
      }
    >
      <Listbox onSelect={handleSelect}>
        {options.length > 0 ? (
          options
        ) : (
          <Listbox.Option value="" disabled>
            No stores match that name or domain
          </Listbox.Option>
        )}
      </Listbox>
    </Combobox>
  );
}
