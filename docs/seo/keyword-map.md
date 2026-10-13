# SEO Keyword-to-URL Map

This keyword map is the single source of truth for the high-intent Travel4Life clusters covered by the repo's SEO and intent architecture. It intentionally maps search intent to the most defensible URL, not to the highest possible page count. Where live inventory or verified supply is missing, the page remains a planning guide rather than a product claim.

## Guardrails

- Preserve existing canonical URLs and primary landing pages.
- Do not create duplicate pages for each keyword variant.
- Only publish a dedicated page when the intent, content depth, and conversion path materially differ.
- Keep official festival, resort, and legal information sourced and clearly attributable.
- Use the static route or intent-owned page already implemented in the site when it matches the user need.

## Priority A — Tomorrowland travel packages

| Search intent cluster | Representative queries | Primary URL | Page type | Ownership notes |
| --- | --- | --- | --- | --- |
| Tomorrowland discovery | Tomorrowland travel planning from India, Tomorrowland trip from India | `/tomorrowland/` | Hub | Primary discovery page |
| Tomorrowland package research | Tomorrowland packages from India, Tomorrowland package planning | `/tomorrowland/packages/` | Package research | Distinct commercial due-diligence intent |
| B2B package enquiry | Tomorrowland B2B packages, travel agent packages India | `/tomorrowland/b2b-travel-agent-packages/` | B2B enquiry | Kept separate from consumer planning |
| Belgium planning | Tomorrowland Belgium from India, Tomorrowland Belgium travel guide | `/tomorrowland/belgium/` | Guide | Focused destination planning |
| Belgium package due diligence | Tomorrowland Belgium travel package from India | `/tomorrowland/belgium/packages/` | Package checklist | Not a live offer page |
| Winter planning | Tomorrowland Winter from India, Tomorrowland Winter travel guide | `/tomorrowland/winter/` | Guide | Evergreen destination guide |
| Thailand planning | Tomorrowland Thailand from India | `/tomorrowland/thailand/` | Guide | Official pages linked as evidence |
| Budget methodology | Tomorrowland trip cost from India, festival travel budget | `/tomorrowland/cost-from-india/` | Cost guide | No fabricated price claims |
| India logistics | How to go to Tomorrowland from India | `/tomorrowland/from-india/` | Planning guide | Departure logistics only |
| Destination compare | Belgium vs Winter vs Thailand | `/tomorrowland/compare/` | Comparison | Consolidated comparison page |
| Accommodation planning | Tomorrowland accommodation planning | `/tomorrowland/accommodation/` | Planning guide | Distinct from package sales |
| Group travel | Tomorrowland group travel from India | `/tomorrowland/group-travel/` | Planning guide | Shared travel coordination |
| Flight planning | Flights from India to Tomorrowland | `/tomorrowland/flights-from-india/` | Planning guide | Transport research only |
| Visa and doc prep | Tomorrowland visa and documents for Indians | `/tomorrowland/visa-documents/` | Checklist | Official authorities linked |
| Package vs independent | Festival package vs independent travel | `/tomorrowland/package-vs-independent/` | Decision guide | Explains trade-offs, not pricing |

### Ownership rules

- Every Tomorrowland landing page owns one primary intent cluster.
- Origin-city pages (Delhi, Mumbai, Bengaluru, etc.) are intentionally excluded unless Query Console evidence and a distinct service proposition justify them.
- Year-specific or unsupported micro-pages are consolidated to the evergreen guide to avoid thin content and unsupported inventory claims.

## Priority B — Jim Corbett travel and accommodation

