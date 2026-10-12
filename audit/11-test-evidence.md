# 11 — Test evidence

**Audit date:** 12 October 2026. Times are local session execution on Windows. This report records only observed outcomes.

## Repository and build

| Command/action | Result |
|---|---|
| `git status --short --branch` | `main...origin/main`; existing user edits/deletions were present before this audit. |
| `npm ls --depth=0` | Exit 0; manifest top-level dependencies resolve. |
| `npm run build` | Exit 0 earlier in this session. Vite 7.3.5 built five HTML entries, including `/india-tours/de/`, `/fr/`, `/nl/`; subsequent scripts generated product/contact/sitemap artifacts. |
| `npm run test:seo` | Exit 0; 44 passed, 0 failed. |
| `npm run seo:validate` | Exit 0; validated 14 Tomorrowland pages, Europe hub, and contact-layer checks on 25 SEO pages. |
| `npm run seo:validate:sitemaps` | Exit 0; 82 eligible URLs in 12 generated groups. |
| `npm run seo:validate:production` | Exit 1; reports only three registry-approved localized URLs missing from live sitemap. |
| `npm run lint` | Exit 1; 243 errors and 26 warnings. |
| `npx tsc -b --pretty false` | Exit 1; parser diagnostics in `src/components/pages/AboutPage.tsx` and `CreatorProfilePage.tsx`; Vite config Node type errors. |
| `npx tsc -p tsconfig.node.json --pretty false` | Exit 2; missing Node built-in/global typings. |
| `npm audit --omit=dev --audit-level=high` | Exit 0; 0 vulnerabilities reported. |
| `npm audit --audit-level=high` | Exit 1; 15 advisories (11 high, 3 moderate, 1 low); full output identifies dev/build dependency paths. |
| `git diff --check` | Exit 0 during the preceding session build/locale work; this audit adds documentation only. |

## Live HTTP/browser checks

- `https://travel4life.net/robots.txt`: readable; allows all and references sitemap index.
- `https://travel4life.net/sitemap.xml`: readable sitemap index with 12 child sitemap entries.
- `https://travel4life.net/sitemaps/india-tours-pages.xml`: valid XML containing English India-tour hub only.
- `https://travel4life.net/india-tours/`: readable English page content.
- `https://travel4life.net/india-tours/de/`: HTTP 404.
- `https://travel4life.net/india-tours/fr/`: HTTP 404.
- `https://travel4life.net/india-tours/nl/`: HTTP 404.
- Local browser direct route checks: home, English hub, and three locales rendered; responsive widths are tabulated in report 03.

## Search Console and performance evidence

- Workbook `travel4life.net-Performance-on-Search-2026-10-10 (1).xlsx`: metadata creation date 10 October; date filter “Last 7 days”; chart rows 30 September–6 October. Summary is in report 06.
- No authenticated GSC reports, URL inspections, page indexing report, Core Web Vitals, manual actions, or security reports were available.
- No Lighthouse/PageSpeed/WebPageTest run was completed. Build artifact sizes are recorded in report 04 and are not performance scores.

## Safety and limitations

- No production form, booking, payment, newsletter, WhatsApp send, or database mutation was submitted.
- The privileged analytics Edge Function was reviewed statically; production access control was not probed.
- No secrets from `.env.local` were inspected or included.
- No full browser accessibility audit, complete site crawl, or native-language editorial review was performed.
- TypeScript commands emitted `tsconfig.*.tsbuildinfo`; those exact audit-generated metadata files were removed. No application source was modified by the audit.

