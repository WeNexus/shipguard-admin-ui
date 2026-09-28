import {
  BlockStack,
  Box,
  Button,
  Card,
  Icon,
  InlineStack,
  Layout,
  Modal,
  Spinner,
  Text,
} from "@shopify/polaris";
import { CodeIcon, ViewIcon } from "@shopify/polaris-icons";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import type { EmailTemplate } from "../type";
import {
  renderEmailTemplate,
  TEMPLATE_VARIABLES,
  templateLabel,
  templateParameters,
} from "./template-preview";

const TemplateCodeView = lazy(() => import("./template-code-view"));

const MIN_PREVIEW_HEIGHT = 480;

function TemplateVariables({ template }: { template: EmailTemplate }) {
  return (
    <Card>
      <BlockStack gap="300">
        <BlockStack gap="100">
          <Text as="h3" variant="headingMd">
            Template variables
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Each is replaced with the real value when the email is sent.
          </Text>
        </BlockStack>
        <BlockStack gap="200">
          {TEMPLATE_VARIABLES[template.name].map((variable) => (
            <Box
              key={variable.key}
              background="bg-surface-secondary"
              borderColor="border"
              borderWidth="025"
              borderRadius="200"
              padding="200"
            >
              <div className="flex items-center justify-between gap-3">
                <Text as="span" variant="bodySm" fontWeight="medium">
                  {variable.name}
                </Text>
                <code className="cursor-text font-mono text-xs select-all text-gray-600">
                  {variable.key}
                </code>
              </div>
            </Box>
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

/**
 * The merchant's template modal (components/emailTemplate/index.tsx) without its save bar:
 * preview ⇄ code on the left, merge tags on the right. The merchant uses an App Bridge "max"
 * modal; the admin has no App Bridge, so this is Polaris' largest modal.
 */
export default function TemplateModal({
  template,
  logo,
  onClose,
}: {
  template: EmailTemplate | null;
  logo: string | null;
  onClose: () => void;
}) {
  const [codeView, setCodeView] = useState(false);
  const [html, setHtml] = useState("");
  const [height, setHeight] = useState(MIN_PREVIEW_HEIGHT);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setCodeView(false);
    setHtml("");
    setHeight(MIN_PREVIEW_HEIGHT);
    if (!template) return;

    let cancelled = false;
    renderEmailTemplate(template.body, templateParameters(template.name, logo)).then(
      (rendered) => {
        if (!cancelled) setHtml(rendered);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [template, logo]);

  // Grow the frame to the email instead of scrolling inside it — the email is read whole. srcDoc is
  // same-origin, so its document is measurable. Re-measured once images (the logo) finish loading.
  const measure = useCallback(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc?.body) return;
    doc.documentElement.style.overflow = "hidden";
    const content = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
    setHeight(Math.max(content, MIN_PREVIEW_HEIGHT));
    doc.querySelectorAll("img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", measure, { once: true });
    });
  }, []);

  return (
    <Modal
      open={template !== null}
      onClose={onClose}
      size="large"
      title={template ? `${templateLabel(template.name)} template` : "Email template"}
    >
      {template && (
        <Modal.Section>
          <Layout>
            <Layout.Section>
              <Card>
                <BlockStack gap="300">
                  <InlineStack align="space-between" blockAlign="center">
                    <InlineStack gap="200" blockAlign="center">
                      <Icon source={codeView ? CodeIcon : ViewIcon} />
                      <Text as="h2" variant="headingMd" fontWeight="semibold">
                        {codeView ? "Email code" : "Preview"}
                      </Text>
                    </InlineStack>
                    <Button variant="primary" onClick={() => setCodeView((code) => !code)}>
                      {codeView ? "Preview" : "View Code"}
                    </Button>
                  </InlineStack>

                  {codeView ? (
                    <Suspense
                      fallback={
                        <Box padding="800">
                          <InlineStack align="center">
                            <Spinner accessibilityLabel="Loading editor" size="small" />
                          </InlineStack>
                        </Box>
                      }
                    >
                      <TemplateCodeView subject={template.subject} body={template.body} />
                    </Suspense>
                  ) : (
                    <BlockStack gap="300">
                      <BlockStack gap="100">
                        <Text as="h3" variant="bodySm" tone="subdued">
                          Email subject
                        </Text>
                        <Box
                          background="bg-surface-secondary"
                          borderColor="border"
                          borderWidth="025"
                          borderRadius="200"
                          padding="300"
                        >
                          <Text as="p" variant="bodyMd" fontWeight="medium">
                            {template.subject || "No subject set"}
                          </Text>
                        </Box>
                      </BlockStack>
                      <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
                        <iframe
                          key={template.name}
                          ref={frameRef}
                          srcDoc={html}
                          title="Email preview"
                          onLoad={measure}
                          scrolling="no"
                          style={{ height }}
                          className="block w-full"
                        />
                      </div>
                    </BlockStack>
                  )}
                </BlockStack>
              </Card>
            </Layout.Section>
            <Layout.Section variant="oneThird">
              <TemplateVariables template={template} />
            </Layout.Section>
          </Layout>
        </Modal.Section>
      )}
    </Modal>
  );
}
