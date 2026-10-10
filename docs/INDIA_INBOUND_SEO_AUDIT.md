# Travel4Life India Inbound SEO Audit

Audit date: 11 October 2026
Scope: repository and live `/india-tours/` hub; four-market organic acquisition foundation.

## Executive summary

The project is a React 18 and TypeScript application built with Vite and deployed on Netlify. The India inbound hub is a separate Vite multi-page entry, so its page content, metadata and schema are present in the initial HTML rather than depending on the React application shell. The live hub returned HTTP 200, declared its canonical URL, was `index, follow`, and appeared in the India Tours sitemap. The slashless URL redirected to the trailing-slash canonical.

The audit found misleading public copy that said the proposed routes had verified supplier inventory, operational itineraries, availability and prices. This contradicted the route catalogue, which marks all ten routes inactive drafts with quote-required pricing and unverified availability. The source has been corrected, as have the page title, social preview image, and a USD-only budget field that did not suit the intended UK, Australian and German audiences. Those source changes have not yet been deployed; production still serves the old copy and metadata.

No tour product pages, country pages or German translations were added. No approved inventory or itinerary facts were available to support them, and the available Search Console workbook does not establish demand for this hub.

## Repository and production audit

| Area | Finding and evidence | Impact / action | Status |
|---|---|---|---|
| Rendering and routing | React 18 / TypeScript / Vite. `/india-tours/` is a Vite multi-page static HTML entry; Vite and Netlify configuration provide direct route handling. | Preserve the static entry for crawlable page content; verify direct route responses after each deployment. | Implemented; local build verified in this phase. |
| Production route | On 11 October 2026, `https://travel4life.net/india-tours/` returned HTTP 200. `/india-tours` returned 301 to the trailing-slash URL. | No route or redirect change required. | Production checked before this phase's source edits. |
| Canonical and indexation | Live HTML declares `https://travel4life.net/india-tours/` and `index, follow`. `robots.txt` allows crawling. The live sitemap index references `india-tours-pages.xml`, which contains the canonical hub. | Keep a single English-language hub; do not add hreflang without equivalent translated/regional pages. | Production checked before this phase's source edits. |
| Public content defect | Live and source HTML described route concepts as having verified inventory, itineraries, availability and prices. `src/india-tours/catalog.mjs` instead sets every concept to `is_active: false`, `approval_status: 'draft'`, `availability_status: 'unverified'`, `price_status: 'quote_required'`, and `selling_price: null`. | Replace the false statement and add regression checks. | Corrected in source; production remains unchanged until deployment. |
| Metadata and image relevance | The live title called the hub a tour-package page, while the social/hero image at `trip-thumbnails/india.jpg` showed a music festival rather than India inbound travel. | Use accurate planning-intent metadata and the existing Jaipur image with a descriptive alt. | Corrected in source; production remains unchanged until deployment. |
| Tour inventory and URL strategy | Ten concepts are planning prompts, not bookable products. The live sitemap's India-tour sitemap contains only `/india-tours/`. | Do not publish indexable Golden Triangle, Rajasthan, Kerala or duration product pages until real inventory and distinct, useful details are supplied. | Existing guardrail retained. |
| Enquiry and contact | The page does not post or store an enquiry. It prepares reviewable WhatsApp and email drafts. The code does not present the handoff as a received enquiry. Phone, email and WhatsApp links use the configured Travel4Life details. | Preserve the explicit draft state; a WhatsApp click is not a submitted or qualified lead. | Existing design retained; draft composition has focused tests. |
| International form fit | The old form offered only USD budget bands and did not collect a country or preferred duration. | Add optional country, duration, and a budget field where travellers can state their own currency. Include permitted country/duration in the visitor-reviewed draft and country only as non-sensitive analytics context. | Corrected in source; production remains unchanged until deployment. |
| Analytics | India-page events use the existing Supabase `analytics_events` insertion helper. The page-specific path sends page/event context, not form names, email addresses, dates, budget or message text. | Track itinerary selection, quote actions, form start/error/draft preparation, contact clicks and optional country market. Do not emit submission/success/qualified-lead events because no server submission or CRM outcome is implemented. | Event wiring present; browser/database delivery not independently verified. |
| International targeting | No equivalent US, UK, Australian or German pages exist; no hreflang is present. | No hreflang or country-code URLs should be added until equivalent content is maintained. Build audience-specific value before country pages. | Correctly not implemented. |
| Trust claims | The hero includes business-supplied statements about payment options, 14 years with heritage groups, festival group leadership, guide certification/languages and in-house support. No supporting documents or supplier evidence were present in the audited repository. | Retain only if the business can substantiate each claim; confirm payment eligibility, guide credentials/language, support coverage and scope before relying on these claims in ads or product pages. | Blocked on business evidence. |
| Competitors and keyword demand | No current SERP/keyword-tool evidence was available in the repository or supplied report. | The market terms below are hypotheses, not measured demand or difficulty. Validate with country-specific Search Console and a reliable keyword source before publishing pages. | Research blocked on data/tool access. |

