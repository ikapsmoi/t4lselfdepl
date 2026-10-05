import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { escapeXml, getProductQuality, productPath } from './seo-quality.mjs';
import { renderProductPage } from './render-product-page.mjs';
import { fetchActiveTrips } from './supabase-seo-data.mjs';
import { gateEuropePages } from './gate-europe-pages.mjs';

const siteUrl = (process.env.SITE_URL || 'https://travel4life.net').replace(/\/$/, '');
const outputDirectory = resolve('dist');
const templatePath = resolve(outputDirectory, 'index.html');

let template;
try {
  template = await readFile(templatePath, 'utf8');
} catch (error) {
  throw new Error('The production app shell is missing. Run the Vite build before generating static product pages.', { cause: error });
}

const trips = await fetchActiveTrips();
const eligibleTrips = trips.filter((trip) => getProductQuality(trip).eligible);
const gatedEuropePages = await gateEuropePages(eligibleTrips, outputDirectory);
const pageDirectory = resolve(outputDirectory, 'trips');
await writeFile(resolve(outputDirectory, 'seo-product-page-candidates.json'), `${JSON.stringify({
  schemaVersion: 1,
  pages: eligibleTrips.map((trip) => ({
    url: productPath(trip.id),
    entityId: trip.id,
    primaryKeyword: trip.title,
    searchIntent: 'Inventory-backed travel product discovery and enquiry',
    lastModified: trip.updated_at || null,
  })),
}, null, 2)}\n`, 'utf8');
const sitemapEntries = await Promise.all(eligibleTrips.map(async (trip) => {
  const tripPath = productPath(trip.id);
  const pagePath = resolve(pageDirectory, trip.id, 'index.html');
  const relatedTrips = eligibleTrips
    .filter((candidate) => candidate.id !== trip.id && candidate.category === trip.category)
    .slice(0, 4);
  const html = renderProductPage(template, trip, relatedTrips, siteUrl);
  await mkdir(dirname(pagePath), { recursive: true });
  await writeFile(pagePath, html, 'utf8');
  const lastmod = trip.updated_at && !Number.isNaN(new Date(trip.updated_at).getTime())
    ? `\n    <lastmod>${new Date(trip.updated_at).toISOString()}</lastmod>`
    : '';
  return `  <url>\n    <loc>${escapeXml(`${siteUrl}${tripPath}`)}</loc>${lastmod}\n  </url>`;
}));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.join('\n')}\n</urlset>\n`;
await writeFile(resolve(outputDirectory, 'sitemap-products.xml'), sitemap, 'utf8');
console.log(`Generated ${eligibleTrips.length} crawlable trip pages from ${trips.length} active listings; excluded ${trips.length - eligibleTrips.length} listings that did not pass quality and date checks, and gated ${gatedEuropePages} Europe pages with no matching eligible inventory.`);
