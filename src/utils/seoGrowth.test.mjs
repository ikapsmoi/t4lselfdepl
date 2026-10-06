import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getOpportunityScore,
  getPageReadiness,
  normalizeSeoQuery,
  parseCsv,
  parseSearchConsoleCsv,
  suggestQueryOwner,
} from './seoGrowth.mjs';

test('CSV parser handles BOM, CRLF, quoted commas, escaped quotes, and embedded newlines', () => {
  assert.deepEqual(parseCsv('\uFEFF"Query","Note"\r\n"travel, life","said ""hello"""\r\n"line one\nline two","ok"'), [
    ['Query', 'Note'],
    ['travel, life', 'said "hello"'],
    ['line one\nline two', 'ok'],
  ]);
});

test('Search Console CSV parser accepts percent CTR and derives it when absent', () => {
  assert.deepEqual(parseSearchConsoleCsv('Top queries,Clicks,Impressions,CTR,Position\n"travel, life",2,50,4%,3.5'), [
    {
      dimensionValue: 'travel, life',
      valueKey: 'travel, life',
      clicks: 2,
      impressions: 50,
      ctr: 0.04,
      averagePosition: 3.5,
    },
  ]);
  assert.equal(parseSearchConsoleCsv('Top pages,Clicks,Impressions,Position\nhttps://travel4life.net/,1,4,2')[0].ctr, 0.25);
});

test('Search Console CSV parser reports malformed or incomplete rows', () => {
  assert.throws(() => parseSearchConsoleCsv('Top queries,Clicks,Impressions,Position'), /does not contain any Search Console data rows/);
  assert.throws(() => parseSearchConsoleCsv('Top queries,Clicks,Impressions,Position\nquery,1,2'), /found 3 columns; expected 4/);
  assert.throws(() => parseSearchConsoleCsv('Top queries,Clicks,Impressions,Position\nquery,-1,2,1'), /Clicks must be a non-negative number/);
  assert.throws(() => parseSearchConsoleCsv('Top queries,Clicks,Impressions,CTR,Position\nquery,1,2,101%,1'), /CTR cannot exceed 100%/);
  assert.throws(() => parseCsv('"unfinished'), /unterminated quoted field/);
});

test('query normalization and owner suggestions keep brand and unmatched intent separate', () => {
  assert.equal(normalizeSeoQuery('  Tomorrowland   Packages FROM India '), 'tomorrowland packages from india');
  assert.equal(suggestQueryOwner('Tomorrowland packages from India').targetUrl, '/tomorrowland/packages/');
  assert.equal(suggestQueryOwner('Tomorrowland trip from India').targetUrl, '/tomorrowland/from-india/');
  assert.equal(suggestQueryOwner('Tomorrowland Winter packages').targetUrl, '/tomorrowland/winter/');
  assert.equal(suggestQueryOwner('Tomorrowland Belgium packages from India').targetUrl, '/tomorrowland/belgium/packages/');
  assert.equal(suggestQueryOwner('Tomorrowland Thailand packages').targetUrl, '/tomorrowland/thailand/');
  assert.equal(suggestQueryOwner('travel 4 life').cluster, 'brand');
  assert.equal(suggestQueryOwner('unrelated search').cluster, 'other');
});

test('opportunity scoring ignores tiny samples and rewards actionable, commercially relevant rows', () => {
  assert.equal(getOpportunityScore({ impressions: 4, position: 8, ctr: 0.01 }), 0);
  const lowerValue = getOpportunityScore({ impressions: 100, position: 8, ctr: 0, commercialValue: 1 });
  const higherValue = getOpportunityScore({ impressions: 100, position: 8, ctr: 0, commercialValue: 5 });
  assert.ok(higherValue > lowerValue);
  assert.ok(higherValue <= 100);
});

test('page readiness requires every dimension to contain an in-range integer score', () => {
  const completeScores = {
    intent_match: 15,
    content_quality: 15,
    entity_coverage: 10,
    data_quality: 10,
    internal_authority: 10,
    technical_seo: 15,
    schema_quality: 5,
    trust_evidence: 5,
    ctr_potential: 5,
    conversion: 5,
  };
  assert.deepEqual(getPageReadiness(completeScores), { total: 95, missing: [], label: 'Exceptional' });
  assert.equal(getPageReadiness({ ...completeScores, conversion: 6 }).total, null);
  assert.equal(getPageReadiness({ ...completeScores, conversion: 4.5 }).total, null);
});
