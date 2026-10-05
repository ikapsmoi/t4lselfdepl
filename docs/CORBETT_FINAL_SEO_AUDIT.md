# Jim Corbett Final SEO Red-Team and Launch Lock

Audit date: 2026-10-05

This is a readiness assessment, not a ranking prediction. No search position, Page 1 result, or commercial result is guaranteed. The assessment uses repository evidence and local build checks; no Search Console export, live Google result set, deployed-server crawl, or field verification of the resort workbook was supplied.

## Pre-audit baseline

Captured before this audit changed indexation or routing:

| Area | Baseline evidence |
|---|---|
| Corbett routes | Five static HTML routes: `/jim-corbett/`, `/jim-corbett/resorts/`, `/jim-corbett/weddings/`, `/jim-corbett/mice/`, `/jim-corbett/travel4life/`. |
| Indexable URLs | All five registry entries were `approved` and `indexable: true`; each page had a self-canonical and `index, follow`. |
| Corbett sitemap | `sitemap-corbett.xml` listed all five URLs; the root sitemap index referenced it. |
| Robots | `robots.txt` allowed all crawlers and referenced the sitemap index. No Corbett-specific block was present. |
| Page metadata/schema | All five routes had titles, descriptions, self-canonicals and JSON-LD; the Corbett validator passed. |
| Internal links | The hub links to all four subordinate pages. Each subordinate page links back to the hub; event pages cross-link to the relevant planning paths. |
| Resort entities | 100 source rows preserved. Zero records are verified; enrichment queue average completeness was 21/100; zero basic, wedding, MICE or price pages were ready for review. |
| Search Console | An admin CSV-import/local-browser-history feature exists, but no repository snapshot or imported account data was supplied for this audit. Ranking/query conclusions cannot be verified. |
| Performance | `build:app` passed in the prior implementation. Corbett CSS was 35,019 bytes and JS 9,087 bytes. No Lighthouse/PageSpeed or field Core Web Vitals result was available. |
| Redirects | Three Tomorrowland redirects and host/protocol redirects existed. No explicit Corbett redirect or Corbett missing-route 404 rule existed. |
| 404 behavior | `_redirects` ended with `/* /index.html 200`; this can send unknown URLs through the SPA shell and create soft-404 risk. There was no Corbett-specific 404 handling. |
| Prior score semantics | The generated route check score was 100/100 for every page. It checks basic HTML/metadata/content-presence criteria; it is not a Page-1 score and does not validate original, useful, factual destination content. |

### Baseline metadata, schema, and link graph

| Route | Title | Meta description | Canonical | Baseline robots | Primary schema | Meaningful Corbett links |
|---|---|---|---|---|---|---|
| `/jim-corbett/` | Jim Corbett Travel Guide, Resorts & Event Planning \| Travel4life | Plan a Jim Corbett stay with a searchable resort guide, transparent workbook rate references, wedding planning and corporate offsite support from Travel4life. | Self | `index, follow` | `CollectionPage`, `Place`, `BreadcrumbList` | resorts, weddings, MICE, Travel4life |
| `/jim-corbett/resorts/` | Jim Corbett Resorts: Search 100 Workbook References \| Travel4life | Search 100 Jim Corbett resort names and compare seasonal rate references from a supplied workbook. Check all prices, locations, facilities and availability before booking. | Self | `index, follow` | Generated `CollectionPage`, `ItemList`, `BreadcrumbList` | hub, weddings, MICE |
| `/jim-corbett/weddings/` | Jim Corbett Destination Weddings & Venue Planning \| Travel4life | Plan a Jim Corbett destination wedding with a clear guest brief, rooming plan, event flow and venue checks. Request a tailored shortlist from Travel4life. | Self | `index, follow` | `Service`, `FAQPage`, `BreadcrumbList` | hub, resorts, MICE |
| `/jim-corbett/mice/` | Jim Corbett MICE, Corporate Offsites & Team Retreats \| Travel4life | Plan a Jim Corbett corporate offsite or MICE brief around headcount, meeting setup, rooms, meals and group logistics. Request a tailored availability check. | Self | `index, follow` | `Service`, `FAQPage`, `BreadcrumbList` | hub, resorts, weddings |
| `/jim-corbett/travel4life/` | Travel4life Corbett Trip Planning \| How We Help | Learn how Travel4life helps structure Jim Corbett resort, wedding and corporate offsite enquiries, and what is verified before a proposal. | Self | `index, follow` | `Service`, `BreadcrumbList` | hub, resorts, weddings, MICE |

