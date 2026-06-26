---
name: project-location-pages
description: Location page architecture for Jacksonville and St. Augustine — what exists, what was added, and key SEO patterns
metadata:
  type: project
---

Tolatiles has a dynamic `[location]/page.tsx` route that renders city-specific pages for `/jacksonville` and `/st-augustine`. The `/florida` slug redirects to `/`.

## What existed before (already implemented per prior plan.md work)
- Distinct `metadata` (title, description, keywords, canonical) per location in `[location]/page.tsx`
- Distinct LocalBusiness schema (with `areaServed`, `hasOfferCatalog`) per city in `[location]/page.tsx`
- `HomePage` component received a `location` prop and rendered different H1, heroDescription, basePath, serviceAreas, CrossCitySection vs GeoSplitterSection

## What was missing (implemented 2026-06-26)
- **`LocalServicesSection`** — a new section in `HomePage.tsx` that renders ONLY for city pages (`location !== 'florida'`). Contains:
  - H2: "Tile Installation Services in [LocationFullName]" (unique per city, SEO-targeted)
  - Keyword-rich intro paragraph with 6 inline anchor links to each city-specific service page (e.g. `/jacksonville/services/kitchen-backsplash`)
  - 6-card grid with H3s like "Kitchen Backsplash Installation in Jacksonville" for each service
  - City-specific neighborhood copy (Riverside/San Marco for JAX; Historic Downtown/Anastasia Island for St. Aug)
- **Neighborhoods badges** in `LocationSection` — renders `content.neighborhoods` as pill badges under a "Neighborhoods We Serve in [City]" heading. Only shows when `content.neighborhoods.length > 0` (so homepage is unaffected)

## Section render order for city pages
1. HeroSection (city-specific H1 + description)
2. ProjectsStripSection (API-driven, same for all)
3. WhyChooseUsSection (generic brand trust)
4. **LocalServicesSection** (NEW — city-specific, bg-gray-50)
5. CrossCitySection (compact cross-link to the other city)
6. BlogCarouselSection
7. LocationSection (map + address + service areas + neighborhoods NEW)
8. FinalCTASection

## Key files
- `client/components/pages/HomePage.tsx` — all location content + LocalServicesSection
- `client/app/[location]/page.tsx` — metadata + schemas + renders `<HomePage location={location} />`
- `client/lib/locations.ts` — LocationType, VALID_LOCATIONS, helper fns

## Navigation links to city pages
- `GeoSplitterSection` on homepage → `/jacksonville`, `/st-augustine`
- `Footer.tsx` lines 186, 191 → direct city links
- Navbar is location-aware (prefix changes on city pages)

**Why:** Search engines and users couldn't differentiate city pages from homepage. The LocalServicesSection gives each city page 6 unique H3 headings + a keyword-rich intro paragraph with anchor text links — the primary on-page differentiation signal.
