import { BlockStack, Card, Divider, Icon, Text } from "@shopify/polaris";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  MinusCircleIcon,
  XCircleIcon,
} from "@shopify/polaris-icons";
import type { AdminTestEmailResult, StoreSenderDetail, Verdict, VerdictState } from "../type";
import { problemMessage, senderLine, verdictHeadline } from "./support-copy";
import { SupportMessageView } from "./support-message";

const LOOK: Record<VerdictState, { icon: typeof CheckCircleIcon; ring: string; tone: "success" | "caution" | "critical" | "subdued" }> = {
  working: { icon: CheckCircleIcon, ring: "bg-green-50 border-green-300", tone: "success" },
  attention: { icon: AlertTriangleIcon, ring: "bg-yellow-50 border-yellow-300", tone: "caution" },
  not_working: { icon: XCircleIcon, ring: "bg-red-50 border-red-300", tone: "critical" },
  inactive: { icon: MinusCircleIcon, ring: "bg-gray-50 border-gray-300", tone: "subdued" },
};

// Problems a passing test email disproves — the only thing that can prove a mail server works.
const PROVEN_BY_TEST = new Set(["smtp_untested", "smtp_no_login"]);

/**
 * The backend verdict, updated by the test email sent on this page:
 *  - a pass clears "untested"/"no login" (the server just accepted mail, so it works);
 *  - a real send failure makes the store not working, whatever the settings looked like.
 */
export function applyTestResult(verdict: Verdict, test: AdminTestEmailResult | null): Verdict {
  if (!test || test.transport === null) return verdict;
  if (!test.success) return { ...verdict, state: verdict.state === "inactive" ? "inactive" : "not_working" };

  const problems = verdict.problems.filter((p) => !PROVEN_BY_TEST.has(p.code));
  const state =
    verdict.state === "attention" && problems.length === 0 ? "working" : verdict.state;
  return { state, problems };
}

/** First thing on the store page: one plain answer, then what to do about each problem. */
export default function VerdictCard({
  detail,
  verdict,
  test,
}: {
  detail: StoreSenderDetail;
  verdict: Verdict;
  test: AdminTestEmailResult | null;
}) {
  const look = LOOK[verdict.state];
  const testFailed = test !== null && test.transport !== null && !test.success;
  const testPassed = test !== null && test.transport !== null && test.success;

  return (
    <Card>
      <BlockStack gap="400">
        <div className={`flex items-start gap-3 rounded-lg border p-4 ${look.ring}`}>
          <span className="mt-0.5 shrink-0">
            <Icon source={look.icon} tone={look.tone} />
          </span>
          <BlockStack gap="100">
            <Text as="h2" variant="headingLg">
              {testFailed ? "Emails are NOT being sent" : verdictHeadline(verdict.state, detail)}
            </Text>
            {verdict.state !== "inactive" && (
              <Text as="p" tone="subdued">
                {senderLine(detail)}
              </Text>
            )}
            {testFailed && (
              <Text as="p" tone="critical">
                The test email just failed — see the test result below for what to do.
              </Text>
            )}
            {testPassed && (
              <Text as="p" tone="success">
                The test email you just sent went through.
              </Text>
            )}
          </BlockStack>
        </div>

        {verdict.problems.map((problem, i) => (
          <BlockStack key={problem.code} gap="400">
            {i > 0 && <Divider />}
            <SupportMessageView message={problemMessage(problem, detail)} />
          </BlockStack>
        ))}
      </BlockStack>
    </Card>
  );
}
