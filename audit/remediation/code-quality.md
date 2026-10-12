# Code quality and type-check status

## Lint

The previously captured baseline was 243 errors and 26 warnings. The final underlying ESLint scan reports 210 errors and 25 warnings across 204 checked result files:

| Rule | Errors | Warnings |
|---|---:|---:|
| `@typescript-eslint/no-unused-vars` | 174 | 0 |
| `@typescript-eslint/no-explicit-any` | 33 | 0 |
| `no-useless-catch` | 2 | 0 |
| `prefer-const` | 1 | 0 |
| `react-hooks/exhaustive-deps` | 0 | 25 |
| **Total** | **210** | **25** |

`npm run lint:edge` passes. Full lint remains non-zero; `npm run lint:app` is not represented as clean. No global rule was disabled and no blanket file exclusion was added. See [`lint-remaining.csv`](./lint-remaining.csv) for remaining findings by file and rule. The reduction from the recorded baseline is partial cleanup, not completion of the lint standard.

## TypeScript

- `npx tsc -p tsconfig.node.json --pretty false` — **passes** after adding `@types/node` and correcting the app deprecation option.
- `npx tsc -b --pretty false` — **fails with 592 diagnostics**. Most common codes are TS6133 (169), TS2339 (165), TS2353 (65), TS7006 (42), and TS2322 (22). The project-wide failures are spread across existing app code and remain visible; no broad exclusion was added.
- The two fragment-only tracked `src/components/pages` files now re-export canonical implementations already used by the application. This avoids fabricating page content. Existing errors inside the canonical page implementations remain part of the full baseline.

The Vite production build transpiles and bundles; the TypeScript project checks validate app and Node/Vite configuration. These checks have different purposes and should remain separate in CI.

## Build and focused tests

- `npm run build` — **passes**.
- `npm run test:seo` — **50 passed, 0 failed**.
- `npm run seo:validate:sitemaps` — **passes** for 82 eligible URLs across 12 groups.
- Production route validation remains **failing** for the three locale URLs; see [`international-seo.md`](./international-seo.md).

No unrelated type/lint cleanup was attempted beyond the affected security, analytics, upload-function, and malformed-file paths.
