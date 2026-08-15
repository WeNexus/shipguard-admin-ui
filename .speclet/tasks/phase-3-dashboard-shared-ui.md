Status: Complete
Completed: 2025-05 (approx)

## Phase 3: Dashboard & Shared UI Primitives

> Documented by speclet map. All tasks below were already implemented before speclet was added.

- [x] **Build dashboard page** — `src/components/dashboard/index.tsx`: KPI grid (Total Subscribers, Basic subscribers, MRR, New Orders Today), Order Overview line chart, Claim Rate pie chart.
- [x] **Add admin KPI card** — `src/components/dashboard/admin-card.tsx` (amount + title).
- [x] **Add charts** — `src/components/dashboard/line-chart.tsx` and `pie-chart.tsx` using Polaris Viz.
- [x] **Build date-range picker** — `src/components/common/date-range-picker.tsx` (Polaris + Tailwind), driving `IActiveDates`.
- [x] **Build toggle switches** — `src/components/common/switch-button.tsx` and `switch-with-loading.tsx`.
- [x] **Add `useDebounce` hook** — `src/hooks/debounce.ts` for search inputs.
- [x] **Add date/money utils** — `src/utils/default30Days.ts` (default 30-day range) and `src/utils/money-format.ts`.
