# Existing Implementation

> Documented by speclet map. All phases below are already implemented.

## Phase 1: Project Setup & Tooling
Scaffolded a Vite 6 + React 19 + TypeScript SPA with pnpm. Added Shopify Polaris (UI kit, icons, viz) and Tailwind CSS v4 via the Vite plugin, configured ESLint 9 flat config with React Hooks/Refresh plugins, `.editorconfig`, and split tsconfig (`app`/`node`). Set up GitHub Pages deployment (`gh-pages`, base path `/shipguard-admin-ui/`) and the app shell in `main.tsx` (Polaris `AppProvider`) with a hash router in `routes.tsx`.

## Phase 2: Authentication & App Shell
Built the login screen (email/password POST to `${BASE_URL}/admin/api`, storing `userEmail` in localStorage), a `useAuth` hook, and a `PublicRoute` guard. Created the `Layout` shell (Sidebar + TopBar) that gates every protected route behind `useAuth`, defines the nav items, and highlights the active route (including the subscriber-detail sub-route).

## Phase 3: Dashboard & Shared UI Primitives
Implemented the dashboard page with KPI admin cards (subscribers, MRR, new orders), a line chart and pie chart (Polaris Viz), and shared building blocks: a Tailwind/Polaris date-range picker, `switch-button` / `switch-with-loading` toggles, and utilities `default30Days` and `money-format`, plus the `useDebounce` hook.

## Phase 4: Subscribers Management
Built the subscribers list page — paginated, filterable, debounced-search store list with a summary stats card — and an Excel export (`xlsx`) that pulls export data from the API and computes per-store metrics (orders, protected/unprotected, revenue, insurance earning, conversion rate, country). Added the subscriber detail page showing store info, stats, order history, and the app-control panel, keyed by `storeId` route param.

## Phase 5: Orders Management
Implemented the all-stores orders page with a date-range picker, tab filters, debounced search, pagination, and an order stats header, reusing the shared subscriber-order-list and order card components.

## Phase 6: Per-Store App Controls
Built the App Control card on the subscriber detail page with Basic and Subscription tabs. Basic tab toggles cart/checkout widget enable, auto-protection, and storefront logging; plus hide-product, custom widget selector, store suspend (with default suspend reason + modals), and app uninstall — all wired to `/admin/api/subscriber` and `/admin-app-control`.

## Phase 7: Activity Logs
Implemented a polling (60s) activity-log viewer using Polaris `IndexFilters`/`IndexTable`, with type/source tabs (INFO/ERROR/BACK END/FRONT END), debounced search, pagination, abortable fetches, message truncation with a custom tooltip, and tolerance for both JSON and legacy double-stringified log messages.

## Phase 8: Review Statistics
Added the review statistics page: fetches all merchant review/feedback records, shows totals and a data table, and a review-history modal. Introduced a small local state store hook (`use-state-data`) to coordinate page, selected store, and modal visibility.

## Phase 9: Subscription & Global Settings
Added the per-store Subscription tab (pricing group Free/Paid, paid plan Monthly/Usage/PayAsYouGoOnly, founder visibility) wired to `/admin/subscribers/subscription`, and a Global Settings page (`/admin/api/global-settings/subscription-config`) controlling the default new-store plan and whether the founder is shown to merchants.
