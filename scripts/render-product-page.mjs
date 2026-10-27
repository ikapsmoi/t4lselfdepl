import { isSafeImage, productPath } from './seo-quality.mjs';

const siteUrl = 'https://travel4life.net';

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const formatDate = (value) => new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(value));

const resolveImageUrl = (image, baseSiteUrl = siteUrl) => {
  if (image.startsWith('/')) return `${baseSiteUrl}${image}`;
  return image;
};

const setMetaContent = (html, selector, value) => {
  const escapedValue = escapeHtml(value);
  const pattern = new RegExp(`(<meta\\s+${selector}\\s+content=")[^"]*(")`, 'i');
  if (!pattern.test(html)) throw new Error(`Built application shell is missing ${selector} metadata.`);
  return html.replace(pattern, (_match, prefix, suffix) => `${prefix}${escapedValue}${suffix}`);
};

const setCanonical = (html, canonicalUrl) => {
  const pattern = /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i;
  if (!pattern.test(html)) throw new Error('Built application shell is missing its canonical link.');
  return html.replace(pattern, `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`);
};

const formatPrice = (price, currency) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency,
  maximumFractionDigits: 0,
}).format(Number(price));

const getJsonLd = (trip, relatedTrips, description, image, canonicalUrl, baseSiteUrl = siteUrl) => {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: trip.title,
      description,
      image: [image],
      url: canonicalUrl,
      brand: { '@type': 'Brand', name: 'Travel4life' },
      category: trip.category,
      offers: {
        '@type': 'Offer',
        price: Number(trip.price_per_person),
        priceCurrency: trip.currency || 'INR',
        url: canonicalUrl,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseSiteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Trips', item: `${baseSiteUrl}/trips` },
        { '@type': 'ListItem', position: 3, name: trip.title, item: canonicalUrl },
      ],
    },
  ];

  if (relatedTrips.length) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `More ${trip.category.replaceAll('_', ' ')} trips`,
      itemListElement: relatedTrips.map((relatedTrip, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: relatedTrip.title,
        url: `${baseSiteUrl}${productPath(relatedTrip.id)}`,
      })),
    });
  }
  return JSON.stringify(jsonLd).replaceAll('<', '\\u003c');
};

export const renderProductPage = (template, trip, relatedTrips = [], siteUrlOverride = siteUrl) => {
  const destination = trip.location.trim().replace(/[,\s]+$/, '');
  const startDate = formatDate(trip.start_date);
  const endDate = formatDate(trip.end_date);
  const duration = Number(trip.itinerary?.duration) ||
    Math.max(1, Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000));
  const description = trip.itinerary.description.trim();
  const image = resolveImageUrl(trip.images.find(isSafeImage), siteUrlOverride);
  const canonicalUrl = `${siteUrlOverride}${productPath(trip.id)}`;
  const currency = trip.currency || 'INR';
  const title = `${trip.title} | Travel Package | Travel4life`;
  const details = `${destination} • ${startDate} • ${duration} days`;
  const availableDescriptionLength = Math.max(0, 177 - details.length);
  const summary = description.slice(0, availableDescriptionLength).trim();
  const metaDescription = `${summary}${description.length > summary.length ? '...' : ''} ${details}`.trim();
  const included = Array.isArray(trip.itinerary.included) ? trip.itinerary.included : [];
  const groupSize = Number(trip.group_size);
  const tomorrowlandPlanning = /\btomorrowland\b/i.test(`${trip.title} ${destination} ${description}`)
    ? `<section aria-labelledby="tomorrowland-planning"><h2 id="tomorrowland-planning">Tomorrowland trip planning</h2><p>This listing explicitly references Tomorrowland. Festival access is included only if the written trip inclusions say so; confirm the edition, current availability and terms before booking.</p><p><a href="/tomorrowland/packages/">Review the Tomorrowland package and ticket checklist</a></p></section>`
    : '';
  const relatedLinks = relatedTrips.length
    ? `<section aria-labelledby="related-trips"><h2 id="related-trips">More ${escapeHtml(trip.category.replaceAll('_', ' '))} trips</h2><ul>${relatedTrips.map((relatedTrip) => `<li><a href="${escapeHtml(productPath(relatedTrip.id))}">${escapeHtml(relatedTrip.title)}</a> — ${escapeHtml(relatedTrip.location)}</li>`).join('')}</ul></section>`
    : '';
  const rootContent = `
    <main>
      <article>
        <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/trips">Trips</a> / ${escapeHtml(trip.title)}</nav>
        <h1>${escapeHtml(trip.title)}</h1>
        <p>${escapeHtml(destination)}</p>
        <img src="${escapeHtml(image)}" alt="${escapeHtml(trip.title)}" width="1200" height="750" fetchpriority="high">
        <p>${escapeHtml(description)}</p>
        <dl>
          <dt>Dates</dt><dd><time datetime="${escapeHtml(trip.start_date)}">${escapeHtml(startDate)}</time> – <time datetime="${escapeHtml(trip.end_date)}">${escapeHtml(endDate)}</time></dd>
          <dt>Duration</dt><dd>${duration} days</dd>
          ${groupSize > 0 ? `<dt>Group capacity</dt><dd>Up to ${groupSize} travellers</dd>` : ''}
          <dt>Price per person</dt><dd>${escapeHtml(formatPrice(trip.price_per_person, currency))}</dd>
        </dl>
        ${included.length ? `<section aria-labelledby="included"><h2 id="included">What's included</h2><ul>${included.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>` : ''}
        ${tomorrowlandPlanning}
        ${relatedLinks}
        <p><a href="/trips">Browse all current trips</a></p>
      </article>
    </main>`;
  let html = template.replace(/<title>[^<]*<\/title>/i, () => `<title>${escapeHtml(title)}</title>`);
  html = html.replace(/<link\s+id="home-lcp-preload"[^>]*\/?>/i, '');
  html = setMetaContent(html, 'name="description"', metaDescription);
  html = setMetaContent(html, 'name="robots"', 'index, follow, max-image-preview:large');
  html = setMetaContent(html, 'property="og:title"', title);
  html = setMetaContent(html, 'property="og:description"', metaDescription);
  html = setMetaContent(html, 'property="og:url"', canonicalUrl);
  html = setMetaContent(html, 'property="og:image"', image);
  html = setMetaContent(html, 'property="og:type"', 'product');
  html = setMetaContent(html, 'name="twitter:title"', title);
  html = setMetaContent(html, 'name="twitter:description"', metaDescription);
  html = setMetaContent(html, 'name="twitter:image"', image);
  html = setCanonical(html, canonicalUrl);
  html = html.replace('</head>', () => `<script type="application/ld+json">${getJsonLd(trip, relatedTrips, description, image, canonicalUrl, siteUrlOverride)}</script>\n</head>`);
  const root = /<div\s+id="root"><\/div>/i;
  if (!root.test(html)) throw new Error('Built application shell is missing the React root element.');
  return html.replace(root, () => `<div id="root">${rootContent}</div>`);
};
