import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  INDIA_DESTINATIONS,
  INDIA_JOURNEY_CONCEPTS,
  getApprovedActivePackages,
  getJourneysMatchingDestination,
  validateJourneyCatalogue,
} from '../src/india-tours/catalog.mjs';
import {
  calculateGroupTotal,
  calculateVerifiedSellingPrice,
  formatCurrency,
} from '../src/india-tours/pricing.mjs';
import { createIndiaEnquiryMessage, sanitizeEnquiryText } from '../src/india-tours/enquiry.mjs';

const validQuote = {
  supplierNetCost: 100,
  supplierCurrency: 'EUR',
  quoteObtainedAt: '2026-10-01T00:00:00Z',
  priceValidUntil: '2026-10-31T23:59:59Z',
  priceStatus: 'verified_price',
  pricingBasis: 'per_person',
  occupancyBasis: 'twin-share',
  now: new Date('2026-10-10T00:00:00Z'),
};

test('journey concepts have unique ids, ordered mapped stops, and safe quote-only data', () => {
  assert.deepEqual(validateJourneyCatalogue(), []);
  assert.equal(INDIA_JOURNEY_CONCEPTS.length, 10);
  assert.equal(INDIA_DESTINATIONS.length, 23);
  assert.equal(getApprovedActivePackages().length, 0);
  assert.ok(INDIA_JOURNEY_CONCEPTS.every((journey) => (
    journey.approval_status === 'draft'
    && journey.is_active === false
    && journey.price_status === 'quote_required'
    && journey.selling_price === null
  )));
});

test('destination matching returns all concepts that include a selected mapped place', () => {
  assert.deepEqual(
    getJourneysMatchingDestination('Kochi').map(({ id }) => id),
    ['golden-triangle-kerala', 'kerala-discovery', 'grand-india'],
  );
});

test('price utility applies the 15% uplift once and rounds to the currency minor unit', () => {
  assert.equal(calculateVerifiedSellingPrice(validQuote).amount, 115);
  assert.equal(calculateVerifiedSellingPrice({ ...validQuote, supplierNetCost: 100.125 }).amount, 115.14);
  assert.equal(calculateVerifiedSellingPrice({
    ...validQuote,
    supplierCurrency: 'JPY',
    supplierNetCost: 100,
  }).amount, 115);
});

test('quote-only, incomplete and expired supplier quotes never produce a numeric price', () => {
  assert.equal(calculateVerifiedSellingPrice({ ...validQuote, priceStatus: 'quote_required' }).amount, null);
  assert.equal(calculateVerifiedSellingPrice({ ...validQuote, supplierNetCost: null }).amount, null);
  assert.equal(calculateVerifiedSellingPrice({ ...validQuote, priceValidUntil: '2026-10-02T00:00:00Z' }).amount, null);
  assert.equal(calculateVerifiedSellingPrice({ ...validQuote, occupancyBasis: null }).amount, null);
});

test('price utility rejects double markup and invalid currency or costs', () => {
  assert.throws(() => calculateVerifiedSellingPrice({ ...validQuote, markupAlreadyApplied: true }), /already includes markup/);
  assert.throws(() => calculateVerifiedSellingPrice({ ...validQuote, supplierCurrency: 'EURO' }), /Unsupported currency/);
  assert.throws(() => calculateVerifiedSellingPrice({ ...validQuote, supplierNetCost: -2 }), /greater than zero/);
});

test('group totals require an explicit occupancy basis and valid traveller count', () => {
  assert.equal(calculateGroupTotal({ perPersonPrice: 115, travellerCount: 3, occupancyBasis: 'twin-share' }), 345);
  assert.throws(() => calculateGroupTotal({ perPersonPrice: 115, travellerCount: 3 }), /occupancy basis/);
  assert.throws(() => calculateGroupTotal({ perPersonPrice: 115, travellerCount: 0, occupancyBasis: 'twin-share' }), /between 1 and 40/);
});

test('currency formatter uses localized currency display', () => {
  assert.equal(formatCurrency(115, 'EUR', 'en-GB'), '€115.00');
});

