import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSitemapIndex,
  buildUrlset,
  extractSitemapUrls,
  inferProductSitemapGroup,
  isSitemapEligible,
  markDuplicatePrimaryKeywords,
  validateRegistryEntries,
} from './seo-sitemap-engine.mjs';

const eligiblePage = (overrides = {}) => ({
  id: 'europe',
  url: '/europe/',
  page_type: 'destination-guide',
  entity_type: 'destination',
  entity_id: 'europe',
  primary_keyword: 'Europe tour packages',
  search_intent: 'Destination planning',
  parent_url: '/',
  canonical_url: 'https://travel4life.net/europe/',
  expected_canonical_url: 'https://travel4life.net/europe/',
  exists: true,
  is_public: true,
  indexable: true,
  quality_status: 'approved',
  robots_directive: 'index, follow',
  redirect_target: null,
  duplicate_canonical: false,
  sitemap_group: 'europe',
  ...overrides,
});

test('sitemap inclusion requires all registry gates to pass', () => {
  assert.equal(isSitemapEligible(eligiblePage()), true);
  for (const update of [
    { exists: false },
    { is_public: false },
    { canonical_url: 'https://travel4life.net/other/' },
    { indexable: false },
    { quality_status: 'needs-improvement' },
    { robots_directive: 'noindex, follow' },
    { redirect_target: '/new-route/' },
    { duplicate_canonical: true },
    { duplicate_primary_keyword: true },
  ]) {
    assert.equal(isSitemapEligible(eligiblePage(update)), false);
  }
});

test('sitemap XML escapes values and preserves only declared last-modified dates', () => {
  const xml = buildUrlset([
    eligiblePage({ canonical_url: 'https://travel4life.net/europe/?a=1&b=2', expected_canonical_url: 'https://travel4life.net/europe/?a=1&b=2', last_modified: '2026-10-01T00:00:00.000Z' }),
    eligiblePage({ id: 'tomorrowland', url: '/tomorrowland/', canonical_url: 'https://travel4life.net/tomorrowland/', expected_canonical_url: 'https://travel4life.net/tomorrowland/', last_modified: null }),
  ]);
  assert.match(xml, /<lastmod>2026-10-01T00:00:00\.000Z<\/lastmod>/);
  assert.match(xml, /europe\/\?a=1&amp;b=2/);
  assert.equal((xml.match(/<lastmod>/g) || []).length, 1);
  assert.deepEqual(extractSitemapUrls(xml), [
    'https://travel4life.net/europe/?a=1&b=2',
    'https://travel4life.net/tomorrowland/',
  ]);
});

test('master sitemap index omits empty groups', () => {
  const xml = buildSitemapIndex('https://travel4life.net', new Map([
    ['europe', [eligiblePage()]],
    ['jim-corbett-resorts', []],
  ]));
  assert.match(xml, /\/sitemaps\/europe\.xml/);
  assert.doesNotMatch(xml, /jim-corbett-resorts/);
});

test('duplicate indexable primary keywords require a single intent owner', () => {
  const first = eligiblePage();
  const second = eligiblePage({ id: 'europe-copy', url: '/europe/tours-from-india/', canonical_url: 'https://travel4life.net/europe/tours-from-india/', expected_canonical_url: 'https://travel4life.net/europe/tours-from-india/' });
  markDuplicatePrimaryKeywords([first, second]);
  assert.equal(first.quality_status, 'needs-review');
  assert.equal(second.quality_status, 'needs-review');
  assert.equal(isSitemapEligible(first), false);
  assert.ok(first.quality_reasons.some((reason) => reason.includes('same primary keyword')));
});

test('inventory-backed products are assigned to their intent sitemap group', () => {
  assert.equal(inferProductSitemapGroup('Music Festival', 'Tomorrowland Belgium package'), 'festival-packages');
  assert.equal(inferProductSitemapGroup('Tour', 'Paris and Switzerland holiday'), 'europe-packages');
  assert.equal(inferProductSitemapGroup('Corporate Retreat', 'Leadership offsite'), 'corporate');
  assert.equal(inferProductSitemapGroup('Adventure', 'Corbett Safari trip'), 'safari');
  assert.equal(inferProductSitemapGroup('Trip', 'Island Escape'), 'packages');
});

test('registry rejects duplicate ids, URLs, canonical URLs and invalid sitemap groups', () => {
  assert.deepEqual(validateRegistryEntries([eligiblePage()]), []);
  const duplicate = eligiblePage({ id: 'europe-copy', url: '/europe-copy/', sitemap_group: 'bad group' });
  assert.equal(validateRegistryEntries([eligiblePage(), duplicate]).length, 3);
  assert.equal(validateRegistryEntries([eligiblePage(), eligiblePage({ id: 'copy' })]).length, 3);
});
