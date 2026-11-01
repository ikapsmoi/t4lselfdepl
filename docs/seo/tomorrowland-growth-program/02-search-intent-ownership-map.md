# Search Intent Ownership Map

## Existing canonical owners

| Intent group | Primary URL | Supporting URLs | Funnel stage |
|---|---|---|---|
| Tomorrowland packages from India | `/tomorrowland/packages/` | `/tomorrowland/`, `/tomorrowland/from-india/` | Commercial |
| Belgium packages | `/tomorrowland/belgium/packages/` | `/tomorrowland/belgium/`, `/tomorrowland/flights-from-india/` | Commercial |
| Thailand packages | `/tomorrowland/thailand/` | `/tomorrowland/packages/`, `/tomorrowland/cost-from-india/`, `/tomorrowland/flights-from-india/` | Commercial |
| Winter packages | `/tomorrowland/winter/` | `/tomorrowland/packages/`, `/tomorrowland/accommodation/` | Commercial |
| Cost from India | `/tomorrowland/cost-from-india/` | edition pages and flights | Informational with commercial CTA |
| Flights | `/tomorrowland/flights-from-india/` | edition pages and from India | Informational |
| Accommodation | `/tomorrowland/accommodation/` | Belgium/Winter/Thailand pages | Informational |
| Tickets | `/tomorrowland/tickets/` | edition pages and official sources | Informational |
| Package vs independent | `/tomorrowland/package-vs-independent/` | packages and cost | Informational |
| Visa and documents | `/tomorrowland/visa-documents/` | from India | Informational |

## Query assignments

| Query family | Owner | Content gap | Required improvement |
|---|---|---|---|
| tomorrowland packages from india, package, holiday packages | `/tomorrowland/packages/` | Commercial completeness | Edition comparison, verified India logistics, quote process, inclusions/exclusions |
| tomorrowland thailand packages from india | `/tomorrowland/thailand/` | Immediate commercial signal | India-origin CTA, cost components, package enquiry and ticket-status caveat |
| tomorrowland cost from india, price, INR, budget | `/tomorrowland/cost-from-india/` | Full-trip budget ownership | Ticket, flight, stay, transport, visa and conversion methodology |
| tomorrowland belgium packages/package from india | `/tomorrowland/belgium/packages/` | Weak commercial depth | Dedicated package evidence, inclusion checklist and quote journey |
| tomorrowland winter packages/cost/Alpe d'Huez | `/tomorrowland/winter/` | Edition freshness and click intent | Dated edition status, price disclaimers, package CTA |
| tomorrowland tickets and ticket information | `/tomorrowland/tickets/` | Official-source clarity | Separate official ticket channels from Travel4Life travel services |

## Migration decision

Do not create the proposed `/packages-from-india/`, `/thailand/packages-from-india/`, `/belgium/packages-from-india/` and `/winter/packages-from-india/` URLs automatically. Equivalent canonical owners already exist. Create new URLs only if query-to-page evidence shows that an existing page cannot satisfy the intent, and document redirects, canonicals, sitemap membership and internal links before implementation.
