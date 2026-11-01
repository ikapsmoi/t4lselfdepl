# Internal Linking Plan

## Target architecture

```text
Tomorrowland Hub
├── India Packages
│   ├── Belgium Packages
│   ├── Thailand Page
│   └── Winter Page
├── Cost from India
├── Tickets Guide
├── Flights from India
├── Accommodation
├── Visa and Documents
├── Group Travel
└── Package vs Independent
```

## Priority actions

1. Link homepage Tomorrowland discovery only to `/tomorrowland/` and specific high-value guides where context is natural.
2. Link `/tomorrowland/packages/` to all three edition owners with descriptive anchor text.
3. Link edition pages to cost, flights, accommodation and tickets.
4. Link cost, flight and visa guides to the appropriate commercial package owner.
5. Ensure package and edition pages link back to `/tomorrowland/packages/`.
6. Remove exact-match sitewide anchor repetition.
7. Audit breadcrumb, footer and contextual links separately; report them in link counts rather than combining without qualification.

## Acceptance criteria

- Every priority URL has at least one contextual in-topic inbound link.
- No priority URL is orphaned through contextual navigation.
- No internal link points to a redirect or missing fragment.
- Search Console exposed pages have descriptive anchor text that matches visitor intent.
