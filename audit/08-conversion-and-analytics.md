# 08 — Conversion and analytics

**Date:** 12 October 2026

## Conversion path findings

- India-tour routes use quote-based planning language and clear route concepts; local German/French/Dutch pages provide localized WhatsApp drafts and contact links. These pages are not deployed in production yet.
- Production English `/india-tours/` page is accessible and uses a planning CTA; actual form submission, availability, and lead receipt were not tested.
- The homepage newsletter is not a functioning subscription service: it composes an email through `mailto:`, sets success immediately, and promises a welcome email. Root issue AUD-05.
- No real enquiry, WhatsApp send, phone call, purchase, or booking was initiated during the audit.

## Analytics implementation findings

- Contact events are inserted into Supabase `analytics_events` with page/context fields.
- The general `trackEvent` function adds URL, referrer, timestamp, and user-agent fields. Its newsletter helper adds the subscriber email to metadata and logs metadata to the console; see AUD-04.
- Existing event instrumentation covers some contact clicks and bookings, but the desired business funnel is not proven end-to-end.
- A CTA click or prepared mail/WhatsApp draft is not a received enquiry, qualified lead, booking, or revenue event.
- Consent behavior and server-side retention/deletion were not verifiable from the available project access.

## Measurement recommendations

1. Track separate, privacy-safe events for localized page view, route selection, quote-form start, successful server acceptance, WhatsApp click, and qualified lead.
2. Never pass names, email, phone, free text, auth identifiers, or complete enquiry content to analytics.
3. Store lead submissions in an access-controlled system and connect qualification/booking outcomes using a non-PII lead identifier.
4. Add reporting dimensions only for language, market, page, CTA placement, route ID, and coarse acquisition source.
5. Report Germany, France, and the Netherlands separately; label clicks, actual enquiries, qualified leads, bookings, and margin as distinct stages.

No conversion-rate or revenue estimate is made because the export contains Search Console data only and no linked lead/booking dataset.

