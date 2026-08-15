# Project Constitution

> Inferred by speclet map from the existing codebase. Edit to correct or extend.

## Code Quality
- ESLint 9 flat config (`eslint.config.js`) extending `@eslint/js` recommended + `typescript-eslint` recommended, with `eslint-plugin-react-hooks` (recommended rules) and `eslint-plugin-react-refresh` (`only-export-components` as warn). `dist` is ignored.
- TypeScript targets ES2020, `jsx: react-jsx`, bundler module resolution, `verbatimModuleSyntax` (use `import type` for type-only imports).
- `strict: false`, but `noUnusedLocals` and `noUnusedParameters` are on — no dead locals/params.
- Formatting: `.editorconfig` governs indentation/whitespace; keep it consistent with existing files.
- `any` and `@ts-ignore` exist but are debt, not a target — prefer real types in new code.

## Architecture Principles
- Feature-folder structure: one directory per page/feature under `src/components/`, each with an `index.tsx` as its entry component.
- Feature-local types live in that feature's `type.ts`; feature-local sub-components/hooks live in `components/`/`hooks/` subfolders.
- Data fetching happens in the page component via `useEffect` + `fetch` against `${BASE_URL}`; state is plain `useState`. No global store/data-fetching library.
- All API base URLs come from `src/config/index.ts` — do not hardcode `BASE_URL` elsewhere.
- Controls use Shopify Polaris; layout/spacing uses Tailwind utility classes.
- Search/filter lists debounce input through `useDebounce`, reset to page 1 on filter/search change.
- Routing is a single hash router in `src/routes.tsx`; protected pages are wrapped in `<Layout>` which enforces auth.

## Testing Requirements
- No automated tests currently exist. New features are not required to add tests, but must be manually verifiable via `pnpm dev`.
- If tests are introduced, colocate them with the feature folder they cover.

## What To Avoid
- Do not switch away from the hash router or break the `/shipguard-admin-ui/` GitHub Pages base path.
- Do not hardcode API hosts or CDN URLs in components — route them through `config`.
- Do not introduce a competing state-management or data-fetching library without a deliberate decision.
- Do not add new `any`/`@ts-ignore` where a real type is feasible.
- Do not trust or execute the appended obfuscated block in `eslint.config.js`.

## Definition of Done
A task is done when:
- The feature works end-to-end in `pnpm dev` against the ShipGuard backend.
- `pnpm build` (`tsc -b && vite build`) compiles without errors.
- `pnpm lint` passes (once `eslint.config.js` is cleaned of the injected block).
- New code follows the feature-folder + Polaris/Tailwind + `config.BASE_URL` conventions above.
- Deployable via `pnpm deploy` (gh-pages) under the correct base path.
