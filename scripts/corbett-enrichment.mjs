import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createEnrichmentQueue, parseCsv, enrichResortRecord } from './corbett-authority.mjs';

const dataPath = resolve('public/jim-corbett/resorts.json');
const queuePath = resolve('public/jim-corbett/enrichment-queue.json');
const inputIndex = process.argv.indexOf('--import');

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const numberOrNull = (value, column, rowNumber) => {
  if (!value) return null;
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0) throw new Error(`Row ${rowNumber}: ${column} must be a positive integer.`);
  return number;
};
const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value)
  && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
  && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

const booleanOrNull = (value, column, rowNumber) => {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (['true', 'yes', '1'].includes(normalized)) return true;
  if (['false', 'no', '0'].includes(normalized)) return false;
  if (normalized === 'unknown') return null;
  throw new Error(`Row ${rowNumber}: ${column} must be yes, no, true, false or blank.`);
};

const listValue = (value) => value ? value.split('|').map((item) => item.trim()).filter(Boolean) : null;
const sourceUrlIsSafe = (value) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

const importVerifiedRows = async (filePath, properties) => {
  const sourceCsv = await readFile(resolve(filePath), 'utf8');
  const rows = parseCsv(sourceCsv);
  if (rows.length < 2) throw new Error('The enrichment CSV must contain a header and at least one resort row.');
  const headers = rows[0].map((header) => header.trim().replace(/^\uFEFF/, '').toLowerCase());
  const requiredHeaders = ['resort_slug', 'source_url', 'verified_by', 'verified_at'];
  for (const header of requiredHeaders) {
    if (!headers.includes(header)) throw new Error(`Missing required verification column "${header}".`);
  }
  const rowFor = (row, name) => {
    const index = headers.indexOf(name);
    return index < 0 ? '' : (row[index] || '').trim();
  };
  const propertyBySlug = new Map(properties.map((property) => [property.slug, property]));
  const updates = new Map();
  const seen = new Set();
  const supportedColumns = new Set([
    ...requiredHeaders, 'name', 'property_existence_verified', 'brand', 'property_type', 'locality', 'zone', 'gate', 'address',
    'description', 'website', 'phone', 'email', 'latitude', 'longitude',
    'room_count', 'room_types', 'capacity', 'amenities', 'images',
    'pool', 'spa', 'restaurant', 'parking', 'wifi', 'safari_support',
    'wedding_facilities', 'wedding_capacity', 'conference_facilities', 'conference_capacity',
    'corporate_facilities', 'event_facilities', 'event_capacity',
    'price_from', 'price_to', 'price_unit', 'price_basis',
  ]);
  const unknownColumns = headers.filter((header) => header && !supportedColumns.has(header));
  if (unknownColumns.length) throw new Error(`Unsupported enrichment columns: ${unknownColumns.join(', ')}.`);

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    const rowNumber = index + 1;
    const slug = rowFor(row, 'resort_slug');
    if (!slug) throw new Error(`Row ${rowNumber}: resort_slug is required.`);
    if (seen.has(slug)) throw new Error(`Row ${rowNumber}: duplicate resort_slug "${slug}".`);
    seen.add(slug);
    const property = propertyBySlug.get(slug);
    if (!property) throw new Error(`Row ${rowNumber}: no source resort matches slug "${slug}".`);
    const sourceUrl = rowFor(row, 'source_url');
    const verifiedBy = rowFor(row, 'verified_by');
    const verifiedAt = rowFor(row, 'verified_at');
    if (!sourceUrlIsSafe(sourceUrl)) throw new Error(`Row ${rowNumber}: source_url must be an HTTPS URL.`);
    if (!verifiedBy) throw new Error(`Row ${rowNumber}: verified_by is required.`);
    if (!isIsoDate(verifiedAt)) {
      throw new Error(`Row ${rowNumber}: verified_at must be YYYY-MM-DD.`);
    }
    if (verifiedAt > new Date().toISOString().slice(0, 10)) throw new Error(`Row ${rowNumber}: verified_at cannot be in the future.`);

    const fieldMap = {
      name: ['name', (value) => value],
      brand: ['brand', (value) => value],
      property_type: ['propertyType', (value) => value],
      locality: ['locality', (value) => value],
      zone: ['zone', (value) => value],
      gate: ['gate', (value) => value],
      address: ['address', (value) => value],
      description: ['description', (value) => value],
      website: ['website', (value) => value],
      phone: ['phone', (value) => value],
      email: ['email', (value) => value],
      latitude: ['latitude', (value) => Number(value)],
      longitude: ['longitude', (value) => Number(value)],
      room_count: ['roomCount', (value) => numberOrNull(value, 'room_count', rowNumber)],
      room_types: ['roomTypes', listValue],
      capacity: ['capacity', (value) => numberOrNull(value, 'capacity', rowNumber)],
      amenities: ['amenities', listValue],
      images: ['images', listValue],
      pool: ['pool', (value) => booleanOrNull(value, 'pool', rowNumber)],
      spa: ['spa', (value) => booleanOrNull(value, 'spa', rowNumber)],
      restaurant: ['restaurant', (value) => booleanOrNull(value, 'restaurant', rowNumber)],
      parking: ['parking', (value) => booleanOrNull(value, 'parking', rowNumber)],
      wifi: ['wifi', (value) => booleanOrNull(value, 'wifi', rowNumber)],
      safari_support: ['safariSupport', (value) => value],
      wedding_facilities: ['weddingFacilities', (value) => value],
      wedding_capacity: ['weddingCapacity', (value) => numberOrNull(value, 'wedding_capacity', rowNumber)],
      conference_facilities: ['conferenceFacilities', (value) => value],
      conference_capacity: ['conferenceCapacity', (value) => numberOrNull(value, 'conference_capacity', rowNumber)],
      corporate_facilities: ['corporateFacilities', (value) => value],
      event_facilities: ['eventFacilities', (value) => value],
      event_capacity: ['eventCapacity', (value) => numberOrNull(value, 'event_capacity', rowNumber)],
    };

    const updatedProperty = {
      ...property,
      fieldEvidence: { ...(property.fieldEvidence || {}) },
    };
    const appliedFields = [];
    for (const [column, [field, convert]] of Object.entries(fieldMap)) {
      const rawValue = rowFor(row, column);
      if (!rawValue) continue;
      const converted = convert(rawValue);
      if (converted === null || converted === undefined) continue;
      if (column === 'website' && !sourceUrlIsSafe(converted)) throw new Error(`Row ${rowNumber}: website must be an HTTPS URL.`);
      if (column === 'images') {
        for (const image of converted) {
          if (!image.startsWith('/') && !sourceUrlIsSafe(image)) throw new Error(`Row ${rowNumber}: image values must be HTTPS URLs or first-party root-relative paths.`);
        }
      }
      const coordinateLimit = column === 'latitude' ? 90 : 180;
      if (['latitude', 'longitude'].includes(column) && (!Number.isFinite(converted) || converted < -coordinateLimit || converted > coordinateLimit)) {
        throw new Error(`Row ${rowNumber}: ${column} is outside valid coordinate bounds.`);
      }
      if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(converted)) {
        throw new Error(`Row ${rowNumber}: email is invalid.`);
      }
      updatedProperty[field] = converted;
      updatedProperty.fieldEvidence[field] = { sourceUrl, verifiedAt, verifiedBy, verified: true };
      appliedFields.push(field);
    }
    const existenceValue = rowFor(row, 'property_existence_verified');
    if (existenceValue) {
      const existenceVerified = booleanOrNull(existenceValue, 'property_existence_verified', rowNumber);
      if (existenceVerified === null) throw new Error(`Row ${rowNumber}: property_existence_verified must be yes or no when provided.`);
      updatedProperty.propertyExistenceStatus = existenceVerified ? 'VERIFIED' : 'SOURCE_LISTED_UNVERIFIED';
      updatedProperty.fieldEvidence.propertyExistenceStatus = { sourceUrl, verifiedAt, verifiedBy, verified: existenceVerified };
      appliedFields.push('propertyExistenceStatus');
    }

    const priceFrom = rowFor(row, 'price_from');
    const priceTo = rowFor(row, 'price_to');
    const priceUnit = rowFor(row, 'price_unit');
    const priceBasis = rowFor(row, 'price_basis');
    if ([priceFrom, priceTo, priceUnit, priceBasis].some(Boolean)) {
      const lower = numberOrNull(priceFrom, 'price_from', rowNumber);
      const upper = numberOrNull(priceTo, 'price_to', rowNumber);
      if (!lower || !priceUnit || !priceBasis) {
        throw new Error(`Row ${rowNumber}: verified pricing requires price_from, price_unit and price_basis; price_to is optional.`);
      }
      if (upper !== null && upper < lower) throw new Error(`Row ${rowNumber}: price_to cannot be lower than price_from.`);
      updatedProperty.verifiedPricing = {
        priceFrom: lower,
        priceTo: upper,
        priceUnit,
        basis: priceBasis,
        verifiedAt,
        sourceUrl,
        verifiedBy,
      };
      updatedProperty.fieldEvidence.verifiedPricing = { sourceUrl, verifiedAt, verifiedBy, verified: true };
      appliedFields.push('verifiedPricing');
    }
    if (!appliedFields.length) throw new Error(`Row ${rowNumber}: provide at least one non-empty field to verify.`);
    if (!updatedProperty.fieldEvidence.category) {
      updatedProperty.fieldEvidence.category = { sourceUrl: property.source.file, verified: false };
    }
    updatedProperty.lastVerifiedAt = verifiedAt;
    updatedProperty.verificationStatus = 'PARTIALLY_VERIFIED';
    updatedProperty.enrichmentStatus = 'PARTIALLY_VERIFIED';
    updatedProperty.dataQuality = 'PARTIALLY_VERIFIED';
    updates.set(slug, updatedProperty);
  }

  const merged = properties.map((property) => updates.get(property.slug) || property);
  const enriched = merged.map(enrichResortRecord);
  await writeFile(dataPath, `${JSON.stringify({
    schemaVersion: 2,
    source: {
      ...JSON.parse(await readFile(dataPath, 'utf8')).source,
      lastEnrichmentImportAt: new Date().toISOString(),
      verifiedRowsImported: updates.size,
      notes: [
        ...JSON.parse(await readFile(dataPath, 'utf8')).source.notes.filter((note) => !note.startsWith('Verified field updates are imported')),
        'Verified field updates are imported only with source URL, verification date and verifier.',
      ],
    },
    properties: enriched,
  }, null, 2)}\n`, 'utf8');
  return { updated: updates.size, total: enriched.length };
};

