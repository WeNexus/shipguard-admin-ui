import { Icon } from "@shopify/polaris";
import { CheckSmallIcon, XSmallIcon } from "@shopify/polaris-icons";

// A switch that only SHOWS a state. Support can't change the merchant's store from here, so it has
// no handler — `aria-disabled` rather than a <button>, which would still be tabbable and clickable.
const StatusToggle = ({ on, label }: { on: boolean; label: string }) => (
  <span
    role="switch"
    aria-checked={on}
    aria-disabled="true"
    aria-label={label}
    title={on ? "On" : "Off"}
    className={`inline-flex h-6 w-11 shrink-0 cursor-not-allowed items-center rounded-md p-0.5 ${
      on ? "justify-end bg-emerald-500" : "justify-start bg-slate-300"
    }`}
  >
    <span className="flex h-5 w-5 items-center justify-center rounded bg-white shadow-sm">
      <Icon
        source={on ? CheckSmallIcon : XSmallIcon}
        tone={on ? "success" : "subdued"}
      />
    </span>
  </span>
);

export default StatusToggle;
