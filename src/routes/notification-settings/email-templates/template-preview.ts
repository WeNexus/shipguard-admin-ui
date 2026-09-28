/**
 * Preview rendering, copied from the merchant app so the admin sees the same email:
 *   ShipGuard_2.0_Frontend/.../notificationSettings/emailTemplate/template.ts
 *   ShipGuard_2.0_Frontend/.../notificationSettings/emailTemplate/templateVariableParams.ts
 * Change them together.
 *
 * Merge tags render as themselves (`{{order_id}}`), so the preview shows WHERE values land rather
 * than fake values. Only `shop_logo` is real — the store's uploaded logo.
 */
import type { EmailTemplateName } from "../type";

// liquidjs is needed only once a template is opened, so it is imported on first render.
let enginePromise: Promise<import("liquidjs").Liquid> | null = null;

export async function renderEmailTemplate(
  liquidBody: string,
  variables: Record<string, unknown>,
): Promise<string> {
  if (!liquidBody) return "";
  try {
    enginePromise ??= import("liquidjs").then(({ Liquid }) => new Liquid());
    const engine = await enginePromise;
    return await engine.render(engine.parse(liquidBody), variables);
  } catch (err) {
    // A malformed body shouldn't blank the preview — show it raw, as the merchant app does.
    console.error("Failed to render email template preview", err);
    return liquidBody;
  }
}

export function templateParameters(
  name: EmailTemplateName,
  logo: string | null,
): Record<string, unknown> {
  switch (name) {
    case "CLAIM_REQUEST_EMAIL_FOR_ADMIN":
      return {
        request_regulation: "{{request_regulation}}",
        customer_name: "{{customer_name}}",
        claim_reason: "{{claim_reason}}",
        claim_date: "{{claim_date}}",
        shop_name: "{{shop_name}}",
        order_url: "{{order_url}}",
        order_id: "{{order_id}}",
        issue: "{{issue}}",
      };
    case "CLAIM_REQUEST_EMAIL_FOR_CUSTOMER":
      return {
        customer_name: "{{customer_name}}",
        claim_reason: "{{claim_reason}}",
        claim_date: "{{claim_date}}",
        shop_name: "{{shop_name}}",
        order_id: "{{order_id}}",
        shop_logo: logo,
      };
    case "CLAIM_REFUND_EMAIL_FOR_CUSTOMER":
      return {
        status_message: "{{status_message}}",
        refund_amount: "{{refund_amount}}",
        shop_name: "{{shop_name}}",
        order_id: "{{order_id}}",
        status: "{{status}}",
        date: "{{date}}",
        // Hardcoded in the merchant preview too; kept identical so both screens match.
        currency: "BDT",
        shop_logo: logo,
      };
    case "CLAIM_REORDER_EMAIL_FOR_CUSTOMER":
      return {
        replacement_order_id: "{{replacement_order_id}}",
        status_message: "{{status_message}}",
        shop_name: "{{shop_name}}",
        order_id: "{{order_id}}",
        status: "{{status}}",
        shop_logo: logo,
      };
    case "CLAIM_CANCEL_EMAIL_FOR_CUSTOMER":
      return {
        cancellation_reason: "{{cancellation_reason}}",
        customer_name: "{{customer_name}}",
        shop_name: "{{shop_name}}",
        order_id: "{{order_id}}",
        status: "{{status}}",
        shop_logo: logo,
      };
  }
}

/** Merge tags listed beside the editor, per template. Same lists as the merchant's templateVariable.tsx. */
export const TEMPLATE_VARIABLES: Record<EmailTemplateName, { name: string; key: string }[]> = {
  CLAIM_REQUEST_EMAIL_FOR_ADMIN: [
    { name: "Shop Name", key: "{{shop_name}}" },
    { name: "Order Id", key: "{{order_id}}" },
    { name: "Customer Name", key: "{{customer_name}}" },
    { name: "issue", key: "{{issue}}" },
    { name: "Request Regulation", key: "{{request_regulation}}" },
    { name: "Claim Reason", key: "{{claim_reason}}" },
    { name: "Claim Date", key: "{{claim_date}}" },
    { name: "Order url", key: "{{order_url}}" },
  ],
  CLAIM_REQUEST_EMAIL_FOR_CUSTOMER: [
    { name: "Order Id", key: "{{order_id}}" },
    { name: "Customer Name", key: "{{customer_name}}" },
    { name: "Claim Reason", key: "{{claim_reason}}" },
    { name: "Claim Date", key: "{{claim_date}}" },
    { name: "Shop Name", key: "{{shop_name}}" },
    { name: "Shop Logo", key: "{{shop_logo}}" },
  ],
  CLAIM_REFUND_EMAIL_FOR_CUSTOMER: [
    { name: "Order Id", key: "{{order_id}}" },
    { name: "Refund Amount", key: "{{refund_amount}}" },
    { name: "Date", key: "{{date}}" },
    { name: "Shop Name", key: "{{shop_name}}" },
    { name: "Shop Logo", key: "{{shop_logo}}" },
    { name: "Status", key: "{{status}}" },
    { name: "Status Message", key: "{{status_message}}" },
  ],
  CLAIM_REORDER_EMAIL_FOR_CUSTOMER: [
    { name: "Order Id", key: "{{order_id}}" },
    { name: "Replacement Order Id", key: "{{replacement_order_id}}" },
    { name: "Status", key: "{{status}}" },
    { name: "Shop Name", key: "{{shop_name}}" },
    { name: "Shop Logo", key: "{{shop_logo}}" },
    { name: "Status Message", key: "{{status_message}}" },
  ],
  CLAIM_CANCEL_EMAIL_FOR_CUSTOMER: [
    { name: "Order Id", key: "{{order_id}}" },
    { name: "Customer Name", key: "{{customer_name}}" },
    { name: "Cancellation Reason", key: "{{cancellation_reason}}" },
    { name: "Shop Name", key: "{{shop_name}}" },
    { name: "Shop Logo", key: "{{shop_logo}}" },
    { name: "status", key: "{{status}}" },
  ],
};

/** `CLAIM_REQUEST_EMAIL_FOR_CUSTOMER` → `Claim request email for customer` (lodash.capitalize in the merchant app). */
export function templateLabel(name: EmailTemplateName): string {
  const words = name.replace(/_/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
