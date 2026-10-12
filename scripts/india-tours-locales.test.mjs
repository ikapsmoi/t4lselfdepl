import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const siteUrl = 'https://travel4life.net';
const alternates = new Map([
  ['en', `${siteUrl}/india-tours/`],
  ['de-DE', `${siteUrl}/india-tours/de/`],
  ['fr-FR', `${siteUrl}/india-tours/fr/`],
  ['nl-NL', `${siteUrl}/india-tours/nl/`],
  ['x-default', `${siteUrl}/india-tours/`],
]);
const marketPages = [
  {
    path: 'india-tours/de/index.html',
    canonical: '/india-tours/de/',
    language: 'de-DE',
    phrase: 'Indien Rundreise',
    route: 'Goldenes Dreieck',
  },
  {
    path: 'india-tours/fr/index.html',
    canonical: '/india-tours/fr/',
    language: 'fr-FR',
    phrase: 'Voyage en Inde',
    route: "Triangle d'Or",
  },
  {
    path: 'india-tours/nl/index.html',
    canonical: '/india-tours/nl/',
    language: 'nl-NL',
    phrase: 'Rondreis India',
    route: 'Gouden Driehoek',
  },
];

const readHtml = async (path) => readFile(resolve(path), 'utf8');
const getAlternates = (html) => new Map(
  [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)]
    .map(([, language, href]) => [language, href]),
);
const visibleWordCount = (html) => html
  .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&(?:nbsp|amp|quot|lt|gt|#\d+);/gi, ' ')
  .trim()
  .split(/\s+/)
  .filter(Boolean)
  .length;

test('localized market pages are crawlable, self-canonical, and substantial', async () => {
  for (const page of marketPages) {
    const html = await readHtml(page.path);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] || '';
    const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1] || '';
    const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '';

    assert.match(html, new RegExp(`<html lang="${page.language}"`));
    assert.equal(canonical, `${siteUrl}${page.canonical}`);
    assert.ok(title.length > 25);
    assert.ok(description.length >= 80);
    assert.equal((html.match(/<h1\b/gi) || []).length, 1);
    assert.match(h1, new RegExp(page.phrase, 'i'));
    assert.match(html, /<meta name="robots" content="index, follow/);
    assert.ok(visibleWordCount(html) >= 250);
    assert.match(html, /<script type="application\/ld\+json">/);
    assert.doesNotMatch(html, /noindex/i);
    assert.match(html, /preise werden.*bestätigt|prix ne sont confirmés|prijzen worden pas bevestigd/i);
  }
});

test('all India language alternatives are reciprocal and point to canonical routes', async () => {
  const english = await readHtml('india-tours/index.html');
  const pages = [english, ...await Promise.all(marketPages.map(({ path }) => readHtml(path)))];

  for (const html of pages) {
    assert.deepEqual(getAlternates(html), alternates);
  }
});

test('localized route ideas use reviewable, translated WhatsApp drafts without analytics payloads', async () => {
  for (const page of marketPages) {
    const html = await readHtml(page.path);
    const whatsappLinks = [...html.matchAll(/<a\b[^>]*href="(https:\/\/wa\.me\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];

    assert.ok(whatsappLinks.length >= 4, `${page.path} should provide localized contact actions.`);
    const messages = whatsappLinks.map(([, href]) => {
      const url = new URL(href);
      assert.equal(url.hostname, 'wa.me');
      assert.equal(url.pathname, '/919511446642');
      return url.searchParams.get('text') || '';
    });
    assert.ok(messages.every((message) => message.length > 60));
    assert.ok(messages.some((message) => message.toLowerCase().includes(page.route.toLowerCase())));
    assert.match(html, /message is only sent|Nachricht wird erst gesendet|message ne part que si|bericht wordt pas verzonden/i);
    assert.doesNotMatch(html, /trackContactEvent|analytics_events|gtag\(/);
  }
});

test('localized pages disclose quote-only concepts and use the configured contact details', async () => {
  const manifest = JSON.parse(await readFile(resolve('public/india-tours/search-intent-map.json'), 'utf8'));
  const contacts = JSON.parse(await readFile(resolve('src/config/travel4life-contact.json'), 'utf8'));
  const owners = new Map(manifest.owners.map((owner) => [owner.url, owner]));

  for (const page of marketPages) {
    const html = await readHtml(page.path);
    const url = page.canonical;
    const owner = owners.get(url);

    assert.ok(owner, `Missing search-intent owner for ${url}.`);
    assert.equal(owner.file, page.path);
    assert.ok(owner.primaryQuery);
    assert.ok(html.includes(`href="https://wa.me/${contacts.whatsappNumber}?text=`));
    assert.ok(html.includes(`href="mailto:${contacts.email}`));
    assert.ok(html.includes(`href="tel:${contacts.phoneHref}"`));
    assert.match(html, /no confirmed|keine bestätigten|non des voyages organisés confirmés|geen bevestigde/i);
  }
});
