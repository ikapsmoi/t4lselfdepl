import test from 'node:test';
import assert from 'node:assert/strict';
import { formatTripDateRange, formatTripDescription, formatTripListItems, formatTripPrice, stripSourceNotes } from '../src/utils/formatters.ts';

test('formatTripDateRange displays Flexible instead of stored dates', () => {
  assert.equal(formatTripDateRange('2026-12-09', '2026-12-15', true), 'Flexible');
});

test('formatTripDateRange retains fixed dates and handles missing date values', () => {
  assert.equal(
    formatTripDateRange('2026-12-09', '2026-12-15', false, (date) => date),
    '2026-12-09 - 2026-12-15',
  );
  assert.equal(formatTripDateRange(undefined, undefined, false), 'Dates not available');
});

test('formatTripPrice formats the stored amount with its currency, including zero', () => {
  assert.equal(formatTripPrice(12500, 'INR'), '₹12,500');
  assert.equal(formatTripPrice(0, 'USD'), '$0');
});

test('formatTripPrice does not invent a currency or a price for missing values', () => {
  assert.equal(formatTripPrice(1200, ''), '1,200 (currency not specified)');
  assert.equal(formatTripPrice(undefined, 'USD'), 'Price unavailable');
});

test('stripSourceNotes removes Source and all following description text', () => {
  const description = [
    'A memorable guided journey through the region.',
    'Source: https://travel.example/trips/itinerary.html',
    'This statement after the source must also be removed.',
  ].join('\n');

  assert.equal(
    stripSourceNotes(description),
    'A memorable guided journey through the region.',
  );
});

test('stripSourceNotes removes inline source text and preserves descriptions without a source label', () => {
  assert.equal(stripSourceNotes('Original itinerary details. Source: supplier page with more notes'), 'Original itinerary details.');
  assert.equal(stripSourceNotes('A source of inspiration for every traveler.'), 'A source of inspiration for every traveler.');
});

test('trip text removes business, contact, social, and banking footers from descriptions and lists', () => {
  const footer = 'GST: 07AIGPK7468L1ZN Corporate Office: D-36, R.K.PURAM, SECTOR 6, 110022 | Email: info@travel4life.net | M: 9511446642 | 9871621921 WWW.TRAVEL4LIFE.NET | INSTAGRAM.COM/TRAVEL4LIFE_NET | FACEBOOK.COM/TRAVELLIFE2 TRAVEL4LIFE GLOBAL | AC: 50200116350847 | IFSC: HDFC0002076';

  assert.equal(
    stripSourceNotes(`A guided journey through the region. ${footer}`),
    'A guided journey through the region.',
  );
  assert.deepEqual(
    formatTripDescription(`Explore the old city.\n\n${footer}`),
    ['Explore the old city.'],
  );
  assert.deepEqual(
    formatTripListItems(['Breakfast included.', footer]),
    ['Breakfast included.'],
  );
});

test('formatTripDescription turns sentences and existing line breaks into readable paragraphs', () => {
  assert.deepEqual(
    formatTripDescription('Begin in Jaipur and explore the old city. Visit the Amber Fort with a local guide.\n\nContinue to Agra for sunrise at the Taj Mahal. Source: https://example.org/itinerary.html\nExtra source text.'),
    [
      'Begin in Jaipur and explore the old city.',
      'Visit the Amber Fort with a local guide.',
      'Continue to Agra for sunrise at the Taj Mahal.',
    ],
  );
});

test('formatTripListItems separates bundled inclusion and exclusion entries', () => {
  assert.deepEqual(
    formatTripListItems([
      'Accommodation included. Daily breakfast included.',
      '• Guided sightseeing\n• Airport transfers',
      'Source: https://example.org/package.html',
    ]),
    [
      'Accommodation included.',
      'Daily breakfast included.',
      'Guided sightseeing',
      'Airport transfers',
    ],
  );
});
