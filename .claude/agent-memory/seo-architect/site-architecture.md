---
name: site-architecture
description: Next.js App Router route structure, existing component map, service slugs, double-redirect bug at root — essential before touching any routing file
metadata:
  type: project
---

# Tolatiles Frontend Site Architecture

**Why:** Needed to design and execute the SEO route consolidation plan — understanding what exists is prerequisite to knowing what to build vs. move vs. redirect.

**How to apply:** Reference these paths whenever editing routing, metadata, schema, or sitemap files. Verify paths still exist before recommending changes.

## Frontend location
`client/` — Next.js 14 App Router. TypeScript throughout.

## Current Route Tree (as of 2026-06-25)

```
client/app/
  page.tsx                          # BUG: redirects to /florida (should serve content)
  layout.tsx                        # Root layout, global LocalBusiness + Organization schema
  sitemap.ts                        # Dynamic sitemap, covers all [location] routes
  not-found.tsx
  privacy-policy/
  terms-of-service/
  [location]/                       # Catches: florida | jacksonville | st-augustine
    page.tsx                        # Location homepage — renders <HomePage location={loc} />
    services/
      [slug]/
        page.tsx                    # Service detail — uses ServiceDetailPage (florida) or ServiceDetailPageLocation (jax/sta)
        projects/
    blog/
      [slug]/
      category/
    about/
    contact/
    faqs/
    gallery/
      [category]/
```

## Key Component Files

| Component | Path |
|-----------|------|
| HomePage (all locations) | `client/components/pages/HomePage.tsx` |
| ServiceDetailPageLocation (jax/sta) | `client/components/pages/ServiceDetailPageLocation.tsx` |
| ServiceDetailPage (florida generic) | `client/components/pages/ServiceDetailPage.tsx` |
| BlogIndexPage | `client/components/pages/BlogIndexPage.tsx` |
| BlogPostPage | `client/components/pages/BlogPostPage.tsx` |
| HomepageSlotsSection (video/BA/grid CMS) | `client/components/projects/HomepageSlotsSection.tsx` |
| Navbar | `client/components/Navbar.tsx` |
| BreadcrumbSchema | `client/components/BreadcrumbSchema.tsx` |

## lib/locations.ts
Exports: `VALID_LOCATIONS = ['florida', 'jacksonville', 'st-augustine']`, `locationNames`, `locationFullNames`, `geoCoordinates`, `areaServed`, `isValidLocation`.

## Service Slug Map (current, already in prod)
| URL Slug | Service ID |
|----------|------------|
| kitchen-backsplash | kitchen-backsplash |
| bathroom-tile | bathroom |
| floor-tile | flooring |
| patio-tile | patio |
| fireplace-tile | fireplace |
| shower-tile | shower |

## Double-Redirect Bug at /
- `next.config.js` has `{ source: '/', destination: '/florida', permanent: true }` — this fires first as a 301
- `client/app/page.tsx` also calls `redirect('/florida')` — this is dead code, never reached
- Both must be changed as part of the root hub consolidation

## Schema Already in Place
- `layout.tsx`: Root `LocalBusiness` schema with `@id: 'https://tolatiles.com/#business'`, plus `Organization` and `SiteNavigationElement`
- `[location]/page.tsx`: Per-location `LocalBusiness` schema injected per page
- `[location]/services/[slug]/page.tsx`: `Service` schema, references `LocalBusiness` by `@id`
- `BreadcrumbSchema` component used on service detail pages

## Sitemap
`client/app/sitemap.ts` — currently gives `priority: 1.0` to all three location homepages (`/florida`, `/jacksonville`, `/st-augustine`). Root `/` is absent. Must add `/` and remove or deprioritize `/florida` after the redirect.
