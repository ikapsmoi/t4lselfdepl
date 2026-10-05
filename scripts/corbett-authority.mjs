export const ENRICHMENT_STAGES = Object.freeze([
  'RAW',
  'DISCOVERED',
  'ENRICHMENT_REQUIRED',
  'PARTIALLY_VERIFIED',
  'VERIFIED',
  'PUBLISH_READY',
  'PUBLISHED',
  'NEEDS_REVIEW',
  'INACTIVE',
]);

export const COMPLETENESS_WEIGHTS = Object.freeze({
  name: 10,
  location: 15,
  zone: 5,
  propertyType: 5,
  description: 5,
  rooms: 5,
  amenities: 10,
  images: 10,
  contact: 5,
  facilities: 5,
  pricing: 10,
  sourceVerification: 10,
});

const COMPLETENESS_WEIGHT_TOTAL = Object.values(COMPLETENESS_WEIGHTS).reduce((sum, score) => sum + score, 0);

const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
const hasList = (value) => Array.isArray(value) && value.some((entry) => hasText(entry));
const verified = (record, field) => record.fieldEvidence?.[field]?.verified === true;
const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value)
  && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
  && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

export const calculateResortCompleteness = (record) => {
  const facts = {
    name: hasText(record.name),
    location: hasText(record.locality) || hasText(record.address) || hasText(record.location),
    zone: hasText(record.zone),
    propertyType: hasText(record.propertyType) || hasText(record.category),
    description: hasText(record.description) && record.description.trim().length >= 120,
    rooms: Number.isSafeInteger(record.roomCount) && record.roomCount > 0
      || hasList(record.roomTypes)
      || Number.isSafeInteger(record.capacity) && record.capacity > 0,
    amenities: hasList(record.amenities),
    images: hasList(record.images) || hasText(record.heroImage),
    contact: hasText(record.phone) || hasText(record.email),
    facilities: [
      record.pool,
      record.spa,
      record.restaurant,
      record.parking,
      record.wifi,
      record.safariSupport,
      record.weddingFacilities,
      record.conferenceFacilities,
      record.corporateFacilities,
      record.eventFacilities,
    ].some((value) => value === true || hasText(value)),
    pricing: Number.isFinite(record.verifiedPricing?.priceFrom)
      && record.verifiedPricing.priceFrom > 0
      && hasText(record.verifiedPricing?.priceUnit)
      && hasText(record.verifiedPricing?.basis)
      && Boolean(record.verifiedPricing?.verifiedAt)
      && Boolean(record.verifiedPricing?.sourceUrl),
    sourceVerification: hasText(record.source?.file)
      || Object.keys(record.fieldEvidence || {}).some((field) => verified(record, field)),
  };

  let earned = 0;
  for (const [field, weight] of Object.entries(COMPLETENESS_WEIGHTS)) {
    if (!facts[field]) continue;
    earned += field === 'sourceVerification' && Object.keys(record.fieldEvidence || {}).some((key) => verified(record, key))
      ? weight
      : field === 'sourceVerification' ? weight * 0.5 : weight;
  }

  const verifiedCore = {
    name: verified(record, 'name'),
    location: verified(record, 'locality') || verified(record, 'address') || verified(record, 'location'),
    propertyType: verified(record, 'propertyType'),
    description: verified(record, 'description') && facts.description,
    images: (verified(record, 'images') || verified(record, 'heroImage')) && facts.images,
    rooms: (verified(record, 'roomCount') || verified(record, 'roomTypes') || verified(record, 'capacity')) && facts.rooms,
    source: Object.keys(record.fieldEvidence || {}).some((field) => verified(record, field)),
  };

  const missingFields = Object.entries(verifiedCore)
    .filter(([, isPresent]) => !isPresent)
    .map(([field]) => field);
  const basicPageReady = missingFields.length === 0
    && earned / COMPLETENESS_WEIGHT_TOTAL * 100 >= 75;
  const weddingPageReady = basicPageReady
    && verified(record, 'weddingFacilities')
    && verified(record, 'weddingCapacity')
    && Number.isSafeInteger(record.weddingCapacity)
    && record.weddingCapacity > 0;
  const micePageReady = basicPageReady
    && verified(record, 'conferenceFacilities')
    && verified(record, 'conferenceCapacity')
    && Number.isSafeInteger(record.conferenceCapacity)
    && record.conferenceCapacity > 0;
  const pricePageReady = facts.pricing && verified(record, 'verifiedPricing');

  return {
    score: Math.round((earned / COMPLETENESS_WEIGHT_TOTAL) * 100),
    facts,
    verifiedCore,
    missingFields,
    pageReadiness: {
      basic: basicPageReady,
      wedding: weddingPageReady,
      mice: micePageReady,
      price: pricePageReady,
    },
  };
};

