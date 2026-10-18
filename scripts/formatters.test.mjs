import test from 'node:test';
import assert from 'node:assert/strict';
import { formatTripDateRange, formatTripDescription, formatTripListItems, stripSourceNotes } from '../src/utils/formatters.ts';

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
