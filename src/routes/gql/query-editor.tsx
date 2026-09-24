import CodeMirror from "@uiw/react-codemirror";
import { graphqlLanguageSupport } from "cm6-graphql";
import { Text } from "@shopify/polaris";
import { EDITOR_HEIGHT } from "./type";

interface QueryEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * The document being sent.
 *
 * `graphqlLanguageSupport()` — highlighting only — rather than cm6-graphql's full `graphql(schema)`
 * extension: the latter bundles schema-driven lint and autocomplete, and with no schema loaded it
 * marks every field as unknown. We have no schema here (the target is a different merchant's shop on
 * every run), so the choice is honest highlighting or a wall of false errors.
 */
export default function QueryEditor({
  value,
  onChange,
  disabled,
}: QueryEditorProps) {
  return (
    <>
      <Text as="h2" variant="headingSm">
        Query
      </Text>
      <div className="border border-gray-300 rounded-lg overflow-hidden mt-1">
        <CodeMirror
          value={value}
          height={EDITOR_HEIGHT}
          extensions={[graphqlLanguageSupport()]}
          editable={!disabled}
          onChange={onChange}
          basicSetup={{ foldGutter: false }}
        />
      </div>
    </>
  );
}
