# Travel4Life project health audit

**Audit date:** 12 October 2026  
**Overall health:** **Amber**

## Management summary

The application builds and the focused SEO suite passes, but the checkout is not release-ready without follow-up. The highest-risk finding is a Supabase Edge Function that uses a service-role client to return analytics records without an in-function authentication or admin-role check. Whether the deployed gateway currently blocks all relevant callers was not verifiable without project access; treat this as a release-blocking authorization review, not as a confirmed production breach.

The local German, French and Dutch India-tour pages render and are listed in the locally generated sitemap. On production, all three routes return 404 and the live India-tour sitemap contains only the English route. The new market pages are therefore not deployed.

### Tests and evidence completed

- `npm run build`: passed earlier in this session; emitted the three localized pages and generated 82 eligible sitemap URLs across 12 groups.
- `npm run test:seo`: passed, 44 tests.
- `npm run seo:validate`: passed its 14 Tomorrowland pages, Europe hub and 25 contact-layer pages.
- `npm run seo:validate:sitemaps`: passed for the local generated artifacts (82 eligible URLs).
- `npm run seo:validate:production`: failed on the three localized pages missing from the live sitemap.
- `npm run lint`: failed with 243 errors and 26 warnings.
- `npx tsc -b --pretty false`: failed on malformed TSX source and missing Node/Vite config types.
- `npm audit --omit=dev --audit-level=high`: zero production dependency advisories reported.
- `npm audit --audit-level=high`: 15 advisories in the full tree (11 high, 3 moderate, 1 low); results were development-tooling-only according to the production-only audit.
- Local browser layout checks covered `/`, `/india-tours/`, and the three localized routes at widths 320, 360, 390, 430, 768, 1366, 1440, and 1920 px. The India hub overflows horizontally at 320 and 360 px.
- A supplied Search Console export was inspected. It covers a short performance period and is not a substitute for live account access.

## Top five risks

1. **High / strongly indicated:** privileged analytics-report function has no in-function authorization check before using the Supabase service-role key.
2. **High / confirmed deployment state:** German, French, and Dutch market routes return production 404 and are absent from the published India sitemap.
3. **Medium / confirmed:** newsletter email addresses are included in analytics metadata and logged in the browser console.
4. **Medium / confirmed:** the newsletter form declares success after opening a `mailto:` draft; it does not confirm subscription or send a welcome email.
5. **Medium / confirmed:** project lint and standalone TypeScript checks fail; no successful project-wide static quality gate is available.

## Top five next actions

1. Verify the deployed analytics-report function's JWT setting, then require an authenticated admin role in the handler before it accesses analytics data; safely test the denial path.
2. Decide whether to launch the three locale pages. If approved, deploy them and validate live 200 responses, canonicals, hreflang, and sitemap inclusion before announcing them.
3. Remove email addresses and other personal identifiers from analytics metadata and logs; review the notice, legal basis, consent, and retention with qualified privacy counsel.
4. Replace the mailto-based newsletter flow with a real subscription path, or change the UI so it accurately describes a prepared email draft.
5. Triage the lint/typecheck baseline and development-only npm advisories; add a repeatable CI gate once the current baseline is understood.

## Evidence limits

- The audit did not modify application code or deploy changes.
- No authenticated Search Console connection was available. Page indexing, URL Inspection, Core Web Vitals, manual actions, and security reports were not checked.
- The October 10 workbook is a user-provided export, not a live GSC account view. Its property identity is not independently verified.
- No authenticated Supabase project access was available. The analytics function was reviewed statically; no request was sent to the privileged endpoint.
- Lighthouse/PageSpeed laboratory testing and field Core Web Vitals were not run. Do not infer performance scores from the bundle-size data.
- Account, booking, payment, newsletter, or enquiry actions were not submitted against production.
- Screenshots were viewed in the browser, but no screenshot files were persisted into this report directory.
- Existing user worktree modifications and deletions were present before the audit and were preserved.

## Detailed reports

- [01 — Project health](./01-project-health.md)
- [02 — Bugs and functional tests](./02-bugs-and-functional-tests.md)
- [03 — UI, UX, and responsive audit](./03-ui-ux-responsive-audit.md)
- [04 — Performance and Core Web Vitals](./04-performance-and-core-web-vitals.md)
- [05 — Technical SEO](./05-technical-seo-audit.md)
- [06 — Google Search Console](./06-google-search-console.md)
- [07 — Security and privacy](./07-security-and-privacy.md)
- [08 — Conversion and analytics](./08-conversion-and-analytics.md)
- [09 — Master issue register](./09-master-issue-register.csv)
- [10 — Remediation roadmap](./10-remediation-roadmap.md)
- [11 — Test evidence](./11-test-evidence.md)

## Engineering appendix: inventory at a glance

The source tree is a React 18 + TypeScript application built with Vite, with a separate India-tours entry, static SEO HTML pages, Tailwind CSS, Supabase browser access, and Supabase Edge Functions/SQL migrations. The repository contains 155 source files, 28 JavaScript test/build scripts, 37 SQL migrations, and 14 Edge Function files. `package.json` has build, lint, preview, SEO, and SEO-test scripts; it has no general-purpose application test command or CI workflow was found in the inspected paths.

