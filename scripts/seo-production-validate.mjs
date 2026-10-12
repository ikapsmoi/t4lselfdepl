import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { extractSitemapUrls } from './seo-sitemap-engine.mjs';

const siteUrl = (process.env.SITE_URL || 'https://travel4life.net').replace(/\/$/, '');
const registry = JSON.parse(await readFile(resolve('dist/seo-page-registry.json'), 'utf8'));
const registryOrigin = new URL(registry.site_url).origin;
const failures = [];
const concurrency = 6;
const toFetchUrl = (url) => {
  const parsed = new URL(url);
  const validationOrigin = new URL(siteUrl).origin;
  if (parsed.origin !== registryOrigin && parsed.origin !== validationOrigin) {
    failures.push(`${url}: sitemap URL is outside the configured site origin.`);
    return null;
  }
  if (parsed.origin === validationOrigin || siteUrl === registryOrigin) return url;
  return new URL(`${parsed.pathname}${parsed.search}`, siteUrl).toString();
};
const checkXml = async (url, expectedRoot) => {
  const requestUrl = toFetchUrl(url);
  if (!requestUrl) return '';
  try {
    const response = await fetch(requestUrl, { redirect: 'manual' });
    const contentType = response.headers.get('content-type') || '';
    const body = await response.text();
    if (response.status !== 200) failures.push(`${requestUrl}: expected HTTP 200, received ${response.status}.`);
    if (!/xml/i.test(contentType)) failures.push(`${requestUrl}: expected an XML content type, received "${contentType || 'missing'}".`);
    if (!new RegExp(`<${expectedRoot}\\b`).test(body)) failures.push(`${requestUrl}: expected a <${expectedRoot}> XML document; it may be an HTML/SPA response.`);
    if (/<html\b/i.test(body)) failures.push(`${requestUrl}: returned HTML instead of XML.`);
    return body;
  } catch (error) {
    failures.push(`${requestUrl}: request failed (${error.message}).`);
    return '';
  }
};
const sitemapIndex = await checkXml(`${siteUrl}/sitemap.xml`, 'sitemapindex');
const childSitemaps = extractSitemapUrls(sitemapIndex);
if (!childSitemaps.length) failures.push(`${siteUrl}/sitemap.xml: sitemap index contains no child sitemaps.`);

const sitemapBodies = [];
for (let index = 0; index < childSitemaps.length; index += concurrency) {
  const batch = childSitemaps.slice(index, index + concurrency);
  sitemapBodies.push(...await Promise.all(batch.map((url) => checkXml(url, 'urlset'))));
}

const listedUrls = sitemapBodies.flatMap(extractSitemapUrls);
if (new Set(listedUrls).size !== listedUrls.length) failures.push('Master sitemap index contains duplicate page URLs across child sitemaps.');
const eligibleUrls = registry.pages
  .filter((page) => page.exists && page.is_public && page.indexable && page.quality_status === 'approved'
    && page.canonical_url === page.expected_canonical_url && page.redirect_target === null && !page.duplicate_canonical
    && !page.duplicate_primary_keyword)
  .map((page) => page.canonical_url);
for (const url of eligibleUrls) {
  if (!listedUrls.includes(url)) failures.push(`${url}: registry-approved page is missing from the production sitemap index.`);
}
for (const url of listedUrls) {
  if (!eligibleUrls.includes(url)) failures.push(`${url}: sitemap URL is not approved by the universal SEO registry.`);
}

const verifyPage = async (url) => {
  try {
    const requestUrl = toFetchUrl(url);
    if (!requestUrl) return;
    const response = await fetch(requestUrl, { redirect: 'manual' });
    const contentType = response.headers.get('content-type') || '';
    const html = await response.text();
    if (response.status !== 200) failures.push(`${requestUrl}: expected HTTP 200, received ${response.status}.`);
    if (response.status >= 300 && response.status < 400) failures.push(`${requestUrl}: sitemap URL redirects (${response.status}).`);
    if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) failures.push(`${requestUrl}: expected HTML content type, received "${contentType || 'missing'}".`);
    if (!/<html\b/i.test(html)) failures.push(`${requestUrl}: response is not an HTML document.`);
    const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
    if (canonical !== url) failures.push(`${requestUrl}: response canonical mismatch (${canonical || 'missing'}).`);
    const robots = html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i)?.[1] || '';
    if (!/^index\s*,\s*follow(?:\s*,|$)/i.test(robots)) failures.push(`${requestUrl}: sitemap-listed page is not explicitly index,follow.`);
  } catch (error) {
    failures.push(`${toFetchUrl(url)}: request failed (${error.message}).`);
  }
};
const urlsToVerify = [...new Set([...listedUrls, ...eligibleUrls])];
for (let index = 0; index < urlsToVerify.length; index += concurrency) {
  await Promise.all(urlsToVerify.slice(index, index + concurrency).map(verifyPage));
}

const legacySitemapUrls = [
  `${siteUrl}/sitemap-static.xml`,
  `${siteUrl}/sitemap-corbett.xml`,
  `${siteUrl}/sitemap-products.xml`,
  `${siteUrl}/jim-corbett/resorts/sitemap.xml`,
];
for (let index = 0; index < legacySitemapUrls.length; index += concurrency) {
  await Promise.all(legacySitemapUrls.slice(index, index + concurrency).map((url) => checkXml(url, 'urlset')));
}

if (failures.length) {
  console.error(`FAIL production SEO validation (${failures.length} issue(s))\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`PASS production SEO validation: sitemap index, ${childSitemaps.length} XML child sitemaps, ${listedUrls.length} HTTP 200 canonical indexable pages, and all legacy sitemap endpoints are valid.`);
}
