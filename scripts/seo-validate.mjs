import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const siteUrl = 'https://travel4life.net';
const pages = [
  ['tomorrowland/index.html', '/tomorrowland/'],
  ['tomorrowland/belgium/index.html', '/tomorrowland/belgium/'],
  ['tomorrowland/belgium/packages/index.html', '/tomorrowland/belgium/packages/'],
  ['tomorrowland/winter/index.html', '/tomorrowland/winter/'],
  ['tomorrowland/thailand/index.html', '/tomorrowland/thailand/'],
  ['tomorrowland/cost-from-india/index.html', '/tomorrowland/cost-from-india/'],
  ['tomorrowland/from-india/index.html', '/tomorrowland/from-india/'],
  ['tomorrowland/compare/index.html', '/tomorrowland/compare/'],
  ['tomorrowland/accommodation/index.html', '/tomorrowland/accommodation/'],
  ['tomorrowland/group-travel/index.html', '/tomorrowland/group-travel/'],
  ['tomorrowland/flights-from-india/index.html', '/tomorrowland/flights-from-india/'],
  ['tomorrowland/visa-documents/index.html', '/tomorrowland/visa-documents/'],
  ['tomorrowland/package-vs-independent/index.html', '/tomorrowland/package-vs-independent/'],
  ['tomorrowland/winter/2027/index.html', '/tomorrowland/winter/2027/'],
];
const knownInternalRoutes = new Set([
  '/',
  '/trips',
  '/tomorrowland-india.html',
  '/tomorrowland-seo.css',
  ...pages.map(([, route]) => route),
]);

const failures = [];
const titles = new Set();
const descriptions = new Set();
const sitemap = await readFile(resolve('public/sitemap-static.xml'), 'utf8');

for (const [relativePath, route] of pages) {
  const filePath = resolve('public', relativePath);
  if (!existsSync(filePath)) {
    failures.push(`${relativePath}: file is missing`);
    continue;
  }

  const html = await readFile(filePath, 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1]?.trim();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const jsonLdCount = (html.match(/application\/ld\+json/gi) || []).length;
  const internalLinks = [...html.matchAll(/href="(\/[^"#?]*)[^" ]*"/gi)].map((match) => match[1]);

  if (!title) failures.push(`${route}: missing title`);
  if (!description) failures.push(`${route}: missing meta description`);
  if (title && titles.has(title)) failures.push(`${route}: duplicate title`);
  if (description && descriptions.has(description)) failures.push(`${route}: duplicate description`);
  if (title) titles.add(title);
  if (description) descriptions.add(description);
  if (canonical !== `${siteUrl}${route}`) failures.push(`${route}: canonical is ${canonical || 'missing'}`);
  if (h1Count !== 1) failures.push(`${route}: expected one H1, found ${h1Count}`);
  if (jsonLdCount === 0) failures.push(`${route}: missing JSON-LD`);
  if (!sitemap.includes(`<loc>${siteUrl}${route}</loc>`)) failures.push(`${route}: missing from static sitemap`);
  internalLinks
    .filter((link) => !knownInternalRoutes.has(link) && !link.startsWith('/#'))
    .forEach((link) => failures.push(`${route}: unknown internal link ${link}`));
}

if (failures.length > 0) {
  console.error('SEO validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Validated ${pages.length} Tomorrowland pages: unique metadata, one H1, canonical, JSON-LD and sitemap coverage.`);
}