| Search intent cluster | Representative queries | Primary URL | Page type | Ownership notes |
| --- | --- | --- | --- | --- |
| Corbett hub | Jim Corbett holiday packages, Jim Corbett resorts | `/jim-corbett/` | Destination hub | Supported by a single destination hub |
| Resort packages | Jim Corbett resort packages, Jim Corbett resorts with packages | `/jim-corbett/resorts/` | Resort package overview | Route for package and resort pricing leads |
| Weekend packages | Jim Corbett weekend packages from Delhi NCR | `/jim-corbett/weekend-packages/` | Origin-led guide | Separate intent if departure logic is clear |
| Safari and resort planning | Jim Corbett safari and resort packages | `/jim-corbett/safari-resorts/` | Planning page | Not a guaranteed safari inventory claim |
| Family and couple stays | Jim Corbett family holiday packages, Jim Corbett couple packages | `/jim-corbett/family-couple/` | Segment page | Need actual booking fit |
| Corporate offsites | Jim Corbett corporate offsite packages, team outings | `/jim-corbett/corporate/` | MICE/Corporate page | Separate from leisure packages |
| Weddings | Jim Corbett wedding resorts, destination wedding packages | `/jim-corbett/weddings/` | Wedding landing page | Clear service boundary |
| Luxury stays | Jim Corbett luxury resort packages | `/jim-corbett/luxury/` | Luxury segment | Should be inventory-backed or clearly planning-only |
| MICE and events | Jim Corbett conference packages, event enquiry | `/jim-corbett/mice/` | Event services page | Distinct from leisure and wedding intent |

### Corbett caveats

- Do not claim resort partnerships, room inventory, or safari permit availability without verified supply and operational permissions.
- If a property page is added, it must clearly state Travel4Life's role and what is confirmed versus offered as a planning service.
- Destination and resort pages should link to the enquiry flow, not to fabricated booking details.

## Priority C — MICE, corporate events and destination wedding pages

| Search intent cluster | Representative queries | Primary URL | Page type | Ownership notes |
| --- | --- | --- | --- | --- |
| Corporate retreats | corporate offsite in Jim Corbett, company team outing | `/mice/` | MICE hub | Dedicated B2B conversion path |
| Destination weddings | Jim Corbett destination wedding packages | `/weddings/` or `/jim-corbett/weddings/` | Wedding guide | Clear service explanation |
| Wedding guest accommodation | wedding resorts in Jim Corbett | `/jim-corbett/weddings/` | Wedding planning | Should not imply guaranteed property control |
| Group logistics | wedding guest logistics, team outing planning | `/mice/`, `/jim-corbett/corporate/` | Service pages | Support the planning to proposal journey |

## International and inbound search clusters

| Search intent cluster | Representative queries | Primary URL | Page type | Ownership notes |
| --- | --- | --- | --- | --- |
| Europe discovery | Europe tours, Europe tour packages | `/europe/` | Hub | Only one hub under current evidence |
| Europe from India | Europe tours from India, Europe tour packages from India | `/europe/tours-from-india/` | Authority page | Planned when there is differentiated, market-specific content |
| Europe cost | Europe trip cost, Europe tour cost | `/europe/tour-cost/` | Price guide | Full budgeting guidance only with verified offer data |
| Budget tiers | Europe under 2 lakh, Europe budget tour | `/europe/tours-under-200000/` | Budget page | Requires matching live inventory |
| Love/romance | Europe honeymoon packages | `/europe/honeymoon/` | Segment page | Only with real product signals | 
| Family travel | Europe family tours | `/europe/family-tours/` | Segment page | Separate intent only when actual lead fits |
| Luxury | Europe luxury tours | `/europe/luxury-tours/` | Premium page | Keep high quality and conversion path |

## Current page ownership rules

1. One page should own one primary query family.
2. Indexable pages must not be near duplicates of each other.
3. Related query clusters should direct to the primary page; do not create a new URL for each keyword phrase.
4. If a page lacks verified product inventory, it should remain an editorial, planning, or enquiry page with a clear CTA.
5. High-intent commercial pages must be supported by a safe conversion path (WhatsApp, phone, email, or enquiry form).

## Canonicalization note

The site uses a stable URL structure and a single canonical destination for each intent cluster. No blanket canonical tag is applied across unrelated pages; canonical ownership stays at the page level and is validated as part of the static SEO checks.
