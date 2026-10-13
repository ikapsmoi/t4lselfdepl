import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  buildSitemapIndex,
  buildUrlset,
  extractSitemapUrls,
  inferProductSitemapGroup,
  isSitemapEligible,
  markDuplicatePrimaryKeywords,
  validateRegistryEntries,
} from './seo-sitemap-engine.mjs';

const siteUrl = (process.env.SITE_URL || 'https://travel4life.net').replace(/\/$/, '');
const publicDirectory = resolve('public');
const outputDirectory = resolve('dist');
const redirectsPath = resolve(publicDirectory, '_redirects');
const redirects = await readFile(redirectsPath, 'utf8');
const staticSitemap = await readFile(resolve(outputDirectory, 'sitemap-static.xml'), 'utf8');
const corbettSource = JSON.parse(await readFile(resolve(publicDirectory, 'jim-corbett/page-registry.json'), 'utf8'));
const sourceManifests = [
  { path: 'tomorrowland/search-intent-map.json', pageType: 'festival-guide' },
  { path: 'mysteryland/search-intent-map.json', pageType: 'festival-guide' },
  { path: 'europe/search-intent-map.json', pageType: 'destination-guide' },
  { path: 'india-tours/search-intent-map.json', pageType: 'destination-guide' },
];

const decodeHtml = (value) => value
  .replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'")
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>');
const extractMeta = (html, attribute, key) => {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = html.match(new RegExp(`<meta\\s+${attribute}="${escapedKey}"\\s+content="([^"]*)"`, 'i'));
  return match ? decodeHtml(match[1]) : '';
};
const extractSchemaType = (html) => {
  const jsonLd = html.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i)?.[1];
  if (!jsonLd) return null;
  const schema = JSON.parse(jsonLd);
  const visit = (value) => {
    if (Array.isArray(value)) {
      for (const child of value) {
        const result = visit(child);
        if (result) return result;
      }
    } else if (value && typeof value === 'object') {
      const type = Array.isArray(value['@type']) ? value['@type'][0] : value['@type'];
      if (type) return type;
      for (const child of Object.values(value)) {
        const result = visit(child);
        if (result) return result;
      }
    }
    return null;
  };
  return visit(schema);
};
const extractProductFields = (html) => {
  const scripts = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  const visit = (value) => {
    if (Array.isArray(value)) {
      for (const child of value) {
        const result = visit(child);
        if (result) return result;
      }
    } else if (value && typeof value === 'object') {
      const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
      if (types.includes('Product')) return value;
      for (const child of Object.values(value)) {
        const result = visit(child);
        if (result) return result;
      }
    }
    return null;
  };
  for (const [, script] of scripts) {
    const product = visit(JSON.parse(script));
    if (product) return product;
  }
  return null;
};
const visibleWordCount = (html) => html
  .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&(?:nbsp|amp|quot|lt|gt|#\d+);/gi, ' ')
  .trim()
  .split(/\s+/)
  .filter(Boolean).length;
const normalizeUrl = (url) => {
  const parsed = new URL(url, siteUrl);
  if (parsed.origin !== new URL(siteUrl).origin) throw new Error(`SEO registry URL is not first-party: ${url}`);
  return parsed.pathname;
};
const localHtmlPath = (file) => resolve(outputDirectory, ...file.split('/'));
const canonicalFor = (url) => new URL(url, siteUrl).toString();
const slug = (url) => url === '/' ? 'home' : url.split('/').filter(Boolean).join('-');
const pathForUrl = (url) => url === '/' ? 'index.html' : `${url.slice(1).replace(/\/$/, '')}/index.html`;
const htmlText = (value) => decodeHtml(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
const readRedirectTarget = (url) => {
  const path = normalizeUrl(url);
  for (const line of redirects.split(/\r?\n/)) {
    const [source, destination, status] = line.trim().split(/\s+/);
    if (!source || source.startsWith('#') || !destination || !status || !/^30[1278]/.test(status.replace('!', ''))) continue;
    const expression = new RegExp(`^${source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replaceAll('\\*', '.*')}$`);
    if (expression.test(path)) return destination;
  }
  return null;
};
const routeGroup = (url, pageType, entityType) => {
  const segments = url.split('/').filter(Boolean);
  if (!segments.length) return 'core';
  if (segments[0] === 'trips') return 'packages';
  if ([
    'destinations', 'countries', 'cities', 'routes', 'packages', 'products', 'experiences',
    'guides', 'weddings', 'mice', 'corporate', 'international-tours', 'domestic-tours',
    'safari', 'hotels', 'resorts', 'itineraries',
  ].includes(segments[0])) return segments[0];
  if (segments[0] === 'jim-corbett') {
    if (segments[1] && ['packages', 'weddings', 'mice', 'guides', 'safari', 'resorts', 'hotels', 'experiences'].includes(segments[1])) {
      return `jim-corbett-${segments[1]}`;
    }
    return 'jim-corbett';
  }
  if (segments[0] === 'europe') {
    if (segments.length === 1) return 'europe';
    if (segments[1] && ['countries', 'cities', 'routes', 'packages', 'guides'].includes(segments[1])) {
      return `europe-${segments[1]}`;
    }
    if (segments.length > 2) return 'europe-cities';
    if (['france', 'italy', 'switzerland'].includes(segments[1])) return 'europe-countries';
    if (segments[1].includes('-') && !['family-tours', 'tours-from-india', 'tours-under-200000'].includes(segments[1])) return 'europe-routes';
    if (['honeymoon', 'family-tours', 'tours-from-india', 'tours-under-200000'].includes(segments[1])) return 'europe-packages';
    return 'europe-guides';
  }
  if (segments[0] === 'tomorrowland') {
    return segments.includes('packages') ? 'festival-packages' : 'festivals';
  }
  if (segments[0] === 'mysteryland') return 'festivals';
  return entityType === 'package' || pageType === 'product' ? 'packages' : `${segments[0]}-pages`;
};
const getStaticPageDescriptors = async () => {
  const descriptors = [];
  const listedStaticPaths = new Set(extractSitemapUrls(staticSitemap).map(normalizeUrl));

  for (const source of sourceManifests) {
    const manifest = JSON.parse(await readFile(resolve(publicDirectory, source.path), 'utf8'));
    for (const owner of manifest.owners) {
      if (!owner.url.startsWith(`/${source.path.split('/')[0]}/`)) continue;
      descriptors.push({
        url: owner.url,
        file: owner.file,
        pageType: source.pageType,
        entityType: owner.entityType || (source.pageType === 'destination-guide' ? 'destination' : undefined),
        primaryKeyword: owner.primaryQuery || owner.primaryKeyword || '',
        searchIntent: owner.intent || '',
        sitemapGroup: routeGroup(owner.url, source.pageType, 'destination'),
        declared: true,
        declaredIndexable: listedStaticPaths.has(owner.url),
        lastVerified: null,
        sourceUpdatedAt: null,
      });
    }
  }

  descriptors.push({
    url: '/',
    file: 'index.html',
    pageType: 'home',
    primaryKeyword: 'Travel4life group travel',
    searchIntent: 'Travel4life trip and group travel discovery',
    sitemapGroup: 'core',
    declared: true,
    declaredIndexable: listedStaticPaths.has('/'),
    lastVerified: null,
    sourceUpdatedAt: null,
  });

  for (const page of corbettSource.pages) {
    descriptors.push({
      url: page.url,
      file: page.file,
      pageType: page.pageType,
      entityType: page.entityType,
      entityId: page.entityType === 'destination' ? 'jim-corbett' : slug(page.url),
      primaryKeyword: page.primaryQuery,
      searchIntent: page.searchIntent,
      parentUrl: page.parentUrl,
      sourceIndexable: page.indexable,
      sourceQualityStatus: page.qualityStatus,
      page1Status: page.page1Status,
      page1Reasons: page.page1Reasons || [],
      lastVerified: page.lastVerified || null,
      sourceUpdatedAt: page.lastUpdated || null,
      pageTypeOverride: page.pageType,
      source: 'corbett',
    });
  }
  return descriptors;
};

const productDescriptors = [];
const productCandidatesPath = resolve(outputDirectory, 'seo-product-page-candidates.json');
if (!existsSync(productCandidatesPath)) {
  throw new Error('Missing static product SEO candidates. Run the full production build before generating universal sitemaps.');
}
const productCandidates = JSON.parse(await readFile(productCandidatesPath, 'utf8'));
if (!Array.isArray(productCandidates.pages)) throw new Error('Product SEO candidate registry has no pages array.');
for (const candidate of productCandidates.pages) {
  const url = normalizeUrl(candidate.url);
  const id = candidate.entityId;
  const file = pathForUrl(url);
  const html = await readFile(localHtmlPath(file), 'utf8');
  const product = extractProductFields(html);
  const title = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '';
  const location = html.match(/itemprop="contentLocation"[^>]*>([\s\S]*?)<\/[^>]+>/i)?.[1] || '';
  productDescriptors.push({
    url,
    file,
    pageType: 'product',
    entityType: 'package',
    entityId: id,
    primaryKeyword: candidate.primaryKeyword,
    searchIntent: candidate.searchIntent,
    sitemapGroup: inferProductSitemapGroup(product?.category || '', title, location),
    declared: true,
    declaredIndexable: true,
    sourceIndexable: true,
    lastVerified: null,
    sourceUpdatedAt: candidate.lastModified || null,
    source: 'product',
  });
}

const staticDescriptors = await getStaticPageDescriptors();
const registeredPaths = new Set(staticDescriptors.map(({ url }) => normalizeUrl(url)));
for (const descriptor of productDescriptors) registeredPaths.add(descriptor.url);
const findParentUrl = (url) => {
  if (url === '/') return null;
  if (url.startsWith('/trips/')) return '/trips/';
  const segments = url.split('/').filter(Boolean);
  while (segments.length > 1) {
    segments.pop();
    const candidate = `/${segments.join('/')}/`;
    if (registeredPaths.has(candidate)) return candidate;
  }
  return '/';
};

const pages = [];
for (const descriptor of [...staticDescriptors, ...productDescriptors]) {
  const url = normalizeUrl(descriptor.url);
  const file = descriptor.file || pathForUrl(url);
  const htmlPath = localHtmlPath(file);
  const exists = existsSync(htmlPath);
  const html = exists ? await readFile(htmlPath, 'utf8') : '';
  const actualCanonical = extractMeta(html, 'property', 'og:url')
    || html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1]
    || '';
  const canonicalUrl = actualCanonical ? decodeHtml(actualCanonical) : '';
  const robotsDirective = extractMeta(html, 'name', 'robots');
  const robotsIndexable = /^index\s*,\s*follow(?:\s*,|$)/i.test(robotsDirective);
  const sourceIndexable = descriptor.sourceIndexable ?? (
    descriptor.declaredIndexable === undefined
      ? robotsIndexable
      : descriptor.declaredIndexable && robotsIndexable
  );
  const visibleWords = visibleWordCount(html);
  const hasCoreContent = Boolean(
    html.match(/<title>[^<]{10,}<\/title>/i)
    && html.match(/<meta\s+name="description"\s+content="[^"]{30,}"/i)
    && html.match(/<h1\b/i)
    && visibleWords >= 100,
  );
  const hasRenderedApplicationShell = url === '/'
    && html.includes('id="root"')
    && extractSchemaType(html)
    && html.match(/<meta\s+name="description"\s+content="[^"]{30,}"/i);
  const redirectTarget = readRedirectTarget(url);
  const qualityReasons = [...(descriptor.page1Reasons || [])];
  let qualityStatus = descriptor.sourceQualityStatus || (
    descriptor.declared && (hasCoreContent || hasRenderedApplicationShell) && canonicalUrl === canonicalFor(url) && sourceIndexable
      ? 'approved'
      : 'needs-improvement'
  );
  if (!exists || !(hasCoreContent || hasRenderedApplicationShell) || canonicalUrl !== canonicalFor(url) || redirectTarget) {
    qualityStatus = 'needs-improvement';
  }
  if (!sourceIndexable && qualityStatus === 'approved') qualityStatus = 'needs-improvement';
  if (!exists) qualityReasons.push('No public HTML build asset exists for this registered URL.');
  if (canonicalUrl !== canonicalFor(url)) qualityReasons.push('The page does not self-canonicalize to its registered URL.');
  if (!sourceIndexable) qualityReasons.push('The page robots directive is not index,follow.');
  if (redirectTarget) qualityReasons.push(`The URL redirects to ${redirectTarget}.`);
  if (!(hasCoreContent || hasRenderedApplicationShell)) qualityReasons.push('The page does not pass the minimum metadata and visible-content quality gate.');
  const entityType = descriptor.entityType || (
    url.startsWith('/tomorrowland/') ? 'festival-destination'
      : url.startsWith('/europe/') ? 'destination'
        : url.startsWith('/trips/') ? 'package'
          : 'website'
  );
  const pageType = descriptor.pageTypeOverride || descriptor.pageType;
  const sitemapGroup = descriptor.sourceSitemapGroup || descriptor.sitemapGroup || routeGroup(url, pageType, entityType);
  const lastModified = descriptor.sourceUpdatedAt
    && !Number.isNaN(new Date(descriptor.sourceUpdatedAt).getTime())
    ? new Date(descriptor.sourceUpdatedAt).toISOString()
    : html.match(/<meta\s+property="article:modified_time"\s+content="([^"]+)"/i)?.[1] || null;
  const primaryKeyword = descriptor.primaryKeyword
    || extractMeta(html, 'name', 'keywords')
    || htmlText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '')
    || html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim()
    || '';

  pages.push({
    id: slug(url),
    url,
    build_file: file,
    canonical_url: canonicalUrl,
    expected_canonical_url: canonicalFor(url),
    page_type: pageType,
    entity_type: entityType,
    entity_id: descriptor.entityId || slug(url),
    primary_keyword: primaryKeyword,
    search_intent: descriptor.searchIntent || '',
    parent_url: descriptor.parentUrl ?? findParentUrl(url),
    indexable: sourceIndexable && qualityStatus === 'approved',
    quality_status: qualityStatus,
    sitemap_group: sitemapGroup,
    priority: url === '/' ? 1 : (url.split('/').filter(Boolean).length === 1 ? 0.8 : 0.6),
    last_modified: lastModified,
    last_verified: descriptor.lastVerified,
    robots_directive: robotsDirective,
    schema_type: extractSchemaType(html),
    created_at: null,
    updated_at: lastModified,
    exists,
    is_public: exists,
    redirect_target: redirectTarget,
    duplicate_canonical: false,
    duplicate_primary_keyword: false,
    quality_reasons: qualityReasons,
    source: descriptor.source || 'static',
    page1_status: descriptor.page1Status || null,
    validation: {
      canonical_matches: canonicalUrl === canonicalFor(url),
      has_core_content: hasCoreContent || Boolean(hasRenderedApplicationShell),
      visible_word_count: visibleWords,
      declared_in_indexable_sitemap: descriptor.declaredIndexable,
    },
  });
}

