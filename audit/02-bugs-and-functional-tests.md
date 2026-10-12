# 02 — Bugs and functional tests

**Date:** 12 October 2026

## Route and journey inventory

Source inspection found the SPA in [`src/App.tsx`](../src/App.tsx), home and static information pages under `src/pages/`, trip browse/detail and booking components under `src/components/trips/`, account/auth flows, admin dashboards, and a separate India-tour planner. Static SEO routes include Europe, Tomorrowland, Jim Corbett, product pages, and the English/German/French/Dutch India-tour pages.

## What was tested

- Local direct navigation and rendering: `/`, `/india-tours/`, `/india-tours/de/`, `/india-tours/fr/`, and `/india-tours/nl/`.
- Direct browser viewport checks for the five routes (320, 360, 390, 430, 768, 1366, 1440, and 1920 px).
- Production HTTP access for robots.txt, sitemap index, India-tour sitemap, English India-tour hub, and each of the three locale URLs.
- Automated SEO tests and validators; see [11 — Test evidence](./11-test-evidence.md).

## Confirmed functional defects

### Newsletter says a subscription succeeded without subscribing

[`src/components/home/Newsletter.tsx`](../src/components/home/Newsletter.tsx) builds a `mailto:` link, opens a compose window, and immediately sets its `subscribed` state. The success panel claims the visitor is part of the newsletter and tells them to check for a welcome offer. No application/server subscription request or delivery confirmation exists in this component. If no mail client opens, the flow silently appears complete; even when it opens, the visitor must send a draft and no subscription result is known.

**Reproduction:** enter a synthetic email and submit; observe that state is set before any mail delivery or server confirmation. Production submission was not performed.

**Recommendation:** connect an approved, consent-aware subscription service with server-side validation and an explicit success/error result, or change the copy to say that an email draft was prepared.

### Unknown-route and authentication flows

The custom hash/path router is source-visible, but full interactive journeys were not submitted because auth, booking, payment, and enquiry flows connect to production services. The SPA's route handler does not appear to use a router library; direct URL, back/forward, and unknown route semantics beyond the tested paths require dedicated E2E coverage.

## Functional areas not end-to-end tested

- Search, filters, itinerary wizard submission, maps, and locale language-switching beyond route rendering.
- Authentication, password reset, host/traveller dashboards, admin views, and Supabase data access.
- Booking, payment, refund, and notification workflows.
- Email, phone, and WhatsApp external handoffs.
- Network timeout, duplicate submission, server rejection, and offline states.
- Production forms were not submitted; no real enquiry or booking was created.

No production request that could create or change customer or booking records was made.

