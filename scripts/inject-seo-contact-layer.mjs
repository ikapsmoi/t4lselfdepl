import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadEnv } from 'vite';
import { getTravel4LifeContactContextFromLocation, TRAVEL4LIFE_CONTACT } from '../src/utils/travel4lifeContact.js';
import { injectContactLayerHtml } from './contact-layer-markup.mjs';

const siteUrl = (process.env.SITE_URL || 'https://travel4life.net').replace(/\/$/, '');
const env = loadEnv('production', process.cwd(), 'VITE_');
const analyticsConfig = {
  url: process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL,
  anonKey: process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY,
};
if (!analyticsConfig.url || !analyticsConfig.anonKey) {
  throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required to add contact analytics to SEO pages.');
}

const css = await readFile(resolve('src/contact-layer.css'), 'utf8');
await writeFile(resolve('dist/travel4life-contact.css'), css, 'utf8');
const sourceSitemap = await readFile(resolve('public/sitemap-static.xml'), 'utf8');
const sourceUrls = [...sourceSitemap.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1]);
const corbettSitemap = await readFile(resolve('dist/sitemap-corbett.xml'), 'utf8');
sourceUrls.push(...[...corbettSitemap.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1]));
const htmlPaths = new Set();
for (const url of sourceUrls) {
  if (!url.startsWith(`${siteUrl}/`)) continue;
  const pathname = new URL(url).pathname;
  if (pathname === '/') continue;
  const routeSegments = pathname.split('/').filter(Boolean);
  htmlPaths.add(resolve('dist', ...routeSegments, 'index.html'));
}

const productSitemap = await readFile(resolve('dist/sitemap-products.xml'), 'utf8');
for (const match of productSitemap.matchAll(/<loc>([^<]+)<\/loc>/gi)) {
  const url = new URL(match[1]);
  const tripId = url.pathname.split('/').filter(Boolean).at(-1);
  if (tripId) htmlPaths.add(resolve('dist', 'trips', tripId, 'index.html'));
}

for (const pagePath of htmlPaths) {
  const html = await readFile(pagePath, 'utf8');
  const relativePath = pagePath.slice(resolve('dist').length).replace(/\\/g, '/');
  const pathname = (relativePath.startsWith('/') ? relativePath : `/${relativePath}`).replace(/\/index\.html$/, '/');
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.replace(/&amp;/g, '&') || '';
  const context = getTravel4LifeContactContextFromLocation(pathname, title);
  const transformedHtml = injectContactLayerHtml(html, context, analyticsConfig);
  await writeFile(pagePath, transformedHtml, 'utf8');
}

const appShellPath = resolve('dist/index.html');
const appShell = await readFile(appShellPath, 'utf8');
const updatedShell = appShell
  .replace(/"telephone"\s*:\s*"[^"]+"/g, `"telephone": "${TRAVEL4LIFE_CONTACT.phone}"`)
  .replace(/"email"\s*:\s*"[^"]+"/g, `"email": "${TRAVEL4LIFE_CONTACT.email}"`);
await writeFile(appShellPath, updatedShell, 'utf8');

console.log(`Added the contextual Travel4Life contact layer to ${htmlPaths.size} static SEO pages.`);