## Search Console evidence available

The local workbook `travel4life.net-Performance-on-Search-2026-10-10 (1).xlsx` is a Web Search report filtered to **Last 7 days**, covering 30 September–6 October 2026. It is not a 28-day or 3-month baseline.

- The 44-row Pages export contains no `/india-tours/` row.
- The separate Countries export reports India 13 clicks / 229 impressions; United States 3 / 67; Australia 3 / 30; United Kingdom 0 / 66; Germany 0 / 57. These are site-wide, not India Tours landing-page metrics.
- The separate Devices export reports Mobile 18 / 616 and Desktop 8 / 266 impressions/clicks respectively. These are site-wide, not country-page intersections.
- The Queries export contains no meaningful India-inbound tour query cluster; its visible commercial examples concern Tomorrowland. UUID trip pages are among the highest-impression pages in this short export, but this does not prove they compete with `/india-tours/`.
- The workbook exports dimensions separately and does not include a page × query × country × device cross-tab. Do not calculate segmented CTR or position by joining unrelated totals.

**Required data request:** export the latest 28-day and 3-month Search Console reports for Queries, Pages, Countries and Devices, and provide a page/query report filtered to `/india-tours/`. For market/device attribution by landing page and query, use a Search Console API export with those dimensions and document privacy-threshold omissions. Do not use the 7-day workbook as the India-tour baseline.

## Corrected issues in this source update

1. Corrected the route-catalogue disclosure so it states that inventory, operational itineraries, availability and prices are not verified.
2. Replaced misleading “package” metadata with India tour-planning intent.
3. Replaced the festival photograph used as the India hero/social image with the existing Jaipur image.
4. Replaced fixed USD budget bands with a currency-neutral optional budget field; added optional residence market and duration to the enquiry draft.
5. Added appropriately scoped analytics names for itinerary selection, quote actions, form start/error/draft preparation and market selection. No event claims that a lead was submitted or successful.
6. Added tests to prevent the false inventory claim from returning and to validate the new enquiry fields.

These changes are local source changes and have not been deployed to production.

Changed files:

- `india-tours/index.html`
- `src/india-tours/main.ts`
- `src/india-tours/enquiry.mjs`
- `src/india-tours/enquiry.d.mts`
- `scripts/india-tours.test.mjs`
- `docs/INDIA_INBOUND_SEO_AUDIT.md`

## Market and content strategy

The following are unvalidated keyword hypotheses based on the requested audiences, not measured Search Console opportunities. Keep one authoritative `/india-tours/` hub while supplier inventory is absent.

| Market | Initial English/German query hypotheses | Intent to serve | Evidence needed before a dedicated landing page |
|---|---|---|---|
| United States | India tours; private India tours; custom India tours; India itinerary 10 days; Golden Triangle India tour | Commercial research and itinerary planning | 28-day/3-month country-query data, distinct trip-planning guidance, verified service/inventory details. |
| United Kingdom | India holidays; tailor-made India holidays; private tours of India; Golden Triangle holidays; Rajasthan tours | Commercial research and itinerary planning | UK query/page/device export, useful UK-specific flight/season/payment planning, and verified service facts. |
| Australia | India tours from Australia; India itinerary 2 weeks; private India tours; India family holidays | Long-haul planning and commercial research | AU query/page/device export and distinct planning value beyond changing the country name. |
| Germany | Indien Rundreise; private Indien Rundreise; Goldenes Dreieck Indien; Rajasthan Rundreise | German-language destination and itinerary research | Reliable German keyword research, native editorial review, maintainable German enquiry support and genuinely translated equivalent content. |

Do not publish a country page by substituting a country name into a common template. Do not implement German hreflang until the translated equivalent exists, is reviewed and has matching canonical/hreflang references.

## Analytics and lead measurement specification

| Funnel stage | Current/allowed event | Meaning and limit |
|---|---|---|
| Organic discovery | `india_tours_page_view` with source category | Page view only; search query and Search Console data remain separate. |
| Itinerary interest | `itinerary_select` | Visitor selected an illustrative route; not a product view or booking intent guarantee. |
| Quote intent | `quote_request_click` | Visitor opened the quote/contact action. |
| Form interaction | `quote_form_start`, `quote_form_error`, `quote_form_draft_prepared` | Draft preparation is local; no lead has been sent or received. |
| Market | `country_market_select` | Optional self-declared country; do not infer residence from IP. |
| Contact handoff | `contact_whatsapp_click`, `contact_phone_click`, `contact_email_click` | Click only; cannot confirm the visitor completed contact. |
| Qualified lead / booking | Not implemented | Requires CRM status/booking outcome integration. Do not report a click or draft as a lead, booking, revenue or margin. |