markDuplicatePrimaryKeywords(pages);
for (const page of pages) {
  if (!page.exists) continue;
  const htmlPath = localHtmlPath(page.build_file);
  const html = await readFile(htmlPath, 'utf8');
  const robotsValue = page.indexable
    ? 'index, follow, max-image-preview:large'
    : 'noindex, follow, max-image-preview:large';
  if (!/<meta\s+name="robots"\s+content="[^"]*"/i.test(html)) {
    throw new Error(`${page.url}: cannot synchronize registry decision because robots metadata is missing.`);
  }
  await writeFile(htmlPath, html.replace(
    /<meta\s+name="robots"\s+content="[^"]*"/i,
    `<meta name="robots" content="${robotsValue}"`,
  ), 'utf8');
  page.robots_directive = robotsValue;
}
const canonicalOwners = new Map();
for (const page of pages.filter(({ canonical_url }) => canonical_url)) {
  canonicalOwners.set(page.canonical_url, [...(canonicalOwners.get(page.canonical_url) || []), page]);
}
for (const owners of canonicalOwners.values()) {
  if (owners.length > 1) owners.forEach((page) => { page.duplicate_canonical = true; });
}

const failures = validateRegistryEntries(pages);
if (failures.length) throw new Error(`SEO registry validation failed:\n- ${failures.join('\n- ')}`);

