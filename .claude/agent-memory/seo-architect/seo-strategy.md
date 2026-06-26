---
name: seo-strategy
description: Decided SEO architecture — root hub at /, /florida redirects to /, service URL structure, internal link matrix, Geo-Splitter copy, WhyChooseUs team photo requirement
metadata:
  type: project
---

# Core SEO Strategy Decisions (2026-06-25)

**Why:** User provided a detailed brief; these decisions shape every file-level change. Record here so future sessions start with full context.

**How to apply:** Any routing, content, or schema work should align with these decisions. If a proposed change conflicts, flag it.

## Root Hub Consolidation
- `/` becomes the true homepage — serves content directly (no redirect)
- `/florida` → 301 redirect to `/`
- `/florida/services/[slug]` → 301 redirect to `/services/[slug]`
- New route `client/app/services/[slug]/page.tsx` created for root-level service pages
- `/jacksonville` and `/st-augustine` remain unchanged as city hub pages
- Canonical in root layout: `https://tolatiles.com/`
- Root `LocalBusiness` schema `@id` stays `https://tolatiles.com/#business` (already correct)

## Internal Link Matrix
```
/ (hub)
├── /jacksonville (city hub)
│   └── /jacksonville/services/{slug} (geo service pages)
├── /st-augustine (city hub)
│   └── /st-augustine/services/{slug} (geo service pages)
└── /services/{slug} (root service pages, canonical)
```

- Homepage → /jacksonville + /st-augustine via Geo-Splitter buttons
- Location pages → /services/{slug} in body copy (keyword-linked)
- Service pages → /jacksonville + /st-augustine in bottom utility block
- Blog posts → /services/{slug} in-content links (per content strategy)

## Geo-Splitter Button Copy (replaces generic "Locations" text)
- Button 1: "Explore Tile Installation in Jacksonville, FL" → /jacksonville
- Button 2: "Explore Tile Installation in St. Augustine, FL" → /st-augustine
This is the existing `ServiceAreasSection` component — the CTA Link text inside each area card needs this copy upgrade.

## WhyChooseUs Section — Team Photo Requirement
Currently `WhyChooseUsSection` in `HomePage.tsx` is icon-only (Award, Users, Clock, CheckCircle icons).
A real team photo must be added with:
`alt="The Tola Tiles expert installation team"`
This signals real local business to Google's vision algorithm.

## HomepageSlotsSection — Semantic Link Wrappers
Each slot rendered by `HomepageSlotsSection` (video cards, before/after) must wrap the project title/media in a `<Link>` pointing to the relevant `/services/{slug}` page.
- E.g. shower project card → `<Link href="/services/shower-tile">View Custom Shower Project</Link>`
- This passes homepage equity to service pages

## Service URL Slugs — Keep Current, Do NOT Change
Brief proposed `patio-outdoor` and `shower-installation` but current slugs are `patio-tile` and `shower-tile`. Keep current slugs — they are already indexed and in the sitemap. Adding redirects for vanity slug changes creates unnecessary redirect chains.

## Meta Title Patterns by Page Type
| Page Type | Pattern |
|-----------|---------|
| Homepage `/` | "Tile Installer Jacksonville & St. Augustine, FL | Tola Tiles" |
| /jacksonville | "Tile Installer Jacksonville FL | Tile Installation & Tile Installers Jax | Tola Tiles" |
| /st-augustine | "Tile Installer St Augustine FL | Tile Installation & Tile Installers | Tola Tiles" |
| /services/{slug} | "{Service Name} Jacksonville & St. Augustine, FL | Tola Tiles" |
| /{loc}/services/{slug} | "{Service Name} {City} FL - Expert Installation | Tola Tiles" |
| Blog post | "{Post Title} | Tola Tiles" |

## Location Page Body Copy Pattern
"We specialize in transforming residential spaces across [County] Name], offering flawless [keyword-linked-service-name](/services/{slug}) designed for Florida coastal homes."

## Service Page Bottom Block Copy
"Proudly serving homeowners across Northeast Florida. View our recent [service] projects in [Jacksonville](/jacksonville) and [St. Augustine](/st-augustine)."