Each route has a distinct title, meta description, canonical and page-specific structured data. The exact description text is in each route’s HTML source and is covered by the Corbett SEO validator. No redirect canonical or cross-route canonical was found in the registry. Production resolution of every canonical still needs a deployed HTTP crawl.

## Page-1 readiness score

**Baseline: 52/100 — AMBER: IMPROVE BEFORE SCALE.**

**Post-lock: 55/100 — AMBER: IMPROVE BEFORE SCALE.**

The small score change is for narrowing indexation to pages with a credible evidence basis, not for adding pages or claiming ranking improvement. The score is a conservative editorial assessment across the required dimensions. Scores are not impressions, search volumes, rankings, or measured conversion rates.

| Dimension | Weight | Baseline | Post-lock | Evidence and scoring reason |
|---|---:|---:|---:|---|
| Technical SEO | 15 | 13 | 13 | Self-canonicals, page metadata, schema, responsive HTML and a passing validator. Live HTTP/canonical resolution and deployed redirects still need a production crawl. |
| Indexation & crawlability | 10 | 4 | 7 | Baseline indexed a workbook-only resort directory. Post-lock removes that directory from the sitemap and adds a Corbett missing-route 404 rule. Google indexing and production-server status remain unverified. |
| Search-intent architecture | 10 | 5 | 5 | Five distinct intents exist, but package, safari, detailed itinerary and origin queries are not fully answered with first-party Corbett logistics. No query-level Search Console evidence was supplied. |
| Content quality & helpfulness | 15 | 6 | 6 | Wedding and MICE briefs contain useful checklists and safety caveats. Destination-specific, verifiable choice data and confirmed offers are absent; additional word count would not solve this. |
| Entity/topic authority | 10 | 3 | 3 | 100 source-listed names exist, but no property location, operating status, facilities, imagery, or local relationships have been verified. |
| Internal linking | 10 | 8 | 8 | The five routes form a hub-and-spoke structure with contextual cross-links. No package/safari/from-origin destinations exist; no need to create them without evidence and differentiated content. |
| Resort/inventory data quality | 10 | 1 | 1 | 0/100 properties are verified; the source has no rate date, occupancy, meals, taxes, room type, facilities, capacity, location, imagery or availability. |
| Structured data | 5 | 4 | 4 | Page-specific `Service`, `CollectionPage`/`ItemList` where appropriate, and breadcrumbs are present. Structured data cannot stand in for verified underlying facts. |
| E-E-A-T / trust | 5 | 2 | 2 | Real phone/email and clear enquiry/pricing caveats are present. Legal business identity, accountable editorial ownership, and substantiated destination experience are not established in this evidence set. |
| UX / conversion | 5 | 4 | 4 | Responsive layouts, enquiry forms, and phone/email/WhatsApp actions exist. Contact completion and conversion performance are not measured here. |
| Performance | 5 | 2 | 2 | Build and responsive smoke checks pass; real-user CWV and Lighthouse/PageSpeed data are absent. |
| **Total** | **100** | **52** | **55** | **AMBER — improve evidence, intent coverage and measurement before scaling.** |

### Page status and indexation decisions