const eligiblePages = pages.filter(isSitemapEligible);
const groups = new Map();
for (const page of eligiblePages) {
  groups.set(page.sitemap_group, [...(groups.get(page.sitemap_group) || []), page]);
}
const groupDirectory = resolve(outputDirectory, 'sitemaps');
await mkdir(groupDirectory, { recursive: true });
for (const [group, groupPages] of groups) {
  const xml = buildUrlset(groupPages);
  await writeFile(resolve(groupDirectory, `${group}.xml`), xml, 'utf8');
}
const sitemapIndex = buildSitemapIndex(siteUrl, groups);
await writeFile(resolve(outputDirectory, 'sitemap.xml'), sitemapIndex, 'utf8');

const legacyGroups = {
  'sitemap-static.xml': eligiblePages.filter((page) => page.source === 'static' && !page.url.startsWith('/jim-corbett/')),
  'sitemap-corbett.xml': eligiblePages.filter((page) => page.source === 'corbett'),
  'sitemap-products.xml': eligiblePages.filter((page) => page.source === 'product'),
};
for (const [file, groupPages] of Object.entries(legacyGroups)) {
  await writeFile(resolve(outputDirectory, file), buildUrlset(groupPages), 'utf8');
}
const corbettSitemap = buildUrlset(legacyGroups['sitemap-corbett.xml']);
const legacyCorbettResortSitemap = resolve(outputDirectory, 'jim-corbett/resorts/sitemap.xml');
await mkdir(resolve(outputDirectory, 'jim-corbett/resorts'), { recursive: true });
await writeFile(legacyCorbettResortSitemap, corbettSitemap, 'utf8');

const registry = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  site_url: siteUrl,
  generation_policy: {
    sitemap_requires: ['existing public build asset', 'self-canonical', 'index,follow', 'quality-approved', 'not redirected', 'unique canonical'],
    production_http_status: 'Verified separately by npm run seo:validate:production after deployment.',
  },
  pages,
  sitemap_groups: Object.fromEntries([...groups].map(([group, groupPages]) => [group, groupPages.map(({ url }) => url)])),
};
const registryJson = `${JSON.stringify(registry, null, 2)}\n`;
await writeFile(resolve(outputDirectory, 'seo-page-registry.json'), registryJson, 'utf8');

console.log(`Generated the universal SEO registry (${pages.length} declared pages) and ${groups.size} non-empty sitemap groups for ${eligiblePages.length} eligible URLs. The production HTTP validator must pass against the deployed host.`);
