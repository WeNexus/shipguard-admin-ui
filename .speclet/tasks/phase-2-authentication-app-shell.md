Status: Complete
Completed: 2025-05 (approx)

## Phase 2: Authentication & App Shell

> Documented by speclet map. All tasks below were already implemented before speclet was added.

- [x] **Build login page** — `src/auth/login.tsx`: email/password form, POST FormData to `${BASE_URL}/admin/api`, store `userEmail` in localStorage on `redirect`, error handling, loading state, branded logos.
- [x] **Add `useAuth` hook** — `src/hooks/use-auth.ts`: returns `true` when `userEmail` exists in localStorage.
- [x] **Add `PublicRoute` guard** — `src/auth/public-route.tsx`: redirects logged-in users to `/`.
- [x] **Create config module** — `src/config/index.ts`: `BASE_URL` (`https://shipguard.app`) and `DEFAULT_SUSPEND_REASON`.
- [x] **Build Layout shell** — `src/components/layout/index.tsx`: auth guard (`<Navigate to="/login" />`), Sidebar + TopBar, mobile overlay, nav item definitions, active-route detection incl. subscriber-detail sub-route.
- [x] **Build Sidebar and TopBar** — `src/components/layout/sidebar.tsx`, `topbar.tsx`, shared `type.ts` (`INavItem`, `IActiveDates`).
- [x] **Wire hash router** — `src/routes.tsx`: `createHashRouter` with routes for dashboard, login, orders, subscribers, subscriber detail, activity-logs, settings, integrations, review, and 404.
