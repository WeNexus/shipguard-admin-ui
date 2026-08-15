Status: Complete
Completed: 2025-05 (approx)

## Phase 5: Orders Management

> Documented by speclet map. All tasks below were already implemented before speclet was added.

- [x] **Build orders page** — `src/components/orders/index.tsx`: fetch `/admin/api/orders` with startDate/endDate/page/limit/filter/searchTerm; date range → ISO with +1 day end boundary.
- [x] **Add date-range filtering** — integrate `DateRangePicker` + `default30Days`, reset to page 1 on range/filter/search change.
- [x] **Add order stats header** — `src/components/orders/admin-order-card.tsx` (stats summary).
- [x] **Add reusable order list** — `src/components/orders/subscriber-order-list.tsx` with `withStoreName` toggle, pagination, filters, debounced search (shared with subscriber detail).
- [x] **Define order types** — `src/components/orders/type.ts` (`ProtectionOrderList`).
