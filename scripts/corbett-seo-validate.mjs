import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { TRAVEL4LIFE_CONTACT } from '../src/utils/travel4lifeContact.js';

const siteUrl = 'https://travel4life.net';
const registry = JSON.parse(await readFile(resolve('dist/jim-corbett/page-registry.json'), 'utf8'));
const dataset = JSON.parse(await readFile(resolve('dist/jim-corbett/resorts.json'), 'utf8'));
const sitemap = await readFile(resolve('dist/sitemap-corbett.xml'), 'utf8');
const rootSitemap = await readFile(resolve('dist/sitemap.xml'), 'utf8');
const seoRegistry = JSON.parse(await readFile(resolve('dist/seo-page-registry.json'), 'utf8'));
const robotsTxt = await readFile(resolve('dist/robots.txt'), 'utf8');
const redirects = await readFile(resolve('public/_redirects'), 'utf8');
const notFound = await readFile(resolve('dist/404.html'), 'utf8');
const resortScript = await readFile(resolve('dist/jim-corbett/corbett.js'), 'utf8');
const errors = [];
const warnings = [];
const htmlByUrl = new Map();
const urls = registry.pages.map(({ url }) => url);
const primaryQueries = registry.pages.map(({ primaryQuery }) => primaryQuery.toLowerCase());

const expect = (condition, message) => {
  if (!condition) errors.push(message);
};
const getMeta = (html, key, attribute = 'name') => html.match(new RegExp(`<meta\\s+${attribute}="${key}"\\s+content="([^"]+)"`, 'i'))?.[1] || '';
const visibleWordCount = (html) => html
  .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&(?:nbsp|amp|quot|lt|gt|#\d+);/gi, ' ')
  .trim()
  .split(/\s+/)
  .filter(Boolean).length;
const collectSchemaTypes = (value, types = []) => {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectSchemaTypes(entry, types));
  } else if (value && typeof value === 'object') {
    if (value['@type']) types.push(...(Array.isArray(value['@type']) ? value['@type'] : [value['@type']]));
    Object.values(value).forEach((entry) => collectSchemaTypes(entry, types));
  }
  return types;
};

expect(new Set(urls).size === urls.length, 'Registry contains duplicate URLs.');
expect(new Set(primaryQueries).size === primaryQueries.length, 'Registry contains duplicate primary queries.');
expect(registry.pages.length === 5, `Expected five Corbett routes, found ${registry.pages.length}.`);
expect(dataset.properties.length === 100, `Expected 100 imported properties, found ${dataset.properties.length}.`);
expect(dataset.schemaVersion === 2, 'Dataset has not been normalized for resort verification tracking.');
expect(dataset.source.importedRows === dataset.properties.length, 'Dataset import count does not match its metadata.');
expect(registry.enrichmentSummary?.total === dataset.properties.length, 'Registry enrichment summary does not match the normalized dataset.');
expect(registry.page1Readiness?.overallScore === 55 && registry.page1Readiness.status === 'AMBER', 'Page-1 readiness score/status is missing or not aligned with the current lock assessment.');
expect(robotsTxt.includes('Allow: /') && robotsTxt.includes('https://travel4life.net/sitemap.xml'), 'Robots rules must allow the site and reference the root sitemap index.');
expect(rootSitemap.includes('https://travel4life.net/sitemaps/jim-corbett.xml'), 'Root sitemap index must reference the non-empty Corbett sitemap group.');
expect(seoRegistry.pages.some((page) => page.url === '/jim-corbett/resorts/' && !page.indexable && page.quality_status !== 'approved'), 'Universal registry must preserve the RED/noindex resort decision.');
expect(seoRegistry.sitemap_groups['jim-corbett']?.includes('/jim-corbett/'), 'Universal sitemap registry must own the Corbett hub URL.');
const corbett404Rule = redirects.match(/^\/jim-corbett\/\*\s+\/404\.html\s+404!?$/m);
const notFoundFallbackRule = redirects.match(/^\/\*\s+\/404\.html\s+404!?$/m);
expect(Boolean(corbett404Rule && notFoundFallbackRule && corbett404Rule.index < notFoundFallbackRule.index), 'Corbett 404 route rule must appear before the generic 404 fallback.');
expect(/<meta\s+name="robots"\s+content="noindex,\s*follow"/i.test(notFound), '404 document must be noindex, follow.');
expect(!/history\.(?:pushState|replaceState)|location\.(?:search|hash)\s*=/i.test(resortScript), 'Resort filters must not generate crawlable URL variants.');

