import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { isSafeImage } from './seo-quality.mjs';

const inventoryTypes = new Set(['tomorrowland', 'belgium', 'winter', 'thailand']);
const maxCards = 4;

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const getTripText = (trip) => [
  trip.title,
  trip.location,
  trip.itinerary?.description,
].filter((value) => typeof value === 'string').join(' ').toLowerCase();

const matchesInventory = (trip, inventoryType) => {
  const searchableText = getTripText(trip);
  if (!/\btomorrowland\b/.test(searchableText)) return false;

  switch (inventoryType) {
    case 'tomorrowland':
      return true;
    case 'belgium':
      return /\bbelgium\b|\bboom\b/.test(searchableText);
    case 'winter':
      return /\bwinter\b/.test(searchableText) || (searchableText.includes('alpe d') && searchableText.includes('huez'));
    case 'thailand':
      return /\bthailand\b/.test(searchableText);
    default:
      throw new Error(`Unsupported Tomorrowland trip inventory type: ${inventoryType}`);
  }
};

export const selectTomorrowlandTrips = (trips, inventoryType) => {
  if (!inventoryTypes.has(inventoryType)) {
    throw new Error(`Unsupported Tomorrowland trip inventory type: ${inventoryType}`);
  }

  return trips
    .filter((trip) => matchesInventory(trip, inventoryType))
    .sort((first, second) => first.start_date.localeCompare(second.start_date))
    .slice(0, maxCards);
};

const formatDate = (value) => new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(`${value}T00:00:00Z`));

const formatPrice = (trip) => {
  const price = Number(trip.price_per_person);
  if (!Number.isFinite(price) || price <= 0) return 'Ask for current price';

  const currency = trip.currency || 'INR';
  const symbol = currency === 'INR' ? '₹' : `${currency} `;
  return `${symbol}${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(price)} per person`;
};

const renderCard = (trip) => {
  const image = Array.isArray(trip.images) ? trip.images.find(isSafeImage) : null;
  if (!image) throw new Error(`Tomorrowland listing "${trip.id}" has no safe product image.`);

  const destination = String(trip.location || '').trim();
  const description = String(trip.itinerary?.description || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const summary = description.length > 150 ? `${description.slice(0, 147).trimEnd()}...` : description;
  const path = `/trips/${encodeURIComponent(trip.id)}/`;

  return `
    <article class="t4l-trip-card">
      <a class="t4l-trip-card__image-link" href="${escapeHtml(path)}" aria-label="View ${escapeHtml(trip.title)}">
        <img class="t4l-trip-card__image" src="${escapeHtml(image)}" alt="${escapeHtml(trip.title)}" width="640" height="400" loading="lazy" decoding="async">
      </a>
      <div class="t4l-trip-card__body">
        <p class="t4l-trip-card__destination">${escapeHtml(destination)}</p>
        <h3 class="t4l-trip-card__title"><a href="${escapeHtml(path)}">${escapeHtml(trip.title)}</a></h3>
        <p class="t4l-trip-card__dates">${escapeHtml(formatDate(trip.start_date))} – ${escapeHtml(formatDate(trip.end_date))}</p>
        <p class="t4l-trip-card__summary">${escapeHtml(summary)}</p>
        <p class="t4l-trip-card__price">${escapeHtml(formatPrice(trip))}</p>
        <a class="t4l-trip-card__action" href="${escapeHtml(path)}">View trip &amp; check availability</a>
      </div>
    </article>`;
};

const inventoryHeadings = {
  tomorrowland: 'Current Tomorrowland-related trips',
  belgium: 'Current Tomorrowland Belgium trips',
  winter: 'Current Tomorrowland Winter trips',
  thailand: 'Current Tomorrowland Thailand trips',
};

export const renderTomorrowlandTripCards = (trips, inventoryType) => {
  const relevantTrips = selectTomorrowlandTrips(trips, inventoryType);
  if (relevantTrips.length === 0) return '';

  const heading = inventoryHeadings[inventoryType];
  return `
    <section class="t4l-trip-listing" aria-labelledby="t4l-trip-listing-title">
      <div class="t4l-trip-listing__heading">
        <p class="t4l-trip-listing__eyebrow">Active Travel4life listings</p>
        <h2 id="t4l-trip-listing-title">${heading}</h2>
        <p>These listings were active in the latest site inventory build. Confirm dates, inclusions, price and availability on each trip page. Festival access is not implied.</p>
      </div>
      <div class="t4l-trip-listing__grid">
        ${relevantTrips.map(renderCard).join('')}
      </div>
    </section>`;
};

const injectCards = (html, cardsHtml) => {
  if (!cardsHtml) return html;

  const articleStart = html.search(/<article\b[^>]*>/i);
  const articleClose = articleStart < 0 ? -1 : html.toLowerCase().indexOf('</article>', articleStart);
  if (articleStart < 0 || articleClose < 0) {
    throw new Error('Could not find a complete article to add Tomorrowland trip cards.');
  }

  const article = html.slice(articleStart, articleClose);
  const introduction = article.match(/<\/h2>[\s\S]*?<\/p>/i);
  const notice = article.match(/<(div|p)\s+class="[^"]*\bnotice\b[^"]*"[^>]*>[\s\S]*?<\/\1>/i);
  let insertionPoint;
  if (introduction) {
    insertionPoint = articleStart + introduction.index + introduction[0].length;
  } else if (notice) {
    insertionPoint = articleStart + notice.index + notice[0].length;
  } else {
    const firstParagraphEnd = article.indexOf('</p>');
    if (firstParagraphEnd < 0) {
      throw new Error('Could not find an introductory paragraph or notice for Tomorrowland trip cards.');
    }
    insertionPoint = articleStart + firstParagraphEnd + '</p>'.length;
  }

  let result = `${html.slice(0, insertionPoint)}${cardsHtml}${html.slice(insertionPoint)}`;
  if (!/<link\b[^>]*href="\/seo-trip-cards\.css"/i.test(result)) {
    const closingHead = result.toLowerCase().indexOf('</head>');
    if (closingHead < 0) throw new Error('SEO page is missing </head>; cannot load the trip card stylesheet.');
    result = `${result.slice(0, closingHead)}<link rel="stylesheet" href="/seo-trip-cards.css">\n${result.slice(closingHead)}`;
  }
  return result;
};

export const injectTomorrowlandTripCards = (html, trips, inventoryType) => (
  injectCards(html, renderTomorrowlandTripCards(trips, inventoryType))
);

export const generateTomorrowlandTripCards = async (trips, outputDirectory) => {
  const manifestPath = resolve('public/tomorrowland/search-intent-map.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  let updatedPages = 0;

  for (const owner of manifest.owners) {
    if (!owner.tripInventory) continue;
    const inventoryType = owner.tripInventory;
    if (!inventoryTypes.has(inventoryType)) {
      throw new Error(`Invalid tripInventory "${inventoryType}" for ${owner.url}.`);
    }
    if (!owner.file.startsWith('tomorrowland/')) {
      throw new Error(`Tomorrowland inventory page must be inside public/tomorrowland: ${owner.file}`);
    }

    const pagePath = resolve(outputDirectory, ...owner.file.split('/'));
    const html = await readFile(pagePath, 'utf8');
    const updatedHtml = injectTomorrowlandTripCards(html, trips, inventoryType);
    if (updatedHtml !== html) {
      await writeFile(pagePath, updatedHtml, 'utf8');
      updatedPages += 1;
    }
  }

  console.log(`Added inventory-backed Tomorrowland trip cards to ${updatedPages} SEO pages.`);
};
