# Security remediation

## AUD-01 — analytics report authorization

The analytics report previously initialized a Supabase service-role client and queried `analytics_events` without an explicit in-handler admin authorization check. A platform JWT check alone would not establish the application admin role.

The handler now:

1. Requires a well-formed bearer token.
2. Validates the token with Supabase Auth.
3. Checks the corresponding `profiles` row for `role === 'admin'`.
4. Returns an authorization failure before constructing/using service-role access if those checks fail.
5. Selects the data needed by the report rather than complete event rows and sanitizes historical metadata before returning it.

The admin UI calls the Edge Function through the authenticated Supabase `functions.invoke` path rather than issuing an unauthenticated request. Five mock-based cases pass: missing/malformed token, invalid user session, non-admin user, authorized admin, and profile lookup failure. Failures are surfaced; they do not grant access.

**Verification boundary:** No Deno runtime, authorized Supabase staging account, or project JWT configuration was available. This is locally verified source behavior, not verified deployed behavior. Production remains unchanged and the original high-risk path must be treated as unresolved there until an authorized deployment and staging/production verification.

## Analytics data minimization

- The app analytics payload builder forces `user_id` to null and removes common direct-identifier keys recursively from metadata.
- It strips query strings from URLs, records a coarse referrer classification, and does not add IP address or user-agent fields.
- Newsletter addresses are not submitted to analytics.
- A synthetic-payload test verifies nested direct-identifier removal and query-string stripping.
- Existing rows are not deleted or migrated; their retention and historical contents need owner-approved review.

The `analytics_events` migration has nullable `ip_address` and `user_agent` columns and an unrestricted public insert policy. The current client writers do not send those columns, but historical values, rate limiting, event allowlisting, and abuse controls were not verified.

## Residual security risk outside the completed AUD-01 change

During the privacy trace, source inspection found:

- `supabase/functions/create-profile/index.ts` uses the service role and accepts `user_id`, email, name, and role in the request body without verifying that the caller is authenticated as that user. The accepted roles are restricted to `host` and `traveler`, but caller ownership is not checked in the handler.
- `supabase/functions/track-login-attempt/index.ts` uses the service role and accepts a caller-supplied email and success flag. Repeated failed-attempt events can trigger a password-reset email and write rate-limit/audit records.

No deployment function-JWT configuration was available, and no requests were sent to these endpoints. These are **potential privileged-endpoint abuse risks based on source**, not confirmed production exploits. A security owner should review and test them in staging before release. They are recorded separately in `remaining-issues.csv`; this pass did not change their behavior.

## Release requirements

- Deploy the analytics-report change only through the authorized release process.
- In staging, verify anonymous denial, authenticated non-admin denial, profile lookup failure, and admin success, plus least-privilege response content.
- Review the two additional service-role endpoints and their deployed gateway configuration.
- Do not represent production as remediated until deployment and production verification occur.
