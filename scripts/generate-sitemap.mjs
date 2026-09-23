import { mkdir, writeFile } from 'node:fs/promises';
import { escapeXml, getProductQuality, productPath } from './seo-quality.mjs';

const siteUrl = (process.env.SITE_URL || 'https://travel4life.net').replace(/\/$/, '');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required to generate the product sitemap.');
}

const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/trips?select=id,title,category,location,start_date,end_date,price_per_person,images,itinerary,updated_at,status&status=eq.active&order=updated_at.desc`;
const response = await fetch(endpoint, {
  headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
});

if (!response.ok) {
  throw new Error(`Supabase sitemap query failed with HTTP ${response.status}: ${await response.text()}`);
}

const trips = await response.json();
const eligibleTrips = trips.filter((trip) => getProductQuality(trip).eligible);
const urls = eligibleTrips
  .map((trip) => `  <url>\n    <loc>${escapeXml(`${siteUrl}${productPath(trip.id)}`)}</loc>${trip.updated_at ? `\n    <lastmod>${new Date(trip.updated_at).toISOString()}</lastmod>` : ''}\n  </url>`)
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
await mkdir('public', { recursive: true });
await writeFile('public/sitemap-products.xml', sitemap, 'utf8');
console.log(`Generated ${eligibleTrips.length} SEO-ready product URLs from ${trips.length} active products; excluded ${trips.length - eligibleTrips.length}.`);
