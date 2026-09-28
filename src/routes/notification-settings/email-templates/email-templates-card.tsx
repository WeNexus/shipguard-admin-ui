import {
  Badge,
  Banner,
  BlockStack,
  Button,
  Card,
  Divider,
  Icon,
  SkeletonBodyText,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import { ImageIcon, ViewIcon } from "@shopify/polaris-icons";
import { useEffect, useMemo, useState } from "react";
import type { EmailTemplate, EmailTemplateName, StoreEmailTemplates } from "../type";
import { ADMIN_TEMPLATE } from "../type";
import TemplateModal from "./template-modal";
import { templateLabel } from "./template-preview";

/** The merchant's ON/OFF pill (components/switch.tsx), without the click. */
function ReadOnlySwitch({ isOn }: { isOn: boolean }) {
  return (
    <div
      aria-label={isOn ? "Enabled" : "Disabled"}
      className={`relative flex h-6 w-13 shrink-0 rounded-full drop-shadow-2xl ${
        isOn ? "bg-[#29845A]" : "bg-gray-500"
      }`}
    >
      <span
        className={`absolute inset-y-0 flex items-center text-[10px] leading-none font-bold text-white ${
          isOn ? "left-2" : "right-2"
        }`}
      >
        {isOn ? "ON" : "OFF"}
      </span>
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-2xl ${
          isOn ? "left-8" : "left-1"
        }`}
      />
    </div>
  );
}

/** Replaces the merchant's "Customize Email Logo" button: what is uploaded, not a way to change it. */
function LogoSummary({ logo }: { logo: StoreEmailTemplates["logo"] }) {
  if (!logo.file) {
    return (
      <Text as="span" tone="subdued" variant="bodySm">
        No email logo set
      </Text>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Thumbnail source={logo.logo ?? ImageIcon} alt="Email logo" size="small" />
      <div className="text-right">
        <Text as="p" variant="bodySm">
          {logo.file.name}
        </Text>
        <Text as="p" variant="bodySm" tone="subdued">
          {(logo.file.size / 1024).toFixed(1)} KB
          {!logo.logo && " · no public URL"}
        </Text>
      </div>
    </div>
  );
}

const audienceOf = (name: EmailTemplateName) => (name === ADMIN_TEMPLATE ? 1 : 0);

/**
 * Read-only mirror of the merchant's "Email templates" card, filtered by the same audience tab as
 * the settings card above it (0 = customer templates, 1 = the single admin template).
 *
 * Missing rows are listed, not hidden: at send time a missing template means that email is skipped.
 * The merchant app never shows this state because its GET seeds defaults on read.
 */
export default function EmailTemplatesCard({
  data,
  error,
  selectedTab,
}: {
  data: StoreEmailTemplates | null;
  error: string | null;
  selectedTab: number;
}) {
  const [open, setOpen] = useState<EmailTemplate | null>(null);

  // Tab switch closes the modal, as in the merchant app.
  useEffect(() => setOpen(null), [selectedTab]);

  const visible = useMemo(
    () => data?.templates.filter((t) => audienceOf(t.name) === selectedTab) ?? [],
    [data, selectedTab],
  );
  const missing = useMemo(
    () => data?.missing.filter((name) => audienceOf(name) === selectedTab) ?? [],
    [data, selectedTab],
  );

  return (
    <>
      <Card>
        <BlockStack gap="300">
          <div className="flex items-center justify-between">
            <Text as="h4" variant="headingMd">
              Email templates
            </Text>
            {data && <LogoSummary logo={data.logo} />}
          </div>
          <div className="-mx-4">
            <Divider />
          </div>

          {error && <Banner tone="critical">{error}</Banner>}
          {!data && !error && <SkeletonBodyText lines={4} />}

          {data && (
            <div className="w-full sm:p-2">
              <div className="border border-gray-400 rounded">
                <div className="bg-slate-200 p-2 rounded flex justify-between">
                  <div className="font-bold w-1/2">Email Template Name</div>
                  <div className="font-bold w-1/2 flex justify-between gap-4">
                    <span>Channel</span>
                    <span>Enable</span>
                    <span>Action</span>
                  </div>
                </div>
                {visible.map((item) => (
                  <div
                    key={item.name}
                    className="border-t border-gray-400 p-2 flex justify-between items-center"
                  >
                    <div className="w-1/2">{templateLabel(item.name)}</div>
                    <div className="w-1/2 flex justify-between items-center gap-4">
                      <span>{item.channel ?? "Email"}</span>
                      <ReadOnlySwitch isOn={item.enable} />
                      <Button
                        onClick={() => setOpen(item)}
                        icon={<Icon source={ViewIcon} accessibilityLabel="view" />}
                      />
                    </div>
                  </div>
                ))}
                {missing.map((name) => (
                  <div
                    key={name}
                    className="border-t border-gray-400 p-2 flex justify-between items-center"
                  >
                    <div className="w-1/2">{templateLabel(name)}</div>
                    <div className="w-1/2 flex justify-end">
                      <Badge tone="critical">Missing — this email is not sent</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </BlockStack>
      </Card>

      <TemplateModal
        template={open}
        logo={data?.logo.logo ?? null}
        onClose={() => setOpen(null)}
      />
    </>
  );
}
