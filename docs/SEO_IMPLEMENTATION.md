# Product SEO Implementation

The app now exposes active Supabase trips through stable product URLs:

`/trips/<trip-id>`

The UUID is used because the current `trips` schema has no persisted slug field. Existing card and related-trip links point to these routes while the existing modal and booking flow remain available.

## Product page behavior

- Fetches one active trip by UUID after the React application hydrates.
- Generates title, meta description, canonical, Open Graph, and Twitter metadata from real trip fields after the fetch completes.
- Adds Product, Offer, BreadcrumbList, and related ItemList JSON-LD from the loaded trip data.
- Uses the real product price and currency in Offer markup, but omits availability and offer-validity dates because current booking counts/price-validity windows are not reliably available in this fetch.
- Renders the H1, destination, dates, capacity, price, description, inclusions, breadcrumb, and related products after the fetch completes.
- Shows the existing TripDetails/booking UI from the page CTA.
- Returns a not-found state for missing or inactive products.

### Rendering limitation

The `npm run build:app` command produces only the SPA shell; trip metadata and content are populated client-side. The production `npm run build` command also generates static trip pages so crawlers and social preview clients receive trip content and metadata in the initial response.

## Universal SEO registry, sitemap groups, and production validation

The site is a Vite React SPA with pre-rendered static HTML for the SEO landing pages and generated product snapshots. SEO URL handling is static-export based (not SSR/ISR). The frontend loads trip inventory through Supabase; no separate sitemap API or CMS route exists. `public/_redirects` uses Netlify-compatible rules: the trip-list routes are explicitly rewritten to the app shell, while unmatched routes receive a real 404 instead of the homepage. The full production build emits `dist/seo-page-registry.json`, the normalized SEO registry consumed by the sitemap generator.

`scripts/generate-seo-sitemaps.mjs` consolidates the explicit Europe and Tomorrowland intent maps, the Corbett page registry, and the quality-gated static product pages. Sitemap entries must have a generated public HTML asset, a self-canonical, `index, follow`, approved quality status, no permanent redirect, and no duplicate canonical. Index and child maps are generated from those final registry decisions; sitemap groups are created only when they contain eligible pages. The group names are path/intent based and can expand to countries, cities, routes, packages/products, festivals, weddings, MICE, guides, resorts, or future declared groups.

Existing child endpoints remain available: `/sitemap-static.xml`, `/sitemap-products.xml`, and `/sitemap-corbett.xml`. The master `/sitemap.xml` points to non-empty grouped files under `/sitemaps/`, avoiding duplicate page URLs across the index. The legacy `/jim-corbett/resorts/sitemap.xml` endpoint is explicitly rewritten to the generated Corbett XML sitemap before the Corbett-specific and generic 404 rules; the resort directory itself remains noindex and is not added to the sitemap.

For a production build, use `npm run build` and deploy `dist`. Run `npm run seo:validate:production` after deployment with `SITE_URL` set to the deployed origin if it is not `https://travel4life.net`. It fetches the master and child sitemaps, rejects HTML/SPA responses and redirects, and verifies every listed URL returns HTTP 200 HTML with a matching canonical and indexable robots directive. Build-time file checks cannot prove the deployed host's actual response codes or MIME headers, so the production HTTP check is a release verification step, not a ranking guarantee.

`npm run test:seo` tests sitemap XML, registry gates, duplicate handling, and the existing SEO quality logic. After a production build, `npm run seo:validate:sitemaps` checks that the master index and child XML files exactly match the generated registry. `npm run seo:validate` checks the editorial pages and intent maps; `npm run corbett:seo:validate` checks Corbett content and decisions. After deployment, `npm run seo:validate:production` checks actual HTTP responses, MIME types, redirects, canonical URLs, and robots directives.

With the production Supabase environment variables available, run:

```text
npm run seo:sitemap
npm run seo:audit
```

