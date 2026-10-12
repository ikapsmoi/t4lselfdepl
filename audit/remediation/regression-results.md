# Regression results

All results below are local. No production deployment or indexing request was made.

| Check | Result | Evidence / limitation |
|---|---|---|
| `npm run build` | **Pass** | Final production build emitted the English hub and German/French/Dutch nested HTML routes. |
| `npm run test:seo` | **Pass: 50/50** | Includes locale metadata/reciprocal-hreflang tests, enquiry tests, sitemap tests, analytics payload minimization, and five analytics authorization cases. |
| `npm run seo:validate:sitemaps` | **Pass** | 82 eligible URLs in 12 non-empty groups; compatibility XML endpoints and redirect precedence validated locally. |
| `npm run lint:edge` | **Pass** | Supabase Edge Function lint. |
| Full ESLint (`npm run lint`, underlying `eslint .`) | **Fail: 210 errors, 25 warnings** | Remaining messages are grouped in `lint-remaining.csv`; no global suppression added. |
| `npx tsc -p tsconfig.node.json --pretty false` | **Pass** | Node/Vite configuration project. |
| `npx tsc -b --pretty false` | **Fail: 592 diagnostics** | Main codes: TS6133 169, TS2339 165, TS2353 65, TS7006 42, TS2322 22. |
| `npm audit` | **Fail: 7 dev-tree entries** | 5 high, 2 moderate; see `dependencies.md`. |
| `npm audit --omit=dev` | **Pass: 0 findings** | Production dependency graph only; not a complete security assessment. |
| Built local India-tour routes | **Pass** | English hub and all three localized paths returned local 200; each locale rendered its language, title, H1, canonical, and alternate links. |
| Mobile viewports | **Pass** | 320, 360, 390, 430, 768, 1366, and 1440 px; document width did not exceed viewport; brand and menu control remained visible. |
| Production locale validator | **Fail: 12 issues** | All three production paths return 404, are missing from the production sitemap, and lack the expected response canonical/indexability metadata. This is an unresolved production issue, not a local test regression. |
| Newsletter send/confirmation | **Not sent** | No email, mailing-list submission, or unsubscribe action was performed. Source behavior is truthful about preparing a `mailto:` request; no subscription backend exists. |
| Real booking/payment/WhatsApp | **Not performed** | No real customer communication or booking mutation was initiated. |

The production check was intentionally non-mutating. Its failure is the strongest evidence that AUD-02 remains unresolved in production.
