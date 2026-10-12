# Mobile UI and privacy review

## AUD-03 — narrow India-tour header

The shared India-tour header now uses a compact narrow-width layout. The built local site was checked in a browser at all requested widths:

| Viewport width | Measured document `scrollWidth` | Result |
|---:|---:|---|
| 320 | 320 | Pass |
| 360 | 345 | Pass |
| 390 | 375 | Pass |
| 430 | 415 | Pass |
| 768 | 753 | Pass |
| 1366 | 1351 | Pass |
| 1440 | 1425 | Pass |

All measurements are at or below the viewport width; the lower values reflect the browser scrollbar gutter. The brand and menu control remained visible. Existing local interaction checks exercised the mobile menu's planning link; desktop navigation and the planning control remained present at desktop sizes. The correction is scoped to the India-tour header rather than hiding document overflow globally.

No dedicated browser-test framework/configuration was present for adding a persistent viewport regression test. These are local browser checks, not a CI-automated visual test.

## Internal data inventory

This inventory is technical evidence, not a legal determination. Retention, legal basis, processor terms, and some row-level access controls are not established by the inspected source.

| Data category | Purpose / collection point | Processing system and observed recipients | Retention | Access controls | Consent / legal basis |
|---|---|---|---|---|---|
| Account/profile | Signup accepts email, password, name, role, and optional Instagram/referral/source fields. | Supabase Auth; `create-profile` writes email, name, role, Instagram ID, referral fields, and profile metadata to Supabase. | Not established. | Exact profile RLS and deletion behavior were not reviewed. The profile Edge Function uses service role; its caller-ownership check is a separate security follow-up. | Not established; business/privacy owner review required. |
| Login and account-security events | Failed/successful login handling passes normalized email; the browser code includes user-agent and sends IP as `"unknown"` in the inspected failed-login path. | `track-login-attempt` writes `auth_audit` and email-derived `rate_limits` records; after repeated failures it can request a password-reset email through Supabase Auth. | Not established. | Service-role function and table policies need review; no retention schedule was found. | Security purpose is visible in code; approved legal basis and notice wording are not established. |
| Custom India enquiry | Form fields include name, email, phone, destination, dates, group size, budget, interests, and free-text requests. | The page constructs a `mailto:` draft to the configured contact address and opens the visitor's email app. The inspected flow does not persist the enquiry in an application backend. | Email-provider/mailbox retention is unknown. | Once sent, access depends on the visitor's and recipient's email systems; no mailbox policy was inspected. | User action to send the draft; approved legal basis and notice details remain for review. |
| Booking | Booking UI collects account/contact and trip details, including mobile, emergency contact, dietary restrictions, and requests. The booking hook sends trip/traveler/host IDs, status, and installment-plan state to Supabase; not all UI fields are included in that insert path. | Supabase booking/profile systems. The UI can redirect to a Razorpay-hosted payment URL after its success state; the payment processor configuration and data-sharing contract were not inspected. | Not established. | Booking/profile RLS, payment state integrity, and deletion behavior were not fully audited. | Not established; do not infer a legal basis or payment-provider agreement. |
| Product analytics | Event name, pseudonymous session ID, page path, coarse source classification, and contextual event metadata (for example trip/destination and funnel context). Current payload construction removes direct-identifier keys and query strings, sets `user_id` to null, and does not add IP/user-agent fields. | Supabase `analytics_events`; admin report access is now gated by the server-side admin check. Public inserts are permitted by the inspected migration. | Not established; old rows may predate minimization. | Migration restricts direct reads to admins, but public inserts are allowed. Current Edge Function report response is minimized. | No consent-management component was found in the inspected app; owner/legal review must decide the required gating and lawful basis. |
| Newsletter request | Visitor enters an email address. The UI now prepares a `mailto:` body containing that address; the address is not written to analytics. | Visitor's chosen email client and configured recipient only after the visitor opens and sends the draft. No mailing-list backend or automatic confirmation was found. | No app-side subscription record is created by this flow; email-system retention is unknown. | No subscription database/access policy exists in this flow. | Visitor must send the message; this is not an automatic subscription. Consent wording/provider flow needs approval before adding a real list. |
| Contact CTA | Clicks on WhatsApp, phone, and email links emit event name and contextual page/destination/route information, not the contact message itself. | Browser hands off to WhatsApp, telephone, or email app; click events go to Supabase analytics. | Not established for analytics or external providers. | Analytics admin read restrictions apply; public event insert remains enabled. | No approved consent/legal-basis determination found. |
| Static third-party media | Browser requests externally hosted Pexels imagery used by the privacy page and other content. | Pexels receives normal resource requests from the browser; no app-submitted form data was observed in those URLs. | Provider-controlled; not established here. | Provider-side controls not inspected. | Requires privacy-owner review of provider disclosure and applicable consent requirements. |

### Notice and behavior gaps for owner review

- The privacy page remains generic and says **Last updated: January 1, 2025**. That date was intentionally not changed without approval.
- The current page does not enumerate the observed analytics, security logs, account/profile data, contact handoffs, or payment handoff.
- Confirm Supabase, Razorpay, Pexels, WhatsApp, and email service roles/terms before naming them as processors or recipients in an approved notice.
- Determine and implement approved retention/deletion periods for analytics, account/security logs, enquiries, bookings, and payment records; none was inferred.
- Confirm a working access/correction/deletion request process. The displayed `privacy@travel4life.net` address was not verified.
- No consent UI was found in the inspected paths; decide whether non-essential analytics must be gated before collection and make implementation match the approved decision.
- If a true newsletter is introduced, define consent, confirmation, provider, retention, and unsubscribe handling before claiming enrollment.

Qualified privacy/legal review is required; this inventory is not legal advice or a compliance claim.
