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

## Sitemap and audit

The root `public/sitemap.xml` is a valid sitemap index. It references the static sitemap and `sitemap-products.xml`.

With the production Supabase environment variables available, run:

```text
npm run seo:sitemap
npm run seo:audit
```

`seo:sitemap` includes only active products that pass the shared quality gate: title, category, destination, valid dates, non-negative price, meaningful description, and at least one image. `seo:audit` reports the active product count, SEO-ready count, exclusions by missing field, duplicate titles, category totals, and sitemap coverage. The scripts require `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the environment where they run.

### Crawlable inventory-backed product pages

`npm run build` builds the app, fetches active listings from Supabase, and writes a static HTML snapshot for each future, SEO-ready trip to `dist/trips/<trip-id>/index.html`. Each snapshot includes that trip's title, description, destination, dates, price, image, canonical, Product/Offer and breadcrumb JSON-LD, plus links to related eligible trips. The product sitemap in `dist` is generated from the same eligible listings. `npm run build:seo` is an explicit alias for the production build.

The eligibility gate rejects malformed trip IDs, expired or inconsistent dates, missing product fields and unsafe/missing images. Europe landing pages are included in the deployed static sitemap and marked indexable only when matching, future, quality-checked inventory exists; otherwise they remain directly accessible as `noindex, follow` planning guides. Country, route, traveller-type and budget pages each require matching destinations or trip details.

The production build requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (loaded from Vite environment files such as `.env.local` or supplied by the deployment environment) and a successful Supabase request. It fails rather than silently producing incomplete crawlable pages. Configure the hosting provider to deploy `dist` from `npm run build`, and rebuild when active trip inventory changes so the HTML snapshots and product sitemap stay current. Use `npm run build:app` for local/offline SPA-only builds.

The deployment fallback in `public/_redirects` keeps direct product URLs on the SPA entry point so the client route can load on a fresh request. The static snapshots emitted by `build:seo` provide the initial trip content and metadata; the client application still loads afterward to preserve the existing booking experience.

## Europe discovery hub

`/europe/` is a static authority hub for Indian travellers planning Europe trips. The SEO deployment build keeps Europe pages in the sitemap and marks them indexable only when matching live trip inventory passes the product quality gate. The page routes visitors to the live trip catalogue using `/trips/?destination=Europe`; that filter matches the country portion of active trip locations instead of claiming fixed package availability.

The supplied Search Console export contains no Europe destination query or landing-page rows, and the product sitemap is not evidence that every European destination has a current offer. For that reason, the first release intentionally creates one useful hub rather than unsupported country/city pages. The page distinguishes planning guidance from confirmed inclusions, prices, dates, hotels, and availability. Add more destination pages only when live product relevance and differentiated content justify them.
