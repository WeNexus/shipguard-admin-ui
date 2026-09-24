import { TextField } from "@shopify/polaris";

// Read-only stand-in for the storefront app's ColorPicker2: swatch + hex value.
const ColorField = ({ label, value }: { label: string; value: string }) => (
  <TextField
    label={label}
    value={value}
    autoComplete="off"
    readOnly
    prefix={
      <span
        className="block h-5 w-5 rounded border border-gray-300"
        style={{ background: value }}
      />
    }
  />
);

export default ColorField;
