# 10 — Remediation roadmap

**Date:** 12 October 2026  
**Priority model:** P0 severe outage/critical confirmed exposure; P1 important security/indexation/core-flow risk; P2 meaningful quality, UX, or privacy remediation; P3 incremental optimization. No P0 finding was established.

## P1 — High priority

### 1. Close analytics-report authorization gap (AUD-01)

- Confirm the deployed Supabase function's gateway JWT configuration.
- Require a server-verified authenticated user with `profiles.role = 'admin'` inside the handler before using service-role access.
- Validate request date ranges and report type, select only needed fields, cap results, and return no direct identifiers by default.
- Add staging tests for anonymous, authenticated non-admin, and admin behavior.
- If launch is imminent and the endpoint cannot be validated, disable the privileged report endpoint until protected.

### 2. Decide and ship the locale rollout (AUD-02)

- Obtain native-language review and business confirmation of the actual response process.
- Deploy the three pages only after content approval.
- Validate each production route, metadata, hreflang reciprocity, canonical, redirect behavior, and sitemap entry.
- Submit representative URLs for inspection only after live validation; do not request indexing for all pages automatically.

## P2 — Planned

### 3. Fix email handling and newsletter behavior (AUD-04, AUD-05, AUD-09)

- Remove email from analytics and console output.
- Implement actual subscription acceptance/confirmation or revise the call-to-action to state it opens a mail draft.
- Review privacy notice and consent/retention behavior with qualified counsel.

### 4. Establish code-quality gates (AUD-06, AUD-07)

- First resolve the malformed, currently tracked TSX fragments and clarify the Vite config TypeScript project.
- Triage the 243 lint errors and 26 warnings, starting with runtime-critical and security-sensitive files.
- Add `tsc` and lint to an automated CI workflow after baseline is clean.
- Keep generated files and pre-existing working-tree changes out of unrelated remediation commits.

### 5. Address mobile header overflow (AUD-03)

- Reflow or reduce narrow-width India-tour header controls.
- Recheck the root document width and visible control behavior at 320 and 360 px.

### 6. Update dependency tree (AUD-08)

- Update safe non-major transitive/direct dependencies through reviewed manifest/lockfile changes.
- Treat Tailwind 4 as a planned migration because the audit's forced fix path implies a major upgrade.
- Rerun tests, build, full and production-only audits after updates.

## P3 — Optimization and measurement

- Baseline Lighthouse/PSI lab runs on representative production pages; collect field Core Web Vitals separately.
- Review actual route network waterfalls before splitting or compressing emitted assets.
- Add E2E journeys with mock/staging integrations for auth, search, route planning, newsletter, enquiry, and booking.
- Create privacy-safe reporting from organic landing page to qualified lead and booking.
- Monitor locale countries independently in GSC after launch; expand only when measured demand and real inventory support it.

## 90-day sequence

| Period | Work | Exit criteria |
|---|---|---|
| Days 0–7 | Secure analytics report function; resolve deploy decision for locale pages; correct email analytics behavior. | Anonymous/non-admin access denied; no direct identifiers in analytics; locale rollout has explicit owner and validation checklist. |
| Days 8–30 | Fix newsletter truthfulness, mobile header, and type/lint baseline; update development advisories in small reviewed increments. | Relevant flows have tests; standalone typecheck/lint pass; no forced major dependency upgrade. |
| Days 31–60 | Deploy approved pages; run live route/canonical/hreflang/sitemap and accessibility checks; establish Lighthouse baseline. | Production routes return 200, are sitemap-listed, and page metrics are recorded with tool/device/network/date. |
| Days 61–90 | Review GSC query/page/country trends and qualified lead/booking reporting; refresh content and prioritization. | Report actual impressions, clicks, received/qualified leads and bookings separately; record data windows and owners. |

No ranking, traffic, lead, or revenue improvement is guaranteed or forecast.

