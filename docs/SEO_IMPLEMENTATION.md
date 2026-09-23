# Product SEO Implementation

The app now exposes active Supabase trips through stable product URLs:

`/trips/<trip-id>`

The UUID is used because the current `trips` schema has no persisted slug field. Existing card and related-trip links point to these routes while the existing modal and booking flow remain available.

## Product page behavior

- Fetches one active trip by UUID.
- Generates title, meta description, canonical, Open Graph, and Twitter metadata from real trip fields.
- Adds Product, Offer, BreadcrumbList, and related ItemList JSON-LD when the corresponding data exists.
- Renders a crawlable H1, destination, dates, capacity, price, description, inclusions, breadcrumb, and related products.
- Shows the existing TripDetails/booking UI from the page CTA.
- Returns a not-found state for missing or inactive products.

## Sitemap and audit

The root `public/sitemap.xml` is a valid sitemap index. It references the static sitemap and `sitemap-products.xml`.

With the production Supabase environment variables available, run:

```text
npm run seo:sitemap
npm run seo:audit
```

`seo:sitemap` includes active trip URLs only. `seo:audit` reports the active product count and missing title, destination, date, price, or image fields. The scripts require `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the environment where they run.

The deployment fallback in `public/_redirects` keeps direct product URLs on the SPA entry point so the client route can load on a fresh request.
