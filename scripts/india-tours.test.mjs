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
    travellerCountry: 'United Kingdom',
    tripDuration: '11–14 days',
    travelDates: ' October\n2027 ',
    budget: 'Under £2,000',
    accommodation: 'Boutique hotels',
    travellerType: 'Couple',
    travellerPace: 'Relaxed',
    currencyPreference: 'GBP',
  });

  assert.equal(enquiry.name, 'Asha Shah');
  assert.equal(enquiry.email, 'asha@example.com');
  assert.equal(enquiry.travellerCount, 2);
  assert.match(enquiry.message, /Country of residence: United Kingdom/);
  assert.match(enquiry.message, /Preferred trip duration: 11–14 days/);
  assert.match(enquiry.message, /Selected route idea: Golden Triangle/);
  assert.match(enquiry.message, /Name: Asha Shah/);
  assert.match(enquiry.message, /Email: asha@example\.com/);
  assert.match(enquiry.message, /Preferred travel dates: October 2027/);
  assert.match(enquiry.message, /Travelling as: Couple/);
  assert.match(enquiry.message, /Preferred pace: Relaxed/);
  assert.match(enquiry.message, /Preferred currency: GBP \(preference only/);
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
  assert.throws(() => createIndiaEnquiryMessage({ ...base, travellerCountry: 'Fake market' }), /supported country/);
  assert.match(createIndiaEnquiryMessage({ ...base, travellerCountry: 'Netherlands' }).message, /Country of residence: Netherlands/);
  assert.throws(() => createIndiaEnquiryMessage({ ...base, tripDuration: 'A month' }), /supported trip duration/);
  assert.throws(() => createIndiaEnquiryMessage({ ...base, travellerPace: 'Breakneck' }), /supported travel pace/);
  assert.throws(() => createIndiaEnquiryMessage({ ...base, travellerType: 'Bus tour' }), /supported traveller type/);
  assert.throws(() => createIndiaEnquiryMessage({ ...base, currencyPreference: 'INR' }), /supported currency preference/);
  assert.throws(() => createIndiaEnquiryMessage({
    ...base,
    pageUrl: 'https://travel4life.net/another-page/',
  }), /canonical Travel4Life/);
});

