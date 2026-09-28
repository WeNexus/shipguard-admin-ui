import { BlockStack, Box, Button, Collapsible, Link, Text } from "@shopify/polaris";
import { CheckIcon, ClipboardIcon } from "@shopify/polaris-icons";
import { useState, type ReactNode } from "react";
import type { SupportMessage } from "./support-copy";
import { stepsAsPlainText } from "./support-copy";

/** `**label**` → bold. The only markup support-copy.ts uses. */
function rich(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <b key={i}>{part.slice(2, -2)}</b>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

/** The copy-ready box: numbered steps, a Copy button, and the help link if there is one. */
function TellMerchant({ message }: { message: SupportMessage }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(stepsAsPlainText(message));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (insecure origin, permissions). The steps are still selectable.
    }
  };

  return (
    <Box background="bg-surface-secondary" borderRadius="200" padding="300">
      <BlockStack gap="200">
        <div className="flex items-center justify-between gap-2">
          <Text as="h4" variant="headingSm">
            Tell the merchant
          </Text>
          <Button size="slim" icon={copied ? CheckIcon : ClipboardIcon} onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          {message.steps!.map((step) => (
            <li key={step}>{rich(step)}</li>
          ))}
        </ol>
        {message.link && (
          <Text as="p" variant="bodySm">
            Guide:{" "}
            <Link url={message.link.url} target="_blank">
              {message.link.label}
            </Link>
          </Text>
        )}
      </BlockStack>
    </Box>
  );
}

/** "What's happening" + either the merchant steps or an escalate-to-engineering note. */
export function SupportMessageView({ message }: { message: SupportMessage }) {
  return (
    <BlockStack gap="200">
      <Text as="p">{message.happening}</Text>
      {message.escalate && (
        <Box background="bg-surface-caution" borderRadius="200" padding="300">
          <Text as="p">
            <b>Don't contact the merchant yet.</b> Send the technical details below to engineering.
          </Text>
        </Box>
      )}
      {message.steps?.length ? <TellMerchant message={message} /> : null}
    </BlockStack>
  );
}

/** Collapsed "for engineers" section. Everything technical goes in here, nothing is removed. */
export function TechnicalDetails({
  children,
  label = "Technical details (for engineers)",
}: {
  children: ReactNode;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = `tech-${label.replace(/\W+/g, "-")}`;
  return (
    <BlockStack gap="200">
      <div>
        <Button
          variant="plain"
          disclosure={open ? "up" : "down"}
          onClick={() => setOpen((v) => !v)}
          ariaControls={id}
        >
          {open ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        </Button>
      </div>
      <Collapsible id={id} open={open}>
        {children}
      </Collapsible>
    </BlockStack>
  );
}