const names = new Set();
const slugs = new Set();
const rateErrors = [];
for (const property of dataset.properties) {
  if (names.has(property.name.trim().toLowerCase())) errors.push(`Duplicate resort name: ${property.name}.`);
  if (slugs.has(property.slug)) errors.push(`Duplicate resort slug: ${property.slug}.`);
  names.add(property.name.trim().toLowerCase());
  slugs.add(property.slug);

  if (!property.name.trim() || !property.category.trim()) errors.push(`Missing name or category for ${property.id}.`);
  if (!['NEEDS_VERIFICATION', 'PARTIALLY_VERIFIED'].includes(property.dataQuality)) {
    errors.push(`${property.name}: source row has an unexpected quality status.`);
  }
  if (property.dataQuality === 'NEEDS_VERIFICATION' && (property.lastVerifiedAt !== null || property.priceLastVerifiedAt !== null)) {
    errors.push(`${property.name}: unverified source data must not be marked verified.`);
  }
  const { season, discountedSeason, offSeason } = property.rates;
  if (![season, discountedSeason, offSeason].every((value) => Number.isSafeInteger(value) && value > 0)) {
    rateErrors.push(`${property.name}: missing or invalid rate values.`);
  } else if (Math.abs(discountedSeason - Math.round(season * 0.85)) > 1) {
    rateErrors.push(`${property.name}: workbook discounted season figure differs from the stated 15% calculation.`);
  }
  if (property.dataQuality === 'NEEDS_VERIFICATION' && (property.location !== null || property.amenities.length || property.images.length)) {
    errors.push(`${property.name}: unverified import contains property details not present in the workbook.`);
  }
  expect(property.propertyExistenceStatus === 'SOURCE_LISTED_UNVERIFIED' || property.propertyExistenceStatus === 'VERIFIED', `${property.name}: property existence status is invalid.`);
  expect(property.availabilityStatus === 'CONTACT_TO_CHECK', `${property.name}: availability must remain date-specific and unconfirmed.`);
}
errors.push(...rateErrors);

