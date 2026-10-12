# 06 — Google Search Console

**Audit date:** 12 October 2026

## Access and evidence sources

No authorised GSC connector or authenticated account session was available. A local workbook, `travel4life.net-Performance-on-Search-2026-10-10 (1).xlsx`, was available and inspected. The workbook metadata says it was created on 10 October 2026; its filter sheet says “Last 7 days”, while its chart rows cover 30 September through 6 October 2026. Treat the export as a short, sampled snapshot. The verified GSC property is not recorded in the workbook; listed page URLs use `https://travel4life.net/`.

## Search performance observed in the supplied export

The chart contains seven daily rows totaling **26 clicks and 888 impressions**, a derived aggregate CTR of **2.93%**. Daily average positions range from 7.5 to 12.0. This is a short time window, not a trend or booking baseline.

The country table reports:

| Country | Clicks | Impressions | Exported average position |
|---|---:|---:|---:|
| Germany | 0 | 57 | 8.84 |
| Netherlands | 0 | 31 | 7.13 |
| France | 0 | 26 | 13.77 |

These three markets total 114 impressions and zero clicks in this export. Small counts and a single short period do not establish durable market demand or a conversion rate.

The device table reports mobile 18 clicks / 616 impressions (2.92% CTR), desktop 8 / 266 (3.01%), and tablet 0 / 6. Search appearance lists product snippets at 1 click / 219 impressions (0.46% CTR). Query and page dimensions are separate sampled exports and should not be added together.

Examples from the page table include `/tomorrowland/winter/` at 137 impressions, 2 clicks, and average position 8.31, and `/tomorrowland/cost-from-india/` at 62 impressions, 2 clicks, and average position 16.79. The data is insufficient to diagnose CTR performance without query/page matching, longer periods, and a comparable baseline.

The Queries and Pages sheets contain 111 and 44 rows respectively, including headers; the Country sheet has 69 data rows and the Device sheet has three. GSC may omit low-volume/private queries, so these are not complete query inventories.

## Requested reports unavailable

No account-level evidence was available for:

- Page indexing reasons and counts.
- Sitemap submission/read status or URL discovery diagnostics.
- URL Inspection, Google-selected canonical, last crawl, or rendered-page details.
- Field Core Web Vitals URL groups, reporting period, or sample counts.
- HTTPS, mobile usability, manual actions, or security issue reports.
- Search clicks/impressions for a representative 28-day or 3-month period and year-over-year comparison.
- Confirmed organic leads, bookings, revenue, or margin.

## Exact owner steps to unblock

1. Share authorized read-only GSC access or export the verified `https://travel4life.net/` property reports.
2. Export Performance (Web) by date, query, page, country, device, and search appearance for the last 3 complete months plus a comparable prior period. Preserve each dimension separately and include export date.
3. Export Page indexing examples with reason, sitemap status, and affected URL; provide URL Inspection results for homepage, India hub, a representative trip page, and locale routes after deployment.
4. Export Core Web Vitals mobile/desktop status and sample counts, plus HTTPS, manual action, and security reports.
5. Join GSC landing-page data to consented analytics and received/qualified lead records using non-PII dimensions; do not treat clicks as leads or bookings.

