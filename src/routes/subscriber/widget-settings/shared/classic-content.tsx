import { FormLayout, TextField } from "@shopify/polaris";
import { ContentIcon } from "@shopify/polaris-icons";
import SettingCard from "./setting-card";
import PolicyFields from "./policy-fields";
import type { ClassicContent as ClassicContentData } from "../dummy-data";

// "Content" card shared by the Cart page (Classic template) and the Checkout page.
const ClassicContent = ({ content }: { content: ClassicContentData }) => (
  <SettingCard
    icon={ContentIcon}
    title="Content"
    subtitle="Configure what customers see on the widget"
  >
    <FormLayout>
      <TextField
        label={<b>Add-on title (Name of the insurance)</b>}
        value={content.title}
        maxLength={25}
        showCharacterCount
        autoComplete="off"
        readOnly
      />
      <TextField
        label={<b>Enabled description (Upsell description)</b>}
        value={content.enabledDescription}
        multiline={2}
        maxLength={170}
        showCharacterCount
        autoComplete="off"
        readOnly
      />
      <TextField
        label={<b>Disabled description (Upsell description)</b>}
        value={content.disabledDescription}
        multiline={2}
        maxLength={170}
        showCharacterCount
        autoComplete="off"
        readOnly
      />
      <PolicyFields
        policyType={content.policyType}
        policyText={content.policyText}
        policyUrl={content.policyUrl}
      />
    </FormLayout>
  </SettingCard>
);

export default ClassicContent;