for (const page of registry.pages) {
  expect(['GREEN', 'AMBER', 'RED'].includes(page.page1Status), `${page.url}: missing a GREEN/AMBER/RED Page-1 status.`);
  expect(Array.isArray(page.page1Reasons) && page.page1Reasons.length > 0, `${page.url}: Page-1 status needs evidence-based reasons.`);
  if (page.page1Status === 'RED') {
    expect(page.indexable === false && page.qualityStatus !== 'approved', `${page.url}: RED pages must not be indexable or approved.`);
  } else {
    expect(page.qualityStatus === 'approved' && page.indexable, `${page.url}: non-RED route should remain approved for indexation.`);
  }
  expect(Number.isFinite(page.technicalScore) && page.technicalScore >= 75, `${page.url}: technical route-quality score must be at least 75.`);
  expect(page.canonicalUrl === `${siteUrl}${page.url}`, `${page.url}: registry canonical does not match its route.`);
  expect(Boolean(page.entityType) && Boolean(page.parentUrl) && Boolean(page.searchIntent), `${page.url}: registry is missing entity, parent or intent metadata.`);
  expect(page.lastVerified === null, `${page.url}: unverified destination information is marked as verified.`);
  const pagePath = resolve('dist', ...page.file.split('/'));
  let html;
  try {
    html = await readFile(pagePath, 'utf8');
  } catch {
    errors.push(`${page.url}: generated HTML page is missing at ${pagePath}.`);
    continue;
  }
  htmlByUrl.set(page.url, html);

  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() || '';
  const description = getMeta(html, 'description');
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1] || '';
  const robots = getMeta(html, 'robots');
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const wordCount = visibleWordCount(html);
  const minimumWords = page.pageType === 'hub' ? 350 : page.pageType === 'resort-directory' ? 500 : 550;
  const url = `${siteUrl}${page.url}`;

  expect(Boolean(title), `${page.url}: missing title.`);
  expect(Boolean(description), `${page.url}: missing description.`);
  expect(canonical === url, `${page.url}: canonical URL is missing or incorrect.`);
  expect(
    page.indexable ? /index,\s*follow/i.test(robots) : /noindex,\s*follow/i.test(robots),
    `${page.url}: robots metadata does not match its indexation decision.`,
  );
  expect(h1Count === 1, `${page.url}: expected exactly one H1; found ${h1Count}.`);
  expect(wordCount >= minimumWords, `${page.url}: insufficient visible content (${wordCount} words; expected ${minimumWords}+).`);
  expect(html.includes('data-t4l-contact-layer'), `${page.url}: missing contact-layer configuration marker.`);
  expect(html.includes('/travel4life-contact-analytics.js'), `${page.url}: missing contact analytics script.`);
  expect(html.includes(`href="tel:${TRAVEL4LIFE_CONTACT.phoneHref}"`), `${page.url}: missing clickable phone link.`);
  expect(html.includes(`href="mailto:${TRAVEL4LIFE_CONTACT.email}"`), `${page.url}: missing clickable email link.`);
  const hasWhatsappLink = html.includes(`https://wa.me/${TRAVEL4LIFE_CONTACT.whatsappNumber}?text=`);
  const hasWhatsappForm = html.includes(`data-whatsapp-number="${TRAVEL4LIFE_CONTACT.whatsappNumber}"`)
    && html.includes('data-enquiry-send-link');
  expect(hasWhatsappLink || hasWhatsappForm, `${page.url}: missing configured WhatsApp link or enquiry form.`);
  expect(html.includes('data-contact-event='), `${page.url}: contact links have no analytics event attributes.`);
  expect(html.includes(`/jim-corbett/corbett.css`), `${page.url}: missing shared Corbett responsive stylesheet.`);
  expect(html.includes('/jim-corbett/'), `${page.url}: missing links to the Corbett hub.`);
  const sitemapEligible = page.indexable
    && page.qualityStatus === 'approved'
    && page.technicalScore >= 75
    && page.page1Status !== 'RED';
  expect(
    sitemap.includes(`<loc>${url}</loc>`) === sitemapEligible,
    `${page.url}: sitemap inclusion does not match its indexation and quality status.`,
  );
  expect(!/lowest price guaranteed|best rates guaranteed|official booking authority|#1 in jim corbett/i.test(html), `${page.url}: contains an unsupported market claim.`);

  const jsonLdScripts = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  expect(jsonLdScripts.length > 0, `${page.url}: missing JSON-LD.`);
  for (const [index, script] of jsonLdScripts.entries()) {
    try {
      const schema = JSON.parse(script[1]);
      const types = collectSchemaTypes(schema);
      expect(types.includes('BreadcrumbList'), `${page.url}: JSON-LD script ${index + 1} is missing BreadcrumbList.`);
      if (page.pageType === 'resort-directory') {
        expect(types.includes('CollectionPage'), `${page.url}: resort directory JSON-LD is missing CollectionPage.`);
        expect(types.includes('ItemList'), `${page.url}: resort directory JSON-LD is missing ItemList.`);
        expect(!types.some((type) => ['Hotel', 'LodgingBusiness', 'Product', 'Offer', 'AggregateRating', 'Review'].includes(type)), `${page.url}: data does not support hotel, offer or review schema.`);
      }
      if (['weddings', 'mice', 'specialist'].includes(page.pageType)) {
        expect(types.includes('Service'), `${page.url}: planning page JSON-LD is missing Service.`);
        if (['weddings', 'mice'].includes(page.pageType)) {
          expect(types.includes('FAQPage'), `${page.url}: visible planning FAQs are missing FAQPage structured data.`);
        }
        expect(!types.some((type) => ['Event', 'EventVenue', 'Offer', 'AggregateRating', 'Review'].includes(type)), `${page.url}: planning page claims unsupported events, rates or reviews.`);
      }
    } catch (error) {
      errors.push(`${page.url}: invalid JSON-LD in script ${index + 1}: ${error.message}`);
    }
  }
}

