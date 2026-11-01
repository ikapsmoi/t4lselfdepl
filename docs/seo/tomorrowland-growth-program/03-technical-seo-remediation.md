# Technical SEO Remediation

## P0 findings

| ID | Issue | Evidence | Required remediation | Acceptance criteria |
|---|---|---|---|---|
| TL-001 | Mysteryland trailing-slash variants | GSC includes slash and no-slash variants | Confirm preferred canonical, product UUID owner, sitemap entries and redirects | One HTTP 200 final URL, permanent redirect for alternate, one canonical, one sitemap entry |
| TL-002 | Product routes depend on client rendering | Trip SEO page updates metadata after browser fetch | Verify production raw HTML and indexation; pre-render priority products if necessary | Important content and canonical appear in HTML inspection or server output |
| TL-003 | URL slash canonical consistency | Several product URLs appear both forms | Standardize `productPath()` and internal links | No competing canonical or internal-link variants |
| TL-004 | No India query × page baseline | Workbook is property/global | Generate India-only GSC export | Recorded 28-day and 90-day query-page files |
| TL-005 | Priority query-page ownership is inferred | Separate workbook dimensions | Retrieve query × page export | Every priority query has exactly one documented owner |

## Validation checklist

- HTTP status and redirect destination for all priority URLs.
- Exactly one indexable canonical per URL.
- `robots.txt` points to the sitemap index.
- Static pages return their intended title, H1, description and JSON-LD in source HTML.
- Priority pages are present exactly once in the sitemap.
- Local links and fragment targets resolve.
- Mobile viewport has no horizontal overflow.
- Lighthouse field/lab issues are tracked separately and not treated as ranking evidence.
- Production output, not only Vite source, is inspected after release.

## Mysteryland authorization boundary

Do not implement a redirect or sitemap change until the canonical UUID is verified against the production trip record and internal links. The implementation must remain festival-specific and never redirect Mysteryland to Tomorrowland.
