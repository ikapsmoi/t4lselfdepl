import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { TRAVEL4LIFE_CONTACT, getTravel4LifeContactContextFromLocation, getTravel4LifeWhatsAppUrl } from '../src/utils/travel4lifeContact.js';
import { injectContactLayerHtml } from './contact-layer-markup.mjs';

const siteUrl = 'https://travel4life.net';
const intentMapPath = resolve('public/tomorrowland/search-intent-map.json');
const intentMap = JSON.parse(await readFile(intentMapPath, 'utf8'));
const routes = intentMap.owners;
const europeIntentMap = JSON.parse(await readFile(resolve('public/europe/search-intent-map.json'), 'utf8'));
const indiaToursIntentMap = JSON.parse(await readFile(resolve('public/india-tours/search-intent-map.json'), 'utf8'));
const knownInternalRoutes = new Set([
  '/',
  '/trips',
  '/trips/',
  '/europe/',
  '/india-tours/',
  '/tomorrowland-seo.css',
  '/travel4life-contact.css',
  ...routes.map(({ url }) => url),
]);
const failures = [];
const titles = new Set();
const descriptions = new Set();
const primaryQueries = new Set();
const hubLinks = new Set();
const sitemapPath = resolve('public/sitemap-static.xml');
const sitemapIndexPath = resolve('public/sitemap.xml');
const redirectsPath = resolve('public/_redirects');
const stylesPath = resolve('public/tomorrowland-seo.css');
const sitemap = await readFile(sitemapPath, 'utf8');
const sitemapIndex = await readFile(sitemapIndexPath, 'utf8');
const redirects = await readFile(redirectsPath, 'utf8');
const styles = await readFile(stylesPath, 'utf8');
const contactStyles = await readFile(resolve('src/contact-layer.css'), 'utf8');
const contactAnalytics = { url: 'https://example.supabase.co', anonKey: 'public-anon-key-placeholder' };
const contactAnalyticsScript = await readFile(resolve('public/travel4life-contact-analytics.js'), 'utf8');
const validatedContactPages = new Set();
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1]);
const sitemapIndexUrls = [...sitemapIndex.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1]);
const redirectedPaths = [
  ['/tomorrowland-india.html', '/tomorrowland/from-india/'],
  ['/tomorrowland/winter/2027/', '/tomorrowland/winter/'],
  ['/tomorrowland/winter/2027/index.html', '/tomorrowland/winter/'],
];
const legacyFallbacks = [
  ['tomorrowland-india.html', '/tomorrowland/from-india/'],
  ['tomorrowland/winter/2027/index.html', '/tomorrowland/winter/'],
];
const destinationEnquiryPages = new Map([
  ['/tomorrowland/thailand/', { destination: 'Tomorrowland Thailand', label: 'Ask about Thailand travel options' }],
  ['/tomorrowland/winter/', { destination: 'Tomorrowland Winter', label: 'Ask about Winter travel options' }],
  ['/tomorrowland/belgium/', { destination: 'Tomorrowland Belgium', label: 'Ask about Belgium travel options' }],
]);

