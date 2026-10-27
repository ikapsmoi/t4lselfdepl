import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getProductQuality, productPath } from './seo-quality.mjs';
import { renderProductPage } from './render-product-page.mjs';
import { injectTomorrowlandTripCards, renderTomorrowlandTripCards, selectTomorrowlandTrips } from './tomorrowland-trip-cards.mjs';
import { getEligibleEuropeTrips, isIndexableEuropePage } from './europe-page-eligibility.mjs';
import { renderEuropeBudgetListings } from './gate-europe-pages.mjs';
import {
  getTravel4LifeContactContextFromLocation,
  getTravel4LifeQuoteEvents,
  getTravel4LifeWhatsAppUrl,
  TRAVEL4LIFE_CONTACT,
} from '../src/utils/travel4lifeContact.js';
import { injectContactLayerHtml } from './contact-layer-markup.mjs';
import { createTomorrowlandB2BWhatsAppUrl } from '../public/tomorrowland-b2b-enquiry.js';

const referenceDate = new Date('2026-10-05T00:00:00.000Z');
const trip = {
  id: '74c8aeb3-625c-48f8-9516-d6b25973dba7',
  title: 'Autumn group adventure',
  category: 'festival',
  location: 'Amsterdam, Netherlands',
  start_date: '2026-11-10',
  end_date: '2026-11-14',
  price_per_person: 85000,
  currency: 'INR',
  group_size: 12,
  images: ['https://images.example/trip.jpg'],
  itinerary: {
    description: 'Join this hosted trip for a thoughtfully paced group adventure with local experiences.',
    duration: 5,
    included: ['Accommodation', 'Local guide'],
  },
  updated_at: '2026-10-01T10:30:00.000Z',
};
const template = `<!doctype html><html><head>
<title>Travel4life</title>
<meta name="description" content="Default description">
<meta name="robots" content="index, follow">
<meta property="og:title" content="Travel4life">
<meta property="og:description" content="Default description">
<meta property="og:url" content="https://travel4life.net/">
<meta property="og:image" content="https://travel4life.net/findyourtribe1.jpg">
<meta property="og:type" content="website">
<meta name="twitter:title" content="Travel4life">
<meta name="twitter:description" content="Default description">
<meta name="twitter:image" content="https://travel4life.net/findyourtribe1.jpg">
<link rel="canonical" href="https://travel4life.net/">
</head><body><div id="root"></div></body></html>`;

test('only future, coherent, complete products pass the indexability gate', () => {
  assert.equal(getProductQuality(trip, referenceDate).eligible, true);
  assert.equal(productPath(trip.id), `/trips/${trip.id}/`);
  assert.equal(getProductQuality({ ...trip, end_date: '2026-10-04' }, referenceDate).checks.dates, false);
  assert.equal(getProductQuality({ ...trip, end_date: '2026-11-01' }, referenceDate).checks.dates, false);
  assert.equal(getProductQuality({ ...trip, id: '../not-a-trip' }, referenceDate).checks.id, false);
  assert.equal(getProductQuality({ ...trip, location: ', ' }, referenceDate).checks.destination, false);
  assert.equal(getProductQuality({ ...trip, images: ['javascript:alert(1)'] }, referenceDate).checks.image, false);
});

test('Europe commercial pages require matching future inventory', () => {
  assert.equal(isIndexableEuropePage('/europe/switzerland/', [trip]), false);
  assert.equal(isIndexableEuropePage('/europe/', [trip]), true);
  assert.equal(isIndexableEuropePage('/europe/tours-under-200000/', [trip]), true);
  assert.equal(isIndexableEuropePage('/europe/not-a-budget-route/', [trip]), true);
  assert.equal(isIndexableEuropePage('/europe/paris-switzerland/', [trip]), false);
  assert.equal(isIndexableEuropePage('/europe/', [{
    ...trip,
    location: 'Brussels, ',
    itinerary: { ...trip.itinerary, description: `${trip.itinerary.description} Includes Switzerland ideas.` },
  }]), false);
});

