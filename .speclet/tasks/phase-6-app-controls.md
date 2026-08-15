Status: Complete
Completed: 2025-06 (approx)

## Phase 6: Per-Store App Controls

> Documented by speclet map. All tasks below were already implemented before speclet was added.

- [x] **Build App Control card** — `src/components/subscriber/app-control-card.tsx` with Basic/Subscription segmented tabs and shared refetch wiring.
- [x] **Add widget toggles** — cart widget enable, cart auto-protection, checkout widget enable, checkout auto-protection, storefront log; each POSTs FormData with an `action` to `/admin/api/subscriber`.
- [x] **Add hide-product control** — `src/components/subscriber/app-controls/hide-product.tsx`.
- [x] **Add custom widget selector** — `src/components/subscriber/app-controls/custom-widget-selector.tsx`.
- [x] **Add store suspend** — `src/components/subscriber/app-controls/suspend.tsx` using `DEFAULT_SUSPEND_REASON` and confirmation modals.
- [x] **Add app uninstall** — `handleAppUninstalled` calls `/admin-app-control?type=uninstall&storeId=...` with confirm dialog and loading state.
