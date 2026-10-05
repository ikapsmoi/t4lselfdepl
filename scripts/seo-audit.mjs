import { getProductQuality, productPath } from './seo-quality.mjs';
import { fetchActiveTrips } from './supabase-seo-data.mjs';

const siteUrl = (process.env.SITE_URL || 'https://travel4life.net').replace(/\/$/, '');
const trips = await fetchActiveTrips();
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
