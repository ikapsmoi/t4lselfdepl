# Travel4life Tomorrowland SEO Architecture

## Scope and guardrails

This implementation improves crawlable Tomorrowland coverage for Indian travellers without claiming official Tomorrowland status, partnership, ticket availability, or rankings. Travel4life is represented as a travel and group-trip provider; Tomorrowland remains the independent festival brand.

The local repository did not expose `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`, so no live Tomorrowland product could be verified. No fictional product, price, Offer, review, scarcity signal, or availability statement was created.

## A. Website architecture

### Before

- Vite + React 18 client-rendered application.
- Manual hash routing in `src/App.tsx`.
- Crawlable product path: `/trips/:id`, backed by active Supabase records.
- Static Tomorrowland editorial page: `/tomorrowland-india.html`.
- Hash pages receive shared metadata and are intentionally not treated as separate indexable documents.
- Static and product sitemap index already existed.

### After

- Added static, crawlable Tomorrowland hub and guide routes under `/tomorrowland/`.
- Added shared static presentation in `/tomorrowland-seo.css`.
- Added visible breadcrumbs and BreadcrumbList JSON-LD to each POC page.
- Added a controlled Belgium package-enquiry page that does not pretend to be a live product.
- Added the `/trips` pathname mapping so existing product breadcrumbs resolve to `TripsPage`.
- Added `npm run seo:validate` for metadata, canonical, H1, JSON-LD, sitemap and internal-link checks.

## B. Tomorrowland URL map

| URL | Purpose | Indexability |
| --- | --- | --- |
| `/tomorrowland/` | India master hub | Indexable |
| `/tomorrowland/belgium/` | Belgium authority guide | Indexable |
| `/tomorrowland/belgium/packages/` | Package enquiry and product-readiness guide | Indexable, not a live offer |
| `/tomorrowland/winter/` | Winter authority guide | Indexable |
| `/tomorrowland/thailand/` | Thailand authority guide | Indexable |
| `/tomorrowland/cost-from-india/` | Cost methodology guide | Indexable |
| `/tomorrowland/from-india/` | India travel logistics guide | Indexable |
| `/tomorrowland-india.html` | Existing editorial guide | Indexable |
| `/trips/:id` | Existing active product route | Indexable only when active and quality-gated |

Future product URLs should remain `/trips/:id` until the database has a trustworthy persisted slug field and migration plan.

## C. Search-intent matrix

| Query family | Intent | Current page | Priority |
| --- | --- | --- | --- |
| Tomorrowland India, Tomorrowland package India | Broad/commercial | `/tomorrowland/` | High |
| Tomorrowland Belgium package India, travel from India | Destination/commercial | `/tomorrowland/belgium/` | High |
| Tomorrowland Winter package India | Destination/commercial | `/tomorrowland/winter/` | High |
| Tomorrowland Thailand package India | Destination/commercial | `/tomorrowland/thailand/` | High |
| Tomorrowland cost from India, trip cost | Cost research | `/tomorrowland/cost-from-india/` | High |
| How to go to Tomorrowland from India | Travel research | `/tomorrowland/from-india/` | High |
| Tomorrowland Belgium package details | Product/enquiry | `/tomorrowland/belgium/packages/` plus verified `/trips/:id` products | High |
| Tomorrowland from Mumbai/Delhi/Bengaluru | Origin research | Not yet published; create only with differentiated flight and product data | Medium |
| Tomorrowland Belgium 2027 package | Edition/product | Requires a real active edition/product record | High when inventory exists |
| Belgium vs Winter vs Thailand | Comparison | Not yet published | Medium |

## D. Product SEO matrix

No Tomorrowland product record was verified locally. The existing product engine remains the correct implementation surface:

- URL: `/trips/:id`
- Title: generated from the real trip title
- H1: generated from the real trip title
- Schema: `Product`, `Offer`, `BreadcrumbList`, related `ItemList`
- Canonical: `https://travel4life.net/trips/<id>`
- Indexability: active, quality-gated records only
- Required next improvement: add festival/destination/edition fields to the real product schema when those fields exist in the database

The Belgium package page intentionally links to the product flow without inventing a product.

## E. Content cluster map

