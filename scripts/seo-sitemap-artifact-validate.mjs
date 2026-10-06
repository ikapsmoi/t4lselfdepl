import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { extractSitemapUrls, isSitemapEligible } from './seo-sitemap-engine.mjs';

const outputDirectory = resolve('dist');
const registry = JSON.parse(await readFile(resolve(outputDirectory, 'seo-page-registry.json'), 'utf8'));
const rootSitemap = await readFile(resolve(outputDirectory, 'sitemap.xml'), 'utf8');
const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};
const isXmlUrlset = (xml) => /<urlset\b/.test(xml) && !/<html\b/i.test(xml);
const expectedPages = registry.pages.filter(isSitemapEligible);
const expectedByGroup = new Map();
for (const page of expectedPages) {
  expectedByGroup.set(page.sitemap_group, [...(expectedByGroup.get(page.sitemap_group) || []), page.canonical_url]);
}
const indexUrls = extractSitemapUrls(rootSitemap);
const expectedIndexUrls = [...expectedByGroup.keys()]
  .sort()
  .map((group) => `${registry.site_url}/sitemaps/${group}.xml`);
expect(/<sitemapindex\b/.test(rootSitemap) && !/<html\b/i.test(rootSitemap), 'dist/sitemap.xml is not a genuine sitemap index.');
expect(new Set(indexUrls).size === indexUrls.length, 'Master sitemap index contains duplicate child sitemap URLs.');
expect(indexUrls.length === expectedIndexUrls.length && expectedIndexUrls.every((url) => indexUrls.includes(url)), 'Master sitemap index does not match the non-empty registry groups.');

const allUrls = [];
for (const [group, expectedUrls] of expectedByGroup) {
  const filePath = resolve(outputDirectory, 'sitemaps', `${group}.xml`);
  expect(existsSync(filePath), `Missing grouped sitemap file: /sitemaps/${group}.xml.`);
  if (!existsSync(filePath)) continue;
  const xml = await readFile(filePath, 'utf8');
  const urls = extractSitemapUrls(xml);
  expect(isXmlUrlset(xml), `/sitemaps/${group}.xml is not a genuine XML urlset.`);
  expect(urls.length > 0, `/sitemaps/${group}.xml is empty and should not be generated.`);
  expect(new Set(urls).size === urls.length, `/sitemaps/${group}.xml contains duplicate URLs.`);
  expect(urls.length === expectedUrls.length && expectedUrls.every((url) => urls.includes(url)), `/sitemaps/${group}.xml does not match its registry group.`);
  allUrls.push(...urls);
}
expect(new Set(allUrls).size === allUrls.length, 'A page URL appears in more than one sitemap group.');
expect(allUrls.length === expectedPages.length && expectedPages.every((page) => allUrls.includes(page.canonical_url)), 'Grouped sitemaps do not exactly match the eligible registry URLs.');

for (const file of ['sitemap-static.xml', 'sitemap-products.xml', 'sitemap-corbett.xml', 'jim-corbett/resorts/sitemap.xml']) {
  const filePath = resolve(outputDirectory, file);
  expect(existsSync(filePath), `Missing compatibility sitemap: ${file}.`);
  if (!existsSync(filePath)) continue;
  const xml = await readFile(filePath, 'utf8');
  expect(isXmlUrlset(xml), `${file} is not a genuine XML urlset.`);
}

const redirects = await readFile(resolve('public/_redirects'), 'utf8');
const aliasRule = redirects.match(/^\/jim-corbett\/resorts\/sitemap\.xml\s+\/sitemap-corbett\.xml\s+200!?$/m);
const tripsRoute = redirects.match(/^\/trips\s+\/index\.html\s+200!?$/m);
const tripsSlashRoute = redirects.match(/^\/trips\/\s+\/index\.html\s+200!?$/m);
const corbett404 = redirects.match(/^\/jim-corbett\/\*\s+\/404\.html\s+404!?$/m);
const notFoundFallback = redirects.match(/^\/\*\s+\/404\.html\s+404!?$/m);
expect(Boolean(aliasRule && tripsRoute && tripsSlashRoute && corbett404 && notFoundFallback
  && aliasRule.index < tripsRoute.index
  && aliasRule.index < tripsSlashRoute.index
  && tripsRoute.index < corbett404.index
  && tripsSlashRoute.index < corbett404.index
  && corbett404.index < notFoundFallback.index), 'Trip-list SPA routes and Corbett sitemap rewrite must precede the Corbett and generic 404 rules.');

if (failures.length) {
  console.error(`FAIL sitemap artifact validation (${failures.length} issue(s))\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`PASS sitemap artifact validation: ${expectedPages.length} eligible URLs in ${expectedByGroup.size} non-empty groups; compatibility XML endpoints and redirect precedence are valid.`);
}
