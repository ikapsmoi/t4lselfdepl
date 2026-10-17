import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getEligibleEuropeTrips, isIndexableEuropePage } from './europe-page-eligibility.mjs';
import { productPath } from './seo-quality.mjs';

const siteUrl = (process.env.SITE_URL || 'https://travel4life.net').replace(/\/$/, '');

const updateRobots = (html, indexable, route) => {
  const pattern = /(<meta\s+name="robots"\s+content=")[^"]*(")/i;
  if (!pattern.test(html)) throw new Error(`${route}: static page is missing its robots metadata.`);
  return html.replace(pattern, (_match, prefix, suffix) => (
    `${prefix}${indexable ? 'index, follow, max-image-preview:large' : 'noindex, follow'}${suffix}`
  ));
};

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const formatPrice = (price, currency) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: currency || 'INR',
  maximumFractionDigits: 0,
}).format(Number(price));

const formatDate = (value) => new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(value));

export const renderEuropeBudgetListings = (trips) => {
  if (trips.length === 0) {
    return '<p class="notice">There are no active qualifying Europe trip listings at this budget right now. Check the Europe catalogue for current options.</p>';
  }

  const cards = trips.map((trip) => {
    const destination = trip.location.trim().replace(/[,\s]+$/, '');
    const details = `${destination} · ${formatDate(trip.start_date)}–${formatDate(trip.end_date)}`;
    return `<a class="link-card" href="${escapeHtml(productPath(trip.id))}"><strong>${escapeHtml(trip.title)}</strong><span>${escapeHtml(details)}</span><span>${escapeHtml(formatPrice(trip.price_per_person, trip.currency || 'INR'))} per person</span><span>View itinerary, price and inclusions</span></a>`;
  }).join('');

  return `<div class="link-grid">${cards}</div>`;
};

export const gateEuropePages = async (eligibleTrips, outputDirectory = resolve('dist')) => {
  const sitemapPath = resolve(outputDirectory, 'sitemap-static.xml');
  const sitemap = await readFile(sitemapPath, 'utf8');
  const entries = [...sitemap.matchAll(/<url>[\s\S]*?<\/url>/gi)];
  let gatedCount = 0;
  const retainedEntries = [];

  for (const [entry] of entries) {
    const url = entry.match(/<loc>([^<]+)<\/loc>/i)?.[1];
    if (!url?.startsWith(`${siteUrl}/europe/`)) {
      retainedEntries.push(entry);
      continue;
    }

    const route = url.slice(siteUrl.length);
    const indexable = isIndexableEuropePage(route, eligibleTrips);
    const relativePath = route.slice('/europe/'.length);
    const pagePath = resolve(outputDirectory, 'europe', relativePath, 'index.html');
    const html = await readFile(pagePath, 'utf8');
    let updatedHtml = updateRobots(html, indexable, route);
    if (route === '/europe/tours-under-200000/') {
      const marker = '<div id="europe-budget-listings" aria-live="polite"></div>';
      if (!updatedHtml.includes(marker)) {
        throw new Error(`${route}: missing the Europe budget listing insertion point.`);
      }
      updatedHtml = updatedHtml.replace(
        marker,
        renderEuropeBudgetListings(getEligibleEuropeTrips(route, eligibleTrips)),
      );
    }
    await writeFile(pagePath, updatedHtml, 'utf8');

    if (indexable) {
      retainedEntries.push(entry);
    } else {
      gatedCount += 1;
    }
  }

  const header = sitemap.match(/^[\s\S]*?<urlset\b[^>]*>/i)?.[0];
  const footer = '</urlset>';
  if (!header || !sitemap.includes(footer)) {
    throw new Error(`${sitemapPath}: invalid static sitemap structure.`);
  }
  await writeFile(sitemapPath, `${header}\n${retainedEntries.map((entry) => entry.trim()).join('\n')}\n${footer}\n`, 'utf8');
  return gatedCount;
};
