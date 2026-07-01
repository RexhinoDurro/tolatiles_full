Here is the full implementation plan from the SEO Architect:

---
Tolatiles SEO Implementation Plan

What the audit found

Five core problems:
1. Root redirect is backwards — / currently 301s to /florida, bleeding all backlink equity into a subfolder
2. Service pages are location-buried at /florida/services/{slug} instead of /services/{slug}
3. Video cards are unlinked — HomepageSlotsSection renders project media with no <a> tags
4. WhyChooseUs has no team photo — only icons, nothing for Google's vision algo to confirm you're a real local business
5. Geo-Splitter copy is generic — "View Jacksonville Services" is not keyword-anchored

---
Phase 1 — Route Architecture (Do First, In Isolation)

┌────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│              File              │                                                                           Change                                                                           │
├────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ client/app/page.tsx            │ Remove redirect('/florida'), render <HomePage location="florida" /> with root canonical + meta                                                             │
├────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ client/next.config.js          │ Remove / → /florida redirect. Add: /florida → /, /florida/services/:slug → /services/:slug, /florida/blog/:path* → /blog/:path*, /florida/:path* → /:path* │
├────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ client/app/[location]/page.tsx │ Add guard: if (location === 'florida') redirect('/')                                                                                                       │
├────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ client/app/about/page.tsx      │ CREATE — must exist before wildcard redirect goes live                                                                                                     │
├────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ client/app/contact/page.tsx    │ CREATE                                                                                                                                                     │
├────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ client/app/gallery/page.tsx    │ CREATE                                                                                                                                                     │
├────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ client/app/faqs/page.tsx       │ CREATE                                                                                                                                                     │
├────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ client/app/blog/page.tsx       │ CREATE                                                                                                                                                     │
├────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ client/app/layout.tsx          │ Update all siteNavigationSchema URLs from /florida/* to root paths                                                                                         │
└────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

Root homepage meta:
- Title: "Tile Installer Jacksonville & St. Augustine FL | Expert Installation | Tola Tiles"
- H1: "Tile Installer Jacksonville & St. Augustine, FL — Expert Installation"
- Canonical: https://tolatiles.com/

---
Phase 2 — Homepage Component Updates

┌───────────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             File                              │                                                           Change                                                            │
├───────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────┤
│ client/components/projects/HomepageSlotsSection.tsx           │ Wrap each video card overlay title in <Link href="/services/{slug}"> with anchor text like "View Custom Shower Tile         │
│                                                               │ Installation"                                                                                  │
├───────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ client/components/pages/HomePage.tsx — WhyChooseUsSection     │ Add <Image src="webp" alt="The Tola Tiles expert installation team" /> before icon grid        │
├───────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ client/components/pages/HomePage.tsx — ServiceAreasSection    │ Change CTA text:n Jacksonville, FL" and "Explore Tile Installation in St. Augustine, FL"       │
├───────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ client/components/pages/HomePage.tsx —                        │ Change from '/fl go to root paths                                                              │
│ floridaContent.basePath                                       │                                                                                                                             │
└───────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────┘

▎ Note: The backend HomepageSlot model needs a service_category field added to Djae their link target.

---
Phase 3 — Service Pages

┌───────────────────────────────────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                         File                          │                                   Change                                                                │
├───────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ client/app/services/[slug]/page.tsx                   │ CREATE — root-level dynachen-backsplash, bathroom-tile, floor-tile, patio-tile, fireplace-tile,         │
│                                                       │ shower-tile                                                                                                                          │
├───────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ client/app/services/page.tsx                          │ CREATE — services index listing all 6                                                                                                │
├───────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ client/components/pages/ServiceDetailPage.tsx         │ Add bottom utility block: "Proudly serving Northeast Florida. [service] in [Jacksonville → /jacksonville/services/{slug}] and [St.   │
│                                                       │ Augustine → /st-augustin                                                                                │
├───────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ client/components/pages/ServiceDetailPageLocation.tsx │ Update cross-link from /ervices/{slug}                                                                  │
└───────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

▎ Slug note: Keep patio-tile and shower-tile — do not rename to patio-outdoor/shower-installation. Existing slugs likely have backlinks; renaming adds a redirect chain for no ranking gain.

---
Phase 4 — Location Pages

┌───────────────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                       File                        │                                                                 Change                                                                  │
├───────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ client/components/pages/HomePage.tsx —            │ Add keyword-linked paragraph: "We specialize in transforming residential spaces across Duval County, offering flawless [kitchen         │
│ LocalServiceAreasSection                          │ backsplash installation → /jbacksplash], [shower tile installation → ...], ..."                            │
├───────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ client/components/pages/HomePage.tsx — cross-city │ Update to "Explore Tile Inst" / "...Jacksonville, FL"                                                      │
│  CTA                                              │                                                                                                                                         │
├───────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ client/app/[location]/page.tsx — canonical        │ Change florida canonical from /florida to / after redirect is live                                                                      │
├───────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ client/app/layout.tsx — localBusinessSchema       │ Fix: standardize email to menitola@tolatiles.com, verify postal code, add "@type": ["LocalBusiness", "HomeAndConstructionBusiness"]     │
└───────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

---
Phase 5 — Blog (3 Seed Articles via Django Admin)

┌─────────────────────────────────────────────────┬────────────────────────────────────────────────────────┬──────────────┬───────────────────────────────────────────────────────────────────┐
│                     Article                     │                          Slug cation Tag │                           Internal Link                           │
├─────────────────────────────────────────────────┼────────────────────────────────────────────────────────┼──────────────┼───────────────────────────────────────────────────────────────────┤
│ "Choosing the Right Grout and Tile for          │ grout-tile-high-humidity-floriorida      │ "patio tile installation" → /services/patio-tile                  │
│ High-Humidity Florida Patios"                   │                                                        │              │                                                                   │
├─────────────────────────────────────────────────┼──────────────────────────────────────────┼───────────────────────────────────────────────────────────────────┤
│ "How to Modernize a Historic San Marco Kitchen  │ modernize-san-marco-kitchen-backsplash                 │ jacksonville │ "kitchen backsplash installation in Jacksonville" →               │
│ with a Bold Backsplash"                         │                                          │ /jacksonville/services/kitchen-backsplash                         │
├─────────────────────────────────────────────────┼────────────────────────────────────────────────────────┼──────────────┼───────────────────────────────────────────────────────────────────┤
│ "Schluter Systems vs. Traditional Mud Beds: How │ schluter-vs-mud-bed-waterproof-augustine │ "shower tile installation in St. Augustine" →                     │
│  We Waterproof St. Augustine Showers"           │                                                        │              │ /st-augustine/services/shower-tile                                │
└─────────────────────────────────────────────────┴──────────────────────────────────────────┴───────────────────────────────────────────────────────────────────┘

Each post needs FAQ schema (3–4 Q&A pairs) and a primary_service_slug field to pow

---
Phase 6 — Technical SEO Checklist

- client/app/sitemap.ts — Remove all /florida/* entries, add /services/{slug} at priority 0.9, add root static pages at 0.8–0.9
- client/app/faqs/page.tsx — Add FAQPage schema with 6–8 Q&A pairs
- client/public/robots.txt — CREATE if missing: Allow: /, Sitemap: https://tolatiles.com/sitemap.xml
- client/components/Navbar.tsx — Fix homeLink: currentLocation === 'florida' ? '/'

---
Priority Order

1. Flip the root redirect (highest leverage, do standalone)
2. Create root /services/[slug] route + update ServiceDetailPage cross-links
3. Geo-Splitter CTA copy + Location page keyword-linked paragraph
4. Hero H1 + basePath fix
5. Schema data errors (email, postal code, @type)
6. HomepageSlotsSection links (needs backend field first)
7. Team photo (needs the actual photo asset)
8. Blog seed articles (content work)
9. Sitemap + robots.txt + FAQPage schema

✻ Crunched for 7m 4s









---
Phase 1 — Route Architecture (done)
- app/page.tsx — renders <HomePage location="florida" /> at root with keyword-optinstaller Jacksonville & St. Augustine, FL — Expert Installation"
---
Phase 1 — Route Architecture (done)
- app/page.tsx — renders <HomePage location="florida" /> at root with keyword-optimized meta; H1 is now "Tile Installer Jacksonville & St. Augustine, FL — Expert Installation"
- next.config.js — removed / → /florida; added 10 permanent redirects from /florida/* → root equivalents
- [location]/page.tsx — adds redirect('/') guard when location is 'florida'; canon
- app/layout.tsx — siteNavigation URLs fixed to root paths; email fixed to menitola@tolatiles.com; postal code fixed to 32084; @type updated to ["LocalBusiness", "HomeAndConstructionBusiness"]

Phase 2 — Homepage Components (done)
- floridaContent.basePath changed from '/florida' to '' so all internal links go t
- ServiceAreasSection CTA text changed from "View Jacksonville Services" to "Explore Tile Installation in Jacksonville, FL"

Phase 3 — Root Service Pages (done)
- Created app/services/page.tsx and app/services/[slug]/page.tsx
- Fixed ServiceDetailPage.tsx to use root paths (/services/, /gallery/, /contact) for florida
- Fixed ServiceDetailPageLocation.tsx cross-link from /florida/services/ to /services/

Phase 6 — Technical SEO (done)
- sitemap.ts — root / and root service/gallery/blog/static pages added; florida ciay
- robots.txt — added Disallow: /florida/ to save crawl budget
- Navbar.tsx — homeLink and all nav paths use root prefix for florida
- Footer.tsx — basePath fixed for florida; "All Florida Services" links to /

✻ Baked for 1m 44s