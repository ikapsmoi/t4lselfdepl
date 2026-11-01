# Next Release Acceptance Criteria

## P0

1. India query × page Search Console exports are attached and dated.
2. Every priority URL has a verified final canonical, indexing directive and sitemap entry.
3. Mysteryland slash/no-slash variants resolve without Tomorrowland cross-routing.
4. All legacy redirects terminate in the correct 200 URL with no chain.

## P1

1. `/tomorrowland/packages/` contains edition routing, package scope, inclusions/exclusions, India logistics and quote CTA.
2. `/tomorrowland/thailand/` directly supports the observed India package query and clearly separates future planning from ticket purchase.
3. `/tomorrowland/cost-from-india/` distinguishes official tickets from flight, accommodation, transport, insurance and service costs.
4. Belgium and Winter commercial ownership is supported by current evidence rather than stale pricing claims.
5. Titles and descriptions pass intent review and avoid repeated commercial keyword stuffing.

## Validation

- Production HTTP and redirect output captured.
- Raw HTML titles, descriptions, canonicals, robots, H1 and JSON-LD verified.
- Sitemap membership verified after release.
- `npm run test:seo` passes relevant tests.
- Mobile CTAs tested without sending real messages.
- Search Console query × page and 28/90-day comparisons captured after a complete measurement window.
- No database, payment, auth or customer-data changes.