`seo:sitemap` includes only active products that pass the shared quality gate: title, category, destination, valid dates, non-negative price, meaningful description, and at least one image. `seo:audit` reports the active product count, SEO-ready count, exclusions by missing field, duplicate titles, category totals, and sitemap coverage. The scripts require `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the environment where they run.

### Crawlable inventory-backed product pages

`npm run build` builds the app, fetches active listings from Supabase, and writes a static HTML snapshot for each future, SEO-ready trip to `dist/trips/<trip-id>/index.html`. Each snapshot includes that trip's title, description, destination, dates, price, image, canonical, Product/Offer and breadcrumb JSON-LD, plus links to related eligible trips. The product sitemap in `dist` is generated from the same eligible listings. `npm run build:seo` is an explicit alias for the production build.

The same quality-checked inventory is also matched to the optional `tripInventory` values in `public/tomorrowland/search-intent-map.json`. The build adds responsive trip cards to the relevant Tomorrowland hub, package, and destination-planning pages only when matching active listings exist. Card links open the corresponding trip page, where travellers can check availability and booking options; cards do not imply festival access. Rebuild after listing changes to keep these static cards current.

The eligibility gate rejects malformed trip IDs, expired or inconsistent dates, missing product fields and unsafe/missing images. Europe landing pages are included in the deployed static sitemap and marked indexable only when matching, future, quality-checked inventory exists; otherwise they remain directly accessible as `noindex, follow` planning guides. Country, route, traveller-type and budget pages each require matching destinations or trip details.

The production build requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (loaded from Vite environment files such as `.env.local` or supplied by the deployment environment) and a successful Supabase request. It fails rather than silently producing incomplete crawlable pages. Configure the hosting provider to deploy `dist` from `npm run build`, and rebuild when active trip inventory changes so the HTML snapshots and product sitemap stay current. Use `npm run build:app` for local/offline SPA-only builds.

Generated static product snapshots are served as files. The `/trips` and `/trips/` catalogue routes explicitly use the SPA entry point; an unknown product URL now receives a 404 instead of a homepage-shaped response.

## Europe discovery hub

`/europe/` is a static authority hub for Indian travellers planning Europe trips. The SEO deployment build keeps Europe pages in the sitemap and marks them indexable only when matching live trip inventory passes the product quality gate. The page routes visitors to the live trip catalogue using `/trips/?destination=Europe`; that filter matches the country portion of active trip locations instead of claiming fixed package availability.

The supplied Search Console export contains no Europe destination query or landing-page rows, and the product sitemap is not evidence that every European destination has a current offer. For that reason, the first release intentionally creates one useful hub rather than unsupported country/city pages. The page distinguishes planning guidance from confirmed inclusions, prices, dates, hotels, and availability. Add more destination pages only when live product relevance and differentiated content justify them.

## Search Console evidence and SEO War Room

The admin dashboard includes a Supabase-backed SEO War Room for separate Search Console query, page, and search-appearance CSV snapshots, one-primary-page query ownership, manual page-readiness assessments, and a dated SEO change log. Apply `supabase/migrations/20261006123800_seo_growth_command_center.sql` after the admin trip-management policy migration. The data tables are restricted to authenticated admin profiles; the footer password alone does not grant database access. CSV exports remain private and are not copied into the public site.

The supplied `travel4life.net-Performance-on-Search-2026-09-23` exports do not reconcile to one total: `Chart.csv` contains 92 daily rows (22 June–21 September 2026) and 56 clicks/680 impressions; `Queries.csv` contains 47 data rows and 27/292; `Pages.csv` contains four data rows and 56/882. The queries and pages exports contain no Tomorrowland, Corbett, or Europe rows. Use each dimension as its own evidence set, keep planned destination queries labelled as hypotheses, and do not infer zero demand from omitted or privacy-thresholded rows. The report's example rankings and stated aggregate totals have not been verified by these CSVs.

The Tomorrowland hub now owns general India-first travel planning and links to a separate package due-diligence page. That page provides a factual checklist rather than claiming live package inventory, ticket access, fixed pricing, or an official festival relationship. It is included in the static sitemap and editorial validator. The historical export does not justify changing UUID product canonicals; retain existing product URLs unless future Search Console evidence and a reviewed redirect map support a migration.

The readiness form preserves the supplied dimension weights and requires all dimensions to have evidence-backed integer scores before saving. Those weights add up to 95 points even though the brief's label bands use a 100-point scale; the War Room surfaces that mismatch instead of silently changing the requested rubric. This manual editorial checklist is not a Google ranking prediction. Opportunity CTR thresholds are also explicitly heuristic. Validate the code with `npm run test:seo`, `npm run seo:validate`, and `npm run seo:validate:sitemaps` after a production build; only `npm run seo:validate:production` on the deployed host can establish live HTTP redirect, status, and content-type behavior.

## Jim Corbett first-wave guide

The Corbett launch adds five static, crawlable routes:

- `/jim-corbett/` — the destination planning hub.
- `/jim-corbett/resorts/` — a searchable directory of 100 names and seasonal rate figures imported from the supplied workbook.
- `/jim-corbett/weddings/` — an event brief and wedding-planning enquiry page.
- `/jim-corbett/mice/` — a corporate offsite/MICE brief and enquiry page.
- `/jim-corbett/travel4life/` — a factual explanation of Travel4life's planning and verification process.

The source workbook contains names, broad categories and season, discounted-season and off-season figures per night. It has no rate-validity dates, room/occupancy definitions, meals, tax treatment, locality, property facilities, event capacity, images or availability confirmation. All imported records therefore remain `NEEDS_VERIFICATION`; the claimed Travel4life discount column is not published. Rate figures are explicitly identified as workbook references and not live prices. The resort directory is the only resort-intent landing page: individual property pages, venue-capacity claims, location/facility filters, package pages and locality pages are withheld until verified data and differentiated content support them.

`public/jim-corbett/page-registry.json` owns the page routes and intent. `scripts/corbett-enrichment.mjs` normalizes every workbook record and produces an enrichment queue with explicit unknowns, evidence state, completeness score, page readiness and separate property-existence/availability states. The 75-point score is only a completeness threshold; it does not verify facts or auto-publish resort pages. `scripts/generate-corbett-pages.mjs` builds static resort cards, `ItemList`/`CollectionPage` structured data, readiness scores and `dist/sitemap-corbett.xml`. A route enters the sitemap only if it remains editorially approved and scores at least 75; otherwise its HTML is marked `noindex, follow`. The registry receives the same score and gate state.

The admin-only Corbett SEO tab is available at `#corbett-authority`. It provides an evidence worksheet and queue, plus a Google Search Console CSV analysis dashboard. Resort-field imports require an HTTPS source URL, verification date and named verifier, and only update existing source-list entities. Individual property pages remain a human decision. Search Console snapshots are stored in the current administrator's browser local storage and are append-only; export backups before changing browsers or devices. Opportunity and CTR indicators are explicitly heuristic. No Search Console data is fabricated, no metadata changes automatically, and the dashboard does not guarantee rankings.

