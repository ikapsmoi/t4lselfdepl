# Issue status

Statuses distinguish local source/build evidence from staging and production. No production change was made.

| ID | Status | Evidence and remaining work |
|---|---|---|
| AUD-01 | **Partially fixed** | Added authenticated-user and `profiles.role === 'admin'` checks before service-role use in `supabase/functions/analytics-report/index.ts`; the browser invokes the function with the current Supabase session. Five mocked authorization cases pass. Staging deployment/configuration and production behavior remain unverified. |
| AUD-02 | **Partially fixed** | Existing German, French, and Dutch page sources build into nested static route files. Local preview returns 200 with language, title, H1, canonical, and reciprocal alternates. The live routes still return 404 and are missing from the published sitemap. Native editorial approval, deployment, and live verification are required. |
| AUD-03 | **Fixed and locally verified** | The India-tour header reflows more compactly at narrow widths. Built-site browser measurements show `scrollWidth <= viewport width` at 320, 360, 390, 430, 768, 1366, and 1440 px; the brand and menu control remain visible. |
| AUD-04 | **Fixed and locally verified** | The newsletter address is no longer passed to analytics. The shared analytics payload builder removes direct-identifier keys recursively, removes query strings, sets `user_id` to null, and does not add IP or user-agent values. Synthetic payload test passes. |
| AUD-05 | **Partially fixed** | Newsletter text and state now describe a user-prepared email request, not a completed subscription. No mailing-list service, confirmed subscription result, or unsubscribe handling exists. Do not treat a prepared draft as a lead or subscription. |
| AUD-06 | **Partially fixed** | Current full lint has 210 errors and 25 warnings, down from the recorded 243 errors and 26 warnings. `npm run lint:edge` passes. App-wide lint is not clean; no blanket lint-rule suppression was added. Remaining messages are grouped in `lint-remaining.csv`. |
| AUD-07 | **Partially fixed** | Replaced two tracked fragment-only component files with re-exports of the existing canonical page implementations; removed the unsupported app deprecation setting and added compatible Node typings. `npx tsc -p tsconfig.node.json --pretty false` passes. `npx tsc -b --pretty false` still reports 592 diagnostics, mostly across existing application typing and unused-symbol issues. |
| AUD-08 | **Partially fixed** | Non-forced `npm audit fix` updates reduced the full audit from 15 entries (11 high, 3 moderate, 1 low) to 7 (5 high, 2 moderate). `npm audit --omit=dev` is zero. All remaining findings are in the development/build graph and npm offers a fix only through Tailwind CSS 4; no forced major migration was performed. |
| AUD-09 | **Partially fixed** | Technical data flows and unknowns are documented in `ui-and-privacy.md`. The privacy page still says 1 January 2025; it was not edited. The business/privacy owner must confirm purposes, legal basis, recipients, retention, rights handling, and consent behavior before approving a notice revision. |

## Additional security follow-up

Static inspection during the privacy trace identified two other service-role Edge Functions that accept caller-provided data without an in-handler user/ownership check: `create-profile` accepts a supplied user ID and profile fields; `track-login-attempt` accepts a supplied email and can trigger a password-reset email after repeated failure events. Whether the deployed gateway configuration limits access was not available, so exploitability is **not confirmed**. Treat this as a separate high-priority security review and staging verification item; neither function was changed in this pass.