test('Europe under-2-lakh listings are filtered and rendered from matching product data', () => {
  const atLimit = { ...trip, price_per_person: 200000 };
  const zeroPrice = { ...trip, id: 'c4c8aeb3-625c-48f8-9516-d6b25973dba7', price_per_person: 0 };
  const overLimit = { ...trip, id: 'a4c8aeb3-625c-48f8-9516-d6b25973dba7', price_per_person: 200001 };
  const nonEurope = { ...trip, id: 'b4c8aeb3-625c-48f8-9516-d6b25973dba7', location: 'Bangkok, Thailand' };
  const eligible = getEligibleEuropeTrips('/europe/tours-under-200000/', [trip, atLimit, zeroPrice, overLimit, nonEurope]);

  assert.deepEqual(eligible.map(({ price_per_person }) => price_per_person), [85000, 200000]);
  const cards = renderEuropeBudgetListings(eligible);
  assert.match(cards, /Autumn group adventure/);
  assert.match(cards, /₹85,000 per person/);
  assert.match(cards, /10 Nov 2026–14 Nov 2026/);
  assert.doesNotMatch(cards, /5 days/);
  assert.match(cards, /\/trips\/74c8aeb3-625c-48f8-9516-d6b25973dba7\//);
  assert.doesNotMatch(cards, /Bangkok|200,001/);
  assert.match(renderEuropeBudgetListings([]), /no active qualifying Europe trip listings/i);
});

test('Tomorrowland trip cards only include related, destination-matched inventory', () => {
  const winterTrip = {
    ...trip,
    id: 'winter-trip',
    title: 'Tomorrowland Winter group trip',
    location: "Alpe d'Huez, France",
    start_date: '2027-03-10',
    end_date: '2027-03-14',
  };
  const belgiumTrip = {
    ...trip,
    id: 'belgium-trip',
    title: 'Tomorrowland Belgium group trip',
    location: 'Boom, Belgium',
    start_date: '2027-07-10',
    end_date: '2027-07-14',
  };
  const thailandTrip = {
    ...trip,
    id: 'thailand-trip',
    title: 'Tomorrowland Thailand group trip',
    location: 'Thailand',
    start_date: '2027-11-10',
    end_date: '2027-11-14',
  };
  const unrelatedTrip = { ...trip, id: 'unrelated', title: 'Amsterdam group adventure' };
  const listings = [thailandTrip, unrelatedTrip, belgiumTrip, winterTrip];

  assert.deepEqual(selectTomorrowlandTrips(listings, 'tomorrowland').map(({ id }) => id), [
    'winter-trip',
    'belgium-trip',
    'thailand-trip',
  ]);
  assert.deepEqual(selectTomorrowlandTrips(listings, 'belgium').map(({ id }) => id), ['belgium-trip']);
  assert.deepEqual(selectTomorrowlandTrips(listings, 'winter').map(({ id }) => id), ['winter-trip']);
  assert.deepEqual(selectTomorrowlandTrips(listings, 'thailand').map(({ id }) => id), ['thailand-trip']);
});

test('Tomorrowland trip cards escape inventory, expose pricing and link to availability details', () => {
  const unsafeTrip = {
    ...trip,
    id: '74c8aeb3-625c-48f8-9516-d6b25973dba7',
    title: 'Tomorrowland <Winter> & Alps',
    location: "Alpe d'Huez, France",
  };
  const cards = renderTomorrowlandTripCards([unsafeTrip], 'winter');

  assert.match(cards, /Current Tomorrowland Winter trips/);
  assert.match(cards, /Tomorrowland &lt;Winter&gt; &amp; Alps/);
  assert.match(cards, /₹85,000 per person/);
  assert.match(cards, /href="\/trips\/74c8aeb3-625c-48f8-9516-d6b25973dba7\/"/);
  assert.match(cards, /View trip &amp; check availability/);
  assert.match(cards, /Festival access is not implied/);
  assert.doesNotMatch(cards, /<img src="javascript:/);
});

test('Tomorrowland trip cards follow the page introduction and are omitted without matching inventory', () => {
  const template = '<html><head></head><body><main><article><div class="notice">Read before booking.</div><h2>Trip information</h2><p>Guide introduction.</p></article></main></body></html>';
  const tomorrowlandTrip = { ...trip, title: 'Tomorrowland festival group trip' };
  const cards = injectTomorrowlandTripCards(template, [tomorrowlandTrip], 'tomorrowland');
  const introductionEnd = cards.indexOf('</p>');
  const cardsStart = cards.indexOf('<section class="t4l-trip-listing"');

  assert.ok(cardsStart > introductionEnd);
  assert.ok(cards.indexOf('href="/seo-trip-cards.css"') > -1);
  assert.equal(injectTomorrowlandTripCards(template, [{ ...trip, title: 'Other festival trip' }], 'tomorrowland'), template);
});

test('the global contact panel stays outside the generated trip card section', () => {
  const template = '<html><head></head><body><main><article><div class="notice">Read before booking.</div><h2>Trip information</h2><p>Guide introduction.</p></article></main></body></html>';
  const withCards = injectTomorrowlandTripCards(template, [{ ...trip, title: 'Tomorrowland festival group trip' }], 'tomorrowland');
  const withContactPanel = injectContactLayerHtml(withCards, { pageType: 'festival', destination: 'Tomorrowland' });
  const listingStart = withContactPanel.indexOf('<section class="t4l-trip-listing"');
  const contactPanelStart = withContactPanel.indexOf('<section class="t4l-contact-panel"');
  const listingEnd = withContactPanel.indexOf('</section>', listingStart);

  assert.ok(contactPanelStart >= 0);
  assert.ok(contactPanelStart < listingStart || contactPanelStart > listingEnd);
});

test('shared contact configuration creates contextual, clickable contact actions', () => {
  assert.equal(TRAVEL4LIFE_CONTACT.phone, '+91 9511446642');
  assert.match(getTravel4LifeWhatsAppUrl({ pageType: 'wedding', destination: 'Jim Corbett' }), /wa\.me\/919511446642\?text=/);
  const europe = getTravel4LifeContactContextFromLocation('/europe/switzerland/', 'Switzerland Tours | Travel4life');
  const europeMessage = new URL(getTravel4LifeWhatsAppUrl(europe)).searchParams.get('text');
  assert.match(europeMessage, /Switzerland from India/);
  assert.doesNotMatch(europeMessage, /Switzerland, Switzerland/);
  const tomorrowland = getTravel4LifeContactContextFromLocation('/tomorrowland/from-india/', 'Tomorrowland from India | Travel4life');
  const festivalMessage = new URL(getTravel4LifeWhatsAppUrl(tomorrowland)).searchParams.get('text');
  assert.match(festivalMessage, /Tomorrowland festival trip/);
  assert.doesNotMatch(festivalMessage, /Tomorrowland festival trip in Tomorrowland/);
  for (const [path, destination] of [
    ['/tomorrowland/thailand/', 'Tomorrowland Thailand'],
    ['/tomorrowland/winter/', 'Tomorrowland Winter'],
    ['/tomorrowland/belgium/', 'Tomorrowland Belgium'],
  ]) {
    const context = getTravel4LifeContactContextFromLocation(path, `${destination} | Travel4life`);
    const message = new URL(getTravel4LifeWhatsAppUrl(context)).searchParams.get('text');
    assert.equal(context.destination, destination);
    assert.match(message, new RegExp(`${destination} trip from India`));
    assert.match(message, /what travel options may be available/);
  }
  assert.deepEqual(getTravel4LifeQuoteEvents('resort'), ['availability_request', 'resort_enquiry']);
  assert.deepEqual(getTravel4LifeQuoteEvents('package'), ['availability_request', 'package_enquiry']);
  const product = getTravel4LifeContactContextFromLocation('/trips/74c8aeb3-625c-48f8-9516-d6b25973dba7', 'Trip title | Travel Package');
  assert.equal(product.pageType, 'package');
  assert.equal(product.package, 'Trip title');

  const html = injectContactLayerHtml(
    '<html><head></head><body><header><nav></nav></header><main><h1>Jim Corbett</h1><h2>Resorts</h2><p>Explore current resort information.</p></main><a class="floating-whatsapp" href="https://wa.me/919871621921?text=Hi">Plan with us</a></body></html>',
    { pageType: 'jim-corbett', destination: 'Jim Corbett' },
  );
  assert.match(html, /href="tel:\+919511446642"/);
  assert.match(html, /href="mailto:info@travel4life\.net"/);
  assert.doesNotMatch(html, /t4l-contact-panel--hero/);
  assert.match(html, /t4l-contact-panel--final/);
  assert.doesNotMatch(html, /t4l-contact-sticky|t4l-global-footer/);
  assert.match(html, /class="floating-whatsapp" href="https:\/\/wa\.me\/919511446642\?text=Hi%20Travel4Life%2C/);
  assert.match(html, /class="floating-whatsapp"[^>]*data-contact-event="contact_whatsapp_click"/);
  assert.match(html, /class="floating-whatsapp"[^>]*data-contact-secondary-event="quote_request_click"/);
  assert.doesNotMatch(html, /t4l-contact-header/);
  assert.match(html, /class="t4l-contact-buttons"/);
  assert.match(html, /data-contact-event="contact_whatsapp_click"/);
  assert.match(html, /data-contact-page-type="jim-corbett"/);
  assert.match(html, /<h1>Jim Corbett<\/h1><h2>Resorts<\/h2><p>Explore current resort information\.<\/p><section class="t4l-contact-panel"/);
  assert.match(html, /Plan with Travel4Life/);

  const thailandContext = getTravel4LifeContactContextFromLocation('/tomorrowland/thailand/', 'Tomorrowland Thailand | Travel4life');
  const thailandHtml = injectContactLayerHtml(
    '<html><head></head><body><header><a class="whatsapp-button" href="https://wa.me/919511446642?text=Hi" aria-label="Chat with Travel4life on WhatsApp"><span>WhatsApp us</span></a></header><main><h1>Tomorrowland Thailand</h1></main><a class="floating-whatsapp" href="https://wa.me/919511446642?text=Hi"><span>WhatsApp us</span></a></body></html>',
    thailandContext,
  );
  assert.match(thailandHtml, /aria-label="Ask Travel4Life about Tomorrowland Thailand on WhatsApp"/);
  assert.match(thailandHtml, /class="whatsapp-button" href="https:\/\/wa\.me\/919511446642\?text=Hi%20Travel4Life%2C/);
  assert.match(thailandHtml, /<span>Ask about Thailand<\/span>/);
  assert.match(thailandHtml, /<span>Ask about Thailand options<\/span>/);
  assert.match(thailandHtml, /<span>Ask about Thailand travel options<\/span>/);
  assert.match(thailandHtml, /data-contact-destination="Tomorrowland Thailand"/);

  const mysterylandContext = getTravel4LifeContactContextFromLocation(
    '/mysteryland/2027/',
    'Mysteryland 2027 Packages from India | Travel4life',
  );
  assert.equal(mysterylandContext.pageType, 'festival');
  assert.equal(mysterylandContext.destination, 'Mysteryland 2027');
  assert.equal(mysterylandContext.eventType, 'Mysteryland 2027 trip from India');
  const mysterylandMessage = new URL(getTravel4LifeWhatsAppUrl(mysterylandContext)).searchParams.get('text');
  assert.equal(
    mysterylandMessage,
    'Hi Travel4Life, I am interested in Mysteryland 2027 trip from India. Please share what travel options may be available and the details I should confirm.',
  );

  const belgiumPackageContext = getTravel4LifeContactContextFromLocation(
    '/tomorrowland/belgium/packages/',
    'Tomorrowland Belgium Package Enquiry | Travel4life',
  );
  const belgiumPackageHtml = injectContactLayerHtml(
    '<html><head></head><body><main><h1>Belgium package enquiry</h1><a class="button" href="https://wa.me/919511446642?text=Hi">Enquire on WhatsApp</a><a href="https://wa.me/919511446642?text=Hi">WhatsApp concierge</a></main></body></html>',
    belgiumPackageContext,
  );
  const enquiryCta = belgiumPackageHtml.match(/<a class="button"[^>]*>Enquire on WhatsApp<\/a>/)?.[0] || '';
  const conciergeCta = belgiumPackageHtml.match(/<a href="https:\/\/wa\.me\/[^"]*"[^>]*>WhatsApp concierge<\/a>/)?.[0] || '';
  assert.match(enquiryCta, /target="_blank" rel="noopener noreferrer"/);
  assert.match(enquiryCta, /data-contact-event="contact_whatsapp_click"/);
  assert.match(enquiryCta, /data-contact-secondary-event="quote_request_click"/);
  assert.match(enquiryCta, /data-contact-destination="Tomorrowland Belgium"/);
  assert.match(enquiryCta, /text=Hi%20Travel4Life%2C/);
  assert.match(conciergeCta, /data-contact-event="contact_whatsapp_click"/);
  assert.doesNotMatch(conciergeCta, /data-contact-secondary-event=/);

  const weddingHtml = injectContactLayerHtml(
    '<html><head></head><body><header><nav></nav></header><main><h1>Jim Corbett Weddings</h1><h2>Venues</h2><p>Compare wedding venues.</p></main></body></html>',
    { pageType: 'wedding', destination: 'Jim Corbett' },
  );
  assert.match(weddingHtml, /data-contact-secondary-event="wedding_quote_request"/);

  const nativeContactHtml = injectContactLayerHtml(
    '<html><head></head><body data-t4l-contact-layer><main><h1>Jim Corbett Wedding Planning</h1></main></body></html>',
    { pageType: 'wedding', destination: 'Jim Corbett' },
    { url: 'https://example.supabase.co', anonKey: 'public-anon-key-placeholder' },
  );
  assert.doesNotMatch(nativeContactHtml, /t4l-contact-panel/);
  assert.match(nativeContactHtml, /travel4life-contact-analytics\.js/);
  assert.match(nativeContactHtml, /t4l-contact-analytics/);

  const miceHtml = injectContactLayerHtml(
    '<html><head></head><body><header><nav></nav></header><main><h1>Jim Corbett MICE</h1><h2>Venues</h2><p>Plan your corporate event.</p></main></body></html>',
    { pageType: 'mice', destination: 'Jim Corbett' },
  );
  assert.match(miceHtml, /data-contact-secondary-event="mice_quote_request"/);
});

test('B2B WhatsApp drafts preserve agent-specific context through contact-layer generation', async () => {
  const source = await readFile(new URL('../public/tomorrowland/b2b-travel-agent-packages/index.html', import.meta.url), 'utf8');
  const context = getTravel4LifeContactContextFromLocation(
    '/tomorrowland/b2b-travel-agent-packages/',
    'Tomorrowland B2B Travel Packages | Travel4life',
  );
  const html = injectContactLayerHtml(source, context);
  const requestCta = html.match(/<a class="button"[^>]*>Request B2B rates<\/a>/)?.[0] || '';
  const requestMessage = new URL(requestCta.match(/\bhref="([^"]+)"/)?.[1] || '').searchParams.get('text');
  const floatingCta = html.match(/<a class="floating-whatsapp"[^>]*>/)?.[0] || '';
  const floatingMessage = new URL(floatingCta.match(/\bhref="([^"]+)"/)?.[1] || '').searchParams.get('text');

  assert.match(requestMessage, /Tomorrowland B2B travel options from India/);
  assert.match(floatingMessage, /travel agent/);
  assert.match(floatingMessage, /B2B quote from India/);
  assert.doesNotMatch(floatingMessage, /Tomorrowland festival trip in Tomorrowland/);
  assert.match(html, /data-b2b-enquiry-form/);
  assert.match(html, /required/);
  assert.match(html, /data-b2b-enquiry-status role="status"/);
  assert.match(html, /Your draft is ready but has not been sent/);
  assert.match(html, /tomorrowland-b2b-enquiry\.js/);
});

test('B2B form data creates a bounded, unsent WhatsApp message draft', () => {
  const url = new URL(createTomorrowlandB2BWhatsAppUrl({
    agency: 'North Star Travel',
    destination: 'Belgium',
    departureCity: 'Mumbai\nIgnore this',
    travelWindow: '2027-07',
    travellers: '18',
    components: ['Flights', 'Accommodation', 'Unrecognized'],
  }, TRAVEL4LIFE_CONTACT.whatsappNumber));
  const message = url.searchParams.get('text');

  assert.equal(url.hostname, 'wa.me');
  assert.match(message, /travel agent requesting a Tomorrowland B2B travel quote from India/);
  assert.match(message, /Agency: North Star Travel/);
  assert.match(message, /Destination: Belgium/);
  assert.match(message, /Departure city: Mumbai Ignore this/);
  assert.match(message, /Estimated travellers: 18/);
  assert.match(message, /Requested components: Flights, Accommodation/);
  assert.doesNotMatch(message, /Unrecognized|Email:|phone number/i);
  assert.throws(() => createTomorrowlandB2BWhatsAppUrl({
    agency: '',
    destination: 'Belgium',
  }, TRAVEL4LIFE_CONTACT.whatsappNumber), /Agency name/);
});

test('static trip HTML contains escaped inventory details, canonical and structured data', () => {
  const unsafeTrip = {
    ...trip,
    title: 'Autumn $& <adventure>',
    images: ['javascript:alert(1)', '/trip-thumbnails/amsterdam.jpg'],
    itinerary: {
      ...trip.itinerary,
      description: 'Join this hosted trip for a thoughtfully paced group adventure with local experiences.</script><script>alert(1)</script>',
    },
  };
  const html = renderProductPage(template, unsafeTrip, [trip]);

  assert.match(html, /<title>Autumn \$&amp; &lt;adventure&gt; \| Travel Package \| Travel4life<\/title>/);
  assert.match(html, /<h1>Autumn \$&amp; &lt;adventure&gt;<\/h1>/);
  assert.match(html, /https:\/\/travel4life\.net\/trip-thumbnails\/amsterdam\.jpg/);
  assert.match(html, /rel="canonical" href="https:\/\/travel4life\.net\/trips\/74c8aeb3-625c-48f8-9516-d6b25973dba7\/"/);
  assert.match(html, /"priceCurrency":"INR"/);
  assert.match(html, /"price":85000/);
  assert.match(html, /Group capacity<\/dt><dd>Up to 12 travellers/);
  assert.match(html, /https:\/\/travel4life\.net\/trips\/74c8aeb3-625c-48f8-9516-d6b25973dba7\//);
  assert.match(html, /\\u003c\/script>/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
});

test('Tomorrowland product pages link back to the relevant planning checklist only when applicable', () => {
  const tomorrowlandTrip = {
    ...trip,
    title: 'Tomorrowland Winter group trip',
    location: "Alpe d'Huez, France",
  };
  const tomorrowlandHtml = renderProductPage(template, tomorrowlandTrip);
  const unrelatedHtml = renderProductPage(template, trip);

  assert.match(tomorrowlandHtml, /Tomorrowland trip planning/);
  assert.match(tomorrowlandHtml, /href="\/tomorrowland\/packages\/">Review the Tomorrowland package and ticket checklist/);
  assert.match(tomorrowlandHtml, /Festival access is included only if the written trip inclusions say so/);
  assert.doesNotMatch(unrelatedHtml, /tomorrowland-planning|\/tomorrowland\/packages\//);
});

test('Tomorrowland ticket guidance uses current official status without unverified prices', async () => {
  const readPublic = (path) => readFile(new URL(`../public/${path}`, import.meta.url), 'utf8');
  const [ticket, belgium, winter, thailand, cost, intentMap, sitemap] = await Promise.all([
    readPublic('tomorrowland/tickets/index.html'),
    readPublic('tomorrowland/belgium/index.html'),
    readPublic('tomorrowland/winter/index.html'),
    readPublic('tomorrowland/thailand/index.html'),
    readPublic('tomorrowland/cost-from-india/index.html'),
    readPublic('tomorrowland/search-intent-map.json').then(JSON.parse),
    readPublic('sitemap-static.xml'),
  ]);
  const priceTables = [belgium, winter, thailand, cost].join('\n');
  const ticketOwner = intentMap.owners.find(({ url }) => url === '/tomorrowland/tickets/');
  const thailandOwner = intentMap.owners.find(({ url }) => url === '/tomorrowland/thailand/');

  assert.ok(ticketOwner);
  assert.match(sitemap, /https:\/\/travel4life\.net\/tomorrowland\/tickets\//);
  assert.match(ticket, /Tomorrowland Winter/);
  assert.match(ticket, /festival tickets are on sale/i);
  assert.match(ticket, /2026 event is sold out/i);
  assert.match(ticket, /Global Journey packages are sold out/i);
  assert.match(ticket, /festival takes place in Boom, Belgium/i);
  assert.match(ticket, /How do you check official Tomorrowland ticket availability/i);
  assert.match(ticket, /href="#ticket-availability"/);
  assert.match(ticket, /Where should you stay for Tomorrowland/i);
  assert.match(ticket, /href="\/tomorrowland\/accommodation\/"/);
  assert.match(ticket, /Tomorrowland ticket prices in India \(INR\)/i);
  assert.match(ticket, /How much do Tomorrowland tickets cost in Indian rupees/i);
  assert.match(ticket, /When do Tomorrowland Belgium tickets go on sale/i);
  assert.match(ticket, /Can I buy Tomorrowland tickets at the venue/i);
  assert.match(ticket, /Can I buy or sell a Tomorrowland ticket through a resale listing/i);
  assert.match(ticket, /"@type":"FAQPage"/);
  assert.match(ticket, /"dateModified":"2026-10-27"/);
  assert.match(ticket, /relevant official edition checkout for the live amount/i);
  assert.match(ticket, /not the festival organiser or an authorised ticket seller/i);
  assert.match(ticket, /<title>Tomorrowland Tickets: Prices &amp; Official Sales \| Travel4life<\/title>/);
  assert.match(belgium, /those dates have passed/i);
  assert.match(winter, /4- and 7-day packages.*sold out/i);
  assert.match(thailand, /2026 event is sold out/i);
  assert.doesNotMatch(priceTables, /(?:€|THB|R\$)\s?[\d,]+|₹\s?[\d,]+/);
  assert.doesNotMatch(thailand, /thailand\.tomorrowland\.com\/en\/passes-packages\//);
  assert.equal(thailandOwner?.tripInventory, undefined);
});
