Status: Complete
Completed: 2025-06 (approx)

## Phase 8: Review Statistics

> Documented by speclet map. All tasks below were already implemented before speclet was added.

- [x] **Build review page** — `src/components/review/index.tsx`: fetch all records from `/admin/api/review`, render totals badge + data table + history modal inside a Polaris `Page`.
- [x] **Add state store hook** — `src/components/review/hooks/use-state-data.ts`: reducer-style `StateData` (reviewData, currentPage, storeId, showModal) with `addChange`.
- [x] **Add review data table** — `src/components/review/components/data-table.tsx` (`ReviewStatisticsData`).
- [x] **Add total stats component** — `src/components/review/components/total-stats.tsx`.
- [x] **Add review history modal** — `src/components/review/components/review-history-modal.tsx` (per-store detailed review).
- [x] **Add review util + types** — `src/components/review/util.ts` and `ReviewProps`/`StateData` types.
- [x] **Register review route** — added `review` route in `src/routes.tsx` and nav item in Layout.
