# 03 — UI, UX, and responsive audit

**Date:** 12 October 2026  
**Method:** browser rendering of local Vite development pages; DOM viewport-width checks. This is not a full manual accessibility certification.

## Viewport checks

| Local route | 320 | 360 | 390 | 430 | 768 | 1366 | 1440 | 1920 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| `/india-tours/` | **Overflow** | **Overflow** | Pass | Pass | Pass | Pass | Pass | Pass |
| `/india-tours/de/` | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| `/india-tours/fr/` | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| `/india-tours/nl/` | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass |

“Pass” here means only that `document.documentElement.scrollWidth` did not exceed the viewport width during the check; it does not certify all visual or accessibility requirements.

## Confirmed issue

At 320 px, the India-tour hub document is 346 px wide; the header's right-hand control group reaches 346 px while the viewport is 320 px. At 360 px the route also reported horizontal overflow. The relevant header layout is in [`src/india-tours/components/Header.tsx`](../src/india-tours/components/Header.tsx), where the logo and a non-wrapping right control group share a row. Root issue ID: AUD-03.

**Impact:** mobile users can get a horizontal page scroll and clipped header controls. The issue is limited to the tested narrow viewport sizes and local hub rendering.

**Recommended fix:** make the header controls fit or wrap at narrow widths; validate at 320 and 360 px after change.

## Visual and accessibility limitations

- New locale pages rendered at all checked widths with no document-level horizontal overflow.
- Keyboard-only navigation, color contrast measurements, screen-reader announcements, touch target measurements, reduced-motion behavior, and form error states were not comprehensively tested.
- No saved screenshot files were produced. Browser screenshots were used for visual inspection but remain session-only.
- Admin screens, modals, booking forms, and dynamic trip detail pages were not visually inspected at all target widths.