| URL | Status | Decision | Reason |
|---|---|---|---|
| `/jim-corbett/` | AMBER — IMPROVE BEFORE SCALE | Keep indexable | Useful destination hub and complete route structure; needs verified local logistics/experience evidence and stronger first-party detail. |
| `/jim-corbett/resorts/` | RED — DO NOT PUSH / DO NOT INDEX | `noindex, follow`; remove from sitemap | The 100 names and rate references are unverified. The page cannot yet support a reliable resort choice, location/facilities comparison, or current-price decision. Keep it available to users and in the enrichment workflow. |
| `/jim-corbett/weddings/` | AMBER — IMPROVE BEFORE SCALE | Keep indexable | Strong brief and venue due-diligence guidance, with explicit statement that no venue/capacity is confirmed. Add only verified, date-appropriate supplier information when obtained. |
| `/jim-corbett/mice/` | AMBER — IMPROVE BEFORE SCALE | Keep indexable | Useful corporate brief and technical/commercial checklists; no verified meeting inventory or venue capacity. Claims remain framed as planning assistance, not confirmed property capabilities. |
| `/jim-corbett/travel4life/` | AMBER — IMPROVE BEFORE SCALE | Keep indexable | Clearly explains the enquiry/verification process; legal business identity and named editorial ownership are not evidenced here. |

GREEN is not assigned to any page. RED means do not index/push the page as an organic landing page. AMBER pages may remain indexable when their claims are accurate and caveated, but should not be scaled as a substitute for verified experience or evidence.

## Query map and ownership

Commercial value labels below are qualitative intent estimates, not measured search volume. No Google result-page review or Search Console query export was provided. Page quality refers to the current landing page's ability to satisfy the query, not its Google position.

| Query | Intent | Primary URL | Supporting URL | Commercial value | Current quality |
|---|---|---|---|---|---|
| Jim Corbett | Destination discovery | `/jim-corbett/` | `/jim-corbett/travel4life/` | Medium | AMBER |
| Jim Corbett packages | Package research/enquiry | `/jim-corbett/` | `/jim-corbett/resorts/` (RED; source references only) | High | AMBER / gap |
| Jim Corbett resorts | Resort discovery/comparison | `/jim-corbett/resorts/` | `/jim-corbett/` | High | RED — noindex |
| Jim Corbett hotels | Accommodation discovery | `/jim-corbett/resorts/` | `/jim-corbett/` | High | RED — noindex |
| Jim Corbett resort booking | Booking/availability | `/jim-corbett/resorts/` | `/jim-corbett/travel4life/` | High | RED — noindex; no live inventory |
| Jim Corbett resort prices | Price comparison | `/jim-corbett/resorts/` | `/jim-corbett/travel4life/` | High | RED — noindex; undated source prices |
| best resorts in Jim Corbett | Comparative research | `/jim-corbett/resorts/` | `/jim-corbett/weddings/` | High | RED — no verified comparison basis |
| Jim Corbett luxury resorts | Accommodation research | `/jim-corbett/resorts/` | `/jim-corbett/` | High | RED — category labels unverified |
| Jim Corbett family resorts | Suitability research | `/jim-corbett/resorts/` | `/jim-corbett/` | High | RED — no family/facility data |
| Jim Corbett resorts for couples | Suitability research | `/jim-corbett/resorts/` | `/jim-corbett/` | Medium | RED — no suitability data |
| Jim Corbett weekend package | Trip package enquiry | `/jim-corbett/` | `/jim-corbett/resorts/` | High | AMBER / package detail gap |
| Jim Corbett weekend from Delhi | Origin trip planning | `/jim-corbett/` | `/jim-corbett/resorts/` | High | AMBER / origin logistics gap |
| Jim Corbett package from Delhi | Origin package enquiry | `/jim-corbett/` | `/jim-corbett/travel4life/` | High | AMBER / package and origin gap |
| Jim Corbett safari | Activity planning | `/jim-corbett/` | `/jim-corbett/resorts/` | High | AMBER / permit and route detail gap |
| Jim Corbett safari packages | Package/activity enquiry | `/jim-corbett/` | `/jim-corbett/resorts/` | High | AMBER / no live safari inventory |
| Jim Corbett wedding | Event planning/enquiry | `/jim-corbett/weddings/` | `/jim-corbett/resorts/` | High | AMBER |
| Jim Corbett wedding resorts | Venue comparison | `/jim-corbett/weddings/` | `/jim-corbett/resorts/` | High | AMBER / no verified venues |
| Jim Corbett wedding cost | Event budget enquiry | `/jim-corbett/weddings/` | `/jim-corbett/travel4life/` | High | AMBER / no verified costs |
| Jim Corbett destination wedding | Event planning | `/jim-corbett/weddings/` | `/jim-corbett/resorts/` | High | AMBER |
| Jim Corbett MICE | Corporate event planning | `/jim-corbett/mice/` | `/jim-corbett/resorts/` | High | AMBER |
| Jim Corbett corporate offsite | Corporate group planning | `/jim-corbett/mice/` | `/jim-corbett/travel4life/` | High | AMBER |
| Jim Corbett corporate packages | Corporate package enquiry | `/jim-corbett/mice/` | `/jim-corbett/` | High | AMBER / no confirmed package |
| Jim Corbett resorts for groups | Group accommodation discovery | `/jim-corbett/resorts/` | `/jim-corbett/mice/` | High | RED — no room/capacity evidence |
| Jim Corbett resorts near safari | Location-based accommodation | `/jim-corbett/resorts/` | `/jim-corbett/` | High | RED — no verified locations/gates |
| Jim Corbett trip cost | Trip budgeting | `/jim-corbett/` | `/jim-corbett/resorts/` | High | AMBER / no current component pricing |
| Jim Corbett itinerary | Itinerary planning | `/jim-corbett/` | `/jim-corbett/travel4life/` | Medium | AMBER / limited local itinerary detail |
| Jim Corbett from Delhi | Origin logistics | `/jim-corbett/` | `/jim-corbett/travel4life/` | High | AMBER / origin-specific content gap |
| Jim Corbett from Noida | Origin logistics | `/jim-corbett/` | `/jim-corbett/travel4life/` | Medium | AMBER / no differentiated origin facts |
| Jim Corbett from Gurgaon | Origin logistics | `/jim-corbett/` | `/jim-corbett/travel4life/` | Medium | AMBER / no differentiated origin facts |
| Jim Corbett from Ghaziabad | Origin logistics | `/jim-corbett/` | `/jim-corbett/travel4life/` | Medium | AMBER / no differentiated origin facts |

