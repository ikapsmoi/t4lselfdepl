# Technical SEO Test Results

## Production HTTP audit

All priority Tomorrowland static routes returned HTTP 200. `/robots.txt` and `/sitemap.xml` returned HTTP 200.

The live sitemap index referenced festivals and festival-products child sitemaps. The festivals child sitemap contained 15 entries and the packages child sitemap contained 14 entries. Both Tomorrowland packages and Belgium packages were included.

## Metadata

Priority routes returned index/follow robots metadata and self-referencing canonical URLs. Titles and H1 values were unique in the tested response set.

## Redirects

- `/tomorrowland-india.html` → 301 `/tomorrowland/from-india/`
- `/tomorrowland/winter/2027/` → 301 `/tomorrowland/winter/`
- Mysteryland no-slash UUID → 301 slash UUID

## Tests

`npm run test:seo`

- Exit: 0
- Tests: 74
- Passed: 74
- Failed: 0
- Duration: 699.0513ms

## Limitations

- No URL Inspection API access.
- Final rendered product canonical was not fully verified.
- No production Lighthouse test was performed.
- Live JSON-LD syntax and mobile layout require browser-specific follow-up.
- `git diff --check` was clean in relevant output; source generated files may depend on deployment tooling.
