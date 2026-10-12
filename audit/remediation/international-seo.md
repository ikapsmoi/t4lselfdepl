# International India-tour pages

## Local route and content status

The established route structure is `/india-tours/{locale}/`; no competing URL pattern was added. The German, French, and Dutch static sources already exist at:

- `india-tours/de/index.html`
- `india-tours/fr/index.html`
- `india-tours/nl/index.html`

They are substantial localized page implementations, not empty route shells. They include itinerary concepts, contact/enquiry actions, and quote-only language rather than invented prices or availability. The local build emits `dist/india-tours/de/index.html`, `fr/index.html`, and `nl/index.html`.

The final local preview returned HTTP 200 for all three routes. Browser inspection confirmed:

| Route | `lang` | Title | Canonical |
|---|---|---|---|
| `/india-tours/de/` | `de-DE` | `Indien Rundreise individuell planen \| Travel4Life` | `https://travel4life.net/india-tours/de/` |
| `/india-tours/fr/` | `fr-FR` | `Voyage en Inde sur mesure : idées & itinéraires \| Travel4Life` | `https://travel4life.net/india-tours/fr/` |
| `/india-tours/nl/` | `nl-NL` | `Rondreis India op maat plannen \| Travel4Life` | `https://travel4life.net/india-tours/nl/` |

Each route rendered one native-language H1: `Indien Rundreise: Ihre Reise beginnt mit einer Idee.`, `Voyage en Inde : commencez par imaginer votre itinéraire.`, and `Rondreis India: begin met een idee voor uw reis.` Each rendered five `hreflang` alternate links. The locale test suite confirms reciprocal alternates and canonical routes. The `x-default` alternate points to the existing English hub. Content is not approved for publication until native-language editorial review; code-level localization is not proof of native review.

## Sitemap and production status

The actual sitemap generator consumes the page registry. The final local build generated 12 non-empty sitemap groups containing 82 eligible URLs; local sitemap artifact validation passed. The locale routes are registry-eligible and included by the local generator.

Production revalidation failed with 12 issues:

- The live sitemap index omits all three registry-approved locale URLs.
- Direct production requests to all three URLs returned HTTP 404.
- The 404 responses have no expected canonical and are not explicitly `index,follow`.

This is a confirmed local/deployed artifact or routing mismatch, not merely a validator artifact. The repository has no recognized host deployment configuration that identifies whether the missing files are caused by an outdated deployment artifact, hosting routing, or another release configuration. Production deployment access was unavailable, so the precise host-side cause remains unconfirmed.

## Approval and release gate

Do not deploy or request indexing until:

1. Native-language editors review terminology, grammar, itinerary meaning, and enquiry phrasing.
2. The business approves publication and any market-specific contact details.
3. An authorized deployment includes the generated locale files and sitemap.
4. Direct production requests return 200, canonicals and reciprocal alternates resolve, and sitemap entries are canonical, indexable, and successful.
