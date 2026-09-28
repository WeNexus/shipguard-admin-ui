import { BlockStack, Card, Icon, SkeletonBodyText, Text } from "@shopify/polaris";
import { CheckCircleIcon, MinusCircleIcon, XCircleIcon } from "@shopify/polaris-icons";
import type { EmailTemplateName, StoreEmailTemplates, StoreSenderDetail } from "../type";
import { ADMIN_TEMPLATE } from "../type";
import { customerEmailsBlocked, EMAIL_NAME } from "./support-copy";

type Row = { name: EmailTemplateName; status: "sent" | "off" | "not_sent"; note: string };

const CUSTOMER_EMAILS: EmailTemplateName[] = [
  "CLAIM_REQUEST_EMAIL_FOR_CUSTOMER",
  "CLAIM_REFUND_EMAIL_FOR_CUSTOMER",
  "CLAIM_REORDER_EMAIL_FOR_CUSTOMER",
  "CLAIM_CANCEL_EMAIL_FOR_CUSTOMER",
];

const STATUS_ICON = {
  sent: { source: CheckCircleIcon, tone: "success" as const },
  off: { source: MinusCircleIcon, tone: "subdued" as const },
  not_sent: { source: XCircleIcon, tone: "critical" as const },
};

/**
 * Mirrors the send-time checks in TemplatedMailService (missing → skipped, disabled → skipped) and
 * the two routes mail takes: customer emails use the store's sender; the merchant alert always
 * goes out from ShipGuard's own address (claim-portal.service, senderMode 'system').
 */
function rowsFor(detail: StoreSenderDetail, data: StoreEmailTemplates) {
  const byName = new Map(data.templates.map((t) => [t.name, t]));
  const has = (code: string) => detail.verdict.problems.some((p) => p.code === code);
  const recipient = detail.notification?.merchantEmail ?? detail.storeInfo.email;

  const row = (name: EmailTemplateName, blocked: string | null): Row => {
    const template = byName.get(name);
    if (!template) return { name, status: "not_sent", note: "Not working — this email is missing" };
    if (!template.enable) return { name, status: "off", note: "Turned off by the merchant" };
    if (blocked) return { name, status: "not_sent", note: blocked };
    return {
      name,
      status: "sent",
      note: name === ADMIN_TEMPLATE ? `Working properly · goes to ${recipient}` : "Working properly",
    };
  };

  const customerBlock = detail.uninstalled
    ? "Not working — store uninstalled"
    : customerEmailsBlocked(detail)
      ? "Not working — see the problem above"
      : null;
  const merchantBlock = detail.uninstalled
    ? "Not working — store uninstalled"
    : has("system_sender_unconfigured")
      ? "Not working — ShipGuard's sender is down (engineering)"
      : !recipient
        ? "Not working — no email address to send to"
        : null;

  return {
    customer: CUSTOMER_EMAILS.map((name) => row(name, customerBlock)),
    merchant: [row(ADMIN_TEMPLATE, merchantBlock)],
  };
}

function Group({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <BlockStack gap="200">
      <Text as="h4" variant="headingSm">
        {title}
      </Text>
      <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200">
        {rows.map((r) => (
          <li key={r.name} className="flex items-center justify-between gap-3 px-3 py-2">
            <span className="flex items-center gap-2">
              <Icon {...STATUS_ICON[r.status]} />
              <Text as="span">{EMAIL_NAME[r.name]}</Text>
            </span>
            <Text as="span" tone={r.status === "not_sent" ? "critical" : "subdued"}>
              {r.note}
            </Text>
          </li>
        ))}
      </ul>
    </BlockStack>
  );
}

/** Plain checklist: for each email this store can send, does it actually go out? */
export default function EmailDeliveryCard({
  detail,
  data,
}: {
  detail: StoreSenderDetail;
  data: StoreEmailTemplates | null;
}) {
  const rows = data && rowsFor(detail, data);
  return (
    <Card>
      <BlockStack gap="300">
        <BlockStack gap="100">
          <Text as="h3" variant="headingMd">
            Which emails go out
          </Text>
          <Text as="p" tone="subdued">
            Whether each email is set up to go out when its event happens (for example, a customer
            files a claim). Checked from the store's settings — nothing is sent from this page.
          </Text>
        </BlockStack>
        {!rows ? (
          <SkeletonBodyText lines={5} />
        ) : (
          <>
            <Group title="To customers" rows={rows.customer} />
            <Group title="To the merchant" rows={rows.merchant} />
          </>
        )}
      </BlockStack>
    </Card>
  );
}
