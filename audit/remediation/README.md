# Local audit remediation report

**Prepared:** 12 October 2026  
**Scope:** AUD-01 through AUD-09, local source/build verification only. No production deployment, indexing request, live booking, payment, newsletter, email, or WhatsApp message was initiated.

This report records what was rechecked, changed, locally verified, and remains blocked. Existing audit evidence is preserved in the parent [`audit/`](../) directory.

## Outcome

| Finding | Local outcome |
|---|---|
| AUD-01 — privileged analytics report | The function now verifies the caller and admin profile before service-role access; mock authorization tests pass. Staging and production are not verified. |
| AUD-02 — localized India pages | German, French, and Dutch static routes build and return local HTTP 200 with localized metadata. Production still returns 404 and omits them from its sitemap. Native-language editorial approval and authorized deployment remain outstanding. |
| AUD-03 — mobile header overflow | No document-level horizontal overflow was measured at any of the seven requested viewports in the built local site. |
| AUD-04 — identifiers in analytics | Analytics payloads redact direct identifiers and omit the submitted newsletter address; the focused payload test passes. |
| AUD-05 — newsletter state | The UI now truthfully prepares a `mailto:` request rather than claiming subscription. There is no subscription backend, confirmation, or unsubscribe flow. |
| AUD-06 — lint | The current baseline is 210 errors and 25 warnings. Edge Function lint passes; full lint does not. See [`lint-remaining.csv`](./lint-remaining.csv). |
| AUD-07 — TypeScript | The Node/Vite project check passes. The full project build check still reports 592 diagnostics; these are not suppressed or excluded. |
| AUD-08 — npm advisories | Safe non-forced updates reduced the full development-tree result to 7 vulnerable package entries (5 high, 2 moderate). The production-only audit reports 0. |
| AUD-09 — privacy notice | A technical data-flow inventory and proposed review items are recorded. The privacy notice date and legal wording were not changed pending business/privacy approval. |

## Important limitations

- The deployed analytics-report function and its Supabase JWT configuration were not accessible for staging verification.
- Production locale routes were directly rechecked and still fail. The local build contains the locale pages, but the repository provides no identifiable host deployment configuration that explains the precise artifact/routing failure.
- The locale text has not been independently approved by native-language editors.
- Data retention, legal basis, processor agreements, database policies beyond the reviewed migrations, and deletion workflows are not established by the inspected source.
- The current production sitemap validator deliberately reports missing/inaccessible locale URLs; a local sitemap pass is not evidence of production publication.
- This worktree contained pre-existing user changes and deletions. They were preserved; only the build-generated enrichment timestamp and TypeScript build-info files created during verification were cleaned up.

## Evidence index

- [`issue-status.md`](./issue-status.md) — per-finding disposition and evidence.
- [`security.md`](./security.md) — authorization changes, tests, and residual risks.
- [`international-seo.md`](./international-seo.md) — locale routes, metadata, sitemap, and production status.
- [`ui-and-privacy.md`](./ui-and-privacy.md) — responsive results and internal data inventory.
- [`code-quality.md`](./code-quality.md) — lint, TypeScript, build, and focused test results.
- [`dependencies.md`](./dependencies.md) — post-update audit findings and risk assessment.
- [`regression-results.md`](./regression-results.md) — commands, browser checks, and failures.
- [`remaining-issues.csv`](./remaining-issues.csv) — outstanding actions, dependencies, and role owners.
