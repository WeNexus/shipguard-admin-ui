import { Banner, BlockStack, Card, Icon, Page, SkeletonBodyText, Text } from "@shopify/polaris";
import { AlertTriangleIcon, CheckCircleIcon, XCircleIcon } from "@shopify/polaris-icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ApiError, apiFetch } from "../../lib/api-client";
import { TechnicalDetails } from "./support/support-message";
import type { SenderKind, SenderStats } from "./type";
import { SENDER_KIND_META } from "./type";

const KIND_ORDER: SenderKind[] = [
  "DEFAULT",
  "CUSTOM_SMTP",
  "GMAIL",
  "CUSTOM_SMTP_INCOMPLETE",
  "GMAIL_DISCONNECTED",
  "CUSTOM_NO_CONFIG",
];

const TILES = [
  {
    state: "working",
    label: "Working",
    hint: "Nothing found that would stop their emails.",
    icon: CheckCircleIcon,
    tone: "success",
    look: "border-green-300 bg-green-50",
    tab: null,
  },
  {
    state: "not_working",
    label: "Not working",
    hint: "Some or all of their emails are not being sent.",
    icon: XCircleIcon,
    tone: "critical",
    look: "border-red-300 bg-red-50 hover:bg-red-100 cursor-pointer",
    tab: "not_working",
  },
  {
    state: "attention",
    label: "Needs attention",
    hint: "Emails probably go out, but worth a check.",
    icon: AlertTriangleIcon,
    tone: "caution",
    look: "border-yellow-300 bg-yellow-50 hover:bg-yellow-100 cursor-pointer",
    tab: "attention",
  },
] as const;

/** "Email setup overview": three numbers that match the problem list's tabs, and link to them. */
export default function SenderStatsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<SenderStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<SenderStats>("admin/notification-settings/stats")
      .then(setStats)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "The overview could not be loaded.",
        ),
      );
  }, []);

  return (
    <Page
      title="Email setup overview"
      subtitle={stats ? `All ${stats.totalStores} installed stores` : "All installed stores"}
      backAction={{
        content: "Notification settings",
        onAction: () => navigate("/notification-settings"),
      }}
    >
      <BlockStack gap="400">
        {error && <Banner tone="critical">{error}</Banner>}

        {!stats && !error && (
          <Card>
            <SkeletonBodyText lines={6} />
          </Card>
        )}

        {stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {TILES.map((tile) => {
                const open = tile.tab
                  ? () => navigate(`/notification-settings/problems?tab=${tile.tab}`)
                  : undefined;
                return (
                  <div
                    key={tile.state}
                    role={open ? "button" : undefined}
                    tabIndex={open ? 0 : undefined}
                    onClick={open}
                    onKeyDown={(e) => open && (e.key === "Enter" || e.key === " ") && open()}
                    className={`rounded-lg border p-5 transition-colors ${tile.look}`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon source={tile.icon} tone={tile.tone} />
                      <Text as="h2" variant="headingMd">
                        {tile.label}
                      </Text>
                    </div>
                    <p className="text-5xl font-bold mt-2">{stats.byState[tile.state]}</p>
                    <Text as="p" tone="subdued" variant="bodySm">
                      {tile.hint}
                      {open && " Click to see them."}
                    </Text>
                  </div>
                );
              })}
            </div>

            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm">
                  Where customer emails come from
                </Text>
                <Text as="p">
                  <b>{stats.bySender.shipguard}</b> use ShipGuard's address ·{" "}
                  <b>{stats.bySender.gmail}</b> use their Gmail ·{" "}
                  <b>{stats.bySender.ownServer}</b> use their own email server
                </Text>
                <TechnicalDetails label="Detailed breakdown (for engineers)">
                  <BlockStack gap="100">
                    {KIND_ORDER.map((kind) => (
                      <div key={kind} className="flex justify-between text-sm">
                        <span>
                          {SENDER_KIND_META[kind].label}{" "}
                          <span className="font-mono text-xs text-gray-500">{kind}</span>
                        </span>
                        <b>{stats.byKind[kind]}</b>
                      </div>
                    ))}
                    <Text as="p" variant="bodySm" tone="subdued">
                      {stats.dormantCustomConfig} default-sender store
                      {stats.dormantCustomConfig === 1 ? "" : "s"} still hold unused custom SMTP
                      settings.
                    </Text>
                  </BlockStack>
                </TechnicalDetails>
              </BlockStack>
            </Card>
          </>
        )}
      </BlockStack>
    </Page>
  );
}
