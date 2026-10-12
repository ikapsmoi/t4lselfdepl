# 07 — Security and privacy

**Date:** 12 October 2026  
**Method:** safe static review of selected browser analytics, Edge Function, and RLS migration paths. No penetration test, production mutation, or authenticated Supabase access was performed.

## High-priority authorization risk

[`supabase/functions/analytics-report/index.ts`](../supabase/functions/analytics-report/index.ts) creates a client with `SUPABASE_SERVICE_ROLE_KEY` and, in the detailed/default branch, selects up to 1,000 complete `analytics_events` rows. The handler checks the request method but contains no in-handler user lookup, admin-role check, or authorization guard before the privileged query. Its broad data path can include metadata and user-agent data. The analytics table migration limits direct row selection to admins but permits inserts from `public`; the service-role client bypasses that RLS restriction.

The local repository has no `supabase/config.toml` that would document function JWT settings, and live project settings were unavailable. A platform JWT gate, if enabled, is not equivalent to an admin-role check. The frontend's admin password is a client-side convenience mechanism, not a security boundary. The README explicitly documents that limitation.

**Classification:** strongly indicated authorization risk, not a confirmed production exploit. No request was sent to this endpoint. **Action:** verify deployment auth configuration and add a server-side authorization/role check before returning any analytics data; safely test unauthenticated and non-admin denial before release. Root issue ID AUD-01.

## Personal data in analytics

The newsletter calls `newsletterSignup(email)`. `src/utils/analytics.ts` places the email in the `metadata` object sent to `analytics_events`, and logs the metadata to the browser console. This is confirmed by static code inspection. Avoid sending email or other direct identifiers to analytics; use an event without the email, and separately handle subscription data in an approved system. Root issue ID AUD-04.

The analytics table allows inserts for all users with `WITH CHECK (true)` in migration `20250910191158_amber_block.sql`. This can enable event spam/metric pollution if the public insert policy is active; rate limiting, event allowlisting, schema validation, and volume controls should be evaluated. This is not proof of a database exploit or billing incident.

## Other observations

- `VITE_ADMIN_PASSWORD` is bundled client-side and can be extracted from frontend assets. The project README says it is not secure authorization. Treat it only as a UI gate; enforce authorization at Supabase RLS and privileged server endpoints.
- The admin trip-management and SEO data migrations use an `is_travel4life_admin()` function with authenticated role checks. This is positive source evidence for those specific tables, not a full audit of every database object.
- The avatar and trip-image upload functions authenticate a Supabase user and check file type/size. Full deployed bucket policy, ownership enforcement, rate limiting, and hostile-file testing were not verified.
- No public credentials or `.env.local` values were read or reported. Supabase browser URL/anon key usage is expected to be public client configuration; service-role use was only observed inside Edge Function source.
- No consent-management component was found in the inspected app paths, while analytics event collection is initiated from application code. Whether consent is legally required depends on actual storage/processing and applicable law; obtain qualified privacy review rather than assuming a violation.
- The privacy page is dated 1 January 2025 and is generic. Verify it accurately describes current analytics, newsletter, retention, processors, and user-rights handling with qualified counsel.

## Dependency advisories

`npm audit` returned 15 advisories in the full installed tree (11 high, 3 moderate, 1 low). A separate `npm audit --omit=dev` returned zero. Reported packages include development/build tooling such as `esbuild`, `braces`, `brace-expansion`, `browserslist`, `js-yaml`, `nanoid`, `postcss`, `postcss-selector-parser`, `source-map-js`, and `baseline-browser-mapping`. The Windows `esbuild` development-server file-read advisory deserves prompt attention while using the dev server. Do not run `npm audit fix --force` blindly: npm reported that a forced resolution would move Tailwind to major version 4.

