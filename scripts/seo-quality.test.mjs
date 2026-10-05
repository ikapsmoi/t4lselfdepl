import test from 'node:test';
import assert from 'node:assert/strict';
import { getProductQuality } from './seo-quality.mjs';
import { renderProductPage } from './render-product-page.mjs';
import { isIndexableEuropePage } from './europe-page-eligibility.mjs';
import {
  getTravel4LifeContactContextFromLocation,
  getTravel4LifeQuoteEvents,
  getTravel4LifeWhatsAppUrl,
  TRAVEL4LIFE_CONTACT,
} from '../src/utils/travel4lifeContact.js';
import { injectContactLayerHtml } from './contact-layer-markup.mjs';

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
  assert.equal(isIndexableEuropePage('/europe/paris-switzerland/', [trip]), false);
  assert.equal(isIndexableEuropePage('/europe/', [{
    ...trip,
    location: 'Brussels, ',
    itinerary: { ...trip.itinerary, description: `${trip.itinerary.description} Includes Switzerland ideas.` },
  }]), false);
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
  assert.match(html, /class="floating-whatsapp" href="https:\/\/wa\.me\/919511446642\?text=Hi"/);
  assert.doesNotMatch(html, /t4l-contact-header/);
  assert.match(html, /class="t4l-contact-buttons"/);
  assert.match(html, /data-contact-event="contact_whatsapp_click"/);
  assert.match(html, /data-contact-page-type="jim-corbett"/);
  assert.match(html, /<h1>Jim Corbett<\/h1><h2>Resorts<\/h2><p>Explore current resort information\.<\/p><section class="t4l-contact-panel"/);
  assert.match(html, /Plan with Travel4Life/);

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
  assert.match(html, /rel="canonical" href="https:\/\/travel4life\.net\/trips\/74c8aeb3-625c-48f8-9516-d6b25973dba7"/);
  assert.match(html, /"priceCurrency":"INR"/);
  assert.match(html, /"price":85000/);
  assert.match(html, /Group capacity<\/dt><dd>Up to 12 travellers/);
  assert.match(html, /https:\/\/travel4life\.net\/trips\/74c8aeb3-625c-48f8-9516-d6b25973dba7/);
  assert.match(html, /\\u003c\/script>/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
});
