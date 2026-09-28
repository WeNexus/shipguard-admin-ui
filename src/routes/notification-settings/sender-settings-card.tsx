import {
  AccountConnection,
  BlockStack,
  Box,
  Card,
  ChoiceList,
  Divider,
  Layout,
  Select,
  Tabs,
  Text,
  TextField,
} from "@shopify/polaris";
import GoogleLogo from "../../assets/Logo-google-icon-PNG.png";
import type { StoreSenderDetail } from "./type";

/**
 * Read-only mirror of the merchant's Notification Settings card
 * (ShipGuard_2.0_Frontend/src/routes/settingsNew/sub-routes/notificationSettings). Same tabs, same
 * branches, same labels — so support sees what the merchant sees and can talk them through it. Every
 * input is disabled; only the branch the store is actually on renders, as in the merchant app.
 *
 * Rebuilt rather than imported: the merchant components are bound to App Bridge and its form state.
 * If the merchant layout changes, change this too.
 */

type Smtp = NonNullable<StoreSenderDetail["smtp"]>;

// Mirrors the merchant's hardcoded default sender label (SenderInfo.tsx).
const DEFAULT_SENDER_EMAIL = "no-reply@shipguard.app";

const PROTOCOL_OPTIONS = [
  { label: "SMTP", value: "smtp" },
  { label: "SMTPS", value: "smtps" },
];
const TLS_OPTIONS = ["TLSv1", "TLSv1.1", "TLSv1.2", "TLSv1.3"].map((v) => ({
  label: v,
  value: v,
}));
const PROVIDER_OPTIONS = [
  { label: "Google", value: "google" },
  { label: "Custom", value: "custom" },
];

/** A disabled field whose empty state says "Not set" instead of looking like a blank input. */
function ReadOnlyField({
  label,
  value,
  helpText,
}: {
  label: string;
  value: string | number | null;
  helpText?: string;
}) {
  return (
    <TextField
      label={label}
      value={value === null || value === "" ? "" : String(value)}
      placeholder="Not set"
      helpText={helpText}
      autoComplete="off"
      disabled
    />
  );
}

/**
 * The merchant screen's `saved || storeInfo.x` fallback (index.tsx), plus a note saying which one is
 * showing — the merchant can't tell, but support needs to.
 */
function SavedOrStoreDefault({
  label,
  saved,
  fallback,
}: {
  label: string;
  saved: string | null | undefined;
  fallback: string | null;
}) {
  const usingDefault = !saved && !!fallback;
  return (
    <ReadOnlyField
      label={label}
      value={saved || fallback}
      helpText={usingDefault ? "Store default — not saved by the merchant" : undefined}
    />
  );
}

/** Passwords never reach the browser — only whether one is saved. */
function SecretField({ label, saved }: { label: string; saved: boolean }) {
  return <ReadOnlyField label={label} value={saved ? "••••••••" : null} />;
}

/** Static look-alike of the merchant's SwitchButton; not clickable. */
function ReadOnlySwitch({ on, label }: { on: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className="relative inline-block w-12 h-6 rounded-full"
        style={{ backgroundColor: on ? "#6bce6a" : "#ddd" }}
      >
        <span
          className={`absolute top-[2px] h-5 w-5 rounded-full bg-white shadow ${on ? "right-[2px]" : "left-[2px]"}`}
        />
      </span>
      <Text as="span">
        {label}: {on ? "on" : "off"}
      </Text>
    </div>
  );
}

/** The merchant's "Connection Settings" box (smtpSettings.custom.tsx), read-only. */
export function SmtpConnectionFields({ smtp }: { smtp: Smtp }) {
  return (
    <div className="border border-gray-400 p-4 rounded my-4">
      <BlockStack gap="300">
        <Text as="p" variant="headingMd">
          Connection Settings
        </Text>
        <Select
          label="SMTP Protocol"
          options={PROTOCOL_OPTIONS}
          value={smtp.protocol || "smtp"}
          disabled
        />
        <div className="sm:flex gap-2">
          <div className="w-full">
            <ReadOnlyField label="SMTP Host" value={smtp.host} />
          </div>
          <div className="w-full">
            <ReadOnlyField label="SMTP Port" value={smtp.port} />
          </div>
        </div>
        <div className="sm:flex gap-2">
          <div className="w-full">
            <ReadOnlyField label="Username" value={smtp.username} />
          </div>
          <div className="w-full">
            <SecretField label="Password" saved={smtp.hasPassword} />
          </div>
        </div>
        <ReadOnlyField label="Timeout (ms)" value={smtp.timeout} />
        <ReadOnlySwitch on={!!smtp.tlsVersion} label="Enable TLS" />
        {smtp.tlsVersion && (
          <Select label="TLS Version" options={TLS_OPTIONS} value={smtp.tlsVersion} disabled />
        )}
        <ReadOnlySwitch on={smtp.useProxy} label="Enable Proxy" />
        {smtp.useProxy && (
          <>
            <div className="sm:flex gap-2">
              <div className="w-full">
                <ReadOnlyField label="Proxy Host" value={smtp.proxyHost} />
              </div>
              <div className="w-full">
                <ReadOnlyField label="Proxy Port" value={smtp.proxyPort} />
              </div>
            </div>
            <div className="sm:flex gap-2">
              <div className="w-full">
                <ReadOnlyField label="Proxy User" value={smtp.proxyUsername} />
              </div>
              <div className="w-full">
                <SecretField label="Proxy Password" saved={smtp.hasProxyPassword} />
              </div>
            </div>
          </>
        )}
      </BlockStack>
    </div>
  );
}

