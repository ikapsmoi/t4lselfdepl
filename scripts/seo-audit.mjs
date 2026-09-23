import { getProductQuality, productPath } from './seo-quality.mjs';

const siteUrl = (process.env.SITE_URL || 'https://travel4life.net').replace(/\/$/, '');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required to run the SEO audit.');
}

const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/trips?select=id,title,category,location,start_date,end_date,price_per_person,images,itinerary,status&status=eq.active&order=created_at.desc`;
const response = await fetch(endpoint, {
  headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
});

if (!response.ok) {
  throw new Error(`Supabase SEO audit query failed with HTTP ${response.status}: ${await response.text()}`);
}

const trips = await response.json();
const qualityResults = trips.map((trip) => ({ trip, quality: getProductQuality(trip) }));
const eligible = qualityResults.filter(({ quality }) => quality.eligible).map(({ trip }) => trip);
const excluded = qualityResults.filter(({ quality }) => !quality.eligible);
const titleCounts = new Map();
trips.forEach((trip) => {
  const title = trip.title?.trim().toLowerCase();
  if (title) titleCounts.set(title, (titleCounts.get(title) || 0) + 1);
});
const duplicateTitles = [...titleCounts.entries()]
  .filter(([, count]) => count > 1)
  .map(([title, count]) => ({ title, count }));
const categories = trips.reduce((counts, trip) => {
  const category = trip.category || 'missing';
  counts[category] = (counts[category] || 0) + 1;
  return counts;
}, {});
const sitemapResponse = await fetch(`${siteUrl}/sitemap-products.xml`);
const sitemapText = sitemapResponse.ok ? await sitemapResponse.text() : '';
const sitemapUrls = [...sitemapText.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const expectedSitemapUrls = new Set(eligible.map((trip) => `${siteUrl}${productPath(trip.id)}`));
const sitemapMissingUrls = [...expectedSitemapUrls].filter((url) => !sitemapUrls.includes(url));
const report = {
  generatedAt: new Date().toISOString(),
  siteUrl,
  totalProducts: trips.length,
  indexableProducts: eligible.length,
  excludedProducts: excluded.length,
  missingFields: excluded.reduce((counts, { quality }) => {
    Object.entries(quality.checks).forEach(([field, present]) => {
      if (!present) counts[field] = (counts[field] || 0) + 1;
    });
    return counts;
  }, {}),
  duplicateTitles,
  categories,
  sitemap: {
    httpStatus: sitemapResponse.status,
    listedUrls: sitemapUrls.length,
    missingEligibleUrls: sitemapMissingUrls.length,
  },
  sampleProduct: eligible[0] ? {
    id: eligible[0].id,
    title: eligible[0].title,
    url: `${siteUrl}${productPath(eligible[0].id)}`,
  } : null,
};

console.log(JSON.stringify(report, null, 2));
