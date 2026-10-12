# 01 — Project health

**Date:** 12 October 2026  
**Scope:** repository architecture, dependencies, build configuration, type/lint health, deployment configuration.

## Baseline

- Git branch: `main`, tracking `origin/main`.
- The worktree was already dirty before this audit. It included ongoing India-market page changes, application edits, and deletions of seven earlier Search Console CSV exports. Those changes were not reverted or overwritten.
- `.env.local` exists and is ignored; it was deliberately not read. No credentials or secret values are included in this report.
- The audit added report files only; no application fixes were applied.

## Architecture

- React 18 and TypeScript application, Vite 7 build tool, Tailwind CSS, Framer Motion, Lucide icons, Leaflet, and Supabase JS.
- SPA route selection is implemented in [`src/App.tsx`](../src/App.tsx); individual application pages are lazy-loaded. `/trips/<uuid>` is handled specially, while the India-tour hub is a separate Vite HTML entry using React.
- Static SEO entry pages are kept under `public/` and `india-tours/`; Vite inputs include the English, German, French, and Dutch India-tour pages in [`vite.config.ts`](../vite.config.ts).
- Backend assets include Supabase Edge Functions and SQL migrations. Database deployment state and live policies were not inspected.
- Netlify-style redirects and 404 handling are in [`public/_redirects`](../public/_redirects); `public/robots.txt` allows crawling and points to the sitemap index.

## Commands and outcomes

| Command | Outcome |
|---|---|
| `npm ls --depth=0` | Passed; installed top-level dependencies satisfy the manifest. |
| `npm run build` | Passed earlier in this session. Vite built all five HTML entries; post-build scripts generated product, Corbett, contact-layer, and sitemap artifacts. |
| `npm run test:seo` | Passed: 44 tests. Coverage is SEO/data utility and India-tour focused, not a general application E2E suite. |
| `npm run lint` | Failed: 243 errors and 26 warnings. Errors span application and Edge Function files, including unused imports, explicit `any`, switch-case declarations, and unused variables. |
| `npx tsc -b --pretty false` | Failed. The app project reports TS parse errors in two tracked files under `src/components/pages/`; both contain literal diff-fragment text rather than TypeScript. The Vite config project additionally reports missing Node globals/types and unresolved Node built-ins. |
| `npx tsc -p tsconfig.node.json --pretty false` | Failed on `fs`, `path`, `process`, `__dirname`, and `URL` typing. `@types/node` is not declared directly. |
| `npm audit --omit=dev --audit-level=high` | Passed: zero production advisories reported by npm on the audit date. |
| `npm audit --audit-level=high` | Failed: 15 advisories in the full dependency tree (11 high, 3 moderate, 1 low). They are in development/build tooling; see report 07. |

The production build succeeding does not establish TypeScript correctness: Vite transpiles modules but the build script does not invoke `tsc`. The malformed TSX files are not imported by current application routes, which explains why Vite can build while the standalone TypeScript project check fails.

## Production readiness

- Local static generation succeeds.
- Live SEO validation identifies exactly three missing market URLs in the published sitemap; each locale route also returns HTTP 404.
- No automated GitHub workflow was found under `.github/workflows/`; build, test, lint, and deploy gating should be confirmed in the actual hosting pipeline.
- Build and development environment variables were not enumerated from `.env.local`. `.env.example` documents placeholder admin-password and hero-video variables.
- Source maps are disabled in Vite production build configuration. No independent deployed-asset inspection was performed.

## Findings

- **Confirmed, medium:** lint and type-check gates fail. Use report 09 entries AUD-06 and AUD-07.
- **Confirmed, medium:** 15 development-tree dependency advisories require review; production-only audit returned zero. Use AUD-08.
- **Informational:** Vite-only build passes without type-checking, so it can conceal compile errors in unreferenced files.
- **Not tested:** actual deployment pipeline, live environment variable values, Supabase migration application state, Edge Function deployment configuration, and rollback procedures.