function GoogleAccount({ google }: { google: StoreSenderDetail["google"] }) {
  const connected = google.lookup === "ok";
  return (
    <AccountConnection
      accountName="Google"
      connected={connected}
      title={google.user?.email || "Google Account Integration"}
      avatarUrl={google.user?.picture || GoogleLogo}
      details={
        connected
          ? "The Google account is connected."
          : "No working Google account — Gmail sends are skipped."
      }
    />
  );
}

function CustomSender({ detail }: { detail: StoreSenderDetail }) {
  const smtp = detail.smtp;
  // resolveSender treats anything but 'google' as custom SMTP, so a null provider shows as Custom.
  const provider = smtp?.provider === "google" ? "google" : "custom";

  return (
    <Card>
      <div className="w-full sm:p-4">
        <Box paddingBlockEnd="200">
          <Select label="SMTP Provider" options={PROVIDER_OPTIONS} value={provider} disabled />
        </Box>
        {provider === "google" ? (
          <Box paddingBlockStart="200" paddingBlockEnd="200">
            <GoogleAccount google={detail.google} />
          </Box>
        ) : smtp ? (
          <>
            <Box paddingBlockStart="200" paddingBlockEnd="200">
              <ReadOnlyField label="Mail From" value={smtp.from} />
            </Box>
            <SmtpConnectionFields smtp={smtp} />
          </>
        ) : (
          <Text as="p" tone="critical">
            No SMTP settings saved.
          </Text>
        )}
      </div>
    </Card>
  );
}

function DefaultSender({ detail }: { detail: StoreSenderDetail }) {
  return (
    <Layout>
      <Layout.Section variant="oneThird">
        <SavedOrStoreDefault
          label="Sender name"
          saved={detail.notification?.senderName}
          fallback={detail.storeInfo.name}
        />
      </Layout.Section>
      <Layout.Section variant="oneThird">
        <ReadOnlyField label="Sender email" value={DEFAULT_SENDER_EMAIL} />
      </Layout.Section>
      <Layout.Section variant="oneThird">
        <SavedOrStoreDefault
          label="Reply-to"
          saved={detail.notification?.replyTo}
          fallback={detail.storeInfo.email}
        />
      </Layout.Section>
    </Layout>
  );
}

const TABS = [
  { id: "notify-customer", content: "Notify customer" },
  { id: "notify-merchant", content: "Notify merchant" },
];

/**
 * The tab is owned by the caller: the email templates card below is filtered by the same tab,
 * exactly as in the merchant app.
 */
export default function SenderSettingsCard({
  detail,
  selectedTab,
  onSelectTab,
}: {
  detail: StoreSenderDetail;
  selectedTab: number;
  onSelectTab: (tab: number) => void;
}) {
  // A store that never saved the screen has no row; the merchant app shows DEFAULT for it.
  const senderFrom = detail.notification?.senderFrom ?? "DEFAULT";

  return (
    <Card>
      <Tabs tabs={TABS} selected={selectedTab} onSelect={onSelectTab} fitted={false} />
      <div className="-mx-4 my-4">
        <Divider />
      </div>

      {selectedTab === 0 ? (
        <BlockStack gap="300">
          <Text as="h4" variant="headingMd">
            Sender info
          </Text>
          <ChoiceList
            title=""
            disabled
            choices={[
              {
                label: (
                  <div>
                    Use default email{" "}
                    <span className="text-blue-800">({DEFAULT_SENDER_EMAIL})</span>
                  </div>
                ),
                value: "DEFAULT",
              },
              { label: "Use custom domain email (SMTP setup)", value: "CUSTOM" },
            ]}
            selected={[senderFrom]}
            onChange={() => {}}
          />
          {senderFrom === "DEFAULT" ? (
            <DefaultSender detail={detail} />
          ) : (
            <CustomSender detail={detail} />
          )}
        </BlockStack>
      ) : (
        <BlockStack gap="300">
          <Text as="h4" variant="headingMd">
            Recipient info
          </Text>
          <Layout>
            <Layout.Section variant="oneThird">
              <SavedOrStoreDefault
                label="Recipient email address"
                saved={detail.notification?.merchantEmail}
                fallback={detail.storeInfo.email}
              />
            </Layout.Section>
            <Layout.Section variant="oneHalf"></Layout.Section>
          </Layout>
        </BlockStack>
      )}
    </Card>
  );
}
