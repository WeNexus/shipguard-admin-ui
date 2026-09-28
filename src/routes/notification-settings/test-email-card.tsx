import { Banner, BlockStack, Box, Button, Card, Text, TextField } from "@shopify/polaris";
import { useState } from "react";
import { ApiError, apiFetch } from "../../lib/api-client";
import { testFailureMessage } from "./support/support-copy";
import { SupportMessageView, TechnicalDetails } from "./support/support-message";
import type { AdminTestEmailResult, StoreSenderDetail } from "./type";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Per-browser convenience only: support usually tests to their own inbox, store after store.
const RECIPIENT_KEY = "notification-settings.test-recipient";

function readRecipient(): string {
  try {
    return localStorage.getItem(RECIPIENT_KEY) ?? "";
  } catch {
    return "";
  }
}

function saveRecipient(value: string) {
  try {
    localStorage.setItem(RECIPIENT_KEY, value);
  } catch {
    // Storage blocked — the field just won't be prefilled next time.
  }
}

function RawResult({ result }: { result: AdminTestEmailResult }) {
  const lines = [
    `transport: ${result.transport ?? "none (settings unusable)"}`,
    result.from && `from: ${result.from}`,
    `duration: ${result.durationMs} ms`,
    `server message: ${result.message}`,
    result.error && `diagnosis: ${result.error.diagnosis}`,
    result.error?.code && `code: ${result.error.code}`,
    result.error?.command && `command: ${result.error.command}`,
    result.error?.responseCode && `responseCode: ${result.error.responseCode}`,
    result.error?.response && `response: ${result.error.response}`,
    result.error && `error: ${result.error.message}`,
  ].filter(Boolean);
  return (
    <Box background="bg-surface-secondary" borderRadius="200" padding="300">
      <pre className="whitespace-pre-wrap break-all font-mono text-xs">{lines.join("\n")}</pre>
    </Box>
  );
}

/**
 * Sends a REAL email through the store's active sender — the same path claim emails take — so a
 * pass means that store's customer emails go out. Audited server-side.
 */
export default function TestEmailCard({
  detail,
  onResult,
}: {
  detail: StoreSenderDetail;
  onResult: (result: AdminTestEmailResult | null) => void;
}) {
  const [to, setTo] = useState(readRecipient);
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<AdminTestEmailResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recipient = to.trim();
  const valid = EMAIL_RE.test(recipient);

  const send = () => {
    setSending(true);
    setResult(null);
    setError(null);
    onResult(null);
    saveRecipient(recipient);
    apiFetch<AdminTestEmailResult>("admin/notification-settings/test-email", {
      method: "POST",
      body: {
        domain: detail.domain,
        to: recipient,
        ...(subject.trim() && { subject: subject.trim() }),
      },
    })
      .then((res) => {
        setResult(res);
        onResult(res);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "The request could not be sent."),
      )
      .finally(() => setSending(false));
  };

  return (
    <Card>
      <BlockStack gap="300">
        <BlockStack gap="100">
          <Text as="h3" variant="headingMd">
            Send a test email
          </Text>
          <Text as="p" tone="subdued">
            Sends a real email the same way this store sends to its customers. Use your own email
            address.
          </Text>
        </BlockStack>
        <div className="sm:flex gap-2 items-end">
          <div className="w-full">
            <TextField
              label="Send to"
              type="email"
              value={to}
              onChange={setTo}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="w-full">
            <TextField
              label="Subject (optional)"
              value={subject}
              onChange={setSubject}
              placeholder="ShipGuard test email"
              autoComplete="off"
            />
          </div>
          <div className="mt-2 sm:mt-0">
            <Button variant="primary" onClick={send} loading={sending} disabled={!valid}>
              Send test
            </Button>
          </div>
        </div>

        {error && <Banner tone="critical">{error}</Banner>}

        {result?.success && (
          <Banner tone="success" title="The test email was sent">
            <p>
              Check the inbox <b>and the spam folder</b> of {recipient}. If it landed in spam, the
              store's emails work but may land in spam for customers too.
            </p>
          </Banner>
        )}

        {result && !result.success && (
          <Banner tone="critical" title="The test email was NOT sent">
            <SupportMessageView message={testFailureMessage(result, detail)} />
          </Banner>
        )}

        {result && (
          <TechnicalDetails label="Technical details of this test">
            <RawResult result={result} />
          </TechnicalDetails>
        )}
      </BlockStack>
    </Card>
  );
}
