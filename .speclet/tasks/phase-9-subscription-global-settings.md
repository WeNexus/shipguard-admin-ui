Status: Complete
Completed: 2025-07 (approx, latest commits)

## Phase 9: Subscription & Global Settings

> Documented by speclet map. All tasks below were already implemented before speclet was added.

- [x] **Build per-store Subscription tab** — `src/components/subscriber/app-controls/subscription.tsx`: load/save via `/admin/subscribers/subscription?shop=...`, pricing group Free/Paid, min-skeleton loading, error state.
- [x] **Add paid plan options** — Monthly (no usage fee), Usage (monthly + usage fee), and PayAsYouGoOnly (`234abdf`).
- [x] **Add founder visibility control** — per-store `eligibleForFounder` show/hide select.
- [x] **Fix subscription/founder data path** — correct API data path for plan + founder visibility (`3a1b02e`).
- [x] **Build Global Settings page** — `src/components/settings/index.tsx`: load/save `/admin/api/global-settings/subscription-config`, control new-store default plan (Free/Monthly/Usage) and show-founder-to-merchant, with skeleton loading and toast errors (`1585f8a`).
- [x] **Document settings spec** — `src/components/settings/settings-readme.md` describing styling, layout, and data contract.
