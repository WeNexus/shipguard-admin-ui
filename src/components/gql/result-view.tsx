import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { Banner, Button, InlineStack, Text } from "@shopify/polaris";
import { useState } from "react";
import { EDITOR_HEIGHT, type GqlRunResult } from "./type";

interface ResultViewProps {
  result: GqlRunResult | null;
}

const PLACEHOLDER = "/* GraphQL result */";

/**
 * Read-only result pane.
 *
 * A run can fail in two ways and both have to be visible: the endpoint-level failure (`ok: false` —
 * no token, transport error) shows as a banner, while GraphQL's own `errors[]` are rendered in the
 * body. A partial success has data AND errors, so neither replaces the other.
 */
export default function ResultView({ result }: ResultViewProps) {
  const [copied, setCopied] = useState(false);

  // `JSON.stringify(undefined)` is `undefined`, not a string — coalesced so the editor and the copy
  // button never receive a non-string.
  const body = result
    ? (JSON.stringify(
        result.errors ? { data: result.data, errors: result.errors } : result.data,
        null,
        2,
      ) ?? "null")
    : PLACEHOLDER;

  const copy = () => {
    void navigator.clipboard.writeText(body).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <>
      <InlineStack align="space-between" blockAlign="center">
        <Text as="h2" variant="headingSm">
          Result
        </Text>
        <Button variant="plain" onClick={copy} disabled={!result}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </InlineStack>

      {result && !result.ok && (
        <div className="mt-1">
          <Banner tone="critical">{result.error ?? "The request failed."}</Banner>
        </div>
      )}

      <div className="border border-gray-300 rounded-lg overflow-hidden mt-1">
        <CodeMirror
          value={body}
          height={EDITOR_HEIGHT}
          extensions={[json()]}
          editable={false}
          basicSetup={{ foldGutter: false, highlightActiveLine: false }}
        />
      </div>
    </>
  );
}
