---
name: project-seo-plan-status
description: Status of plan.md SEO implementation phases — what is done vs outstanding
metadata:
  type: project
---

Reference: `plan.md` in project root.

## Phase 1 — Route Architecture
- Root page.tsx renders `<HomePage location="florida" />` ✓
- `/florida` redirects to `/` in `[location]/page.tsx` ✓
- `floridaContent.basePath` = `''` ✓
- `about/`, `contact/`, `gallery/`, `faqs/`, `blog/` page stubs created ✓

## Phase 2 — Homepage Component Updates
- `GeoSplitterSection` CTA text: "Explore Tile Installation in {city.name}, FL" ✓
- Service video cards linking (HomepageSlotsSection) — OUTSTANDING (needs backend `service_category` field)
- Team photo in WhyChooseUsSection — photo grid already implemented ✓

## Phase 3 — Service Pages (MAJOR UPDATE 2026-06-26)
- Root `/services/[slug]` route — IMPLEMENTED ✓
- Per-service visual themes (6 distinct color schemes) — IMPLEMENTED 2026-06-26 ✓
- Per-service unique H1s using keywordBase — IMPLEMENTED 2026-06-26 ✓
- Materials & Styles section per service — IMPLEMENTED 2026-06-26 ✓
- FAQ accordion per service (5 Q&As each) — IMPLEMENTED 2026-06-26 ✓
- FAQPage schema JSON-LD in both `/services/[slug]/page.tsx` and `/[location]/services/[slug]/page.tsx` — IMPLEMENTED 2026-06-26 ✓
- Service-specific process steps — IMPLEMENTED 2026-06-26 ✓
- `ServiceDetailPageLocation.tsx` full visual theme + new sections — IMPLEMENTED 2026-06-26 ✓
- New data file: `client/data/serviceDetails.ts` — CREATED 2026-06-26 ✓

## Phase 4 — Location Pages
- `LocalServicesSection` with keyword-linked paragraph — IMPLEMENTED 2026-06-26
- Neighborhoods badges in `LocationSection` — IMPLEMENTED 2026-06-26
- Cross-city CTA text updated — ✓ already present
- `localBusinessSchema @type` array in layout.tsx — ✓ already correct

## Phase 5 — Blog Seed Articles
- 3 articles (grout/humidity, San Marco backsplash, Schluter showers) — OUTSTANDING (Django admin)

## Phase 6 — Technical SEO
- sitemap.ts — root services + city services already included ✓
- robots.txt — exists in public/ ✓
- FAQPage schema in `/services/[slug]/page.tsx` — IMPLEMENTED 2026-06-26 ✓
- FAQPage schema in `/faqs/page.tsx` — IMPLEMENTED ✓ (was already present; memory was stale)
- Navbar homeLink fix — already correct ✓

## Gallery SEO (NEW — 2026-06-26)
- ImageGallery schema on `/gallery/page.tsx` — IMPLEMENTED ✓
- BreadcrumbList schema on `/gallery/[category]/page.tsx` — IMPLEMENTED ✓
- ImageGallery schema per category on `/gallery/[category]/page.tsx` — IMPLEMENTED ✓
- Per-category meta titles + descriptions (keyword-rich) — IMPLEMENTED ✓
- Static gallery image data (`gallery.ts`) — unique keyword-rich titles & descriptions per image ✓

## Priority Outstanding Items
1. Blog seed articles (Phase 5) — content work in Django admin
2. FAQPage schema in `/faqs/page.tsx` (Phase 6)
3. HomepageSlotsSection links (needs backend `service_category` field)