export const resolveEnrichmentStage = (record, completeness) => {
  if (record.enrichmentStatus === 'INACTIVE' || record.enrichmentStatus === 'NEEDS_REVIEW') {
    return record.enrichmentStatus;
  }
  if (record.enrichmentStatus === 'PUBLISHED') return 'PUBLISHED';
  if (completeness.pageReadiness.basic) return 'PUBLISH_READY';
  if (Object.keys(record.fieldEvidence || {}).some((field) => verified(record, field))) {
    return 'PARTIALLY_VERIFIED';
  }
  if (hasText(record.source?.file)) return 'ENRICHMENT_REQUIRED';
  if (hasText(record.name)) return 'DISCOVERED';
  return 'RAW';
};

export const enrichResortRecord = (record) => {
  const normalized = {
    propertyType: null,
    brand: null,
    location: null,
    locality: null,
    zone: null,
    gate: null,
    address: null,
    description: null,
    shortDescription: null,
    website: null,
    phone: null,
    email: null,
    latitude: null,
    longitude: null,
    roomTypes: [],
    roomCount: null,
    capacity: null,
    amenities: [],
    pool: null,
    spa: null,
    restaurant: null,
    parking: null,
    wifi: null,
    safariSupport: null,
    weddingFacilities: null,
    weddingCapacity: null,
    conferenceFacilities: null,
    conferenceCapacity: null,
    corporateFacilities: null,
    eventFacilities: null,
    eventCapacity: null,
    verifiedPricing: null,
    fieldEvidence: {
      ...(record.fieldEvidence || {}),
      name: record.fieldEvidence?.name || { sourceUrl: record.source?.file || '', verified: false },
      category: record.fieldEvidence?.category || { sourceUrl: record.source?.file || '', verified: false },
      rates: record.fieldEvidence?.rates || { sourceUrl: record.source?.file || '', verified: false },
    },
    propertyExistenceStatus: 'SOURCE_LISTED_UNVERIFIED',
    availabilityStatus: 'CONTACT_TO_CHECK',
    verificationStatus: record.verificationStatus || 'NOT_VERIFIED',
    lastVerifiedAt: record.lastVerifiedAt || null,
    priceLastVerifiedAt: record.priceLastVerifiedAt || null,
    facilitiesLastVerifiedAt: record.facilitiesLastVerifiedAt || null,
    locationLastVerifiedAt: record.locationLastVerifiedAt || null,
    ...record,
    propertyExistenceStatus: record.propertyExistenceStatus === 'VERIFIED'
      ? 'VERIFIED'
      : 'SOURCE_LISTED_UNVERIFIED',
    availabilityStatus: 'CONTACT_TO_CHECK',
  };
  const completeness = calculateResortCompleteness(normalized);
  const enrichmentStatus = resolveEnrichmentStage(normalized, completeness);
  return {
    ...normalized,
    completenessScore: completeness.score,
    missingFields: completeness.missingFields,
    pageReadiness: completeness.pageReadiness,
    enrichmentStatus,
    seoStatus: completeness.pageReadiness.basic ? 'PUBLISH_READY_REVIEW_REQUIRED' : 'NOINDEX',
    indexStatus: 'DIRECTORY_LISTING_ONLY',
  };
};

