import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const siteUrl = 'https://travel4life.net';
const intentMapPath = resolve('public/tomorrowland/search-intent-map.json');
const intentMap = JSON.parse(await readFile(intentMapPath, 'utf8'));
const routes = intentMap.owners;
const knownInternalRoutes = new Set([
  '/',
  '/trips',
  '/tomorrowland-seo.css',
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

if (new Set(sitemapUrls).size !== sitemapUrls.length) {
  failures.push('sitemap-static.xml: duplicate URLs');
}
for (const requiredStyle of ["font-family: 'Plus Jakarta Sans'", '#0284c7 0%, #10b981 55%, #f59e0b']) {
  if (!styles.includes(requiredStyle)) failures.push(`tomorrowland-seo.css: missing main-site theme value ${requiredStyle}`);
}
for (const requiredStyle of ['.home-link', '.guides-link', '.whatsapp-button', '.floating-whatsapp', '@media (max-width: 480px)']) {
  if (!styles.includes(requiredStyle)) failures.push(`tomorrowland-seo.css: missing shared responsive UI style ${requiredStyle}`);
}
const mappedUrls = new Set(routes.map(({ url }) => `${siteUrl}${url}`));
for (const sitemapUrl of sitemapUrls) {
  if (sitemapUrl.startsWith(`${siteUrl}/tomorrowland/`) && !mappedUrls.has(sitemapUrl)) {
    failures.push(`sitemap-static.xml: Tomorrowland URL has no intent owner (${sitemapUrl})`);
  }
}
if (!sitemapIndexUrls.includes(`${siteUrl}/sitemap-static.xml`)) {
  failures.push('sitemap.xml: missing static sitemap');
}
if (!sitemapIndexUrls.includes(`${siteUrl}/sitemap-products.xml`)) {
  failures.push('sitemap.xml: missing product sitemap');
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

  const html = await readFile(filePath, 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1]?.trim();
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  const robots = html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i)?.[1] || '';
  const homeLink = html.match(/<a\s+class="home-link"\s+href="\/">Home<\/a>/i);
  const guideLink = html.match(/<a\s+class="guides-link"\s+href="\/tomorrowland\/">Festival guides<\/a>/i);
  const headerWhatsapp = html.match(/<a\s+class="whatsapp-button"\s+href="(https:\/\/wa\.me\/919871621921[^"]*)"[^>]*aria-label="Chat with Travel4life on WhatsApp"/i)?.[1];
  const floatingWhatsapp = html.match(/<a\s+class="floating-whatsapp"\s+href="(https:\/\/wa\.me\/919871621921[^"]*)"[^>]*aria-label="Chat with Travel4life on WhatsApp"/i)?.[1];
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
  if (!floatingWhatsapp) failures.push(`${route.url}: missing persistent WhatsApp action`);
  if (headerWhatsapp && floatingWhatsapp !== headerWhatsapp) failures.push(`${route.url}: header and floating WhatsApp links do not match`);
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
  for (const route of routes) {
    if (route.url !== '/tomorrowland/' && !hubLinks.has(route.url)) {
      failures.push(`/tomorrowland/: missing direct hub link to ${route.url}`);
    }
  }
}

if (failures.length > 0) {
  console.error('SEO validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Validated ${routes.length} mapped Tomorrowland pages: intent ownership, visible content, unique metadata, canonical, schema, image metadata, Home and WhatsApp navigation, internal links, redirects, sitemap index and static sitemap coverage.`);
}
