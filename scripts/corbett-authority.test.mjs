import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeSearchConsole,
  calculateResortCompleteness,
  calculateSeoReadiness,
  createEnrichmentQueue,
  createSearchConsoleSnapshot,
  enrichResortRecord,
  getPositionBucket,
  inferCorbettIntent,
  isCorbettPageIndexable,
  parseSearchConsoleCsv,
} from './corbett-authority.mjs';

const evidence = (fields) => Object.fromEntries(fields.map((field) => [
  field,
  { sourceUrl: 'https://example.com/property', verifiedAt: '2026-05-01', verifiedBy: 'Reviewer', verified: true },
]));

const verifiedProperty = () => ({
  slug: 'sample-lodge',
  name: 'Sample Lodge',
  category: 'Lodge',
  propertyType: 'Lodge',
  locality: 'Ramnagar',
  zone: 'Dhikuli',
  description: 'A verified sample property description with enough detail to pass the minimum content requirements. '.repeat(2),
  roomCount: 20,
  roomTypes: ['Standard room'],
  amenities: ['Restaurant'],
  images: ['https://example.com/sample.jpg'],
  phone: '+911234567890',
  spa: true,
  weddingFacilities: 'Indoor hall',
  weddingCapacity: 80,
  conferenceFacilities: 'Meeting room',
  conferenceCapacity: 40,
  verifiedPricing: {
    priceFrom: 5000,
    priceUnit: 'INR per night',
    basis: 'Double occupancy, room only',
    verifiedAt: '2026-05-01',
    sourceUrl: 'https://example.com/property',
  },
  source: { file: 'source-workbook.xlsx' },
  fieldEvidence: evidence([
    'name', 'locality', 'propertyType', 'description', 'roomCount', 'images',
    'weddingFacilities', 'weddingCapacity', 'conferenceFacilities', 'conferenceCapacity',
    'verifiedPricing',
  ]),
});

test('enrichment normalization preserves source-listed status and keeps all unknown facts explicit', () => {
  const record = enrichResortRecord({ slug: 'sample', name: 'Sample', category: 'Lodge', source: { file: 'source.xlsx' } });
  assert.equal(record.propertyExistenceStatus, 'SOURCE_LISTED_UNVERIFIED');
  assert.equal(record.availabilityStatus, 'CONTACT_TO_CHECK');
  assert.equal(record.location, null);
  assert.deepEqual(record.amenities, []);
  assert.equal(record.enrichmentStatus, 'ENRICHMENT_REQUIRED');
  assert.ok(record.completenessScore < 75);
  assert.equal(record.pageReadiness.basic, false);
});

test('completeness requires verified core fields and separately gates wedding, MICE and pricing pages', () => {
  const property = verifiedProperty();
  const result = calculateResortCompleteness(property);
  assert.equal(result.score, 100);
  assert.equal(result.pageReadiness.basic, true);
  assert.equal(result.pageReadiness.wedding, true);
  assert.equal(result.pageReadiness.mice, true);
  assert.equal(result.pageReadiness.price, true);

  const unverified = { ...property, fieldEvidence: {} };
  const unverifiedResult = calculateResortCompleteness(unverified);
  assert.equal(unverifiedResult.pageReadiness.basic, false);
  assert.equal(unverifiedResult.pageReadiness.wedding, false);
  assert.ok(unverifiedResult.missingFields.includes('location'));
  assert.equal(enrichResortRecord({ propertyExistenceStatus: 'VERIFIED' }).propertyExistenceStatus, 'VERIFIED');
});

test('SEO route quality score detects missing requirements and rewards a complete route', () => {
  const page = {
    url: '/jim-corbett/travel4life/',
    primaryQuery: 'Travel4life Jim Corbett travel specialist',
    searchIntent: 'travel planner evaluation and enquiry',
    pageType: 'specialist',
  };
  const html = `<title>Travel4life Corbett travel planning service</title>
    <meta name="description" content="A useful description that is comfortably longer than fifty characters for this test page.">
    <meta name="robots" content="index, follow"><link rel="canonical" href="https://travel4life.net${page.url}">
    <meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/jim-corbett/corbett.css">
    <h1>Jim Corbett planning, with details to confirm</h1>
    <script type="application/ld+json">{"@type":"BreadcrumbList"}</script>
    <a href="/jim-corbett/">Corbett</a><a href="/jim-corbett/resorts/">Resorts</a><a href="/jim-corbett/weddings/">Weddings</a>
    <a href="tel:+919511446642">Call</a><a href="mailto:info@travel4life.net">Email</a>
    <a href="https://wa.me/919511446642">WhatsApp</a>${'Jim Corbett planning details are confirmed for your dates. '.repeat(100)}`;
  const readiness = calculateSeoReadiness(page, html);
  assert.equal(readiness.score, 100);
  assert.ok(Object.values(readiness.checks).every(Boolean));
  assert.ok(calculateSeoReadiness(page, '<h1>Thin page</h1>').score < 75);
  assert.equal(isCorbettPageIndexable({ indexable: true, qualityStatus: 'approved' }, 75), true);
  assert.equal(isCorbettPageIndexable({ indexable: true, qualityStatus: 'approved' }, 74), false);
  assert.equal(isCorbettPageIndexable({ indexable: false, qualityStatus: 'approved' }, 100), false);
  assert.equal(isCorbettPageIndexable({ indexable: true, qualityStatus: 'draft' }, 100), false);
});