export const createEnrichmentQueue = (properties) => {
  const records = properties.map(enrichResortRecord);
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    scoring: {
      threshold: 75,
      denominator: COMPLETENESS_WEIGHT_TOTAL,
      weights: COMPLETENESS_WEIGHTS,
      pageTypes: {
        basic: ['verified name', 'verified location', 'verified property type', 'unique description (120+ characters)', 'verified image', 'verified room/accommodation information', 'verified source', 'completeness score >= 75'],
        wedding: ['basic page requirements', 'verified wedding facilities', 'verified wedding capacity'],
        mice: ['basic page requirements', 'verified conference facilities', 'verified conference capacity'],
        price: ['verified price source', 'verification date', 'pricing basis'],
      },
    },
    summary: {
      total: records.length,
      readyForReview: records.filter(({ enrichmentStatus }) => enrichmentStatus === 'PUBLISH_READY').length,
      verified: records.filter(({ enrichmentStatus }) => ['VERIFIED', 'PUBLISH_READY', 'PUBLISHED'].includes(enrichmentStatus)).length,
      needsEnrichment: records.filter(({ enrichmentStatus }) => ['RAW', 'DISCOVERED', 'ENRICHMENT_REQUIRED', 'PARTIALLY_VERIFIED'].includes(enrichmentStatus)).length,
      needsReview: records.filter(({ enrichmentStatus }) => enrichmentStatus === 'NEEDS_REVIEW').length,
      inactive: records.filter(({ enrichmentStatus }) => enrichmentStatus === 'INACTIVE').length,
      averageCompleteness: records.length
        ? Math.round(records.reduce((sum, record) => sum + record.completenessScore, 0) / records.length)
        : 0,
      weddingReady: records.filter(({ pageReadiness }) => pageReadiness.wedding).length,
      miceReady: records.filter(({ pageReadiness }) => pageReadiness.mice).length,
      priceReady: records.filter(({ pageReadiness }) => pageReadiness.price).length,
    },
    missingFieldCounts: records.reduce((counts, record) => {
      record.missingFields.forEach((field) => {
        counts[field] = (counts[field] || 0) + 1;
      });
      return counts;
    }, {}),
    properties: records,
  };
};

