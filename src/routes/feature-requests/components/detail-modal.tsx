import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Badge,
  Banner,
  BlockStack,
  Button,
  Collapsible,
  InlineStack,
  Modal,
  Select,
  Spinner,
  Text,
  TextField,
  Tooltip,
} from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";
import { apiFetch } from "../../../lib/api-client";
import {
  CATEGORY_SELECT_OPTIONS,
  FEATURE_REQUESTS_PATH,
  STATUS_SELECT_OPTIONS,
  TEAM_AUTHOR,
  errorText,
  formatDate,
  storeLabel,
  timeAgo,
  userLabel,
} from "../types";
import type {
  AdminFeatureRequest,
  AdminFeatureRequestComment,
  AdminFeatureRequestDetail,
  AdminStoreSummary,
  FeatureRequestCategory,
  FeatureRequestStatus,
} from "../types";
import { AttachmentGallery, CommentBubble } from "./comment-bubble";

interface EditForm {
  title: string;
  description: string;
  category: FeatureRequestCategory;
  status: FeatureRequestStatus;
  hidden: boolean;
}

const toForm = (row: AdminFeatureRequest): EditForm => ({
  title: row.title,
  description: row.description,
  category: row.category,
  status: row.status,
  hidden: row.hidden,
});

// PATCH only what changed, so the backend's audit log `fields` names what was actually edited.
const changedFields = (row: AdminFeatureRequest, form: EditForm) => {
  const patch: Partial<EditForm> = {};
  if (form.title.trim() !== row.title) patch.title = form.title.trim();
  if (form.description.trim() !== row.description)
    patch.description = form.description.trim();
  if (form.category !== row.category) patch.category = form.category;
  if (form.status !== row.status) patch.status = form.status;
  if (form.hidden !== row.hidden) patch.hidden = form.hidden;
  return patch;
};

const VISIBLE_COMMENTS = 5;

const STATUS_DOT: Record<FeatureRequestStatus, string> = {
  UNDER_REVIEW: "#8a8a8a",
  PLANNED: "#e08a00",
  IN_PROGRESS: "#005bd3",
  SHIPPED: "#29845a",
};

const STATUS_OPTIONS = STATUS_SELECT_OPTIONS.map((option) => ({
  ...option,
  prefix: (
    <span
      aria-hidden="true"
      className="block h-2 w-2 rounded-full"
      style={{ background: STATUS_DOT[option.value] }}
    />
  ),
}));

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";

const commentAuthor = (comment: AdminFeatureRequestComment) =>
  comment.is_team
    ? TEAM_AUTHOR
    : (userLabel(comment.user) ?? storeLabel(comment.store) ?? "Merchant");

const StoreChip = ({ store }: { store: AdminStoreSummary | null }) =>
  storeLabel(store) ? (
    <Tooltip content={store?.domain}>
      <span className="rounded-md bg-[#f1f1f1] px-1.5 py-0.5 text-xs text-[#616161]">
        {storeLabel(store)}
      </span>
    </Tooltip>
  ) : null;

const Toggle = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full border-0 p-0 transition-colors ${
      checked ? "bg-[#303030]" : "bg-[#cccccc]"
    }`}
  >
    <span
      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
        checked ? "left-[18px]" : "left-0.5"
      }`}
    />
  </button>
);

const DetailRow = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-2">
    <Text as="span" variant="bodySm" tone="subdued">
      {label}
    </Text>
    <div className="min-w-0 break-words">
      <Text as="span" variant="bodySm" fontWeight="semibold">
        {children}
      </Text>
    </div>
  </div>
);

const Divider = () => (
  <div className="border-0 border-t border-solid border-[#e3e3e3]" />
);

