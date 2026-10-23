# 06 — Google Search Console

**Updated:** 23 October 2026

## Access and evidence sources

No authorised GSC connector or authenticated account session was available. The current local workbook, `travel4life.net-Performance-on-Search-2026-10-23.xlsx`, is filtered to Web search and “Last 28 days”; its Chart sheet covers 24 September–21 October 2026. The verified GSC property is not recorded in the workbook; page URLs use `https://travel4life.net/`.

The workbook exports date, query, page, country, device and search-appearance dimensions separately. They are sampled reports, not a query × page × country × device cross-tab. GSC can omit low-volume and privacy-thresholded query data.

## Search performance observed

The Chart sheet contains 28 daily rows totaling **64 clicks and 2,127 impressions**, a derived CTR of **3.01%** and impression-weighted position of **10.26**. These are a short-term snapshot, not a ranking or booking baseline.

| Chart week | Clicks | Impressions | Derived CTR | Impression-weighted daily position |
|---|---:|---:|---:|---:|
| 24–30 Sep | 16 | 706 | 2.27% | 8.73 |
| 1–7 Oct | 27 | 843 | 3.20% | 9.32 |
| 8–14 Oct | 8 | 295 | 2.71% | 12.47 |
| 15–21 Oct | 13 | 283 | 4.59% | 14.56 |

The last week has a higher CTR but fewer impressions and a worse impression-weighted position than the previous week. This is mixed evidence, not a sustained improvement.

The dimensions do not reconcile: the Queries sheet reports 17 clicks / 1,058 impressions, the Pages sheet 64 / 2,307, while the Chart and Countries sheets each report 64 / 2,127. Do not combine dimension totals or calculate query-to-page CTR from these exports.

The Queries sheet contains 200 data rows, including six clicks across visible Tomorrowland query rows (301 impressions); “tomorrowland thailand packages from india” has 3 / 7 at position 8.71. “Mysteryland 2027” has 4 / 290 at position 8.16. These query rows cannot be attributed to a landing page from this workbook.

Selected page results:

| Page group | Clicks | Impressions | Notes |
|---|---:|---:|---|
| Tomorrowland guides | 21 | 824 | Thailand: 6 / 83, position 8.13; Winter: 4 / 292, position 7.75; cost guide: 2 / 145, position 15.04. |
| Europe pages | 1 | 60 | Three listed pages; Europe hub 1 / 15, cost page 0 / 29, under-₹2-lakh page 0 / 16. |
| Jim Corbett pages | 2 | 22 | Hub 2 / 3; low-volume evidence. |
| India Tours | 0 | 8 | Main hub 0 / 6; insufficient to assess. |
| Product pages | 27 | 1,248 | Product URLs have varied click-through; page rows include URL slash variants. |

These page totals are grouped from the Pages sheet only. They should not be added to the Chart or query totals. Europe-themed query rows show 23 impressions and no clicks, but the separate dimensions cannot establish which Europe page appeared for those queries.

Country rows show India at 34 clicks / 637 impressions (5.34% CTR, position 14.88). Device rows show mobile 36 / 1,378 (2.61%), desktop 28 / 737 (3.80%), and tablet 0 / 12. Product snippets show 8 clicks / 582 impressions (1.37%). These are property-wide, not landing-page-specific performance.

## Comparison limits and implementation status

The prior local `travel4life.net-Performance-on-Search-2026-10-17.xlsx` is a Last 7 days export for 8–14 October. Its chart matches the same seven-day slice in the 28-day workbook (8 clicks / 295 impressions); it is an overlapping snapshot, not an independent before/after comparison. The 23 October export does not establish whether SEO changes caused the observed performance.

The three destination snippet updates made in source on 23 October are not evidence of ranking or CTR gains until deployed, recrawled and compared in a subsequent complete period. A local SEO validator and 71 SEO tests pass after these edits; this does not prove Google has processed them or will display the supplied titles and descriptions.

## Requested reports unavailable

No account-level evidence was available for:

- Page indexing reasons, sitemap processing or URL Inspection / Google-selected canonicals.
- Field Core Web Vitals URL groups, device status, reporting period or sample counts.
- HTTPS, mobile usability, manual actions or security issue reports.
- A query × landing-page report, a three-month trend, or a comparable prior period.
- Organic leads, bookings, revenue or margin joined to search visits.

## Exact owner steps to improve the evidence

1. Provide authorised read-only access or export the verified `https://travel4life.net/` property reports.
2. Export Performance (Web) for at least three complete months and a comparable prior period, preserving date, query, page, country, device and search appearance dimensions separately.
3. Export query × page data for Tomorrowland, Mysteryland, Europe and India Tours; keep privacy omissions explicit.
4. Export Page indexing examples and URL Inspection results for the homepage, target hubs, representative trip pages and locale routes after deployment.
5. Export Core Web Vitals, HTTPS, manual-action and security reports.
6. Join canonical landing-page data to consented analytics and received/qualified lead records using non-PII dimensions. Do not treat clicks or WhatsApp opens as submitted leads or bookings.
