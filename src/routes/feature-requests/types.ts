/**
 * The team side of the merchant "Request feature" board, served by the backend's
 * `admin/api/feature-requests`. Labels mirror ShipGuard_2.0_Frontend's
 * routes/requestFeature/types.ts so both apps name statuses and categories the same.
 */

export type FeatureRequestStatus =
  "UNDER_REVIEW" | "PLANNED" | "IN_PROGRESS" | "SHIPPED";

export type FeatureRequestCategory =
  | "SHIPPING_PROTECTION"
  | "WIDGET_DESIGN"
  | "CHECKOUT"
  | "CLAIMS"
  | "NOTIFICATIONS"
  | "ANALYTICS"
  | "INTEGRATIONS"
  | "OTHER";

export interface AdminStoreSummary {
  id: string;
  domain: string;
  name: string | null;
}

export interface AdminUserSummary {
  id: string;
  name: string | null;
  email: string | null;
}

export interface AdminFeatureRequest {
  id: string;
  title: string;
  description: string;
  attachments: string[];
  status: FeatureRequestStatus;
  category: FeatureRequestCategory;
  vote_count: number;
  comment_count: number;
  hidden: boolean;
  hidden_at: string | null;
  status_changed_at: string | null;
  is_team: boolean;
  store: AdminStoreSummary | null;
  user: AdminUserSummary | null;
  created_at: string;
  updated_at: string;
}

export interface AdminFeatureRequestComment {
  id: string;
  body: string;
  attachments: string[];
  is_team: boolean;
  deleted: boolean;
  deleted_at: string | null;
  store: AdminStoreSummary | null;
  user: AdminUserSummary | null;
  created_at: string;
}

export interface AdminFeatureRequestVote {
  id: string;
  store: AdminStoreSummary | null;
  user: AdminUserSummary | null;
  created_at: string;
}

export interface AdminFeatureRequestDetail extends AdminFeatureRequest {
  comments: AdminFeatureRequestComment[];
  votes: AdminFeatureRequestVote[];
}

export interface AdminFeatureRequestPage {
  items: AdminFeatureRequest[];
  nextCursor: string | null;
}

export const FEATURE_REQUESTS_PATH = "admin/api/feature-requests";

export const TEAM_AUTHOR = "ShipGuard team";

export const STATUS_LABELS: Record<FeatureRequestStatus, string> = {
  UNDER_REVIEW: "Under review",
  PLANNED: "Planned",
  IN_PROGRESS: "In progress",
  SHIPPED: "Shipped",
};

export const CATEGORY_LABELS: Record<FeatureRequestCategory, string> = {
  SHIPPING_PROTECTION: "Shipping Protection",
  WIDGET_DESIGN: "Widget & Design",
  CHECKOUT: "Checkout & Thank You Page",
  CLAIMS: "Claims & Claim Portal",
  NOTIFICATIONS: "Emails & Notifications",
  ANALYTICS: "Analytics",
  INTEGRATIONS: "Integrations",
  OTHER: "Something Else",
};

export const STATUS_SELECT_OPTIONS = (
  Object.entries(STATUS_LABELS) as [FeatureRequestStatus, string][]
).map(([value, label]) => ({ label, value }));

export const CATEGORY_SELECT_OPTIONS = (
  Object.entries(CATEGORY_LABELS) as [FeatureRequestCategory, string][]
).map(([value, label]) => ({ label, value }));

export const statusLabel = (status: FeatureRequestStatus) =>
  STATUS_LABELS[status] ?? status;

export const categoryLabel = (category: FeatureRequestCategory) =>
  CATEGORY_LABELS[category] ?? category;

// Under review stays neutral (no tone) so the active stages stand out in the table.
export const badgeTone = (status: FeatureRequestStatus) => {
  switch (status) {
    case "SHIPPED":
      return "success";
    case "IN_PROGRESS":
      return "info";
    case "PLANNED":
      return "warning";
    default:
      return undefined;
  }
};

export const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export const timeAgo = (iso: string) => {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  if (Number.isNaN(seconds)) return "";
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size)
      return relativeFormat.format(Math.round(seconds / size), unit);
  }
  return "just now";
};

export const storeLabel = (store: AdminStoreSummary | null) =>
  store ? store.name || store.domain : null;

export const userLabel = (user: AdminUserSummary | null) =>
  user ? user.name || user.email || user.id : null;

// apiFetch throws ApiError whose message is already the server's own text.
export const errorText = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;
