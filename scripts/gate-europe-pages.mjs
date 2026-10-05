import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { isIndexableEuropePage } from './europe-page-eligibility.mjs';

const siteUrl = (process.env.SITE_URL || 'https://travel4life.net').replace(/\/$/, '');

const updateRobots = (html, indexable, route) => {
  const pattern = /(<meta\s+name="robots"\s+content=")[^"]*(")/i;
  if (!pattern.test(html)) throw new Error(`${route}: static page is missing its robots metadata.`);
  return html.replace(pattern, (_match, prefix, suffix) => (
    `${prefix}${indexable ? 'index, follow, max-image-preview:large' : 'noindex, follow'}${suffix}`
  ));
};

export const gateEuropePages = async (eligibleTrips, outputDirectory = resolve('dist')) => {
  const sitemapPath = resolve(outputDirectory, 'sitemap-static.xml');
  const sitemap = await readFile(sitemapPath, 'utf8');
  const entries = [...sitemap.matchAll(/<url>[\s\S]*?<\/url>/gi)];
  let gatedCount = 0;
  const retainedEntries = [];

  for (const [entry] of entries) {
    const url = entry.match(/<loc>([^<]+)<\/loc>/i)?.[1];
    if (!url?.startsWith(`${siteUrl}/europe/`)) {
      retainedEntries.push(entry);
      continue;
    }

    const route = url.slice(siteUrl.length);
    const indexable = isIndexableEuropePage(route, eligibleTrips);
    const relativePath = route.slice('/europe/'.length);
    const pagePath = resolve(outputDirectory, 'europe', relativePath, 'index.html');
    const html = await readFile(pagePath, 'utf8');
    await writeFile(pagePath, updateRobots(html, indexable, route), 'utf8');

    if (indexable) {
      retainedEntries.push(entry);
    } else {
      gatedCount += 1;
    }
  }

  const header = sitemap.match(/^[\s\S]*?<urlset\b[^>]*>/i)?.[0];
  const footer = '</urlset>';
  if (!header || !sitemap.includes(footer)) {
    throw new Error(`${sitemapPath}: invalid static sitemap structure.`);
  }
  await writeFile(sitemapPath, `${header}\n${retainedEntries.map((entry) => entry.trim()).join('\n')}\n${footer}\n`, 'utf8');
  return gatedCount;
};
