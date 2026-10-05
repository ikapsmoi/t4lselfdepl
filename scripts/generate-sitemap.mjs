import { mkdir, writeFile } from 'node:fs/promises';
import { escapeXml, getProductQuality, productPath } from './seo-quality.mjs';
import { fetchActiveTrips } from './supabase-seo-data.mjs';

const siteUrl = (process.env.SITE_URL || 'https://travel4life.net').replace(/\/$/, '');
const trips = await fetchActiveTrips();
const eligibleTrips = trips.filter((trip) => getProductQuality(trip).eligible);
const urls = eligibleTrips
  .map((trip) => {
    const lastmod = trip.updated_at && !Number.isNaN(new Date(trip.updated_at).getTime())
      ? `\n    <lastmod>${new Date(trip.updated_at).toISOString()}</lastmod>`
      : '';
    return `  <url>\n    <loc>${escapeXml(`${siteUrl}${productPath(trip.id)}`)}</loc>${lastmod}\n  </url>`;
  })
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
await mkdir('public', { recursive: true });
await writeFile('public/sitemap-products.xml', sitemap, 'utf8');
console.log(`Generated ${eligibleTrips.length} SEO-ready product URLs from ${trips.length} active products; excluded ${trips.length - eligibleTrips.length}.`);