try {
  const dataset = JSON.parse(await readFile(dataPath, 'utf8'));
  let properties = dataset.properties;
  if (inputIndex >= 0) {
    const inputPath = process.argv[inputIndex + 1];
    if (!inputPath) throw new Error('Usage: node scripts/corbett-enrichment.mjs --import <verified-enrichment.csv>');
    const result = await importVerifiedRows(inputPath, properties);
    const updatedDataset = JSON.parse(await readFile(dataPath, 'utf8'));
    properties = updatedDataset.properties;
    console.log(`Imported verified field data for ${result.updated} of ${result.total} resort entities. No resort pages were published.`);
  }
  if (inputIndex < 0) {
    properties = properties.map(enrichResortRecord);
    await writeFile(dataPath, `${JSON.stringify({
      ...dataset,
      schemaVersion: 2,
      properties,
    }, null, 2)}\n`, 'utf8');
  }
  const queue = createEnrichmentQueue(properties);
  await writeFile(queuePath, `${JSON.stringify(queue, null, 2)}\n`, 'utf8');
  if (inputIndex < 0) {
    const { summary } = queue;
    console.log(`Enrichment queue refreshed: ${summary.total} resorts; ${summary.readyForReview} ready for editorial review; ${summary.needsEnrichment} need enrichment; ${summary.weddingReady} wedding-ready; ${summary.miceReady} MICE-ready; ${summary.priceReady} price-ready.`);
  } else {
    console.log(`Queue refreshed: ${queue.summary.readyForReview} ready for review; ${queue.summary.needsEnrichment} still need enrichment.`);
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
