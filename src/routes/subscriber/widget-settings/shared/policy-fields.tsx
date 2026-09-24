import { ChoiceList, TextField } from "@shopify/polaris";
import type { ReactNode } from "react";
import type { PolicyType } from "../dummy-data";

const POLICY_CHOICES = [
  { label: "None", value: "NONE" },
  { label: "Show as Tooltip", value: "TOOLTIP" },
  { label: "Show in Footer", value: "FOOTER_LINK" },
];

const PolicyFields = ({
  policyType,
  policyText,
  policyUrl,
  titleHidden,
  tooltipExtra,
  footerExtra,
}: {
  policyType: PolicyType;
  policyText: string;
  policyUrl: string;
  titleHidden?: boolean;
  tooltipExtra?: ReactNode;
  footerExtra?: ReactNode;
}) => {
  const urlField = (
    <TextField
      label="Refund policy url"
      type="url"
      prefix="https://"
      value={policyUrl}
      maxLength={100}
      showCharacterCount
      autoComplete="off"
      readOnly
    />
  );

  return (
    <>
      <ChoiceList
        title={<b>Policy Link Placement</b>}
        titleHidden={titleHidden}
        choices={POLICY_CHOICES}
        selected={[policyType]}
        onChange={() => {}}
        disabled
      />
      {policyType === "TOOLTIP" && (
        <>
          {urlField}
          {tooltipExtra}
        </>
      )}
      {policyType === "FOOTER_LINK" && (
        <>
          <TextField
            label="Policy text"
            value={policyText}
            maxLength={100}
            showCharacterCount
            autoComplete="off"
            readOnly
          />
          {urlField}
          {footerExtra}
        </>
      )}
    </>
  );
};

export default PolicyFields;
