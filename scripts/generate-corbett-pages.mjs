import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getTravel4LifeContactContext, getTravel4LifeWhatsAppUrl } from '../src/utils/travel4lifeContact.js';
import { calculateSeoReadiness, isCorbettPageIndexable } from './corbett-authority.mjs';

const siteUrl = (process.env.SITE_URL || 'https://travel4life.net').replace(/\/$/, '');
const dataPath = resolve('dist/jim-corbett/resorts.json');
const queuePath = resolve('dist/jim-corbett/enrichment-queue.json');
const registryPath = resolve('dist/jim-corbett/page-registry.json');
const dataset = JSON.parse(await readFile(dataPath, 'utf8'));
const queue = JSON.parse(await readFile(queuePath, 'utf8'));
const registry = JSON.parse(await readFile(registryPath, 'utf8'));
const properties = queue.properties;
const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');
const money = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

if (!Array.isArray(properties) || properties.length !== dataset.source.importedRows) {
  throw new Error('The Corbett resort data import count does not match the source metadata.');
}
if (properties.length !== queue.summary.total) {
  throw new Error('The Corbett enrichment queue does not match the source resort dataset.');
}
dataset.schemaVersion = 2;
dataset.properties = properties;
await writeFile(dataPath, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8');

const cards = properties.map((property) => {
  const context = getTravel4LifeContactContext({
    pageType: 'resort',
    destination: 'Jim Corbett',
    resort: property.name,
  });
  const whatsappUrl = getTravel4LifeWhatsAppUrl(context);
  return `          <article class="resort-card" data-resort-card data-resort-name="${escapeHtml(property.name)}" data-resort-category="${escapeHtml(property.category)}" data-season-rate="${property.rates.season}">
            <div class="resort-card-top"><div><h3>${escapeHtml(property.name)}</h3><span class="resort-category">${escapeHtml(property.category)}</span></div><span class="verification-tag">Needs verification</span></div>
            <div class="rate-grid" aria-label="Workbook rate references">
              <div><small>Season reference / night</small><strong>INR ${money.format(property.rates.season)}</strong></div>
              <div><small>Listed 15% season figure</small><strong>INR ${money.format(property.rates.discountedSeason)}</strong></div>
              <div><small>Off-season reference / night</small><strong>INR ${money.format(property.rates.offSeason)}</strong></div>
            </div>
            <p class="rate-footnote">Workbook reference only; validity, occupancy, meals, taxes and availability are not stated.</p>
            <a class="text-link" href="${escapeHtml(whatsappUrl)}" target="_blank" rel="noopener noreferrer" data-contact-event="contact_whatsapp_click" data-contact-secondary-event="availability_request" data-contact-extra-event="resort_enquiry" data-contact-page-type="resort" data-contact-destination="Jim Corbett" data-contact-resort="${escapeHtml(property.name)}">Ask about this property <b>↗</b></a>
          </article>`;
}).join('\n');

const itemList = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${siteUrl}/jim-corbett/resorts/#page`,
      url: `${siteUrl}/jim-corbett/resorts/`,
      name: 'Jim Corbett resort reference guide',
      description: 'Search 100 resort names and non-live rate references supplied in a workbook.',
      isPartOf: { '@id': `${siteUrl}/jim-corbett/#page` },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: properties.length,
        itemListElement: properties.map(({ name }, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name,
        })),
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Jim Corbett', item: `${siteUrl}/jim-corbett/` },
        { '@type': 'ListItem', position: 3, name: 'Resort guide', item: `${siteUrl}/jim-corbett/resorts/` },
      ],
    },
  ],
};

const directoryPath = resolve('dist/jim-corbett/resorts/index.html');
let directoryHtml = await readFile(directoryPath, 'utf8');
if (!directoryHtml.includes('<!-- CORBETT_RESORT_CARDS -->') || !directoryHtml.includes('<!-- CORBETT_RESORT_JSONLD -->')) {
  throw new Error('The Corbett resort directory template is missing a data generation marker.');
}
directoryHtml = directoryHtml
  .replace('<!-- CORBETT_RESORT_CARDS -->', cards)
  .replace('<!-- CORBETT_RESORT_JSONLD -->', `<script type="application/ld+json">${JSON.stringify(itemList).replaceAll('<', '\\u003c')}</script>`);
await writeFile(directoryPath, directoryHtml, 'utf8');

registry.enrichmentSummary = queue.summary;
for (const page of registry.pages) {
  const htmlPath = resolve('dist', ...page.file.split('/'));
  let html = await readFile(htmlPath, 'utf8');
  const readiness = calculateSeoReadiness(page, html);
  page.readinessScore = readiness.score;
  page.readinessChecks = readiness.checks;
  const approvedForIndex = isCorbettPageIndexable(page, readiness.score);
  page.indexable = approvedForIndex;
  if (!approvedForIndex && readiness.score < 75) page.qualityStatus = 'needs-improvement';
  html = html.replace(
    /<meta\s+name="robots"\s+content="[^"]*"/i,
    `<meta name="robots" content="${approvedForIndex ? 'index, follow' : 'noindex, follow'}, max-image-preview:large"`,
  );
  await writeFile(htmlPath, html, 'utf8');
}
await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
await writeFile(resolve('public/jim-corbett/page-registry.json'), `${JSON.stringify(registry, null, 2)}\n`, 'utf8');

const sitemapUrls = [];
for (const page of registry.pages.filter((entry) => (
  entry.indexable && entry.qualityStatus === 'approved' && entry.readinessScore >= 75
))) {
  const htmlPath = resolve('dist', ...page.file.split('/'));
  const { mtime } = await stat(htmlPath);
  const lastmod = `\n    <lastmod>${mtime.toISOString()}</lastmod>`;
  sitemapUrls.push(`  <url>\n    <loc>${escapeHtml(`${siteUrl}${page.url}`)}</loc>${lastmod}\n  </url>`);
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join('\n')}\n</urlset>\n`;
await mkdir(resolve('dist'), { recursive: true });
await writeFile(resolve('dist/sitemap-corbett.xml'), sitemap, 'utf8');
await writeFile(resolve('public/sitemap-corbett.xml'), sitemap, 'utf8');
console.log(`Generated the Corbett directory with ${properties.length} property references and ${sitemapUrls.length} approved landing pages.`);
