Status: Complete
Completed: 2025-06 (approx)

## Phase 7: Activity Logs

> Documented by speclet map. All tasks below were already implemented before speclet was added.

- [x] **Build activity logs page** — `src/components/logs/index.tsx` using Polaris `IndexFilters` + `IndexTable` (Store, Log Type, Log From, Message, Created At).
- [x] **Add type/source tabs** — All / INFO / ERROR / BACK END / FRONT END filter tabs.
- [x] **Add 60s polling** — `setInterval` fetch of `/admin/api/logs` with an `AbortController`, cleaned up on unmount/deps change.
- [x] **Add debounced search + pagination** — `useDebounce`, page reset on filter/search change, prev/next pagination from API.
- [x] **Add message tooltip + truncation** — `src/components/logs/tooltip.tsx` (`TooltipCustom`) with `truncate` helper.
- [x] **Handle legacy log format** — tolerate both pure-JSON and double-stringified message payloads.