const hubHtml = htmlByUrl.get('/jim-corbett/') || '';
for (const page of registry.pages.filter(({ url }) => url !== '/jim-corbett/')) {
  expect(hubHtml.includes(`href="${page.url}"`), `/jim-corbett/: missing direct hub link to ${page.url}.`);
}
expect((hubHtml.match(/<h1\b/gi) || []).length === 1, '/jim-corbett/: expected one H1.');

const directoryHtml = htmlByUrl.get('/jim-corbett/resorts/') || '';
expect((directoryHtml.match(/data-resort-card\b/g) || []).length === 100, `/jim-corbett/resorts/: generated card count does not match imported data (${(directoryHtml.match(/data-resort-card\b/g) || []).length}).`);
expect(directoryHtml.includes('validity, occupancy, meals, taxes and availability are not stated'), '/jim-corbett/resorts/: missing rate validity caveat.');
expect(/needs verification/i.test(directoryHtml), '/jim-corbett/resorts/: missing property verification state.');
expect(!directoryHtml.includes('5%-10% Less'), '/jim-corbett/resorts/: publishes the unverified Travel4life Rate claim.');

const eventRoutes = [
  ['/jim-corbett/weddings/', 'wedding', 'wedding_quote_request'],
  ['/jim-corbett/mice/', 'mice', 'mice_quote_request'],
];
for (const [url, pageType, quoteEvent] of eventRoutes) {
  const html = htmlByUrl.get(url) || '';
  expect(html.includes(`data-corbett-enquiry="${pageType}"`), `${url}: missing the contextual enquiry form.`);
  expect(html.includes(`data-contact-page-type="${pageType}"`), `${url}: missing page-specific conversion context.`);
  expect(html.includes(quoteEvent), `${url}: missing the appropriate quote event.`);
  expect(html.includes('data-enquiry-send-link'), `${url}: missing the WhatsApp form submission link.`);
}

const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1]);
const expectedSitemapUrls = registry.pages.filter(({ indexable, qualityStatus, technicalScore, page1Status }) => (
  indexable && qualityStatus === 'approved' && technicalScore >= 75 && page1Status !== 'RED'
))
  .map(({ url }) => `${siteUrl}${url}`);
expect(new Set(sitemapUrls).size === sitemapUrls.length, 'Corbett sitemap contains duplicate URLs.');
expect(sitemapUrls.length === expectedSitemapUrls.length && expectedSitemapUrls.every((url) => sitemapUrls.includes(url)), 'Corbett sitemap does not exactly match approved registry entries.');

const unsupportedClaims = dataset.source.notes.some((note) => /no rate validity dates/i.test(note));
expect(unsupportedClaims, 'Dataset provenance is missing the rate-validity limitation.');
warnings.push(`${dataset.properties.length} property rows are listed; all ${dataset.properties.length} need verification before availability or suitability claims.`);
warnings.push('Workbook pricing has no validity dates, occupancy, meal plan, tax or room-type context; displayed figures are references only.');
warnings.push('Individual property SEO pages, price landing pages, locality pages and venue-capacity filters are intentionally not generated until supporting data is verified.');

if (errors.length) {
  console.error('FAIL Corbett SEO validation');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  const indexableCount = registry.pages.filter(({ indexable }) => indexable).length;
  console.log(`PASS Corbett SEO validation: ${indexableCount} indexable, ${registry.pages.length - indexableCount} noindex routes; ${dataset.properties.length} source resort records; metadata, canonical, schema, content, sitemap, links, 404 handling and conversion forms checked.`);
  warnings.forEach((warning) => console.warn(`WARN ${warning}`));
}
