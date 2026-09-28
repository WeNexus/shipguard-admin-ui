import { Box, Card, TextField } from "@shopify/polaris";
import { liquid } from "@codemirror/lang-liquid";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";

// Same wrapping the merchant editor uses: email HTML has long lines, and the editor sits in a column
// beside the variables card, so sideways scrolling would hide the end of nearly every line.
const EXTENSIONS = [
  liquid(),
  EditorView.lineWrapping,
  EditorView.theme({
    "&": { width: "100%" },
    ".cm-scroller": { overflowX: "hidden" },
    ".cm-content": { overflowWrap: "anywhere" },
  }),
];

/**
 * The merchant's "Edit Code" view (textEditor.tsx), read-only. Default export so it can be
 * lazy-loaded — CodeMirror's Liquid/HTML grammar is only needed once someone opens the code.
 */
export default function TemplateCodeView({ subject, body }: { subject: string; body: string }) {
  return (
    <Card padding="100">
      <div className="w-full sm:p-2">
        <Box paddingBlockStart="200" paddingBlockEnd="200">
          <TextField label="Email Subject" value={subject} autoComplete="off" disabled />
        </Box>
        <div className="mt-5">
          <h1 className="my-1">Email Body (HTML)</h1>
          <div className="border border-gray-300 rounded overflow-hidden">
            <CodeMirror value={body} extensions={EXTENSIONS} editable={false} readOnly />
          </div>
        </div>
      </div>
    </Card>
  );
}
