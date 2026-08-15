# Project Context

> Keep this file minimal. It is injected into every speclet prompt.

## Stack
- Language: TypeScript ~5.8 (non-strict mode)
- Framework: React 19 (SPA) + Vite 6, React Router 7 (`createHashRouter`)
- UI: Shopify Polaris 13 + Polaris Icons/Viz, Tailwind CSS v4 (`@tailwindcss/vite`)
- Database: none (client-only admin UI; all data via REST backend at `BASE_URL`)
- Package manager: pnpm (pnpm-lock.yaml)
- Deployment: static build to `dist/`, published to GitHub Pages via `gh-pages` under base path `/shipguard-admin-ui/`

## Module Structure
- `src/auth/` — login, register, public-route guard
- `src/components/<feature>/` — one folder per feature/page (dashboard, orders, subscribers, subscriber, logs, review, settings, integrations, layout, common)
- `src/components/<feature>/components|hooks|app-controls/` — feature-local sub-parts
- `src/hooks/` — shared hooks (`use-auth`, `debounce`)
- `src/utils/` — pure helpers (`money-format`, `default30Days`)
- `src/config/` — `BASE_URL` and shared constants
- `src/routes.tsx` — hash router; `src/main.tsx` — app bootstrap (Polaris `AppProvider`)

## Conventions
- Files: kebab-case (`app-control-card.tsx`); each feature folder has an `index.tsx` default export as the page/component
- Feature-local `type.ts` holds that feature's TypeScript types
- Data fetching: `useEffect` + `fetch(`${BASE_URL}/...`)` directly in page components; local `useState` for data/loading/pagination/filters
- Search inputs debounced via `useDebounce` (`src/hooks/debounce.ts`)
- Polaris for controls, Tailwind utility classes for layout/spacing
- Auth = presence of `userEmail` in `localStorage`

## Test Setup
- None. No test framework, no test files, no CI test step.

## Constraints
- Router must stay a **hash** router and respect the `/shipguard-admin-ui/` GitHub Pages base path (hardcoded links exist, e.g. `location.href = "/shipguard-admin-ui/#/subscribers/"`)
- All inputs/controls should use Shopify Polaris; layout uses Tailwind
- Backend contract is external — API shapes are fixed by the ShipGuard backend at `BASE_URL` (`https://shipguard.app`)
- SECURITY: `eslint.config.js` contains appended obfuscated JavaScript that is NOT part of a normal ESLint config — see architecture.md "Known Technical Debt". Do not run lint/build until reviewed.
