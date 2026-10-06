const cleanCell = (value) => value.replace(/^\uFEFF/, '').trim();

export const normalizeSeoQuery = (value) => String(value ?? '')
  .trim()
  .toLocaleLowerCase('en')
  .replace(/\s+/g, ' ');

export const parseCsv = (text) => {
  text = text.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
    } else if (character === '"' && cell.length === 0) {
      quoted = true;
    } else if (character === ',') {
      row.push(cleanCell(cell));
      cell = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cleanCell(cell));
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }

  row.push(cleanCell(cell));
  if (row.some((value) => value !== '')) rows.push(row);
  if (quoted) throw new Error('CSV contains an unterminated quoted field.');
  return rows;
};

const parseMetric = (value, label, rowNumber) => {
  const normalized = value.replaceAll(',', '').trim();
  const number = Number(normalized);
  if (!normalized || !Number.isFinite(number) || number < 0) {
    throw new Error(`CSV row ${rowNumber}: ${label} must be a non-negative number.`);
  }
  return number;
};

const parseCtr = (value, clicks, impressions, rowNumber) => {
  if (!value) return impressions === 0 ? 0 : clicks / impressions;
  const hasPercentSign = value.includes('%');
  const parsed = parseMetric(value.replace('%', ''), 'CTR', rowNumber);
  const ctr = hasPercentSign ? parsed / 100 : parsed;
  if (ctr > 1) throw new Error(`CSV row ${rowNumber}: CTR cannot exceed 100%.`);
  return ctr;
};

export const parseSearchConsoleCsv = (text) => {
  const rows = parseCsv(text);
  if (rows.length < 2) throw new Error('CSV does not contain any Search Console data rows.');

  const headers = rows[0].map((header) => normalizeSeoQuery(header));
  const dimensionColumn = 0;
  const findColumn = (aliases) => headers.findIndex((header) => aliases.includes(header));
  const clicksColumn = findColumn(['clicks']);
  const impressionsColumn = findColumn(['impressions']);
  const ctrColumn = findColumn(['ctr', 'click through rate']);
  const positionColumn = findColumn(['position', 'average position', 'avg. position']);

  if ([clicksColumn, impressionsColumn, positionColumn].some((column) => column < 0)) {
    throw new Error('Expected Search Console columns for clicks, impressions, and position.');
  }

  return rows.slice(1).map((cells, index) => {
    const rowNumber = index + 2;
    if (cells.length !== headers.length) {
      throw new Error(`CSV row ${rowNumber}: found ${cells.length} columns; expected ${headers.length}.`);
    }
    const dimensionValue = cells[dimensionColumn]?.trim();
    if (!dimensionValue) throw new Error(`CSV row ${rowNumber}: the query or page value is empty.`);

    const clicks = parseMetric(cells[clicksColumn], 'Clicks', rowNumber);
    const impressions = parseMetric(cells[impressionsColumn], 'Impressions', rowNumber);
    const averagePosition = parseMetric(cells[positionColumn], 'Position', rowNumber);
    const ctr = ctrColumn < 0
      ? (impressions === 0 ? 0 : clicks / impressions)
      : parseCtr(cells[ctrColumn], clicks, impressions, rowNumber);

    if (!Number.isInteger(clicks) || !Number.isInteger(impressions)) {
      throw new Error(`CSV row ${rowNumber}: clicks and impressions must be whole numbers.`);
    }

    return {
      dimensionValue,
      valueKey: normalizeSeoQuery(dimensionValue),
      clicks,
      impressions,
      ctr,
      averagePosition,
    };
  });
};