No new query pages are approved by this audit. Missing package, safari, and origin-specific coverage is a content gap, not permission to publish near-duplicate pages. Revisit only when verified facts and a distinct user task support a useful page.

## Cannibalization, linking, and URL findings

- Registry primary-query ownership is unique across the five routes. This proves no duplicate primary-query declarations, not that Google has never shown multiple URLs for one query.
- The intended ownership is: destination/trip overview → hub; accommodation → resort reference guide (currently RED/noindex); wedding → weddings; corporate meeting/offsite → MICE; service/process/branded planning → Travel4life page.
- Query-level cannibalization cannot be proven without dated Search Console query/page exports. Import a real export before making URL consolidation decisions.
- Hub-to-subpage links are direct; subordinate pages link to the hub and relevant sibling pages. No orphan among the five registry routes was found. Resort-directory links are user-useful but that page is not an indexable authority destination until verified.
- Canonicals are self-referential on all five routes. Filter/search/sort controls are client-side; they do not add query parameters to the URL. Query-string variants must remain non-indexable and canonicalize to the clean route.
- The five routes are lowercase, descriptive and hierarchical. `/jim-corbett/packages/`, `/safari/`, and `/from-delhi/` do not exist and are intentionally not fabricated by this lock.

## Data, commercial claims, event claims, and trust

- Resort source audit and required field statuses:

  | Field | Status | Evidence |
  |---|---|---|
  | Source-list name/category | NOT VERIFIED | Present in workbook; no current independent property-existence check recorded. |
  | Property existence | NOT VERIFIED | 0/100 entity records have verified existence. |
  | Location / zone / gate | UNKNOWN | Not present in the source workbook. |
  | Facilities / amenities | UNKNOWN | Not present in the source workbook. |
  | Room inventory / capacity | UNKNOWN | Not present in the source workbook. |
  | Wedding / MICE capacity | UNKNOWN | No facility or event-capacity source evidence. |
  | Images | UNKNOWN | No verified/usable property images in the source workbook. |
  | Price figures | PARTIAL | Seasonal values exist in the workbook, but are not verified as current prices and lack date, occupancy, meal and tax basis. |
  | Availability | UNKNOWN | No date-specific confirmation. |

  All 100 records remain `SOURCE_LISTED_UNVERIFIED`; none is to be promoted by inference.