test('India tours page preserves crawlable metadata and wires the accessible luxury journey experience', async () => {
  const html = await readFile(resolve('india-tours/index.html'), 'utf8');
  const entry = await readFile(resolve('src/india-tours/main.tsx'), 'utf8');
  const header = await readFile(resolve('src/india-tours/components/Header.tsx'), 'utf8');
  const hero = await readFile(resolve('src/india-tours/components/Hero.tsx'), 'utf8');
  const trustBar = await readFile(resolve('src/india-tours/components/TrustBar.tsx'), 'utf8');
  const tourGrid = await readFile(resolve('src/india-tours/components/TourGrid.tsx'), 'utf8');
  const routeMap = await readFile(resolve('src/india-tours/components/RouteMap.tsx'), 'utf8');
  const wizard = await readFile(resolve('src/india-tours/components/TripDesignerWizard.tsx'), 'utf8');
  const page = await readFile(resolve('src/india-tours/components/IndiaToursPage.tsx'), 'utf8');
  const regions = await readFile(resolve('src/india-tours/components/types.ts'), 'utf8');
  const globalFooter = await readFile(resolve('src/components/layout/Footer.tsx'), 'utf8');
  const staticSitemap = await readFile(resolve('public/sitemap-static.xml'), 'utf8');
  const stylesheet = await readFile(resolve('src/india-tours/india-tours.css'), 'utf8');
  const entryMarkup = await readFile(resolve('india-tours/index.html'), 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] || '';
  const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1] || '';
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  const socialImage = html.match(/<meta property="og:image" content="([^"]+)"/i)?.[1];
  const visibleContent = html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|quot|lt|gt|#\d+);/gi, ' ');
  const wordCount = visibleContent.trim().split(/\s+/).filter(Boolean).length;
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)]
    .map(([, content]) => JSON.parse(content));
  const schemaTypes = schemas.flatMap((schema) => schema['@graph'].map((node) => node['@type']));

  assert.match(title, /India Tour Planning for International Travellers/);
  assert.ok(description.length >= 80);
  assert.equal(canonical, 'https://travel4life.net/india-tours/');
  assert.equal(socialImage, 'https://travel4life.net/trip-thumbnails/jaipur.jpg');
  assert.match(html, /<meta name="robots" content="index, follow/);
  assert.equal((html.match(/<h1\b/gi) || []).length, 1);
  assert.ok(wordCount >= 500, `Expected at least 500 crawlable fallback words; found ${wordCount}.`);
  assert.equal((html.match(/class="journey-card"/g) || []).length, INDIA_JOURNEY_CONCEPTS.length);
  assert.match(html, /id="india-tours-root"/);
  assert.match(entryMarkup, /src="\.\.\/src\/india-tours\/main\.tsx"/);
  assert.match(globalFooter, /\{ name: 'Inbound', href: '\/india-tours\/' \}/);
  assert.doesNotMatch(html, /hreflang=/i);
  assert.match(html, /No starting prices or availability are represented/);
  assert.match(html, /id="route"/);
  assert.match(html, /id="plan"/);
  assert.match(hero, /India\. Your Way\./);
  assert.match(hero, /One Remarkable Journey\./);
  assert.match(hero, /Start designing my trip/);
  assert.match(hero, /Explore curated itineraries/);
  assert.match(hero, /motion\.h1/);
  assert.match(trustBar, /Established 2014/);
  assert.match(trustBar, /India-led planning/);
  assert.doesNotMatch(`${html}\n${trustBar}`, /Trustpilot|ABTA Protected|Conde Nast Traveler|Rated 5 Stars/i);
  assert.match(tourGrid, /INDIA_JOURNEY_CONCEPTS\.filter/);
  assert.match(tourGrid, /aspect-\[4\/5\]/);
  assert.match(tourGrid, /Request a tailored quote/);
  assert.match(tourGrid, /View itinerary/);
  assert.doesNotMatch(tourGrid, /From \$3,500/);
  assert.match(routeMap, /IntersectionObserver/);
  assert.match(routeMap, /data-route-stop/);
  assert.match(routeMap, /aria-current=\{activeStop === index \? 'step' : undefined\}/);
  assert.match(routeMap, /scrollIntoView/);
  assert.match(wizard, /AnimatePresence/);
  assert.match(wizard, /Who is travelling\?/);
  assert.match(wizard, /What is your preferred pace\?/);
  assert.match(wizard, /When are you looking to go\?/);
  assert.match(wizard, /Where can we reach you\?/);
  assert.match(wizard, /aria-valuenow=\{step \+ 1\}/);
  assert.match(wizard, /createIndiaEnquiryMessage/);
  assert.match(wizard, /contact_whatsapp_click/);
  assert.match(wizard, /this page has not sent your message/i);
  assert.match(regions, /US: \{ label: 'United States', currency: 'USD'/);
  assert.match(regions, /UK: \{ label: 'United Kingdom', currency: 'GBP'/);
  assert.match(regions, /DE: \{ label: 'Germany', currency: 'EUR'/);
  assert.match(regions, /NL: \{ label: 'Netherlands', currency: 'EUR'/);
  assert.match(header, /Choose your region and preferred currency/);
  assert.match(header, /Call our India travel desk/);
  assert.match(page, /india_tours_page_view/);
  assert.match(page, /itinerary_select/);
  assert.match(stylesheet, /prefers-reduced-motion/);
  assert.match(stylesheet, /@tailwind base/);
  assert.match(stylesheet, /Playfair Display/);
  assert.match(stylesheet, /DM Sans/);
  for (const eventName of [
    'india_tours_page_view',
    'itinerary_select',
    'contact_whatsapp_click',
    'contact_email_click',
    'quote_form_draft_prepared',
    'country_market_select',
  ]) assert.ok(`${page}\n${wizard}`.includes(eventName), `Missing privacy-safe analytics event ${eventName}.`);
  assert.ok(!`${page}\n${wizard}`.includes('quote_form_submit'));
  assert.ok(!`${page}\n${wizard}`.includes('quote_form_success'));
  assert.ok(!`${page}\n${wizard}`.includes('tour_detail_view'));
  assert.ok(schemaTypes.includes('CollectionPage'));
  assert.ok(schemaTypes.includes('BreadcrumbList'));
  assert.ok(!schemaTypes.some((type) => ['Product', 'Offer', 'Review', 'AggregateRating'].includes(type)));
  assert.match(staticSitemap, /https:\/\/travel4life\.net\/india-tours\//);
});
