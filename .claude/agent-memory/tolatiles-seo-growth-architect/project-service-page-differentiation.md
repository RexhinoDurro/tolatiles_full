---
name: project-service-page-differentiation
description: Architecture decisions for making each service page visually + content unique — implemented 2026-06-26
metadata:
  type: project
---

## What was built (2026-06-26)

Tolatiles had 6 service pages (`kitchen-backsplash`, `bathroom`, `flooring`, `patio`, `fireplace`, `shower`) that all rendered with identical blue color schemes and no unique content sections. Google would have treated them as near-duplicate templates.

### New data file
`client/data/serviceDetails.ts` — exports `serviceDetailsMap` with per-service:
- `keywordBase` — SEO-targeted H1 base phrase (location suffix appended by component)
- `whyHeading` / `whySubtitle` — service-specific "Why Choose Us" headings
- `materials[]` — 6 tile material cards per service
- `faqs[]` — 5 Q&As per service (renders accordion UI + FAQPage schema)
- `processSteps[]` — 4 installation steps per service (unique to each service type)

### Visual theme system
`serviceThemes` object defined directly in `ServiceDetailPage.tsx` and `ServiceDetailPageLocation.tsx` (NOT in data files — Tailwind must see class strings statically in components/ dir). Maps 6 service IDs to 13-property theme objects.

**Color palette by service:**
- `kitchen-backsplash` → amber/orange (warm food-kitchen feel)
- `bathroom` → teal/cyan (clean/spa feel)
- `flooring` → stone/slate (grounded/earthy feel)
- `patio` → green/emerald (outdoor/nature feel)
- `fireplace` → red/rose (warmth/heat feel)
- `shower` → sky/blue (water/refresh feel)

### New page sections added to both ServiceDetailPage.tsx and ServiceDetailPageLocation.tsx
1. **Materials & Styles section** (white bg, 3-col grid) — after Features, before Service Areas
2. **FAQ Accordion section** (white bg, accordion) — after Process steps
3. Updated H1 uses `keywordBase` from serviceDetailsMap
4. "Why Choose Us" heading is now service-specific
5. Process steps are now service-specific (not generic 4-step template)

### Schema
FAQPage schema (JSON-LD) added to server components:
- `app/services/[slug]/page.tsx`
- `app/[location]/services/[slug]/page.tsx`

### H1 strategy
Root pages: `${keywordBase} in Northeast Florida`
Location pages: `${keywordBase} in ${locationName}`

Examples:
- "Expert Kitchen Backsplash Tile Installation in Jacksonville"
- "Professional Bathroom Tile Installation in St. Augustine"
- "Durable Floor Tile Installation in Northeast Florida"

### Meta title strategy
Format: `${keywordBase} Jacksonville & St. Augustine FL | Tola Tiles`

**Why:** Google was likely detecting duplicate template patterns across service pages. Unique color schemes, unique content sections, unique H1s, and FAQPage schema make each page clearly differentiated by topic and intent.

**How to apply:** When adding new service types, add an entry to `serviceDetailsMap` and a matching entry to `serviceThemes` in both component files. Do NOT put Tailwind class strings in `serviceDetails.ts` — they won't be scanned by Tailwind (data/ dir not in tailwind.config.js content array).
