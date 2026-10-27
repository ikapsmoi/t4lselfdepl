# Tomorrowland SEO Baseline

**Reviewed:** 24 October 2026
**Scope:** Existing public Tomorrowland pages, ticket-related content, SEO registry and static sitemap. No deployment was performed.

## Current routes and purpose

All mapped public routes are static HTML under `public/tomorrowland/`. They are served alongside the React/Vite application; they are not dependent on client-side React rendering for their main text or metadata.

| Route | Current purpose |
| --- | --- |
| `/tomorrowland/` | India-first discovery hub |
| `/tomorrowland/tickets/` | Official ticket channels, dated edition status and ticket-versus-travel clarification (added in this implementation) |
| `/tomorrowland/packages/` | Consumer package research and due diligence |
| `/tomorrowland/b2b-travel-agent-packages/` | B2B travel-agent enquiry |
| `/tomorrowland/belgium/` | Belgium ticket and travel planning |
| `/tomorrowland/belgium/packages/` | Belgium package due diligence |
| `/tomorrowland/winter/` | Tomorrowland Winter / Alpe d'Huez ticket and travel planning |
| `/tomorrowland/thailand/` | Thailand event status and travel planning |
| `/tomorrowland/cost-from-india/` | Quote-based trip budget methodology |
| `/tomorrowland/from-india/` | India-origin travel planning |
| `/tomorrowland/compare/` | Destination comparison |
| `/tomorrowland/accommodation/` | Accommodation planning |
| `/tomorrowland/group-travel/` | Group coordination |
| `/tomorrowland/flights-from-india/` | Flight planning |
| `/tomorrowland/visa-documents/` | Travel-document checklist |
| `/tomorrowland/package-vs-independent/` | Package versus independent planning |

`/tomorrowland-india.html` permanently redirects to `/tomorrowland/from-india/`; `/tomorrowland/winter/2027/` permanently redirects to `/tomorrowland/winter/`. No dedicated Brazil route exists; current Brasil ticket status is included in the central ticket guide pending evidence for a distinct Travel4life travel page.

## Baseline findings

### Technical and indexation

- Existing guide pages use static HTML, self-referencing HTTPS canonicals, indexable robots directives, unique titles/descriptions, Open Graph images, breadcrumbs and JSON-LD.
- `_redirects` enforces the preferred non-`www` HTTPS host and has permanent redirects for the two consolidated Tomorrowland paths.
- `robots.txt` allows public crawling and references `/sitemap.xml`.
- The current production sitemap index was retrieved and points to grouped sitemaps. Its `festivals.xml` group included the existing Tomorrowland guides. The new ticket route is added to the source intent map and static sitemap; production inclusion requires a deployment.
- Important page copy is in the HTML, not gated behind JavaScript. The pages use a shared stylesheet and ordinary crawlable links.
- The build contains a sitemap/SEO-registry generator. Production HTTP/indexing validation remains a post-deployment step.

### Content and trust

- Before editing, Belgium, Winter and cost pages displayed pass-price tables with no verified edition-dated official price evidence. Thailand displayed third-party historical prices and linked to pass/package URLs that currently return 404.
- The Belgium 2026 edition has concluded. The official Belgium pages reviewed do not confirm 2027 dates or sale timing.
- The official Winter site currently lists 20–27 March 2027, festival tickets on sale, and 4-/7-day packages sold out.
- The official Thailand site currently lists 11–13 December 2026 at Wisdom Valley and says the event is sold out.
- The official Brasil site currently lists 30 April–2 May 2027, some remaining ticket options, and Global Journey sold out.
- Travel4life is not presented as the organiser or an authorised ticket seller. A Travel4life enquiry is not a festival ticket or booking confirmation.

### Conversion

- Existing CTA flows use the configured phone, email and WhatsApp contact details.
- Edition-specific enquiry builders create unsent WhatsApp drafts; copy discloses that the visitor must review and send the draft.
- Thailand's displayed listing inventory is suppressed in its intent-map configuration while the official 2026 event is sold out and the scope of any Travel4life ticket inclusion is unverified. This does not modify product data or query behavior.

### Search evidence and limits

The 23 October 2026 Search Console export covers 24 September–21 October 2026. It records six clicks across visible Tomorrowland query rows (301 impressions), including `tomorrowland thailand packages from india` (3 clicks, 7 impressions, position 8.71). The separately sampled Pages report groups Tomorrowland pages at 21 clicks and 824 impressions. Those exports do not associate query rows with specific landing pages or prove sustained rankings. Search volume and keyword difficulty are unknown. See [`audit/06-google-search-console.md`](../../audit/06-google-search-console.md).

## Tests before implementation

`npm run test:seo` was run before code changes: **71 passed, 0 failed**. The change-specific SEO validator and tests are recorded in [`tomorrowland-execution-report.md`](./tomorrowland-execution-report.md).

## Protected boundary and owner verification

- Supabase files, configuration, schemas, queries, data contracts, authentication and live project data were not modified.
- Spreadsheet files in the worktree were treated as existing user data and left untouched.
- Search Console account access, URL Inspection, indexing state, and post-deployment canonical selection require owner access.
- No production deployment was performed. Current production content was read for representative routes and sitemap/robots responses only.