test('India enquiry draft includes the selected concept and safely bounded visitor details', () => {
  const enquiry = createIndiaEnquiryMessage({
    journey: INDIA_JOURNEY_CONCEPTS[0],
    travellerName: '  Asha\nShah  ',
    travellerEmail: '  asha@example.com  ',
    travellerCount: '2',
    travelDates: ' October\n2027 ',
    budget: 'Under £2,000',
    accommodation: 'Boutique hotels',
  });

  assert.equal(enquiry.name, 'Asha Shah');
  assert.equal(enquiry.email, 'asha@example.com');
  assert.equal(enquiry.travellerCount, 2);
  assert.match(enquiry.message, /Selected route idea: Golden Triangle/);
  assert.match(enquiry.message, /Name: Asha Shah/);
  assert.match(enquiry.message, /Email: asha@example\.com/);
  assert.match(enquiry.message, /Preferred travel dates: October 2027/);
  assert.match(enquiry.message, /Route page: https:\/\/travel4life\.net\/india-tours\//);
  assert.ok(!/[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/.test(enquiry.message));
  assert.equal(sanitizeEnquiryText(`${'x'.repeat(110)}\nignored`, 100).length, 100);
});

test('India enquiry draft rejects invalid required details and non-canonical page URLs', () => {
  const base = {
    journey: INDIA_JOURNEY_CONCEPTS[0],
    travellerName: 'Asha',
    travellerEmail: 'asha@example.com',
    travellerCount: 2,
  };
  assert.throws(() => createIndiaEnquiryMessage({ ...base, travellerName: '' }), /enter your name/);
  assert.throws(() => createIndiaEnquiryMessage({ ...base, travellerEmail: 'not-an-email' }), /valid email/);
  assert.throws(() => createIndiaEnquiryMessage({ ...base, travellerCount: '2.5' }), /whole number/);
  assert.throws(() => createIndiaEnquiryMessage({ ...base, travellerCount: 41 }), /whole number/);
  assert.throws(() => createIndiaEnquiryMessage({
    ...base,
    pageUrl: 'https://travel4life.net/another-page/',
  }), /canonical Travel4Life/);
});

test('India tours page has crawlable metadata, content, accessibility controls, and no unsupported offer schema', async () => {
  const html = await readFile(resolve('india-tours/index.html'), 'utf8');
  const entry = await readFile(resolve('src/india-tours/main.ts'), 'utf8');
  const globalFooter = await readFile(resolve('src/components/layout/Footer.tsx'), 'utf8');
  const staticSitemap = await readFile(resolve('public/sitemap-static.xml'), 'utf8');
  const stylesheet = await readFile(resolve('src/india-tours/india-tours.css'), 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] || '';
  const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1] || '';
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  const visibleContent = html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|quot|lt|gt|#\d+);/gi, ' ');
  const wordCount = visibleContent.trim().split(/\s+/).filter(Boolean).length;
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)]
    .map(([, content]) => JSON.parse(content));
  const schemaTypes = schemas.flatMap((schema) => schema['@graph'].map((node) => node['@type']));

  assert.match(title, /India Tour Packages for International Travellers/);
  assert.ok(description.length >= 80);
  assert.equal(canonical, 'https://travel4life.net/india-tours/');
  assert.match(html, /<meta name="robots" content="index, follow/);
  assert.equal((html.match(/<h1\b/gi) || []).length, 1);
  assert.ok(wordCount >= 500, `Expected at least 500 crawlable words; found ${wordCount}.`);
  assert.equal((html.match(/class="journey-card"/g) || []).length, INDIA_JOURNEY_CONCEPTS.length);
  assert.match(html, /Interactive map of India/);
  assert.match(html, /aria-label="Choose map or itinerary view"/);
  assert.match(html, /href="\/india-tours\/" aria-current="page">Inbound<\/a>/);
  assert.match(globalFooter, /\{ name: 'Inbound', href: '\/india-tours\/' \}/);
  assert.match(html, /Government-certified guides/);
  assert.match(html, /Cash &amp; crypto/);
  assert.match(entry, /highlightsToggle\.addEventListener\('click'/);
  assert.match(stylesheet, /prefers-reduced-motion/);
  assert.match(stylesheet, /@keyframes proof-scroll/);
  assert.match(stylesheet, /@keyframes text-shimmer/);
  assert.match(stylesheet, /@keyframes journey-card-highlight/);
  assert.match(html, /nothing has been sent or saved/i);
  assert.match(html, /href="https:\/\/wa\.me\/919511446642/);
  assert.match(html, /href="mailto:info@travel4life\.net"/);
  assert.match(entry, /https:\/\/www\.openstreetmap\.org\/copyright/);
  for (const eventName of [
    'india_tours_page_view',
    'india_tours_map_select',
    'india_tours_package_select',
    'india_tours_route_play',
    'india_tours_itinerary_open',
    'india_tours_quote_click',
    'contact_whatsapp_click',
    'contact_email_click',
    'lead_form_start',
    'lead_form_error',
    'lead_form_draft_prepared',
  ]) assert.ok(entry.includes(eventName), `Missing privacy-safe analytics event ${eventName}.`);
  assert.ok(schemaTypes.includes('CollectionPage'));
  assert.ok(schemaTypes.includes('BreadcrumbList'));
  assert.ok(!schemaTypes.some((type) => ['Product', 'Offer', 'Review', 'AggregateRating'].includes(type)));
  assert.match(staticSitemap, /https:\/\/travel4life\.net\/india-tours\//);
});