```text
Tomorrowland India hub
├── Belgium guide
│   └── Belgium package enquiry
├── Winter guide
├── Thailand guide
├── Cost from India guide
├── Travel from India guide
└── Existing Tomorrowland India editorial guide
    └── Verified active Travel4life product pages when available
```

## F. Technical SEO report

| Area | Before | After |
| --- | --- | --- |
| Crawlable Tomorrowland hubs | One static guide | Seven new static POC pages plus existing guide |
| Metadata | Existing guide and client product metadata | Unique title, description, OG and canonical on each POC |
| Canonicals | Existing static/product controls | Added explicit canonical for every POC |
| Structured data | Article on existing guide; Product engine | Added Article/WebPage and BreadcrumbList JSON-LD to POCs |
| Sitemap | Static guide plus products | Added seven POC routes to static sitemap |
| Routing | `/trips` breadcrumb target fell back to home | `/trips` and `/trips/` render the Trips page |
| Automated SEO checks | No dedicated POC validator | `npm run seo:validate` |
| Rendering | Main app remains CSR | SEO POCs are static HTML and do not depend on React hydration |

Remaining technical risks include client-rendered product metadata, SPA fallback behavior on non-Netlify hosts, and the lack of a deployment-time sitemap generation step.

## G. Structured data report

- `CollectionPage`: Tomorrowland master hub.
- `Article`: Belgium, Winter, Thailand, cost and India travel guides.
- `WebPage`: Belgium package-enquiry page.
- `BreadcrumbList`: every new POC page.
- Existing `Organization`/`TravelAgency` and `WebSite`: root `index.html`.
- Existing `Product`/`Offer`/`ItemList`: verified active trip pages only.
- No `Event` schema was added because Travel4life is not the organiser and no specific event product was verified.
- No `FAQPage` schema was added to avoid marking generic editorial questions without a validated FAQ publishing workflow.

## H. Internal linking report

The hub links to all destination guides, cost, travel and package pages. Each destination guide links back to the hub, cost/travel guides and official festival sources. The package page links to the Belgium guide, cost guide, travel guide, official sales information and the existing trip discovery flow. The validator checks these internal paths and reports unknown routes.

## I. Indexability report

- POC pages: `index, follow`, self-canonical, static sitemap inclusion, HTTP 200 locally.
- Existing `/tomorrowland-india.html`: retained as indexable and sitemap-listed.
- Existing hash routes: unchanged and still not treated as standalone indexable pages.
- Existing `/trips/:id`: active product and quality-gated sitemap behavior retained.
- `/trips`: now resolves to the Trips page; it is still part of the SPA metadata model rather than a newly published SEO landing page.

## J. Mobile conversion report

- Static pages use a responsive single-column layout below 800px.
- Primary actions appear near the hero: planning, cost, active trips or WhatsApp enquiry.
- Secondary links preserve research flow between destination, cost and India logistics pages.
- Package pages use a factual enquiry CTA and do not use fake scarcity or countdowns.

## K. Remaining SEO opportunities

1. Run `npm run seo:sitemap` and `npm run seo:audit` in deployment with production Supabase credentials.
2. Add a real Tomorrowland product taxonomy to the trip data model: festival, destination, edition, weekend, package type and access inclusion.
3. Add stable slugs only after a migration and redirect strategy exists for existing UUID URLs.
4. Connect verified active Tomorrowland products to the hub and package page.
5. Add differentiated origin pages only when real departure and product data supports them.
6. Add comparison and accommodation guides only when they contain original, current information.
7. Add rendered-page checks for product metadata and JSON-LD after Supabase responses resolve.
8. Add deployment checks for 200 status, canonical, sitemap inclusion and broken links on the production preview.
9. Confirm official Travel4life social profiles before expanding `sameAs` values.
10. Submit the sitemap index and monitor Search Console coverage, canonical selection, CWV and query-level performance after deployment.

## Validation evidence

- `npm run seo:validate`: passed for 7 Tomorrowland pages.
- `npm run build`: passed.
- Local HTTP probes: all 7 new routes returned HTTP 200 and contained canonical markup on the running Vite server.
- Official source review: Belgium, Winter and Thailand terminology was checked against the official source pages supplied in the brief; copy remains original.
