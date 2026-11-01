# Evidence Log

## Repository

- Audit timestamp: 2026-11-01
- Branch: `main`
- HEAD: `f92f24b499ea3e7a1ba69981b18c4c41a46afbcb`
- Key commits:
  - `ad24cd8` 2026-10-27: Tomorrowland SEO implementation
  - `b14106f` 2026-10-27: ticket SEO guide
  - `a27e243` 2026-10-10: conversion and technical SEO hardening
- Existing reports inspected under `docs/seo/`.

## Production

- Priority Tomorrowland routes returned HTTP 200.
- `/tomorrowland-india.html` returned HTTP 301 to `/tomorrowland/from-india/`.
- `/tomorrowland/winter/2027/` returned HTTP 301 to `/tomorrowland/winter/`.
- Mysteryland no-slash UUID returned 301 to slash UUID; slash version returned 200.
- Sitemap index references the festivals and product festival sitemap children.
- Eight priority pages returned self-canonicals and index/follow robots directives.

## Search Console

- Workbook `travel4life.net-Performance-on-Search-2026-11-01.xlsx`
- Search type: Web text-based
- Filter: Last 28 days
- Chart exact range observed: 3–30 October 2026
- Chart totals: 52 clicks, 1,818 impressions
- India country row: 32 clicks, 559 impressions, 5.72% CTR, 16.42 position
- Query × page and authenticated URL Inspection were unavailable.

## Tests

- Command: `npm run test:seo`
- Exit code: 0
- Tests: 74
- Passed: 74
- Failed: 0

## External limitations

- No authenticated Search Console API or URL Inspection.
- No fresh 28/90-day India query × page exports.
- No locale-specific live SERP capture.
- No PageSpeed or Lighthouse run.
- No qualified organic lead records.
