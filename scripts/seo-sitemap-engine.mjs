export const escapeXml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

export const extractSitemapUrls = (xml) => [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
  .map((match) => match[1].trim()
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'"));

export const isSitemapEligible = (page) => (
  page.exists === true
  && page.is_public === true
  && page.canonical_url === page.expected_canonical_url
  && page.indexable === true
  && page.quality_status === 'approved'
  && /^index\s*,\s*follow(?:\s*,|$)/i.test(page.robots_directive || '')
  && page.redirect_target === null
  && page.duplicate_canonical !== true
  && page.duplicate_primary_keyword !== true
);

export const markDuplicatePrimaryKeywords = (pages) => {
  const ownersByKeyword = new Map();
  for (const page of pages) {
    if (!page.indexable || page.quality_status !== 'approved' || !page.primary_keyword?.trim()) continue;
    const keyword = page.primary_keyword.trim().toLocaleLowerCase('en');
    ownersByKeyword.set(keyword, [...(ownersByKeyword.get(keyword) || []), page]);
  }
  for (const owners of ownersByKeyword.values()) {
    if (owners.length < 2) continue;
    for (const page of owners) {
      page.duplicate_primary_keyword = true;
      page.quality_status = 'needs-review';
      page.indexable = false;
      page.quality_reasons = [...new Set([
        ...(page.quality_reasons || []),
        'Another indexable page claims the same primary keyword; assign one clear intent owner before indexing both.',
      ])];
    }
  }
  return pages;
};

export const inferProductSitemapGroup = (category, title, location = '') => {
  const context = `${category} ${title} ${location}`.toLocaleLowerCase('en');
  if (/\b(festival|music|concert|tomorrowland|coachella|ultra)\b/.test(context)) return 'festival-packages';
  if (/\b(mice|corporate|offsite|business travel)\b/.test(context)) return 'corporate';
  if (/\bwedding\b/.test(context)) return 'weddings';
  if (/\b(corbett|safari|wildlife)\b/.test(context)) return /\bsafari\b/.test(context) ? 'safari' : 'jim-corbett-packages';
  if (/\b(europe|france|switzerland|italy|paris|rome|spain|greece|london)\b/.test(context)) return 'europe-packages';
  if (/\binternational\b/.test(context)) return 'international-tours';
  if (/\b(domestic|india|indian)\b/.test(context)) return 'domestic-tours';
  return 'packages';
};

export const buildUrlset = (pages) => {
  const entries = pages.map((page) => {
    const lastmod = page.last_modified
      ? `\n    <lastmod>${escapeXml(page.last_modified)}</lastmod>`
      : '';
    return `  <url>\n    <loc>${escapeXml(page.canonical_url)}</loc>${lastmod}\n  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
};

export const buildSitemapIndex = (siteUrl, groups) => {
  const sitemaps = [...groups]
    .filter(([, pages]) => pages.length > 0)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([group]) => `  <sitemap>\n    <loc>${escapeXml(`${siteUrl}/sitemaps/${group}.xml`)}</loc>\n  </sitemap>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps.join('\n')}\n</sitemapindex>\n`;
};

export const validateRegistryEntries = (pages) => {
  const failures = [];
  const ids = new Set();
  const urls = new Set();

  for (const page of pages) {
    if (!page.id || ids.has(page.id)) failures.push(`Missing or duplicate SEO registry id: ${page.id || '(empty)'}`);
    if (!page.url || urls.has(page.url)) failures.push(`Missing or duplicate SEO registry URL: ${page.url || '(empty)'}`);
    if (!page.canonical_url || !page.expected_canonical_url) {
      failures.push(`${page.url || '(unknown URL)'}: missing canonical URL (actual "${page.canonical_url || ''}", expected "${page.expected_canonical_url || ''}").`);
    }
    for (const field of ['page_type', 'entity_type', 'entity_id', 'primary_keyword', 'search_intent']) {
      if (!page[field]) failures.push(`${page.url || '(unknown URL)'}: missing required registry field "${field}".`);
    }
    if (page.url !== '/' && !page.parent_url) failures.push(`${page.url || '(unknown URL)'}: missing parent URL.`);
    if (!page.sitemap_group || !/^[a-z0-9-]+$/.test(page.sitemap_group)) {
      failures.push(`${page.url || '(unknown URL)'}: invalid sitemap group "${page.sitemap_group}".`);
    }
    ids.add(page.id);
    urls.add(page.url);
  }

  const eligible = pages.filter(isSitemapEligible);
  const canonicalOwners = new Map();
  const keywordOwners = new Map();
  for (const page of eligible) {
    const owners = canonicalOwners.get(page.canonical_url) || [];
    owners.push(page);
    canonicalOwners.set(page.canonical_url, owners);
    const keyword = page.primary_keyword.trim().toLocaleLowerCase('en');
    keywordOwners.set(keyword, [...(keywordOwners.get(keyword) || []), page]);
  }
  for (const [canonical, owners] of canonicalOwners) {
    if (owners.length > 1) failures.push(`Duplicate eligible canonical URL: ${canonical}`);
  }
  for (const [keyword, owners] of keywordOwners) {
    if (owners.length > 1) failures.push(`Duplicate eligible primary keyword "${keyword}": ${owners.map(({ url }) => url).join(', ')}`);
  }
  return failures;
};