Continue to omit PII from analytics. The existing global `trackEvent` helper has broader legacy uses (including an email-bearing newsletter event); this India-hub audit did not refactor unrelated analytics. Review global event payloads and consent/legal requirements separately before building an international attribution dashboard.

## 90-day roadmap

| Window | Task and affected page | Evidence / dependency | Success measure |
|---|---|---|---|
| Days 0–14 | Deploy and recheck the corrected `/india-tours/` metadata, disclosure and image. Obtain documented evidence for hero trust claims. | Source fixes are tested locally; production currently serves the prior copy. Business must provide evidence/terms for claims. | Canonical hub returns 200, is indexable, shows corrected HTML and image; zero unsupported inventory/price statements. |
| Days 0–14 | Obtain 28-day and 3-month Search Console query/page/country/device data, including a hub-filtered export. | Current workbook covers 7 days and has no hub page row or joint dimension view. | A dated baseline exists by country, device, page and query; omitted data is labelled. |
| Days 15–30 | Verify Supabase event delivery and define a CRM handoff/status field for qualified enquiry and booking outcomes. | Supabase table/policies, consent requirements, production diagnostics and CRM ownership. | Test events arrive with no PII; clicks/drafts and actual qualified leads can be reported separately. |
| Days 15–30 | Prepare operational data records for Golden Triangle, Rajasthan and Kerala concepts; do not index product pages yet. | Supplier arrangements, current route/day-by-day facts, transport, inclusions/exclusions, prices or quote status, validity, terms and editorial approval. | Each proposed page passes an explicit completeness and factual review gate or remains unpublished. |
| Days 31–60 | Publish only the best-supported itinerary pages or evergreen planning guides; link from the hub where useful. | Product-data gate or researched/cited article draft with owner and review date. | Pages render crawlable, have unique intent/metadata, meet editorial checks, and receive relevant impressions. |
| Days 31–60 | Validate priority query hypotheses for US, UK and Australia; decide whether distinct country content merits publication. | Country/query/page GSC and keyword research. | No page is created without distinct value and a measured or documented search/user need. |
| Days 61–90 | Research German demand and commission native German editorial review only if support capacity is available. | Reliable German keyword data, translator/editor, maintained German enquiry handling. | Approved German page has natural language, equivalent content, reciprocal hreflang and canonical validation—or remains deferred. |
| Days 61–90 | Review organic-to-enquiry funnel and improve one measured step at a time. | At least 28 days of post-deployment data plus CRM lead outcomes. | Report organic sessions/clicks, quote actions, confirmed enquiries, qualified leads and bookings separately; compare against the first full baseline. |

### Measurement rules

- SEO: indexed canonical pages; impressions/clicks/CTR/position by query, landing page, country and device; crawl/render errors; sitemap eligibility.
- Business: quote/contact clicks; actual enquiries received; qualified enquiries; enquiry-to-booking progression; revenue and margin only where CRM/booking data supports them.
- Use a stable 28-day baseline and an appropriate 28-day or 90-day evaluation window. Annotate deployments and avoid attributing short-window changes to a single edit without enough volume.
- Do not promise ranking, traffic, conversion or booking gains.

## Validation and deployment status

- `npm run build`: passed; generated the India Tours entry and the SEO sitemap registry.
- `npm run test:seo`: passed, 40 tests and 0 failures.
- `npm run seo:validate:sitemaps`: passed, 79 eligible URLs across 12 sitemap groups.
- `npm run seo:validate`: passed for the existing registered SEO surfaces.
- Focused ESLint on changed TypeScript/JavaScript/test files: passed.
- Focused TypeScript check for `src/india-tours/main.ts`: passed.
- `git diff --check`: passed.
- Full repository `npm run lint`: blocked by 248 existing lint errors and 26 warnings; no changed India Tours files were reported by that run.
- Full `npx tsc --noEmit -p tsconfig.app.json`: blocked by pre-existing parse errors in `src/components/pages/AboutPage.tsx` and `src/components/pages/CreatorProfilePage.tsx`.
- Production page, canonical redirect, `robots.txt`, and sitemap were checked before these edits. The final local production preview returned HTTP 200 for `/india-tours/`, `/sitemap.xml`, its CSS and JavaScript bundles, and the Jaipur image; the built HTML contains the corrected canonical and disclosure. Browser-based responsive/interactions verification was unavailable.
- Live production checks in this audit describe the deployment observed before the source update. They do not verify the corrected source until it is deployed and rechecked.
- No new environment variable is required. The existing Supabase configuration uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; these are build-time browser variables, and no service-role secret should be exposed.
- Deployment remains the project's normal Netlify deployment process. Do not deploy without the normal release authorization.