const countVisibleWords = (html) => html
  .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&(?:nbsp|amp|quot|lt|gt|#\d+);/gi, ' ')
  .trim()
  .split(/\s+/)
  .filter(Boolean).length;

export const calculateSeoReadiness = (page, html) => {
  const checks = {
    intent: Boolean(page.primaryQuery && page.searchIntent && page.url),
    content: countVisibleWords(html) >= 500,
    data: page.pageType === 'resort-directory'
      ? html.includes('resorts.json') || html.includes('data-resort-card')
      : html.includes('Jim Corbett') && html.includes('confirm'),
    internalLinks: (html.match(/href="\/jim-corbett\/[^"]*"/g) || []).length >= 3,
    technical: Boolean(
      html.includes(`href="https://travel4life.net${page.url}"`)
      && html.match(/<title>[^<]{20,}<\/title>/i)
      && html.match(/<meta\s+name="description"\s+content="[^"]{50,}"/i)
      && html.match(/<h1\b/i)
      && html.match(/<meta\s+name="robots"\s+content="index, follow/i),
    ),
    schema: html.includes('application/ld+json') && html.includes('BreadcrumbList'),
    ux: html.includes('name="viewport"') && html.includes('corbett.css'),
    trust: html.includes('verification') || html.includes('verify') || html.includes('confirm'),
    conversion: html.includes('tel:+919511446642')
      && html.includes('mailto:info@travel4life.net')
      && (html.includes('https://wa.me/919511446642') || html.includes('data-corbett-enquiry')),
  };
  const points = {
    intent: checks.intent ? 15 : 0,
    content: checks.content ? 15 : 0,
    data: checks.data ? 15 : 0,
    internalLinks: checks.internalLinks ? 10 : 0,
    technical: checks.technical ? 15 : 0,
    schema: checks.schema ? 10 : 0,
    ux: checks.ux ? 10 : 0,
    trust: checks.trust ? 5 : 0,
    conversion: checks.conversion ? 5 : 0,
  };
  return {
    score: Object.values(points).reduce((total, value) => total + value, 0),
    points,
    checks,
  };
};

export const isCorbettPageIndexable = (page, readinessScore) => (
  page.indexable === true
  && page.qualityStatus === 'approved'
  && Number.isFinite(readinessScore)
  && readinessScore >= 75
);

const HEADER_ALIASES = new Map([
  ['query', 'query'], ['top query', 'query'], ['top queries', 'query'], ['queries', 'query'],
  ['page', 'page'], ['top page', 'page'], ['top pages', 'page'], ['landing page', 'page'],
  ['clicks', 'clicks'], ['impressions', 'impressions'], ['ctr', 'ctr'],
  ['position', 'position'], ['average position', 'position'],
  ['date', 'date'], ['country', 'country'], ['device', 'device'],
]);

export const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }
  if (quoted) throw new Error('CSV contains an unclosed quoted field.');
  if (field || row.length) {
    row.push(field);
    if (row.some((value) => value.trim())) rows.push(row);
  }
  return rows;
};

export const parseSearchConsoleCsv = (text, snapshotDate) => {
  if (!isIsoDate(snapshotDate)) {
    throw new Error('Choose a valid Search Console snapshot date before importing.');
  }
  const rawRows = parseCsv(text);
  const headerIndex = rawRows.findIndex((row) => {
    const normalized = row.map((cell) => HEADER_ALIASES.get(cell.trim().replace(/^\uFEFF/, '').toLowerCase()));
    return normalized.includes('clicks') && normalized.includes('impressions') && normalized.includes('position')
      && normalized.some((name) => name === 'query' || name === 'page');
  });
  if (headerIndex < 0) {
    throw new Error('Could not find a Search Console header row with Query or Page, Clicks, Impressions and Position columns.');
  }

  const headers = rawRows[headerIndex].map((cell) => HEADER_ALIASES.get(cell.trim().replace(/^\uFEFF/, '').toLowerCase()) || '');
  const valueFor = (row, name) => {
    const index = headers.indexOf(name);
    return index < 0 ? '' : (row[index] || '').trim();
  };
  const observations = [];
  for (const row of rawRows.slice(headerIndex + 1)) {
    const query = valueFor(row, 'query');
    const page = valueFor(row, 'page');
    if (!query && !page) continue;
    const clicks = Number(valueFor(row, 'clicks').replaceAll(',', ''));
    const impressions = Number(valueFor(row, 'impressions').replaceAll(',', ''));
    const position = Number(valueFor(row, 'position').replaceAll(',', ''));
    if (![clicks, impressions, position].every(Number.isFinite) || clicks < 0 || impressions < 0 || position <= 0) {
      throw new Error(`Invalid clicks, impressions or position values in Search Console row: ${row.join(',')}`);
    }
    const rawCtr = valueFor(row, 'ctr').trim();
    const ctrRaw = rawCtr.replace('%', '').trim();
    const ctrNumber = Number(ctrRaw);
    const ctr = ctrRaw ? ctrNumber / (rawCtr.includes('%') || ctrNumber > 1 ? 100 : 1)
      : impressions ? clicks / impressions : 0;
    if (!Number.isFinite(ctr) || ctr < 0 || ctr > 1) {
      throw new Error(`Invalid CTR value in Search Console row: ${row.join(',')}`);
    }
    observations.push({
      query,
      page,
      clicks,
      impressions,
      ctr,
      position,
      date: valueFor(row, 'date') || snapshotDate,
      country: valueFor(row, 'country') || '',
      device: valueFor(row, 'device') || '',
    });
  }
  if (!observations.length) throw new Error('The Search Console CSV has headers but no query/page observations.');
  return observations;
};

export const inferCorbettIntent = (query) => {
  const normalized = query.toLowerCase();
  if (/\b(travel4life|travel4life planner|corbett travel planner|corbett travel agent|corbett travel agency)\b/.test(normalized)) {
    return { cluster: 'specialist', targetUrl: '/jim-corbett/travel4life/', commercialWeight: 0.8 };
  }
  if (/\b(wedding|weddings|marriage|shaadi)\b/.test(normalized)) return { cluster: 'weddings', targetUrl: '/jim-corbett/weddings/', commercialWeight: 1 };
  if (/\b(mice|corporate|offsite|conference|team outing|team retreat)\b/.test(normalized)) return { cluster: 'mice', targetUrl: '/jim-corbett/mice/', commercialWeight: 0.95 };
  if (/\b(resort|resorts|hotel|hotels|stay|accommodation|price|rates|rooms)\b/.test(normalized)) return { cluster: 'resorts', targetUrl: '/jim-corbett/resorts/', commercialWeight: 1 };
  return { cluster: 'destination', targetUrl: '/jim-corbett/', commercialWeight: 0.7 };
};

export const getPositionBucket = (position) => {
  if (position <= 3) return 'DEFEND (1–3)';
  if (position <= 10) return 'HIGH-PRIORITY (4–10)';
  if (position <= 20) return 'PAGE 1 BREAKTHROUGH (11–20)';
  if (position <= 50) return 'IMPROVE (21–50)';
  return 'INVESTIGATE (50+)';
};

const expectedCtrForPosition = (position) => {
  if (position <= 1) return 0.28;
  if (position <= 3) return 0.12;
  if (position <= 5) return 0.07;
  if (position <= 10) return 0.035;
  if (position <= 20) return 0.012;
  if (position <= 50) return 0.004;
  return 0.001;
};

const hashText = (text) => {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
};

export const createSearchConsoleSnapshot = (text, snapshotDate, fileName) => {
  const observations = parseSearchConsoleCsv(text, snapshotDate);
  return {
    id: `${snapshotDate}-${hashText(text)}`,
    snapshotDate,
    importedAt: new Date().toISOString(),
    fileName,
    rowCount: observations.length,
    observations,
  };
};

export const analyzeSearchConsole = (snapshots, registry, { minimumImpressions = 100 } = {}) => {
  const latestDate = snapshots.reduce((latest, snapshot) => snapshot.snapshotDate > latest ? snapshot.snapshotDate : latest, '');
  const latest = snapshots.filter(({ snapshotDate }) => snapshotDate === latestDate).flatMap(({ observations }) => observations);
  const priorDate = [...new Set(snapshots.map(({ snapshotDate }) => snapshotDate).filter((date) => date < latestDate))]
    .sort().at(-1) || '';
  const prior = snapshots.filter(({ snapshotDate }) => snapshotDate === priorDate).flatMap(({ observations }) => observations);

  const queryGroups = new Map();
  for (const observation of latest) {
    if (!observation.query) continue;
    const key = observation.query.toLowerCase().trim();
    const group = queryGroups.get(key) || { query: observation.query, observations: [] };
    group.observations.push(observation);
    queryGroups.set(key, group);
  }

  const pagesByUrl = new Map(registry.pages.map((page) => [page.url, page]));
  const queries = [...queryGroups.values()].map(({ query, observations }) => {
    const totals = observations.reduce((result, observation) => ({
      clicks: result.clicks + observation.clicks,
      impressions: result.impressions + observation.impressions,
      positionImpressions: result.positionImpressions + observation.position * observation.impressions,
      ctr: result.ctr + observation.ctr * observation.impressions,
    }), { clicks: 0, impressions: 0, positionImpressions: 0, ctr: 0 });
    const position = totals.impressions ? totals.positionImpressions / totals.impressions : observations[0].position;
    const ctr = totals.impressions ? totals.ctr / totals.impressions : 0;
    const intent = inferCorbettIntent(query);
    const expectedCtr = expectedCtrForPosition(position);
    const ctrGap = Math.max(0, expectedCtr - ctr);
    const demandScore = Math.min(1, Math.log10(totals.impressions + 1) / 4);
    const positionScore = Math.max(0, 1 - Math.abs(position - 9) / 16);
    const ctrScore = Math.min(1, ctrGap / Math.max(expectedCtr, 0.005));
    const opportunityScore = Math.round(100 * (0.36 * demandScore + 0.28 * positionScore + 0.22 * ctrScore + 0.14 * intent.commercialWeight));
    const observedPages = [...new Set(observations.map(({ page }) => page).filter(Boolean))];
    const misalignedPages = observedPages.filter((page) => {
      let pathname;
      try {
        pathname = new URL(page, 'https://travel4life.net').pathname;
      } catch {
        pathname = page;
      }
      return pathname !== intent.targetUrl;
    });
    const currentPage = observedPages[0] || '';
    const recommendation = totals.impressions >= minimumImpressions && position >= 4 && position <= 20
      ? `Improve ${intent.targetUrl} for this existing ${intent.cluster} query before creating another page.`
      : misalignedPages.length
        ? `Review internal links and query ownership: Google is showing ${misalignedPages[0]} instead of ${intent.targetUrl}.`
        : position <= 3
          ? `Defend ${intent.targetUrl}; monitor CTR and keep its supporting links current.`
          : position > 20
            ? `Review intent fit, verified inventory and content gaps for ${intent.targetUrl}.`
            : `Improve title, description and snippet fit for ${intent.targetUrl}.`;

    return {
      query,
      ...totals,
      position,
      ctr,
      positionBucket: getPositionBucket(position),
      targetUrl: intent.targetUrl,
      cluster: intent.cluster,
      currentPage,
      observedPages,
      wrongPage: misalignedPages.length > 0,
      cannibalization: observedPages.length > 1,
      opportunityScore,
      opportunity: opportunityScore >= 75 ? 'VERY HIGH' : opportunityScore >= 55 ? 'HIGH' : opportunityScore >= 35 ? 'MODERATE' : 'LOW',
      lowCtr: totals.impressions >= minimumImpressions && ctr < expectedCtr * 0.6,
      recommendation,
      pageQuality: pagesByUrl.get(intent.targetUrl)?.qualityStatus || 'needs review',
    };
  });

  const priorByQuery = new Map();
  for (const observation of prior) {
    if (!observation.query) continue;
    const key = observation.query.toLowerCase().trim();
    const current = priorByQuery.get(key) || { clicks: 0, impressions: 0 };
    current.clicks += observation.clicks;
    current.impressions += observation.impressions;
    priorByQuery.set(key, current);
  }
  const opportunities = queries
    .filter((query) => query.impressions >= minimumImpressions && query.position >= 4 && query.position <= 20)
    .sort((a, b) => b.opportunityScore - a.opportunityScore || b.impressions - a.impressions);
  const cannibalization = queries.filter((query) => query.cannibalization);
  const wrongPage = queries.filter((query) => query.wrongPage);
  const lowCtr = queries.filter((query) => query.lowCtr).sort((a, b) => b.impressions - a.impressions);
  const latestByQuery = new Map(queries.map((query) => [query.query.toLowerCase().trim(), query]));
  const lostQueries = [];
  for (const [key, before] of priorByQuery.entries()) {
    const current = latestByQuery.get(key);
    if (before.clicks > 0 && (!current || current.clicks < before.clicks * 0.7)) {
      lostQueries.push({
        ...(current || { query: key, clicks: 0, impressions: 0, position: 0, targetUrl: inferCorbettIntent(key).targetUrl }),
        previousClicks: before.clicks,
        recommendation: current
          ? `Review the latest snippet, ranking URL and impression trend; clicks fell by at least 30% versus ${priorDate}.`
          : `This query had clicks in ${priorDate} but is absent from ${latestDate}; check Search Console coverage and query demand.`,
      });
    }
  }
  const alerts = [
    ...lostQueries.map((query) => ({ severity: 'warning', type: 'ranking-loss', query: query.query, recommendation: query.recommendation })),
    ...lowCtr.map((query) => ({ severity: 'opportunity', type: 'low-ctr', query: query.query, recommendation: 'Review title, meta description, search intent and snippet eligibility. No metadata is changed automatically.' })),
    ...cannibalization.map((query) => ({ severity: 'warning', type: 'cannibalization', query: query.query, recommendation: 'Review query ownership, internal links and whether ranking URLs serve distinct intents; do not redirect automatically.' })),
    ...wrongPage.map((query) => ({ severity: 'warning', type: 'wrong-page', query: query.query, recommendation: query.recommendation })),
  ];
  const pageScores = registry.pages.map((page) => ({
    url: page.url,
    pageType: page.pageType,
    readinessScore: Number.isFinite(page.readinessScore) ? page.readinessScore : 0,
    indexable: page.indexable === true,
  }));
  const needsContentGap = queries.filter(({ position, targetUrl }) => {
    const target = pagesByUrl.get(targetUrl);
    return position > 20 || !target || target.qualityStatus !== 'approved'
      || (Number.isFinite(target.readinessScore) && target.readinessScore < 75);
  }).length;

  const readyForVerification = registry.enrichmentSummary?.readyForReview || 0;
  const verifiedEntityCount = registry.enrichmentSummary?.verified || 0;
  const topicalCoverage = [
    { cluster: 'Core destination', pageUrl: '/jim-corbett/', pagePresent: pagesByUrl.has('/jim-corbett/'), queryCount: queries.filter(({ cluster }) => cluster === 'destination').length },
    { cluster: 'Resort discovery', pageUrl: '/jim-corbett/resorts/', pagePresent: pagesByUrl.has('/jim-corbett/resorts/'), queryCount: queries.filter(({ cluster }) => cluster === 'resorts').length },
    { cluster: 'Weddings', pageUrl: '/jim-corbett/weddings/', pagePresent: pagesByUrl.has('/jim-corbett/weddings/'), queryCount: queries.filter(({ cluster }) => cluster === 'weddings').length },
    { cluster: 'MICE & offsites', pageUrl: '/jim-corbett/mice/', pagePresent: pagesByUrl.has('/jim-corbett/mice/'), queryCount: queries.filter(({ cluster }) => cluster === 'mice').length },
    { cluster: 'Travel4life planning service', pageUrl: '/jim-corbett/travel4life/', pagePresent: pagesByUrl.has('/jim-corbett/travel4life/'), queryCount: queries.filter(({ cluster }) => cluster === 'specialist').length },
  ].map((cluster) => ({
    ...cluster,
    coverageScore: Math.round(
      (cluster.pagePresent ? 40 : 0)
      + (pagesByUrl.get(cluster.pageUrl)?.qualityStatus === 'approved' ? 20 : 0)
      + (pagesByUrl.get(cluster.pageUrl)?.indexable === true ? 15 : 0)
      + Math.min(15, cluster.queryCount * 3)
      + (verifiedEntityCount > 0 ? 10 : 0),
    ),
  }));
  const nextActions = [];
  if (readyForVerification > 0) nextActions.push({
    title: `Review ${readyForVerification} resort ${readyForVerification === 1 ? 'entity' : 'entities'} ready for editorial QA`,
    targetUrl: '/admin-corbett-enrichment',
    reason: 'Verified core details and a completeness score above the threshold qualify the record for a human publication review.',
    priority: 95,
  });
  if (!latest.length) nextActions.push({
    title: 'Import a dated Google Search Console query export',
    targetUrl: '/admin-corbett-enrichment',
    reason: 'There is no Search Console snapshot yet; ranking opportunities and query ownership cannot be measured without first-party data.',
    priority: 100,
  });
  for (const query of opportunities.slice(0, 3)) nextActions.push({
    title: `Improve ${query.targetUrl} for “${query.query}”`,
    targetUrl: query.targetUrl,
    reason: `${query.impressions} impressions, average position ${query.position.toFixed(1)}, opportunity score ${query.opportunityScore}/100.`,
    priority: query.opportunityScore,
  });
  nextActions.sort((a, b) => b.priority - a.priority);

  return {
    latestDate,
    priorDate,
    importedObservations: latest.length,
    metrics: {
      clicks: queries.reduce((sum, query) => sum + query.clicks, 0),
      impressions: queries.reduce((sum, query) => sum + query.impressions, 0),
      ctr: queries.reduce((sum, query) => sum + query.clicks, 0) / Math.max(1, queries.reduce((sum, query) => sum + query.impressions, 0)),
      averagePosition: queries.length
        ? queries.reduce((sum, query) => sum + query.position * Math.max(query.impressions, 1), 0)
          / queries.reduce((sum, query) => sum + Math.max(query.impressions, 1), 0)
        : 0,
      approvedIndexablePages: pageScores.filter(({ indexable }) => indexable).length,
      topThreeQueries: queries.filter(({ position }) => position <= 3).length,
      pageOneQueries: queries.filter(({ position }) => position <= 10).length,
      opportunities: opportunities.length,
      lostQueries: lostQueries.length,
      cannibalization: cannibalization.length,
      contentGaps: needsContentGap,
      technicalIssues: pageScores.filter(({ readinessScore, indexable }) => indexable && readinessScore < 75).length,
    },
    queries: [...queries].sort((a, b) => b.impressions - a.impressions),
    opportunities,
    lowCtr,
    cannibalization,
    wrongPage,
    lostQueries,
    alerts,
    topicalCoverage,
    nextActions,
    pageScores,
  };
};
