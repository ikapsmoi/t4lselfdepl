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

Product metadata and content are client-rendered. A fresh HTTP response initially serves the SPA shell, so crawlers or social preview clients that do not execute JavaScript may not receive the trip-specific title, canonical, JSON-LD, or visible product content. The sitemap's inclusion of a trip URL is not proof that every crawler can render its product page. Server rendering or pre-rendering from verified active trip records, followed by deployment-level crawler tests, remains necessary to close this gap.

## Sitemap and audit

The root `public/sitemap.xml` is a valid sitemap index. It references the static sitemap and `sitemap-products.xml`.

With the production Supabase environment variables available, run:

```text
npm run seo:sitemap
npm run seo:audit
```

`seo:sitemap` includes only active products that pass the shared quality gate: title, category, destination, valid dates, non-negative price, meaningful description, and at least one image. `seo:audit` reports the active product count, SEO-ready count, exclusions by missing field, duplicate titles, category totals, and sitemap coverage. The scripts require `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the environment where they run.

The deployment fallback in `public/_redirects` keeps direct product URLs on the SPA entry point so the client route can load on a fresh request. This fallback makes the route reachable; it does not solve the initial-render limitation above.
