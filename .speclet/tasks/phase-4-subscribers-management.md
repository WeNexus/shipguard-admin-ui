Status: Complete
Completed: 2025-05 (approx)

## Phase 4: Subscribers Management

> Documented by speclet map. All tasks below were already implemented before speclet was added.

- [x] **Build subscribers list page** — `src/components/subscribers/index.tsx`: fetch `/admin/api/subscriber` with page/limit/filter/searchTerm, loading + pagination + stats state, reset to page 1 on filter/search change.
- [x] **Add subscribers stats card** — `src/components/subscribers/subscripber-card.tsx` (summary stats).
- [x] **Add subscriber list table** — `src/components/subscribers/subscriber-list.tsx` with pagination, tab filters, debounced search.
- [x] **Add Excel export** — `handleExport` in list page pulls `/admin/api/exports?action=subscriber` and builds `subscribers.xlsx` via `xlsx`, computing orders/protected/unprotected/revenue/insurance earning/conversion rate/country.
- [x] **Define subscriber types** — `src/components/subscribers/type.ts` (`StoreRecordList`).
- [x] **Build subscriber detail page** — `src/components/subscriber/index.tsx`: fetch `/admin/api?storeId=...` for store, orders, stats, packageProtection, pagination; keyed on `storeId`, `page`, `filters`, `searchTerm`, `reFetch`.
- [x] **Add subscriber details card** — `src/components/subscriber/subscriber-details-card.tsx` and detail types in `src/components/subscriber/type.ts`.
