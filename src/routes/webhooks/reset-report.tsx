import { Badge, Banner, Card, List, Text } from "@shopify/polaris";
import type { WebhookResetReport } from "./type";
import { transportLabel } from "./type";

interface ResetReportProps {
  report: WebhookResetReport;
}

/**
 * The outcome of a run.
 *
 * Its one job is that a partial failure must not look like a success. A reset half-applies in ways a
 * single status cannot express — subscriptions that refused to delete, topics that did not come back —
 * so every one of those gets a critical banner of its own rather than a line buried under a tick.
 */
export default function ResetReport({ report }: ResetReportProps) {
  if (report.refused) {
    return (
      <Banner tone="critical" title="Nothing was changed">
        <p>{report.refused}</p>
      </Banner>
    );
  }

  if (report.error) {
    return (
      <Banner tone="critical" title="The store could not be reached">
        <p>{report.error}</p>
      </Banner>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Banner
        tone={report.ok ? "success" : "critical"}
        title={
          report.ok
            ? `Re-registered on ${transportLabel(report.transport)}`
            : "Completed with problems — read below"
        }
      >
        <p>
          Deleted {report.deleted.length}, now registered {report.after.length}.
        </p>
      </Banner>

      {report.deleteFailures.length > 0 && (
        <Banner tone="critical" title="Some subscriptions could not be deleted">
          <List>
            {report.deleteFailures.map((failure) => (
              <List.Item key={failure.id}>
                <span className="font-mono text-xs">{failure.topic}</span> — {failure.error}
              </List.Item>
            ))}
          </List>
        </Banner>
      )}

      {report.missing.length > 0 && (
        <Banner tone="critical" title="Topics that did not come back">
          {/* Derived by re-reading Shopify after the run, so this is what is actually registered —
              not what the mutations claimed. A topic here has no subscription at all right now. */}
          <p className="mb-2">
            These were expected after the reset but are absent from the store. Re-run, or check the
            server logs for the registration pass.
          </p>
          <List>
            {report.missing.map((topic) => (
              <List.Item key={topic}>
                <span className="font-mono text-xs">{topic}</span>
              </List.Item>
            ))}
          </List>
        </Banner>
      )}

      {report.skipped.length > 0 && (
        <Card>
          <Text as="h3" variant="headingSm">
            Deliberately not re-registered
          </Text>
          <div className="mt-2 flex flex-col gap-2">
            {report.skipped.map((skip) => (
              <div key={skip.topic} className="flex items-start gap-2">
                <Badge>{skip.topic}</Badge>
                <Text as="span" tone="subdued" variant="bodySm">
                  {skip.reason}
                </Text>
              </div>
            ))}
          </div>
        </Card>
      )}

      {report.deleted.length > 0 && (
        <Card>
          <Text as="h3" variant="headingSm">
            Deleted
          </Text>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <tbody>
                {report.deleted.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100">
                    <td className="py-1 pr-4 font-mono text-xs">{row.topic}</td>
                    <td className="py-1 break-all font-mono text-xs text-gray-600">
                      {row.destination || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
