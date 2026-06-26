# FAQ SEO + YouTube Embed Changes

## What was done

### 1. FAQ System — Database-Backed with Admin CRUD

**Why:** FAQs were static TypeScript — no way to manage them without code deploys, and no schema markup for Google rich results.

**Django (server/faqs/)**
- New app: `FAQ` model with `question`, `answer`, `category` (5 choices), `order`, `is_active`
- `FAQViewSet`: public reads filtered to `is_active=True`, admin writes require `IsAdminUser`
- Seeded 25 FAQs across 5 categories via migration `0002_seed_faqs.py`
- Added `'faqs'` to `INSTALLED_APPS`, mounted at `/api/faqs/`
- **Pending:** run `python manage.py migrate faqs` on server

**Next.js (client/)**
- `client/app/faqs/page.tsx` — server component, fetches from API (`revalidate: 300`), static fallback if API fails, FAQPage + BreadcrumbList JSON-LD schemas
- `client/app/[location]/faqs/page.tsx` — same but location-specific metadata + breadcrumbs
- `client/components/pages/FAQsPage.tsx` — now accepts `initialFAQs: SiteFAQ[]` (was static import), added "Browse by Service" section with 6 links, inline microdata (`itemScope`/`itemProp`)
- `client/app/admin/faqs/page.tsx` — full CRUD: list, create, edit, delete, toggle active, filter by category
- FAQ removed from Navbar (still SEO-reachable via footer + service page links)
- Footer link text changed to "Tile Installation FAQs" (keyword-rich)
- Service pages (`ServiceDetailPage.tsx`, `ServiceDetailPageLocation.tsx`) each got a FAQ CTA section linking to `/faqs`
- Admin sidebar: FAQs link added with `HelpCircle` icon
- Sitemap priority: FAQs bumped from 0.7 → 0.8

**Type note:** FAQ types are named `SiteFAQ` / `SiteFAQCreate` / `SiteFAQUpdate` / `FAQCategorySlug` to avoid collision with existing `FAQItem` type (used by blog inline FAQs/FAQEditor in `types/api.ts`).

---

### 2. YouTube Embed Support for Project Media

**Why:** YouTube videos are indexed separately by Google (VideoObject rich results), load faster than self-hosted files, and improve SERP appearance.

**Django (server/projects/)**
- `ProjectMedia.file` made nullable (`null=True, blank=True`)
- Added `youtube_url = URLField(...)` field
- `media_type` choices extended: `'image' | 'video' | 'youtube'`
- `save()` auto-sets `media_type='youtube'` when `youtube_url` is set
- Model properties: `youtube_video_id`, `youtube_embed_url`, `youtube_thumbnail`
- `ProjectMediaSerializer`: exposes `youtube_url`, `youtube_embed_url`, `youtube_thumbnail`
- `phase_media` POST view: accepts `youtube_url` OR `file`, returns 400 if neither
- Migration: `server/projects/migrations/0003_projectmedia_youtube.py`
- **Pending:** run `python manage.py migrate projects` on server

**Next.js (client/)**
- `client/types/api.ts` — `ProjectMedia.file` changed to `string | null`, added `youtube_url`, `youtube_embed_url`, `youtube_thumbnail` fields; `cover_media_type` includes `'youtube'`
- `client/lib/api.ts` — added `addYouTubeMedia(projectId, phaseId, youtubeUrl, altText?)` method + FAQ CRUD methods
- `client/components/admin/projects/YouTubeUploader.tsx` — toggle button → URL input, validates YouTube URL with regex before submitting
- `client/components/admin/projects/MediaDragGrid.tsx` — `YouTubeUploader` added alongside file upload button; `onYouTubeAdd` prop threaded through
- `client/components/admin/projects/PhaseEditor.tsx` — `onMediaYouTubeAdd` prop added
- `client/components/admin/projects/PhaseDragList.tsx` — `onMediaYouTubeAdd` prop threaded through
- `client/components/admin/projects/ProjectEditor.tsx` — `handleYouTubeAdd` callback calls `api.addYouTubeMedia()`
- `client/components/admin/projects/MediaItem.tsx` — YouTube type shows thumbnail + red play button overlay + "YT" badge
- `client/components/admin/projects/DisplayStyleModal.tsx` — all `src={m.file}` → `src={m.file ?? undefined}`, YouTube type shows thumbnail
- `client/components/admin/projects/LivePreviewCard.tsx` — same null-safety fixes, YouTube thumbnail support
- `client/components/projects/CinematicVideoHeader.tsx` — YouTube: `<iframe>` with `autoplay=1&mute=1&loop=1&controls=0&playlist={id}`
- `client/components/projects/BeforeAfterSlider.tsx` — YouTube: shows thumbnail (iframes can't be CSS-clipped)
- `client/components/projects/ProjectCard.tsx` — YouTube cover: thumbnail image + red play button overlay
- `client/components/projects/ProcessGrid.tsx` — YouTube: thumbnail + play button overlay

**YouTube URL formats supported:**
- `youtube.com/watch?v=VIDEO_ID`
- `youtu.be/VIDEO_ID`
- `youtube.com/embed/VIDEO_ID`

**Embed URL format:** `https://www.youtube.com/embed/{ID}?autoplay=1&mute=1&loop=1&controls=0&playlist={ID}`
**Thumbnail URL:** `https://img.youtube.com/vi/{ID}/maxresdefault.jpg`

---

## Migrations still to run on server

```bash
python manage.py migrate faqs
python manage.py migrate projects
```