- The resort directory accurately labels workbook figures as references and disclaims the unverified “Travel4life Rate”. It does not establish current offers, discounts, or price competitiveness. RED/noindex is therefore retained until a useful, verified comparison can be published.
- Wedding/MICE pages describe enquiry planning and due diligence. They explicitly say venue status, facilities, capacity and availability are not confirmed. No property is represented as a verified venue. Keep these page-level service claims distinct from supplier capability claims.
- No supported “best/leading/cheapest/#1” Travel4life market claim was found in the reviewed Corbett pages. The word “best” in the requested query map is an observed target phrase, not a page claim.
- Phone, email, WhatsApp and enquiry steps are present. Legal entity/company identity, substantiated first-hand expertise and a named accountable editor were not provided. Do not invent them. Add verified identity/editorial details when the business supplies them.
- No false review, award, certification, partnership or resort relationship should be added. “Last verified” must stay blank until a human verification event is recorded; do not use build date as a substitute.

## Robots, sitemap, redirects, 404 and performance

- `robots.txt` currently allows crawling and links to the root sitemap. It does not block Corbett HTML, CSS, JS or images. The site-wide SPA fallback still risks soft 404s for unknown paths.
- Root sitemap index includes `sitemap-corbett.xml`. After the lock, the Corbett sitemap should contain only the four approved, indexable, non-RED routes; the resort reference directory must not appear.
- Existing host/protocol redirects are retained. No Corbett route redirect is required for this launch lock.
- An explicit `/jim-corbett/*` 404 response should precede the SPA fallback for unknown Corbett paths. Verify this with the deployed host after release; local Vite fallback behavior is not proof of production HTTP status.
- Static assets are small and the production app build passes, but there is no trustworthy field performance result in the repository. Run Lighthouse/PageSpeed and Search Console CWV after deployment; record LCP, INP, CLS and device/network context.

## Required follow-up before scaling

1. Verify resort identity, current operating status, locality/zone, accommodation and facilities against attributable first-party/authoritative sources; capture verifier and verification date per field.
2. Obtain current, date-valid price terms including occupancy, room, meals, taxes, exclusions and cancellation. Do not reuse workbook figures as live pricing.
3. Only after enough records meet the documented publication gate, commission human review of a genuinely differentiated resort-choice page. Keep the current reference guide `noindex` until then.
4. Obtain dated Search Console exports for the Corbett page/query dimensions and use them to verify query ownership, impressions, clicks, CTR, positions and actual cannibalization.
5. Add only verified local access/safari planning facts and current package components. Do not publish template-only city/origin variants.
6. Supply approved legal business identity and an accountable editorial owner; add only claims that can be substantiated.
7. Test the `/jim-corbett/*` 404 rule, sitemap availability, canonical targets, and mobile/Lighthouse metrics on the deployed host.

## Validation record

`npm run build:app` completed successfully and generated a registry with five existing Corbett routes: four approved, indexable AMBER pages and the RED resort directory set to `noindex, follow`. The generated Corbett sitemap contains exactly those four indexable AMBER pages and no build-time `lastmod` values. The 11 weighted dimensions sum to 100, and their post-lock values sum to 55. All 13 tests in `npm run test:seo` passed, and `npm run seo:validate` passed for the existing Europe/Tomorrowland pages and contact layer.

The first `npm run corbett:seo:validate` run exposed a stale validator expectation that every route, including the noindex RED resort directory, must appear in the sitemap. The validator was corrected to require sitemap membership to match each route's indexation and quality status; the post-correction run passed. Targeted ESLint on the modified admin component and Corbett SEO scripts passed.

`git diff --check` reported no whitespace errors. A local HTTP server was not available for route probing. These checks do not establish deployed-host HTTP status behavior, Google indexation or rankings, live Search Console performance, or field Core Web Vitals.