test('Search Console CSV parsing handles GSC percent CTRs, quoted commas and invalid dates', () => {
  const csv = 'Top queries,Top pages,Clicks,Impressions,CTR,Position\r\n"wedding, corbett","https://travel4life.net/jim-corbett/",2,1000,0.20%,8.5';
  const observations = parseSearchConsoleCsv(csv, '2026-05-01');
  assert.equal(observations[0].query, 'wedding, corbett');
  assert.equal(observations[0].ctr, 0.002);
  assert.throws(() => parseSearchConsoleCsv(csv, '2026-02-30'), /valid Search Console snapshot date/);
});

test('Search Console analysis reports query ownership, cannibalization, CTR opportunities and click losses', () => {
  const oldCsv = 'Top queries,Top pages,Clicks,Impressions,CTR,Position\r\n"Corbett wedding resorts","https://travel4life.net/jim-corbett/weddings/",20,1000,2%,8';
  const latestCsv = 'Top queries,Top pages,Clicks,Impressions,CTR,Position\r\n"Corbett wedding resorts","https://travel4life.net/jim-corbett/",8,1000,0.8%,8\r\n"Corbett wedding resorts","https://travel4life.net/jim-corbett/resorts/",5,500,0.8%,9';
  const snapshots = [
    createSearchConsoleSnapshot(oldCsv, '2026-04-01', 'old.csv'),
    createSearchConsoleSnapshot(latestCsv, '2026-05-01', 'latest.csv'),
  ];
  const registry = {
    pages: [
      { url: '/jim-corbett/', pageType: 'hub', qualityStatus: 'approved', indexable: true, readinessScore: 90 },
      { url: '/jim-corbett/weddings/', pageType: 'weddings', qualityStatus: 'approved', indexable: true, readinessScore: 90 },
      { url: '/jim-corbett/resorts/', pageType: 'resort-directory', qualityStatus: 'approved', indexable: true, readinessScore: 90 },
      { url: '/jim-corbett/mice/', pageType: 'mice', qualityStatus: 'approved', indexable: true, readinessScore: 90 },
      { url: '/jim-corbett/travel4life/', pageType: 'specialist', qualityStatus: 'approved', indexable: true, readinessScore: 90 },
    ],
    enrichmentSummary: { readyForReview: 0, verified: 0 },
  };
  const analysis = analyzeSearchConsole(snapshots, registry);
  assert.equal(analysis.queries[0].wrongPage, true);
  assert.equal(analysis.queries[0].cannibalization, true);
  assert.equal(analysis.opportunities.length, 1);
  assert.equal(analysis.lostQueries.length, 1);
  assert.ok(analysis.alerts.some(({ type }) => type === 'wrong-page'));
  assert.ok(analysis.topicalCoverage.some(({ cluster }) => cluster === 'Travel4life planning service'));
});

test('position groups, intent ownership and initial queue preserve the expected boundaries', () => {
  assert.equal(getPositionBucket(3), 'DEFEND (1–3)');
  assert.equal(getPositionBucket(4), 'HIGH-PRIORITY (4–10)');
  assert.equal(getPositionBucket(11), 'PAGE 1 BREAKTHROUGH (11–20)');
  assert.equal(getPositionBucket(21), 'IMPROVE (21–50)');
  assert.equal(getPositionBucket(51), 'INVESTIGATE (50+)');
  assert.equal(inferCorbettIntent('Travel4life Jim Corbett travel specialist').targetUrl, '/jim-corbett/travel4life/');
  const queue = createEnrichmentQueue([{ slug: 'one', name: 'One', category: 'Hotel', source: { file: 'source.xlsx' } }]);
  assert.equal(queue.summary.total, 1);
  assert.equal(queue.summary.needsEnrichment, 1);
  assert.equal(queue.properties[0].enrichmentStatus, 'ENRICHMENT_REQUIRED');
});
