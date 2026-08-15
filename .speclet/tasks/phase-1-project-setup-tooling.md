Status: Complete
Completed: 2025-05 (approx, from initial commits)

## Phase 1: Project Setup & Tooling

> Documented by speclet map. All tasks below were already implemented before speclet was added.

- [x] **Scaffold Vite + React 19 + TS SPA** — `package.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/vite-env.d.ts` with pnpm as package manager.
- [x] **Configure TypeScript** — split `tsconfig.json` → `tsconfig.app.json` / `tsconfig.node.json`; ES2020, `react-jsx`, bundler resolution, `verbatimModuleSyntax`, `noUnusedLocals/Parameters`.
- [x] **Add Tailwind CSS v4** — `@tailwindcss/vite` plugin, `src/index.css` / `src/App.css`, autoprefixer/postcss deps.
- [x] **Add Shopify Polaris** — `@shopify/polaris` + `polaris-icons` + `polaris-viz`; wrap app in `AppProvider` with English translations in `main.tsx`.
- [x] **Set up ESLint 9 flat config** — `eslint.config.js` with `@eslint/js`, `typescript-eslint`, `react-hooks`, `react-refresh`; `dist` ignored; `lint` script added.
- [x] **Add `.editorconfig` and `.gitignore`** — consistent formatting and ignore rules.
- [x] **Configure GitHub Pages deploy** — `gh-pages` dependency, `deploy` script (`gh-pages -d dist`), `/shipguard-admin-ui/` base path, `config-root.ts` recording built asset path, `public/` assets.
- [x] **Set app metadata** — site title and tab icon configured (`index.html`).