const validateContactLayer = (route, html) => {
  validatedContactPages.add(route);
  if (!html.includes(`tel:${TRAVEL4LIFE_CONTACT.phoneHref}`)) failures.push(`${route}: missing clickable phone CTA`);
  if (!html.includes(`mailto:${TRAVEL4LIFE_CONTACT.email}`)) failures.push(`${route}: missing clickable email CTA`);
  if (!html.includes(`https://wa.me/${TRAVEL4LIFE_CONTACT.whatsappNumber}?text=`)) failures.push(`${route}: missing configured WhatsApp CTA`);
  if (html.includes('t4l-contact-panel--hero')) failures.push(`${route}: unexpected contact panel in hero`);
  if (!html.includes('t4l-contact-panel--final')) failures.push(`${route}: missing final contact CTA`);
  if (html.includes('t4l-contact-sticky') || html.includes('t4l-global-footer')) failures.push(`${route}: unexpected added contact footer bar`);
  if (html.includes('t4l-contact-header')) failures.push(`${route}: unexpected extra contact button in header`);
  if (!html.includes('data-contact-page-type=') || !html.includes('data-contact-event=')) failures.push(`${route}: contact links are missing context or analytics event attributes`);
  if (!html.includes('/travel4life-contact-analytics.js')) failures.push(`${route}: missing contact conversion analytics script`);
  if (!contactAnalyticsScript.includes("analytics_events")) failures.push(`${route}: contact analytics does not submit conversion events`);
  if (!contactAnalyticsScript.includes('contactSecondaryEvent') || !contactAnalyticsScript.includes('contactExtraEvent')) failures.push(`${route}: contact analytics omits contextual quote events`);
  if (!contactAnalyticsScript.includes('button[data-contact-event]')) failures.push(`${route}: contact analytics does not track the enquiry button`);
  if (!contactAnalyticsScript.includes("sendEvent('form_start'") ||
    !contactAnalyticsScript.includes("sendEvent('form_error'")) {
    failures.push(`${route}: contact analytics does not distinguish enquiry starts and client-side errors`);
  }
  if (contactAnalyticsScript.includes('data-enquiry-') || contactAnalyticsScript.includes('.value')) {
    failures.push(`${route}: contact analytics must not read or send enquiry field values`);
  }
  if (contactAnalyticsScript.includes("sendEvent('form_submit'") ||
    contactAnalyticsScript.includes("sendEvent('qualified_enquiry'")) {
    failures.push(`${route}: contact analytics must not claim a WhatsApp draft is a submitted or qualified lead`);
  }
  if (!contactStyles.includes('min-height: 48px')) failures.push(`${route}: contact touch targets are below 44px`);
  const context = getTravel4LifeContactContextFromLocation(route, html.match(/<title>([^<]+)<\/title>/i)?.[1] || '');
  const expectedMessageUrl = getTravel4LifeWhatsAppUrl(context).replaceAll('&', '&amp;');
  if (!html.includes(expectedMessageUrl)) failures.push(`${route}: WhatsApp message is not contextual to the landing page`);
  if (route.startsWith('/tomorrowland/')) {
    const whatsappAnchors = [...html.matchAll(/<a\b[^>]*href="https:\/\/wa\.me\/[^"]*"[^>]*>[\s\S]*?<\/a>/gi)]
      .map((match) => match[0]);
    for (const anchor of whatsappAnchors) {
      const openingTag = anchor.slice(0, anchor.indexOf('>') + 1);
      if (!/\bdata-contact-event="contact_whatsapp_click"/i.test(openingTag)) {
        failures.push(`${route}: a WhatsApp link is missing click analytics`);
      }
      if (!/\bdata-contact-page-type="/i.test(openingTag)) {
        failures.push(`${route}: a WhatsApp link is missing page context`);
      }
      const label = `${anchor.replace(/<[^>]*>/g, ' ')} ${openingTag.match(/\baria-label="([^"]*)"/i)?.[1] || ''}`;
      if (/\b(?:quote|enquir(?:y|e)|proposal|availability|booking)\b/i.test(label)
        && !/\bdata-contact-secondary-event="/i.test(openingTag)) {
        failures.push(`${route}: a quote or enquiry WhatsApp link is missing quote-click analytics`);
      }
    }
  }
};

if (new Set(sitemapUrls).size !== sitemapUrls.length) {
  failures.push('sitemap-static.xml: duplicate URLs');
}
for (const requiredStyle of ["font-family: 'Plus Jakarta Sans'", '#0284c7 0%, #10b981 55%, #f59e0b']) {
  if (!styles.includes(requiredStyle)) failures.push(`tomorrowland-seo.css: missing main-site theme value ${requiredStyle}`);
}
for (const requiredStyle of ['.home-link', '.guides-link', '.whatsapp-button', '.floating-whatsapp', '@media (max-width: 480px)']) {
  if (!styles.includes(requiredStyle)) failures.push(`tomorrowland-seo.css: missing shared responsive UI style ${requiredStyle}`);
}
for (const requiredStyle of ['--forest-deep: #091c18', '--serif: \'Playfair Display\'', '.layout > article', 'grid-template-columns: 1fr', '@media (max-width: 560px)']) {
  if (!styles.includes(requiredStyle)) failures.push(`tomorrowland-seo.css: missing shared destination editorial theme style ${requiredStyle}`);
}
const mappedUrls = new Set(routes.map(({ url }) => `${siteUrl}${url}`));
const indiaToursOwnerUrls = new Set(indiaToursIntentMap.owners.map(({ url }) => `${siteUrl}${url}`));
for (const sitemapUrl of sitemapUrls) {
  if (sitemapUrl.startsWith(`${siteUrl}/tomorrowland/`) && !mappedUrls.has(sitemapUrl)) {
    failures.push(`sitemap-static.xml: Tomorrowland URL has no intent owner (${sitemapUrl})`);
  }
  const europeOwners = europeIntentMap.owners.filter(({ url }) => url.startsWith('/europe/'));
  const europeOwnerUrls = new Set(europeOwners.map(({ url }) => `${siteUrl}${url}`));
  const europePrimaryQueries = new Set();
  for (const owner of europeOwners) {
    const query = owner.primaryQuery.trim().toLowerCase();
    if (europePrimaryQueries.has(query)) failures.push(`${owner.url}: duplicate Europe primary query owner "${owner.primaryQuery}"`);
    europePrimaryQueries.add(query);
  }
  for (const sitemapUrl of sitemapUrls.filter((url) => url.startsWith(`${siteUrl}/europe/`))) {
    if (!europeOwnerUrls.has(sitemapUrl)) failures.push(`sitemap-static.xml: Europe URL has no intent owner (${sitemapUrl})`);
  }
  if (sitemapUrl.startsWith(`${siteUrl}/india-tours/`) && !indiaToursOwnerUrls.has(sitemapUrl)) {
    failures.push(`sitemap-static.xml: India tours URL has no intent owner (${sitemapUrl})`);
  }
}
if (!sitemapIndexUrls.includes(`${siteUrl}/sitemap-static.xml`)) {
  failures.push('sitemap.xml: missing static sitemap');
}
if (!sitemapIndexUrls.includes(`${siteUrl}/sitemap-products.xml`)) {
  failures.push('Legacy public sitemap.xml: missing product sitemap entry');
}
for (const sitemapUrl of sitemapIndexUrls) {
  const sitemapFile = resolve('public', sitemapUrl.slice(siteUrl.length + 1));
  if (!existsSync(sitemapFile)) failures.push(`sitemap.xml: referenced file is missing (${sitemapUrl})`);
}
for (const [source, destination] of redirectedPaths) {
  const redirectPattern = new RegExp(`^${source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+${destination.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+301!?$`, 'm');
  if (!redirectPattern.test(redirects)) failures.push(`_redirects: missing permanent redirect ${source} -> ${destination}`);
  if (sitemapUrls.includes(`${siteUrl}${source}`)) failures.push(`sitemap-static.xml: redirected URL is listed (${source})`);
}
for (const [file, destination] of legacyFallbacks) {
  const filePath = resolve('public', file);
  if (!existsSync(filePath)) {
    failures.push(`legacy fallback is missing (${file})`);
    continue;
  }
  const html = await readFile(filePath, 'utf8');
  if (!html.includes('content="noindex,follow"')) failures.push(`${file}: missing noindex fallback directive`);
  if (!html.includes(`href="${siteUrl}${destination}"`)) failures.push(`${file}: missing destination canonical`);
  if (!html.includes(`url=${destination}`)) failures.push(`${file}: missing fallback redirect`);
}

for (const route of routes) {
  if (primaryQueries.has(route.primaryQuery.toLowerCase())) {
    failures.push(`${route.url}: duplicate primary query owner "${route.primaryQuery}"`);
  }
  primaryQueries.add(route.primaryQuery.toLowerCase());

  const filePath = resolve('public', route.file);
  if (!existsSync(filePath)) {
    failures.push(`${route.url}: mapped file is missing`);
    continue;
  }

  const sourceHtml = await readFile(filePath, 'utf8');
  const sourceWhatsappNumbers = [...sourceHtml.matchAll(/https:\/\/wa\.me\/(\d+)/g)].map((match) => match[1]);
  if (sourceWhatsappNumbers.some((number) => number !== TRAVEL4LIFE_CONTACT.whatsappNumber)) {
    failures.push(`${route.url}: source WhatsApp CTA does not use the shared contact configuration`);
  }
  const html = injectContactLayerHtml(
    sourceHtml,
    getTravel4LifeContactContextFromLocation(route.url, sourceHtml.match(/<title>([^<]+)<\/title>/i)?.[1] || ''),
    contactAnalytics,
  );
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1]?.trim();
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  const robots = html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i)?.[1] || '';
  const homeLink = html.match(/<a\s+class="home-link"\s+href="\/">Home<\/a>/i);
  const guideLink = html.match(/<a\s+class="guides-link"\s+href="\/tomorrowland\/">Festival guides<\/a>/i);
  const headerWhatsapp = html.match(new RegExp(`<a\\s+class="whatsapp-button"\\s+href="(https:\\/\\/wa\\.me\\/${TRAVEL4LIFE_CONTACT.whatsappNumber}[^"]*)"[^>]*aria-label="Ask Travel4Life about [^"]+ on WhatsApp"`, 'i'))?.[1];
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const jsonLd = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  const imageUrl = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)?.[1];
  const imageAlt = html.match(/<meta\s+property="og:image:alt"\s+content="([^"]+)"/i)?.[1];
  const imageType = html.match(/<meta\s+property="og:image:type"\s+content="([^"]+)"/i)?.[1];
  const imageWidth = html.match(/<meta\s+property="og:image:width"\s+content="([^"]+)"/i)?.[1];
  const imageHeight = html.match(/<meta\s+property="og:image:height"\s+content="([^"]+)"/i)?.[1];
  const twitterCard = html.match(/<meta\s+name="twitter:card"\s+content="([^"]+)"/i)?.[1];
  const twitterImage = html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i)?.[1];
  const bodyHtml = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  const visibleText = bodyHtml.replace(/<[^>]+>/g, ' ').replace(/&(?:nbsp|amp|quot|lt|gt|#\d+);/gi, ' ');
  const wordCount = visibleText.trim().split(/\s+/).filter(Boolean).length;
  const internalLinks = [...html.matchAll(/href="(\/[^"#?]*)[^"]*"/gi)].map((match) => match[1]);
  if (route.url === '/tomorrowland/') {
    internalLinks.forEach((link) => hubLinks.add(link));
  }

  if (!title) failures.push(`${route.url}: missing title`);
  if (!description) failures.push(`${route.url}: missing meta description`);
  if (title && titles.has(title)) failures.push(`${route.url}: duplicate title`);
  if (description && descriptions.has(description)) failures.push(`${route.url}: duplicate description`);
  if (title) titles.add(title);
  if (description) descriptions.add(description);
  if (title && (title.length < 25 || title.length > 70)) failures.push(`${route.url}: title length should be 25-70 characters (found ${title.length})`);
  if (description && (description.length < 70 || description.length > 180)) failures.push(`${route.url}: description length should be 70-180 characters (found ${description.length})`);
  if (canonical !== `${siteUrl}${route.url}`) failures.push(`${route.url}: canonical is ${canonical || 'missing'}`);
  if (!/index,\s*follow/i.test(robots)) failures.push(`${route.url}: expected index, follow robots directive`);
  if (!homeLink) failures.push(`${route.url}: missing visible Home navigation link`);
  if (!guideLink) failures.push(`${route.url}: missing visible Tomorrowland guides navigation link`);
  if (!headerWhatsapp) failures.push(`${route.url}: missing accessible header WhatsApp action`);
  validateContactLayer(route.url, html);
  const destinationEnquiry = destinationEnquiryPages.get(route.url);
  if (destinationEnquiry) {
    const context = getTravel4LifeContactContextFromLocation(route.url, title);
    const expectedWhatsappUrl = getTravel4LifeWhatsAppUrl(context).replaceAll('&', '&amp;');
    if (!html.includes(`href="${expectedWhatsappUrl}"`)) {
      failures.push(`${route.url}: missing a WhatsApp CTA with destination-specific enquiry text`);
    }
    if (!html.includes(`>${destinationEnquiry.label}</a>`)) {
      failures.push(`${route.url}: missing the destination-specific primary enquiry CTA`);
    }
    if (!html.includes(`data-contact-destination="${destinationEnquiry.destination}"`)) {
      failures.push(`${route.url}: enquiry CTA is missing its destination analytics context`);
    }
    if (!html.includes('data-contact-secondary-event="quote_request_click"')) {
      failures.push(`${route.url}: enquiry CTA is missing quote-click tracking`);
    }
    if (!html.includes('data-tomorrowland-enquiry')) {
      failures.push(`${route.url}: missing the trip-detail WhatsApp enquiry builder`);
    }
    if (!html.includes('/tomorrowland-enquiry.js')) {
      failures.push(`${route.url}: missing the enquiry builder script`);
    }
    if (!html.includes('data-enquiry-departure') ||
      !html.includes('data-enquiry-month') ||
      !html.includes('data-enquiry-travellers')) {
      failures.push(`${route.url}: enquiry builder is missing optional trip-detail fields`);
    }
    if (!html.includes('page does not save these optional trip details') ||
      !html.includes('unsent WhatsApp message')) {
      failures.push(`${route.url}: enquiry builder does not disclose its WhatsApp-only, unsaved behavior`);
    }
    if (/<input\b[^>]*\btype="(?:email|tel)"|<(?:input|textarea)\b[^>]*\bname="(?:name|email|phone|mobile)"/i.test(html)) {
      failures.push(`${route.url}: static enquiry flow must not collect personal contact fields without a secure backend`);
    }
  }
  if (h1Count !== 1) failures.push(`${route.url}: expected one H1, found ${h1Count}`);
  if (wordCount < 150) failures.push(`${route.url}: thin visible content (${wordCount} words; minimum 150)`);
  if (jsonLd.length === 0) failures.push(`${route.url}: missing JSON-LD`);
  for (const [index, script] of jsonLd.entries()) {
    try {
      const parsed = JSON.parse(script[1]);
      const nodes = Array.isArray(parsed['@graph']) ? parsed['@graph'] : [parsed];
      const types = nodes.flatMap((node) => Array.isArray(node['@type']) ? node['@type'] : [node['@type']]);
      if (index === 0 && !types.includes(route.schemaType)) {
        failures.push(`${route.url}: JSON-LD does not include expected ${route.schemaType} type`);
      }
      if (types.some((type) => ['Event', 'MusicEvent', 'Product', 'Offer', 'Review', 'AggregateRating'].includes(type))) {
        failures.push(`${route.url}: editorial page contains unsupported event, offer, product or review schema`);
      }
    } catch {
      failures.push(`${route.url}: invalid JSON-LD in script ${index + 1}`);
    }
  }
  if (!imageUrl || !imageUrl.startsWith(`${siteUrl}/`)) {
    failures.push(`${route.url}: missing absolute first-party Open Graph image`);
  } else if (!existsSync(resolve('public', imageUrl.slice(siteUrl.length + 1)))) {
    failures.push(`${route.url}: Open Graph image file does not exist (${imageUrl})`);
  }
  if (!imageAlt) failures.push(`${route.url}: missing Open Graph image alt text`);
  if (imageType !== 'image/png' || imageWidth !== '1200' || imageHeight !== '630') {
    failures.push(`${route.url}: Open Graph image must declare the 1200x630 PNG dimensions and MIME type`);
  }
  if (twitterCard !== 'summary_large_image') failures.push(`${route.url}: missing large-image Twitter card`);
  if (twitterImage !== imageUrl) failures.push(`${route.url}: Twitter image does not match the Open Graph image`);
  for (const [index, image] of [...html.matchAll(/<img\b[^>]*>/gi)].entries()) {
    if (!/\balt="[^"]+"/i.test(image[0])) failures.push(`${route.url}: image ${index + 1} is missing alt text`);
  }
  if (!sitemapUrls.includes(`${siteUrl}${route.url}`)) failures.push(`${route.url}: missing from static sitemap`);
  if (route.officialSources.some((source) => !html.includes(source))) {
    failures.push(`${route.url}: a mapped official source is not linked in page content`);
  }
  if (html.includes('/tomorrowland-india.html') || html.includes('/tomorrowland/winter/2027/')) {
    failures.push(`${route.url}: links to a consolidated legacy URL`);
  }
  for (const link of internalLinks) {
    if (!knownInternalRoutes.has(link) && !link.startsWith('/#')) {
      failures.push(`${route.url}: unknown internal link ${link}`);
    }
  }
  const declaredIds = new Set([...html.matchAll(/\bid="([^"]+)"/gi)].map((match) => match[1]));
  for (const [, fragment] of html.matchAll(/\bhref="#([^"]+)"/gi)) {
    if (!declaredIds.has(fragment)) failures.push(`${route.url}: fragment link target #${fragment} does not exist`);
  }
  for (const route of routes) {
    if (route.url !== '/tomorrowland/' && !hubLinks.has(route.url)) {
      failures.push(`/tomorrowland/: missing direct hub link to ${route.url}`);
    }
  }
}

for (const sitemapUrl of sitemapUrls) {
  const pageUrl = new URL(sitemapUrl);
  if (!pageUrl.pathname.startsWith('/europe/') && !pageUrl.pathname.startsWith('/tomorrowland/')) continue;
  const pagePath = resolve('public', ...pageUrl.pathname.split('/').filter(Boolean), 'index.html');
  if (!existsSync(pagePath)) {
    failures.push(`${pageUrl.pathname}: missing static SEO page for global contact validation`);
    continue;
  }
  if (validatedContactPages.has(pageUrl.pathname)) continue;
  const sourceHtml = await readFile(pagePath, 'utf8');
  if (!sourceHtml.includes('href="/tomorrowland-seo.css"')) {
    failures.push(`${pageUrl.pathname}: missing the shared destination editorial stylesheet`);
  }
  const contactHtml = injectContactLayerHtml(
    sourceHtml,
    getTravel4LifeContactContextFromLocation(pageUrl.pathname, sourceHtml.match(/<title>([^<]+)<\/title>/i)?.[1] || ''),
    contactAnalytics,
  );
  validateContactLayer(pageUrl.pathname, contactHtml);
}

const europePath = resolve('public/europe/index.html');
if (!existsSync(europePath)) {
  failures.push('/europe/: mapped file is missing');
} else {
  const sourceHtml = await readFile(europePath, 'utf8');
  const html = injectContactLayerHtml(
    sourceHtml,
    getTravel4LifeContactContextFromLocation('/europe/', sourceHtml.match(/<title>([^<]+)<\/title>/i)?.[1] || ''),
    contactAnalytics,
  );
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1]?.trim();
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  const robots = html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i)?.[1] || '';
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const jsonLd = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  const bodyHtml = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  const visibleText = bodyHtml.replace(/<[^>]+>/g, ' ').replace(/&(?:nbsp|amp|quot|lt|gt|#\d+);/gi, ' ');
  const wordCount = visibleText.trim().split(/\s+/).filter(Boolean).length;
  const internalLinks = [...html.matchAll(/href="(\/[^"#?]*)[^"]*"/gi)].map((match) => match[1]);
  const europeUrl = `${siteUrl}/europe/`;

  validateContactLayer('/europe/', html);
  if (!title) failures.push('/europe/: missing title');
  if (!description) failures.push('/europe/: missing meta description');
  if (primaryQueries.has(europeIntentMap.owners[0].primaryQuery.toLowerCase())) {
    failures.push('/europe/: duplicate primary query owner');
  }
  if (!canonical || canonical !== europeUrl) failures.push('/europe/: incorrect canonical');
  if (!/index,\s*follow/i.test(robots)) failures.push('/europe/: expected index, follow robots directive');
  if (h1Count !== 1) failures.push(`/europe/: expected one H1, found ${h1Count}`);
  if (wordCount < 500) failures.push(`/europe/: insufficient visible content (${wordCount} words; minimum 500)`);
  if (!html.includes('href="/trips/?destination=Europe"')) failures.push('/europe/: missing current Europe trip search link');
  if (!sitemapUrls.includes(europeUrl)) failures.push('/europe/: missing from static sitemap');
  if (europeIntentMap.owners[0]?.url !== '/europe/' || europeIntentMap.owners[0]?.file !== 'europe/index.html') {
    failures.push('/europe/: search intent map does not identify the hub page');
  }
  if (!europeIntentMap.evidence?.limitation?.trim()) {
    failures.push('/europe/: search intent map is missing evidence limitations');
  }
  if (jsonLd.length === 0) failures.push('/europe/: missing JSON-LD');
  for (const [index, script] of jsonLd.entries()) {
    try {
      const parsed = JSON.parse(script[1]);
      const nodes = Array.isArray(parsed['@graph']) ? parsed['@graph'] : [parsed];
      const types = nodes.flatMap((node) => Array.isArray(node['@type']) ? node['@type'] : [node['@type']]);
      if (index === 0 && !types.includes('CollectionPage')) {
        failures.push('/europe/: JSON-LD does not include CollectionPage');
      }
      if (types.some((type) => ['Product', 'Offer', 'Review', 'AggregateRating'].includes(type))) {
        failures.push('/europe/: hub contains unsupported product, offer or review schema');
      }
    } catch {
      failures.push(`/europe/: invalid JSON-LD in script ${index + 1}`);
    }
  }
  const imageUrl = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)?.[1];
  const imageAlt = html.match(/<meta\s+property="og:image:alt"\s+content="([^"]+)"/i)?.[1];
  if (!imageUrl || !imageUrl.startsWith(`${siteUrl}/`)) {
    failures.push('/europe/: missing absolute first-party Open Graph image');
  } else if (!existsSync(resolve('public', imageUrl.slice(siteUrl.length + 1)))) {
    failures.push(`/europe/: Open Graph image file does not exist (${imageUrl})`);
  }
  if (!imageAlt) failures.push('/europe/: missing Open Graph image alt text');
  if (!html.includes('Availability and pricing:')) failures.push('/europe/: missing availability and pricing caveat');
  if (!html.includes('Confirm every inclusion in writing')) failures.push('/europe/: missing written-inclusion guidance');
  for (const link of internalLinks) {
    if (!knownInternalRoutes.has(link) && !link.startsWith('/#')) {
      failures.push(`/europe/: unknown internal link ${link}`);
    }
  }
}

if (failures.length > 0) {
  console.error('SEO validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Validated ${routes.length} Tomorrowland pages and the Europe hub: intent ownership, visible content, metadata, canonical, schema, internal links, redirects, sitemap coverage and availability caveats.`);
  console.log(`Travel4Life Contact Layer: validated ${validatedContactPages.size} SEO landing pages for clickable phone, WhatsApp and email, no added hero or footer bars, final CTAs, contextual messages, and analytics event wiring.`);
}
