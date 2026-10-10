# Travel4life Tomorrowland SEO Architecture

## Purpose and guardrails

This is an independent, India-focused travel-planning cluster. Travel4life is not presented as the festival organiser, an authorised ticket seller, or an official partner. Editorial pages do not promise rankings, invent product inventory, or publish unverified ticket prices, event dates, review scores, or availability.

Reviewed on **2 October 2026**. The supplied Search Console export is labelled `travel4life.net-Performance-on-Search-2026-09-23`. No Tomorrowland query row appeared in `Queries.csv`, and no Tomorrowland landing-page row appeared in `Pages.csv`. These exports therefore do not establish Tomorrowland demand or validate a city-specific page opportunity.

## URL ownership

One primary search-intent owner is recorded per indexable page in [`public/tomorrowland/search-intent-map.json`](../public/tomorrowland/search-intent-map.json). Its query families are editorial hypotheses, not Search Console volume or ranking data.

| Canonical URL | Search intent owner | Status |
| --- | --- | --- |
| `/tomorrowland/` | Broad India-first discovery and destination selection | Indexable hub |
| `/tomorrowland/belgium/` | Belgium destination planning from India | Indexable guide |
| `/tomorrowland/belgium/packages/` | Package enquiry and due-diligence checklist | Indexable; not a live offer |
| `/tomorrowland/winter/` | Winter destination and Alps travel planning | Indexable evergreen guide |
| `/tomorrowland/thailand/` | Thailand destination and travel planning | Indexable guide; official site currently describes the 2026 edition |
| `/tomorrowland/cost-from-india/` | Cost methodology and budget research | Indexable guide; no fixed quote |
| `/tomorrowland/from-india/` | India departure logistics and trip planning | Indexable guide |
| `/tomorrowland/compare/` | Destination comparison | Indexable guide |
| `/tomorrowland/accommodation/` | Accommodation and stay planning | Indexable guide |
| `/tomorrowland/group-travel/` | Group coordination | Indexable guide |
| `/tomorrowland/flights-from-india/` | Flight and routing research | Indexable guide |
| `/tomorrowland/visa-documents/` | Document preparation | Indexable checklist, not legal advice |
| `/tomorrowland/package-vs-independent/` | Package-versus-independent planning | Indexable guide |

### Consolidated URLs

- `/tomorrowland-india.html` permanently redirects to `/tomorrowland/from-india/`.
- `/tomorrowland/winter/2027/` permanently redirects to `/tomorrowland/winter/`. The year-specific page was consolidated because the current official page response available for review did not expose verifiable edition dates or prices.
- Both legacy documents remain minimal `noindex` fallbacks for hosts that do not process the repository's Netlify `_redirects` file. They use the destination canonical and redirect the browser.
- Neither redirected URL appears in the static sitemap or internal editorial links.

Do not publish Indian origin-city pages (Delhi, Mumbai, Bengaluru, or others) without Search Console evidence and distinct, current route or product information. A city name alone is not a meaningful page distinction.

## Current official-source review

Official source pages were checked on 2 October 2026:

- [Tomorrowland Belgium welcome](https://belgium.tomorrowland.com/en/welcome/) and [sales information](https://belgium.tomorrowland.com/en/sales-info/). The accessible sales page says sale timing and offered pass/package types depend on the sale. No stable price was verified.
- [Tomorrowland Winter welcome](https://winter.tomorrowland.com/en/welcome/) and [festival-ticket information](https://winter.tomorrowland.com/en/tickets/festival-ticket). The accessible ticket page describes regular and Comfort tickets and says the Comfort Festival Ticket includes general access and a lift and ski pass. No current edition dates or prices were verified from the pages retrieved.
- [Tomorrowland Thailand welcome](https://thailand.tomorrowland.com/en/welcome/) describes the announced 2026 event at Wisdom Valley. The [festival-pass page](https://thailand.tomorrowland.com/en/passes-packages/festival-passes) exposes pass information but did not provide verifiable numeric prices or sales status in the retrieved content. The [hotel-package page](https://thailand.tomorrowland.com/en/passes-packages/hotel-packages) is linked for current package terms.

Accordingly, the Belgium, Winter and Thailand guides link to official sources and tell readers to re-check current edition and sale information. Unverified 2026 Thailand prices/sold-out status and 2027 Winter dates/prices were removed. No source-free “current” price, currency conversion, or inventory claim should be reintroduced.

## Forty-point implementation and coverage checklist

This checklist describes the implemented page system and its limits; it is not a claim that every search query is already ranking.

| # | Area | Result |
| ---: | --- | --- |
| 1 | India-first Tomorrowland hub | Implemented |
| 2 | Belgium travel guide | Implemented; no unverified edition pricing |
| 3 | Winter travel guide | Implemented as evergreen; edition data deferred |
| 4 | Thailand travel guide | Implemented; links to current official pass/package pages |
| 5 | India trip-cost methodology | Implemented as components, not a fabricated quote |
| 6 | India travel-planning guide | Implemented |
| 7 | Flight-planning guide | Implemented; no invented routes or fares |
| 8 | Visa/document checklist | Implemented; directs travellers to official authorities |
| 9 | Accommodation guide | Implemented as a due-diligence checklist |
| 10 | Group-travel guide | Implemented |
| 11 | Destination comparison | Implemented; readers are sent to official destination sources |
| 12 | Package-versus-independent decision support | Implemented |
| 13 | Belgium package enquiry checklist | Implemented; clearly not a live offer |
| 14 | One primary intent owner per page | Recorded in the machine-readable intent map |
| 15 | Related query families | Recorded as hypotheses without volume claims |
| 16 | URL-to-canonical consistency | Enforced by `npm run seo:validate` |
| 17 | Duplicate India-guide consolidation | `/tomorrowland-india.html` redirects to `/from-india/` |
| 18 | Year-specific Winter consolidation | Unverified `/winter/2027/` redirects to `/winter/` |
| 19 | Origin-city landing pages | Deliberately not created; no GSC evidence or differentiated route data |
| 20 | Search Console query evidence | Supplied exports contain no matching Tomorrowland rows |
| 21 | Search volume and ranking statements | None invented or inferred from missing rows |
| 22 | Ticket prices | Unverified amounts removed; official sale links provided |
| 23 | Ticket availability and sold-out claims | Unverified statements removed |
| 24 | Edition dates | Not asserted where the current official source could not verify them |
| 25 | Package prices and live inventory | Not invented; requires a real, active product record |
| 26 | Official partnership and reseller claims | Explicitly disclaimed; no affiliation claimed |
| 27 | Scarcity and countdowns | Not used |
| 28 | Editorial reviews and ratings | No fabricated review/rating structured data |
| 29 | Event, Offer and Product schema on guides | Excluded from editorial pages |
| 30 | Visible content and schema type | Checked against the mapped Article/WebPage/CollectionPage type |
| 31 | Unique title and description | Validated for all mapped routes |
| 32 | One H1 and content depth | Validated; minimum 150 visible words per mapped route |
| 33 | Open Graph social card | Uses a first-party, original 1200×630 PNG with alt text |
| 34 | Twitter large-image metadata | Uses the same first-party image; unverified account handles removed from root metadata |
| 35 | Festival-photo rights | No unverified Tomorrowland event photo is used by the editorial social cards |
| 36 | Image attribution status | The new planning illustration is original; no external photo attribution is implied |
| 37 | Static sitemap ownership | Includes the canonical guide routes; excludes redirects |
| 38 | Sitemap index and robots discovery | Sitemap index points to static/product sitemaps; `robots.txt` references the index |
| 39 | Internal route/link integrity | Checked by `npm run seo:validate` |
| 40 | Product rendering and live SEO evidence | Not fully verified: product metadata is set client-side and requires production-like rendering checks |

## Internal topical-readiness scorecard

The score is an internal implementation heuristic only. It is not a Google metric, ranking estimate, traffic forecast, or quality rating by a search engine. Scale: **0** = missing; **1** = partial or externally unverifiable; **2** = implemented and locally verifiable.

| Dimension | Score / 2 | Evidence and remaining work |
| --- | ---: | --- |
| Query ownership and page separation | 2 | Thirteen canonical editorial routes have distinct primary intents in the JSON map. |
| Topic coverage for India-first planning | 2 | Destination, cost, logistics, flights, documents, accommodation, group and package-choice guides exist. |
| Cannibalisation and redirects | 2 | Duplicate India URL and unverified year route are consolidated and excluded from the sitemap. |
| Static technical SEO | 2 | Automated checks cover canonical, metadata, content, schema, image metadata, links and sitemap membership. |
| Claim/source freshness | 1 | Current official links are present; dynamic sales details cannot be verified from the retrieved official pages. |
| Search Console demand validation | 1 | The supplied export has no Tomorrowland rows; no demand conclusion can be drawn. |
| Live Tomorrowland product evidence | 1 | No active Tomorrowland product could be verified from local data without production Supabase access. |
| Brand and structured-data integrity | 2 | Editorial pages avoid unsupported Product/Offer/Event/Review markup and disavow official affiliation. |
| Image and social sharing readiness | 2 | Original first-party PNG, Open Graph dimensions/alt text and matching Twitter card metadata are checked locally. |
| Production rendering and monitoring | 1 | Static build/preview can be checked locally; production redirect behavior, product rendering and Search Console coverage remain deployment checks. |
| **Total** | **16 / 20** | **Internal implementation-readiness score only; not a ranking signal.** |

## Technical and product SEO boundaries

- `public/sitemap.xml` is the index; `public/sitemap-static.xml` contains editorial canonicals; `public/sitemap-products.xml` is produced from quality-gated active trip records.
- `scripts/seo-validate.mjs` does not read environment files or require Supabase credentials. `npm run seo:sitemap` and `npm run seo:audit` do require production Supabase settings and were not run.
- No Tomorrowland database product was verified in this task. Do not add a product CTA that implies availability until an active record's dates, price, destination, inclusions and status have been checked.
- `TripSeoPage` currently fetches trip data in the browser and updates title, canonical and JSON-LD after the request. Search engines that do not execute the application may see only the SPA shell's initial metadata. Pre-rendering or server rendering real active product details remains a separate deployment/data task.
- The repository's `_redirects` rules provide HTTP 301s on hosts that support the Netlify format. Verify production status codes and canonical selection after deployment.

## 10 October 2026 destination-page refresh

The Thailand, Winter and Belgium guides now open with distinct, destination-specific WhatsApp enquiry actions. The copy asks what travel arrangements may be available; it does not claim a live Travel4life package, ticket access, fixed price, date, room, or availability. Each page adds a cost-component checklist, a three-step enquiry checklist and answers about what an enquiry or written offer does and does not confirm. Existing official-source links, canonical URLs, editorial schema types and legacy redirects are preserved.

| Page | Title | Description | H1 | Primary action |
| --- | --- | --- | --- | --- |
| Thailand | `Tomorrowland Thailand Package Planning from India \| Travel4life` | Planning Tomorrowland Thailand from India? Check official pass details, travel-cost factors and booking terms, then ask Travel4life what travel options may be available. | Plan Your Tomorrowland Thailand Trip from India | Ask about Thailand travel options |
| Winter | `Tomorrowland Winter Trip Planning from India \| Travel4life` | Plan a Tomorrowland Winter trip from India with official ticket links, Alps travel checks and cost factors. Ask Travel4life about travel options for your dates. | Plan Your Tomorrowland Winter Trip from India | Ask about Winter travel options |
| Belgium | `Tomorrowland Belgium Travel Planning from India \| Travel4life` | Plan Tomorrowland Belgium from India with official sales links, budget factors and travel checks. Ask Travel4life what travel options may be available for your dates. | Plan Your Tomorrowland Belgium Trip from India | Ask about Belgium travel options |

The floating WhatsApp action now uses the same route-specific message as the injected contact panel, carries non-sensitive destination/page context and records click events through the existing Supabase analytics path. Clicks are tracked as `contact_whatsapp_click` and `quote_request_click`; neither is a confirmed lead or booking. No enquiry form or submission event was added because this site does not currently provide a verified server-backed Tomorrowland enquiry flow. The mobile floating action spans the phone viewport's safe content width and the page reserves bottom space for it.

### Search Console baseline supplied with the implementation brief

The brief refers to `travel4life.net-Performance-on-Search-2026-10-10.xlsx`, but that workbook is not present in the workspace. The values below are transcribed from the brief and have **not** been checked against the workbook sheets. The only local Search Console export is labelled 23 September 2026 and its documentation says it contains no Tomorrowland query or landing-page rows. These figures are therefore a provisional user-supplied baseline, not independently verified Search Console evidence.

| Landing page or segment | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| India | 13 | 229 | 5.68% | 12.13 |
| `/tomorrowland/winter/` | 2 | 137 | 1.46% | 8.31 |
| `/tomorrowland/cost-from-india/` | 2 | 62 | 3.23% (calculated) | 16.79 |
| `/tomorrowland/thailand/` | 4 | 30 | 13.33% | 8.13 |
| `/tomorrowland-india.html` | 1 | 34 | 2.94% (calculated) | 13.79 |
| `/tomorrowland/belgium/` | 1 | 25 | 4.00% (calculated) | 34.12 |
| `/tomorrowland/` | 0 | 15 | 0% | 48.00 |
| `/tomorrowland/belgium/packages/` | 0 | 11 | 0% | 53.55 |

The supplied CTRs are consistent with clicks divided by impressions; the three omitted CTRs above are calculated. The brief separately reports 26 clicks and 888 impressions in the Chart tab and 437 impressions in Queries. These are different report dimensions and must not be added together or treated as interchangeable totals. Its Thailand query example (3 clicks, 7 impressions, position 8.71) is also a small-sample observation. The workbook must be supplied before sheet-level analysis, query-to-page ownership checks, or a reproducible baseline report can be claimed.

The live production validator was run before this code change and reported 220 issues, concentrated on UUID `/trips/{id}` sitemap URLs: Netlify returns 301 to `/trips/{id}/`, while the old sitemap URL and rendered canonical omitted the trailing slash. The shared `productPath()` builder now emits the slash form for product canonicals, links and sitemap entries. The final local production preview passed the same validator for 78 canonical indexable URLs across 11 child sitemaps and the legacy sitemap endpoints. Production has not yet been deployed, so the live sitemap/product discrepancy remains pending release and a post-deployment rerun.

### Validation status for this refresh

- Locally implemented and validated: route-specific snippets and enquiry copy, canonical/robots/schema/sitemap checks, and non-sensitive contact-click context.
- Passed locally: `npm run seo:validate`, `npm run seo:validate:sitemaps`, `SITE_URL=http://127.0.0.1:4173 npm run seo:validate:production`, all 25 focused SEO tests, changed-file lint, production build, and production-preview mobile/desktop layout checks at 390px and 1440px.
- Live pre-deployment checks: the three destination landing pages returned HTTP 200; `/robots.txt` returned HTTP 200 `text/plain`; `/sitemap.xml` returned HTTP 200 XML. The live product sitemap issue above remains unresolved until deployment.
- Not performed: production deployment, post-deployment HTTP/redirect checks, Search Console API retrieval, Analytics debug-view confirmation, or a real lead submission. These require release authorization, the missing workbook/access, and an approved test lead flow respectively.

## 10 October 2026 Phase 2 verification

### Production evidence

All six requested landing-page URLs returned HTTP 200 directly, retained their requested canonical URL, exposed one distinct H1, and included visible guide copy in the raw HTML. Each was present exactly once in the live sitemap index's 78-URL set (11 child sitemaps). The Thailand, Winter and Belgium production titles/H1s still differ from the newer destination refresh in this repository, so that refresh has not been deployed. The three destinations currently use a “from India” guide title, while local code has the newer destination-specific planning snippets.

The live robots file allows crawling (`User-agent: *`, `Allow: /`). Each target has `index, follow` metadata. The legacy India URL and both Winter 2027 URL forms return HTTP 301 to their evergreen owners. The live sitemap's 55 UUID trip URLs omit trailing slashes; direct requests return HTTP 301 to the slash version, and the rendered product canonical also omits the slash. The local `productPath()` fix has not been deployed.

At a 390 × 844 mobile viewport, all six pages rendered without horizontal overflow; the fixed WhatsApp action was visible near the bottom of the viewport. The six pages had no observed browser page errors or failed requests. All same-site links discovered on these pages returned HTTP 200. The live static pages have no enquiry forms. Phone and email anchors resolve to the configured `+91 9511446642` and `info@travel4life.net`; WhatsApp links use the matching number. This verifies markup/targets, not that a call connected, an email was delivered, or a WhatsApp conversation was completed.

The public PageSpeed Insights endpoint returned HTTP 429, so no Lighthouse score or field Core Web Vitals result could be established. Browser navigation timings from a single audit session are diagnostic observations only, not a performance pass. Structured data on the six static pages is crawlable JSON-LD (Article/BreadcrumbList or WebPage/BreadcrumbList); no test here claimed validation by Google's Rich Results Test.

### Confirmed code fixes in this phase

- The build-time contact injector now adds `contact_whatsapp_click`, route context, and—only for enquiry/quote-labelled actions—the quote event to native WhatsApp anchors. It also makes these links open safely in a new tab. This is a local code fix; production pages still need deployment and a Supabase/analytics-debug verification.
- The live pages had tracked injected contact-panel links, but their original header, floating and page-authored WhatsApp anchors did not consistently carry click-event attributes. The build now normalizes Tomorrowland WhatsApp links only; other site destinations retain their existing link behavior.
- The Belgium package page now has the missing `#product` anchor, and the cost guide's “Access”, “Flights” and “Stay” links now target actual sections. SEO validation checks local fragment references to prevent regression.
- Focused tests cover labelled versus generic WhatsApp links; the SEO validator checks every generated WhatsApp anchor for contact-event context and checks local fragment destinations.

No contact form was added. There are no form-start, successful-submission, form-error or qualified-enquiry events for these static pages. Existing click analytics only record link-click intent and must not be presented as leads or bookings. The analytics payload uses page path and non-sensitive route context and does not include form fields, phone numbers, email addresses or WhatsApp message text.

### Data and deployment boundary

No Search Console workbook for 10 October or authenticated Search Console API access is available in the workspace. The September 23 CSV export is stale for this audit and is not a valid 28-day or 3-month baseline. Request fresh Search Console exports split by date range, query, page, country and device; no query opportunity ranking is inferred here. Deployment, analytics debug-view, CRM qualification and PageSpeed field data remain unverified.

## Validation

Run:

```text
npm run seo:validate
npm run build
```

The validator checks all thirteen map-owned editorial documents, unique metadata, canonical and robots directives, minimum visible text, JSON-LD parsing/types, official-source links declared by the intent map, social image and alt metadata, local routes, redirects, sitemap index references and static sitemap membership.

After deployment, verify the two permanent redirects, submit `https://travel4life.net/sitemap.xml` in Search Console, inspect representative static and active-product URLs, and compare actual query/page rows over a sufficiently long period. Do not treat a technical pass or this internal score as a ranking guarantee.

## 10 October 2026 Phase 3 verification

### Live release and technical checks

The Phase 2 revision `a27e243c1a67418a370cbcb319232a2d30a4811c` is present on `origin/main`, and its static-page changes are now visible in production. This supersedes the pre-release observations above. The six priority landing pages each returned HTTP 200, a self-canonical, `index, follow`, one destination-appropriate H1, crawlable HTML copy, and one live sitemap entry. The sitemap index and all 11 child XML sitemaps parsed; the combined set contained 78 unique URLs, including all six priority pages and no UUID product URLs missing their trailing slash. Requests to a no-slash product URL redirect to the slash canonical with HTTP 301.

`robots.txt` returned HTTP 200 `text/plain`, allows crawling, and points to the sitemap index. The six-page check found working phone, email and WhatsApp link targets in the source HTML and all page-authored WhatsApp links carried click/context instrumentation. This verifies markup and configured targets, not delivery of an email, connection of a call, a completed WhatsApp conversation, or Search Console indexing. No live form is present in production yet. Production mobile was previously inspected at 390 × 844 without horizontal overflow; performance lab/field data remains unverified because the public PageSpeed request returned HTTP 429.

### Inventory evidence and controls

An authenticated-free read using the configured public Supabase client returned 168 active trip rows, including eight whose public trip fields identify Tomorrowland. Six passed the current local product-quality predicate and two Winter records failed it; the latter advertise `L'Île-d'Yeu, Pays de la Loire` as their location and their product URLs return 404. They are not in the sitemap, so the quality gate is preventing those rows from being published as indexable inventory. Do not publish or repair those business records without the product owner's verified location and offer details.

Five of the eight Tomorrowland rows have a conflict between `price_per_person` and numeric `itinerary.price`. The product renderer uses `price_per_person` consistently for the visible price and `Product`/`Offer` schema, but the other stored field disagrees; the available evidence does not establish which value the owner intends. Three such conflicting rows currently have indexable product URLs. Confirm the source of truth with the business owner before changing these records or presenting any price as a verified offer. This phase does not alter inventory, product prices, availability, ticket claims, or schema.

### Search Console file received

The uploaded `travel4life.net-Performance-on-Search-2026-10-10 (1).xlsx` is a Search type **Web, Last 7 days** export covering **30 September–6 October 2026**, not the requested 28-day and 3-month reports. It contains separate Query, Page, Country and Device dimensions, not a query × page × device report filtered to India. Its data are useful for a short-window directional read only:

| Requested intent cluster | Query rows in export | Clicks | Impressions | CTR | Impression-weighted position | Strongest existing owner / separate page evidence |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| A. Thailand packages from India | 4 | 3 | 15 | 20.0% | 9.46 | Thailand; its page separately had 4 clicks / 30 impressions, 13.33% CTR, position 8.13 |
| B. Winter packages and cost | 9 | 0 | 19 | 0% | 11.00 | Winter; separately 2 / 137, 1.46% CTR, position 8.31 |
| C. Belgium packages from India | 5 | 0 | 5 | 0% | 48.60 | Belgium; 1 / 25, 4% CTR, position 34.12; packages page 0 / 11, position 53.55 |
| D. General Tomorrowland travel from India | 7 | 1 | 24 | 4.17% | 9.79 | From-India hub; separately 0 / 8, position 18.12; broad hub 0 / 15, position 48.00 |
| E. Cost, itinerary, accommodation and planning | 27 | 1 | 64 | 1.56% | 21.70 | Cost-from-India; separately 2 / 62, 3.23% CTR, position 16.79 |

Cluster assignment is based on terms in each exported Tomorrowland query (destination first, then cost/planning terms); metrics sum the visible query rows and are not India-only. The exact `tomorrowland thailand packages from india` row had 3 clicks, 7 impressions, 42.86% CTR and average position 8.71; its page cannot be attributed from this workbook. The India Country row is 13 clicks / 229 impressions, 5.68% CTR and position 12.13 for the whole property. The Device rows are also property-wide: Mobile 18 / 616 (2.92%, position 8.28), Desktop 8 / 266 (3.01%, position 11.41), Tablet 0 / 6. No query, page, or destination performance can be assigned to India mobile from these separate dimensions. There is no prior-period comparison in this export.

For the next decision, keep Thailand as the strongest commercial owner; improve Winter's snippet and first-screen answer only with a measurement window and the longer GSC baseline; strengthen Belgium's distinct package and destination evidence before creating more URLs; and retain the existing India hub and cost guide as owners rather than adding overlapping pages. Treat observed impressions as a limited sample, not proof of demand or a ranking promise.

### Enquiry and analytics status

The static priority pages did not have a genuine server-backed form. The configured browser Supabase client is not a lead backend, the existing mock notification function does not persist enquiries, and the public analytics table is not a safe place for personal details. The Supabase CLI and deployment credentials are unavailable in this environment, so this phase cannot install a migration or publish a secure submission endpoint.

The three local destination pages now have a mobile-friendly, optional-detail WhatsApp message builder. It only collects a departure-city choice, month and traveller count; it does not ask for a name, email, phone number, budget or free-form message. Details are not stored by the website or sent to analytics. A click opens an unsent WhatsApp draft that the visitor reviews and explicitly sends. The UI does not claim that opening WhatsApp is a form submission, lead, booking or confirmed quote. Existing analytics records `contact_whatsapp_click`, quote-click intent, `form_start`, and client-side `form_error` with route context only. No successful-submission or qualified-lead event is emitted because this is not a server-backed form. Production remains unchanged for this new builder until an authorized release.

### 30-day action plan

| Timing / task | Page or system | Evidence | Expected impact | Effort / dependency | Success measure |
| --- | --- | --- | --- | --- | --- |
| Days 1–3: reconcile Tomorrowland product fields and eligibility | Thailand, Belgium, Winter inventory | Eight active rows; two invalid Winter locations; five conflicting price fields | Prevent inaccurate offers/schema and resolve missing inventory pages | Medium; business owner confirms destination, dates, price, currency, inclusions and availability | Zero active Tomorrowland rows with unresolved location/price conflicts; generated pages and schema match approved source data |
| Days 1–5: provide 28-day and 3-month India Search Console reports | All six priority URLs | Current file is only 7 days and has no India × query/page/device combination | Establish a comparable SEO baseline and avoid decisions on tiny samples | Low; Search Console export or authorized API | Canonical-page and query baselines for India, device, period and previous-period comparison |
| Days 1–7: approve and deploy secure enquiry storage | Three destination pages, Supabase | No suitable table/endpoint, CLI/access token or verified notification path | Enable persisted, retrievable enquiries and accurate submission/error measurement | High; project owner supplies authorized Supabase deployment access, data-retention/notice decision and lead recipient/workflow | Approved test enquiry stored once; errors are honest; no PII reaches analytics; recipient can retrieve/respond |
| Days 7–14: review Thailand CTR and the Winter snippet/first screen | Thailand and Winter | Seven-day exact Thailand query 3/7 at 8.71; Winter page 2/137 at 1.46% | Improve relevance without repeated title changes | Low–medium; 28-day baseline and a fixed test window | Query/page/device CTR and organic clicks versus the saved baseline after 28 days |
| Days 14–30: improve Belgium authority and internal links; review business outcomes | Belgium and packages; analytics/CRM | Belgium page position 34.12 and packages 53.55; no qualified enquiry or booking attribution | Improve intent ownership and measure progression beyond contact clicks | Medium; longer GSC window, approved package facts, CRM qualification process | Belgium non-brand impressions/clicks and separately counted WhatsApp clicks, stored enquiries, qualified enquiries and booking progression |
