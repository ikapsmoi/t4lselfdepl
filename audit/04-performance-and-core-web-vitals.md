# 04 — Performance and Core Web Vitals

**Date:** 12 October 2026

## Measurements performed

No Lighthouse, PageSpeed Insights, WebPageTest, or authenticated Search Console Core Web Vitals report was run. Consequently, this audit has **no LCP, INP, CLS, TTFB, field percentile, or field URL-group measurement**. The route viewport checks in report 03 only tested document-level overflow; they do not measure speed.

The successful local production build reported these emitted file sizes (raw / gzip):

| Artifact | Raw | Gzip |
|---|---:|---:|
| Main CSS | 166.33 kB | 26.13 kB |
| India-tour CSS | 129.82 kB | 19.91 kB |
| Main JavaScript chunk | 87.82 kB | 22.21 kB |
| `travel4lifeContact` JavaScript chunk | 362.15 kB | 101.76 kB |
| `PackageCreator` JavaScript chunk | 269.69 kB | 62.94 kB |

These are bundle artifacts, not a route's guaranteed initial transfer size. Lazy loading, caching, request waterfalls, and actual production loading were not measured.

## Core Web Vitals status

The thresholds in scope are LCP ≤ 2.5 seconds, INP ≤ 200 ms, and CLS ≤ 0.1 at the 75th percentile for field data. No field source was available, so no pass/fail status can be assigned.

## Recommendations, not measured defects

1. Run repeatable mobile and desktop Lighthouse tests on the production homepage, India hub, product page, and locale pages after deployment.
2. Review the large emitted shared JavaScript chunks and confirm route-level code splitting in a network waterfall before choosing optimizations.
3. Collect field Core Web Vitals from Search Console/CrUX when sufficient traffic exists; retain date range and sample size.
4. Investigate the confirmed 320/360 px India hub overflow separately from performance.

No savings, score improvement, or ranking benefit is estimated.

