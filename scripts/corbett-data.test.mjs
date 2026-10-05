import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const dataset = JSON.parse(await readFile(new URL('../public/jim-corbett/resorts.json', import.meta.url), 'utf8'));

test('Corbett workbook import preserves its records and verification caveats', () => {
  assert.equal(dataset.source.sourceRows, 100);
  assert.equal(dataset.properties.length, 100);
  assert.match(dataset.source.notes.join(' '), /no rate validity dates/i);
  assert.match(dataset.source.notes.join(' '), /unverified Travel4life Rate column was excluded/i);
  assert.ok(dataset.properties.every(({ dataQuality }) => dataQuality === 'NEEDS_VERIFICATION'));
  assert.ok(dataset.properties.every(({ lastVerifiedAt, priceLastVerifiedAt }) => lastVerifiedAt === null && priceLastVerifiedAt === null));
  assert.ok(dataset.properties.every(({ location, amenities, images }) => location === null && amenities.length === 0 && images.length === 0));
  assert.ok(dataset.properties.every(({ propertyExistenceStatus, availabilityStatus }) => (
    propertyExistenceStatus === 'SOURCE_LISTED_UNVERIFIED' && availabilityStatus === 'CONTACT_TO_CHECK'
  )));
});

test('resort ids, names, slugs and listed 15% rate calculations are consistent', () => {
  const ids = dataset.properties.map(({ id }) => id);
  const names = dataset.properties.map(({ name }) => name.toLowerCase());
  const slugs = dataset.properties.map(({ slug }) => slug);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(names).size, names.length);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const property of dataset.properties) {
    const { season, discountedSeason, offSeason, currency, unit } = property.rates;
    assert.ok([season, discountedSeason, offSeason].every((rate) => Number.isSafeInteger(rate) && rate > 0));
    assert.ok(Math.abs(discountedSeason - Math.round(season * 0.85)) <= 1);
    assert.equal(currency, 'INR');
    assert.equal(unit, 'per night');
  }
});
