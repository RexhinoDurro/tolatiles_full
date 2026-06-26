---
name: blog-infrastructure
description: Blog is Django-backed CMS, location field on posts, BlogIndexPage/BlogPostPage components already built, 3 seed articles targeted for content strategy
metadata:
  type: project
---

# Blog Infrastructure

**Why:** Understanding the blog system is needed to structure seed articles correctly and advise on the Django admin content fields.

**How to apply:** When writing seed article briefs or advising on blog SEO, reference the existing field structure so content enters the right fields.

## Architecture
- Backend: Django `server/blog/` app — posts have `slug`, `location`, `publish_date`, `last_updated`, `featured_image`, `featured_image_alt`, `reading_time`, `excerpt`, `content` (HTML), `categories` (M2M), `has_faq_schema`, `faq_data` (JSON)
- Frontend: `BlogIndexPage.tsx`, `BlogPostPage.tsx`, `BlogCategoryPage.tsx`
- Routes: `/{location}/blog/`, `/{location}/blog/{slug}`, `/{location}/blog/category/{cat-slug}`
- Sitemap: fetches from `/api/blog/posts/sitemap_data/` — each post has a `location` field that determines URL prefix

## Location Field on Posts
Post URL is determined by the post's `location` field in the Django model (`/api/blog/posts/sitemap_data/` returns `post.location`). The frontend renders the post at `/{post.location}/blog/{post.slug}`. Posts should be assigned to the most relevant location; they appear on that location's blog index.

## 3 Seed Articles (priority order)
1. "Choosing the Right Grout and Tile for High-Humidity Florida Patios"
   - Target slug: `grout-tile-high-humidity-florida-patios`
   - Location: florida (visible on all blog indexes)
   - Service link: /services/patio-tile (in-body link in first 200 words)
   - Category: Outdoor Tile, Installation Tips
   - FAQ schema: Yes — include 3 PAA-style Qs about humidity/grout

2. "How to Modernize a Historic San Marco Kitchen with a Bold Backsplash"
   - Target slug: `modernize-san-marco-kitchen-backsplash`
   - Location: jacksonville
   - Service link: /jacksonville/services/kitchen-backsplash (in-body)
   - Category: Kitchen Backsplash, Jacksonville
   - FAQ schema: Yes

3. "Schluter Systems vs. Traditional Mud Beds: How We Waterproof St. Augustine Showers"
   - Target slug: `schluter-vs-mud-bed-waterproofing-st-augustine-showers`
   - Location: st-augustine
   - Service link: /st-augustine/services/shower-tile (in-body)
   - Category: Shower Tile, St. Augustine
   - FAQ schema: Yes

## SEO Fields to Fill Per Post (Django Admin)
- `meta_title`: Follow pattern "{Post Title} | Tola Tiles"
- `meta_description`: 150–160 chars, include city + service keyword
- `featured_image_alt`: Descriptive alt text with location + service keyword
- `has_faq_schema`: True for all 3 seeds
- `faq_data`: 3–5 Q&A pairs as JSON array `[{"question": "...", "answer": "..."}]`