/** Edit, moderate and reply to one request. Opens when `id` is set. */
export function FeatureRequestDetailModal({
  id,
  onClose,
  onChanged,
  onDeleted,
}: {
  id: string | null;
  onClose: () => void;
  onChanged: (row: AdminFeatureRequest) => void;
  onDeleted: (id: string) => void;
}) {
  const [detail, setDetail] = useState<AdminFeatureRequestDetail | null>(null);
  const [form, setForm] = useState<EditForm | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reply, setReply] = useState("");
  const [posting, setPosting] = useState(false);
  const [removingCommentId, setRemovingCommentId] = useState<string | null>(
    null,
  );
  const [showAllComments, setShowAllComments] = useState(false);
  const [votersOpen, setVotersOpen] = useState(false);

  const load = useCallback(async (requestId: string) => {
    setLoading(true);
    setError(null);
    try {
      const row = await apiFetch<AdminFeatureRequestDetail>(
        `${FEATURE_REQUESTS_PATH}/${requestId}`,
      );
      setDetail(row);
      setForm(toForm(row));
    } catch (e) {
      setError(errorText(e, "Could not load the request"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setDetail(null);
    setForm(null);
    setConfirmDelete(false);
    setReply("");
    setShowAllComments(false);
    setVotersOpen(false);
    if (id) load(id);
  }, [id, load]);

  const patch = detail && form ? changedFields(detail, form) : {};
  const dirty = Object.keys(patch).length > 0;
  const canSave = dirty && !!form?.title.trim() && !!form?.description.trim();

  const discard = () => {
    if (detail) setForm(toForm(detail));
  };

  const hiddenCount =
    detail && !showAllComments
      ? Math.max(0, detail.comments.length - VISIBLE_COMMENTS)
      : 0;
  const visibleComments = detail ? detail.comments.slice(hiddenCount) : [];

  const save = async () => {
    if (!detail || !dirty) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await apiFetch<AdminFeatureRequest>(
        `${FEATURE_REQUESTS_PATH}/${detail.id}`,
        { method: "PATCH", body: patch },
      );
      setDetail((prev) => (prev ? { ...prev, ...updated } : prev));
      setForm(toForm(updated));
      onChanged(updated);
    } catch (e) {
      setError(errorText(e, "Could not save the request"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!detail) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`${FEATURE_REQUESTS_PATH}/${detail.id}`, {
        method: "DELETE",
      });
      onDeleted(detail.id);
      onClose();
    } catch (e) {
      setError(errorText(e, "Could not delete the request"));
    } finally {
      setSaving(false);
    }
  };

  const postReply = async () => {
    if (!detail || !reply.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const comment = await apiFetch<AdminFeatureRequestComment>(
        `${FEATURE_REQUESTS_PATH}/${detail.id}/comments`,
        { method: "POST", body: { body: reply.trim() } },
      );
      const next = {
        ...detail,
        comments: [...detail.comments, comment],
        comment_count: detail.comment_count + 1,
      };
      setDetail(next);
      onChanged(next);
      setReply("");
    } catch (e) {
      setError(errorText(e, "Could not post the reply"));
    } finally {
      setPosting(false);
    }
  };

  // Soft delete: the comment stays here, dimmed, but merchants stop seeing it.
  const removeComment = async (commentId: string) => {
    if (!detail) return;
    setRemovingCommentId(commentId);
    setError(null);
    try {
      await apiFetch(
        `${FEATURE_REQUESTS_PATH}/${detail.id}/comments/${commentId}`,
        { method: "DELETE" },
      );
      const deletedAt = new Date().toISOString();
      const next = {
        ...detail,
        comments: detail.comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, deleted: true, deleted_at: deletedAt }
            : comment,
        ),
        comment_count: Math.max(0, detail.comment_count - 1),
      };
      setDetail(next);
      onChanged(next);
    } catch (e) {
      setError(errorText(e, "Could not delete the comment"));
    } finally {
      setRemovingCommentId(null);
    }
  };

  return (
    <Modal open={!!id} onClose={onClose} size="large" title="Feature request">
      {error ? (
        <Modal.Section>
          <Banner tone="critical">{error}</Banner>
        </Modal.Section>
      ) : null}

      {loading || !detail || !form ? (
        <Modal.Section>
          <div
            className="flex justify-center"
            style={{ minHeight: 240, alignItems: "center" }}
          >
            {loading ? <Spinner size="large" /> : null}
          </div>
        </Modal.Section>
      ) : (
        <>
          <Modal.Section flush>
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_240px]">
              <div className="flex min-w-0 flex-col gap-4 p-4">
                <TextField
                  label="Title"
                  autoComplete="off"
                  maxLength={120}
                  value={form.title}
                  onChange={(title) => setForm({ ...form, title })}
                />
                <TextField
                  label="Description"
                  autoComplete="off"
                  multiline={4}
                  maxLength={2000}
                  value={form.description}
                  onChange={(description) => setForm({ ...form, description })}
                />
                {detail.attachments.length > 0 ? (
                  <div>
                    <Text as="p">Attachments</Text>
                    <AttachmentGallery urls={detail.attachments} />
                  </div>
                ) : null}

                <Divider />

                <BlockStack gap="300">
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="h3" variant="headingSm">
                      Conversation
                    </Text>
                    <span className="rounded-full bg-[#f1f1f1] px-2 py-0.5 text-xs font-medium text-[#616161]">
                      {detail.comment_count}
                    </span>
                  </InlineStack>

                  {hiddenCount > 0 ? (
                    <div>
                      <Button
                        variant="plain"
                        disclosure="up"
                        onClick={() => setShowAllComments(true)}
                      >
                        {`Show ${hiddenCount} earlier ${hiddenCount === 1 ? "comment" : "comments"}`}
                      </Button>
                    </div>
                  ) : null}

                  {detail.comments.length === 0 ? (
                    <Text as="p" tone="subdued">
                      No comments yet.
                    </Text>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {visibleComments.map((comment) => (
                        <CommentBubble
                          key={comment.id}
                          avatarText={initials(commentAuthor(comment))}
                          isTeam={comment.is_team}
                          body={comment.body}
                          attachments={comment.attachments}
                          dimmed={comment.deleted}
                          header={
                            <>
                              <Text
                                as="span"
                                variant="bodySm"
                                fontWeight="semibold"
                              >
                                {commentAuthor(comment)}
                              </Text>
                              {comment.is_team ? (
                                <Badge tone="info">Team</Badge>
                              ) : (
                                <StoreChip store={comment.store} />
                              )}
                              {comment.deleted ? <Badge>Deleted</Badge> : null}
                              <Tooltip content={formatDate(comment.created_at)}>
                                <Text as="span" variant="bodyXs" tone="subdued">
                                  {timeAgo(comment.created_at)}
                                </Text>
                              </Tooltip>
                            </>
                          }
                          actions={
                            comment.deleted ? null : (
                              <Tooltip content="Delete comment">
                                <Button
                                  variant="tertiary"
                                  tone="critical"
                                  icon={DeleteIcon}
                                  accessibilityLabel="Delete comment"
                                  loading={removingCommentId === comment.id}
                                  onClick={() => removeComment(comment.id)}
                                />
                              </Tooltip>
                            )
                          }
                        />
                      ))}
                    </div>
                  )}

                  <div className="rounded-lg border border-solid border-[#8a8a8a] bg-white">
                    <TextField
                      label={`Reply as the ${TEAM_AUTHOR}`}
                      labelHidden
                      variant="borderless"
                      placeholder="Write a reply..."
                      autoComplete="off"
                      multiline={3}
                      maxLength={1000}
                      value={reply}
                      onChange={setReply}
                    />
                    <div className="flex justify-end p-2">
                      <Button
                        onClick={postReply}
                        loading={posting}
                        disabled={!reply.trim()}
                      >
                        Post reply
                      </Button>
                    </div>
                  </div>
                </BlockStack>
              </div>

              <div className="flex flex-col gap-4 border-0 border-t border-solid border-[#e3e3e3] p-4 md:border-l md:border-t-0">
                <Select
                  label="Status"
                  options={STATUS_OPTIONS}
                  value={form.status}
                  onChange={(status) =>
                    setForm({ ...form, status: status as FeatureRequestStatus })
                  }
                />
                <Select
                  label="Category"
                  options={CATEGORY_SELECT_OPTIONS}
                  value={form.category}
                  onChange={(category) =>
                    setForm({
                      ...form,
                      category: category as FeatureRequestCategory,
                    })
                  }
                />

                <Divider />

                <div className="flex items-start justify-between gap-3">
                  <BlockStack gap="100">
                    <Text as="span" variant="bodySm" fontWeight="semibold">
                      Show on merchant board
                    </Text>
                    <Text as="span" variant="bodyXs" tone="subdued">
                      When off, merchants can't see this request. Votes and
                      comments are kept.
                    </Text>
                  </BlockStack>
                  <Toggle
                    label="Show on merchant board"
                    checked={!form.hidden}
                    onChange={(visible) =>
                      setForm({ ...form, hidden: !visible })
                    }
                  />
                </div>

                <Divider />

                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Details
                  </Text>
                  <DetailRow label="Store">
                    {detail.is_team
                      ? TEAM_AUTHOR
                      : (storeLabel(detail.store) ?? "—")}
                  </DetailRow>
                  <DetailRow label="Submitted by">
                    {userLabel(detail.user) ?? "—"}
                  </DetailRow>
                  <DetailRow label="Votes">
                    {detail.vote_count > 0 ? (
                      <Button
                        variant="plain"
                        disclosure={votersOpen ? "up" : "down"}
                        ariaExpanded={votersOpen}
                        ariaControls="feature-request-voters"
                        onClick={() => setVotersOpen((open) => !open)}
                      >
                        {String(detail.vote_count)}
                      </Button>
                    ) : (
                      "0"
                    )}
                  </DetailRow>
                  <Collapsible id="feature-request-voters" open={votersOpen}>
                    <div className="flex flex-col gap-2 rounded-lg bg-[#f7f7f7] p-2">
                      {detail.votes.map((vote) => (
                        <div key={vote.id} className="flex flex-col">
                          <Text
                            as="span"
                            variant="bodySm"
                            fontWeight="semibold"
                          >
                            {storeLabel(vote.store) ?? "Unknown store"}
                          </Text>
                          <Text as="span" variant="bodyXs" tone="subdued">
                            {`${userLabel(vote.user) ?? "—"} · ${formatDate(vote.created_at)}`}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </Collapsible>
                  <DetailRow label="Comments">{detail.comment_count}</DetailRow>
                  <DetailRow label="Created">
                    {formatDate(detail.created_at)}
                  </DetailRow>
                  <DetailRow label="Status changed">
                    {formatDate(detail.status_changed_at)}
                  </DetailRow>
                </BlockStack>
              </div>
            </div>
          </Modal.Section>

          <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-0 border-t border-solid border-[#e3e3e3] bg-white px-4 py-3">
            {confirmDelete ? (
              <InlineStack gap="200" blockAlign="center">
                <Text as="span" variant="bodySm" tone="critical">
                  Delete with all votes and comments?
                </Text>
                <Button
                  variant="primary"
                  tone="critical"
                  onClick={remove}
                  loading={saving}
                >
                  Yes, delete
                </Button>
                <Button
                  onClick={() => setConfirmDelete(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </InlineStack>
            ) : (
              <Button
                variant="plain"
                tone="critical"
                icon={DeleteIcon}
                onClick={() => setConfirmDelete(true)}
              >
                Delete request
              </Button>
            )}

            <InlineStack gap="300" blockAlign="center">
              {dirty ? (
                <span className="flex items-center gap-1.5 text-xs text-[#616161]">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-[#e08a00]"
                  />
                  Unsaved changes
                </span>
              ) : null}
              <Button onClick={discard} disabled={!dirty || saving}>
                Discard
              </Button>
              <Button
                variant="primary"
                onClick={save}
                loading={saving}
                disabled={!canSave}
              >
                Save changes
              </Button>
            </InlineStack>
          </div>
        </>
      )}
    </Modal>
  );
}