Refresh the normalized queue with `npm run corbett:enrichment:refresh`; import verified field updates with `npm run corbett:enrichment:import -- <file.csv>`. Both `npm run build:app` and `npm run build` refresh the queue before copying static assets. Validate page and registry gates with `npm run corbett:seo:validate`; test scoring, date/CSV parsing, ranking buckets, ownership, and opportunity signals with `npm run test:seo`.

The final red-team baseline, 11-dimension Page-1 readiness assessment, query ownership map, status reasons, claim/data audit and release actions are in [CORBETT_FINAL_SEO_AUDIT.md](./CORBETT_FINAL_SEO_AUDIT.md). Its 55/100 AMBER score is an evidence-based editorial assessment, not a Google position prediction. The unverified 100-property directory is intentionally served as `noindex, follow` and excluded from the sitemap until its data can support a reliable comparison. Unknown Corbett routes receive the dedicated 404 rule before the SPA fallback; verify the HTTP response on the deployed host before treating that as production evidence.

Build the public app shell and Corbett SEO assets with `npm run build:app`, or use the production SEO build when Supabase credentials are available. Validate the generated Corbett routes with `npm run corbett:seo:validate`; workbook normalization is covered by `npm run test:seo`.

## Global contact and conversion layer

`src/config/travel4life-contact.json` is the single source for the phone, WhatsApp number, and email used by the React app and crawlable HTML. `src/utils/travel4lifeContact.js` builds page-specific WhatsApp messages and maps enquiry actions to conversion events. Contact actions appear in the existing site footer, the lower-right floating WhatsApp trip enquiry form, and contextual mid-page and final CTAs on static Europe, Tomorrowland, and inventory-backed product pages. The form collects a traveller's name, party size, travel date, nights, and destination, then opens WhatsApp with those details prefilled; form details are not stored by the site. The contact layer does not add header contact buttons, a hero panel, or a fixed/mobile contact footer bar.

Contact clicks are recorded in `analytics_events` with the event name, page path, relevant page and destination context, and a coarse traffic-source label. Contact tracking does not include IP addresses or user-agent strings. The static-page analytics handler uses the configured Supabase project URL and public anon key supplied to the production build.

Run `npm run test:seo` and `npm run seo:validate` to check contextual contact links and their coverage on static SEO pages. The production `npm run build` runs the injection after generating product pages.