const queryOwners = [
  { pattern: /tomorrowland.*(cost|price|budget|expense|inr|rupee)/i, cluster: 'tomorrowland', targetUrl: '/tomorrowland/cost-from-india/' },
  { pattern: /tomorrowland.*winter/i, cluster: 'tomorrowland', targetUrl: '/tomorrowland/winter/' },
  { pattern: /tomorrowland.*thailand/i, cluster: 'tomorrowland', targetUrl: '/tomorrowland/thailand/' },
  { pattern: /tomorrowland.*belgium.*packages?/i, cluster: 'tomorrowland', targetUrl: '/tomorrowland/belgium/packages/' },
  { pattern: /tomorrowland.*belgium/i, cluster: 'tomorrowland', targetUrl: '/tomorrowland/belgium/' },
  { pattern: /tomorrowland.*packages?/i, cluster: 'tomorrowland', targetUrl: '/tomorrowland/packages/' },
  { pattern: /tomorrowland.*(trip|holiday).*india|tomorrowland from india/i, cluster: 'tomorrowland', targetUrl: '/tomorrowland/from-india/' },
  { pattern: /tomorrowland/i, cluster: 'tomorrowland', targetUrl: '/tomorrowland/' },
  { pattern: /jim corbett.*(wedding|weddings)/i, cluster: 'corbett', targetUrl: '/jim-corbett/weddings/' },
  { pattern: /jim corbett.*(mice|corporate|offsite)/i, cluster: 'corbett', targetUrl: '/jim-corbett/mice/' },
  { pattern: /jim corbett.*(resort|hotel|price)/i, cluster: 'corbett', targetUrl: '/jim-corbett/resorts/' },
  { pattern: /jim corbett/i, cluster: 'corbett', targetUrl: '/jim-corbett/' },
  { pattern: /(europe|switzerland|france|italy|paris)/i, cluster: 'europe', targetUrl: '/europe/' },
  { pattern: /travel\s*4?\s*life|travel4life/i, cluster: 'brand', targetUrl: '/' },
];

export const suggestQueryOwner = (query) => {
  const match = queryOwners.find(({ pattern }) => pattern.test(query));
  return match
    ? { ...match, evidenceStatus: 'hypothesis', status: 'needs-review' }
    : { cluster: 'other', targetUrl: '/', evidenceStatus: 'hypothesis', status: 'needs-review' };
};

export const expectedCtrForPosition = (position) => {
  if (position <= 3) return 0.1;
  if (position <= 5) return 0.06;
  if (position <= 10) return 0.03;
  if (position <= 20) return 0.01;
  return 0.005;
};

export const getOpportunityScore = ({ impressions, position, ctr, commercialValue = 3 }) => {
  if (!Number.isFinite(impressions) || impressions < 5 || !Number.isFinite(position)) return 0;
  const demandScore = Math.min(1, Math.log10(impressions + 1) / 4);
  const rankingPotential = position >= 4 && position <= 20 ? 1 : position <= 30 ? 0.65 : 0.3;
  const expectedCtr = expectedCtrForPosition(position);
  const ctrGap = Math.max(0, expectedCtr - (Number.isFinite(ctr) ? ctr : 0)) / expectedCtr;
  const commercialScore = Math.max(1, Math.min(5, commercialValue)) / 5;
  return Math.round(100 * (
    demandScore * 0.3
    + rankingPotential * 0.25
    + ctrGap * 0.15
    + commercialScore * 0.3
  ));
};

export const getPageReadiness = (scores) => {
  const dimensions = [
    ['intent_match', 15],
    ['content_quality', 15],
    ['entity_coverage', 10],
    ['data_quality', 10],
    ['internal_authority', 10],
    ['technical_seo', 15],
    ['schema_quality', 5],
    ['trust_evidence', 5],
    ['ctr_potential', 5],
    ['conversion', 5],
  ];
  const missing = dimensions.filter(([key, max]) => {
    const score = scores[key];
    return !Number.isInteger(score) || score < 0 || score > max;
  });
  const total = dimensions.reduce((sum, [key, max]) => {
    const score = scores[key];
    if (!Number.isInteger(score) || score < 0 || score > max) return sum;
    return sum + score;
  }, 0);
  if (missing.length) return { total: null, missing: missing.map(([key]) => key), label: 'Not assessed' };
  return {
    total,
    missing: [],
    label: total >= 90 ? 'Exceptional' : total >= 80 ? 'Strong' : total >= 70 ? 'Improve' : 'Not ready',
  };
};
