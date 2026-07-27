"""
Orchestrates candidate-fetching for a single media_plan image placeholder
across the sources that CAN be queried automatically at import time
(AI-generate, internal gallery). There is no automated "web" source here --
finding a real web image requires an agent/session with actual web-browsing
access (Claude searching + vetting), so `candidates['web']` always starts
empty and gets filled in later via the add_web_image_candidate management
command once a good image has actually been found.

Used by import_content_drafts at import time (pre-fetching AI/gallery
candidates for every placeholder so they're ready the moment a human opens
the post). Each source is independent and best-effort -- a failure in one
(bad key, rate limit, network, safety filter) never blocks the others; it
just leaves that source's list empty.
"""
import logging

from django.db.models import Q

from gallery.models import GalleryImage
from .image_gen_service import ImageGenerationService

logger = logging.getLogger(__name__)

_CATEGORY_KEYWORDS = {
    'backsplash': ['backsplash', 'kitchen wall', 'tile wall'],
    'shower': ['shower', 'bath', 'bathroom', 'waterproof', 'drain'],
    'flooring': ['floor', 'flooring', 'subfloor'],
    'patio': ['patio', 'outdoor', 'pool deck', 'deck'],
    'fireplace': ['fireplace', 'hearth', 'mantel'],
}


def _guess_gallery_category(prompt):
    """Map a free-text image prompt to the closest gallery Category name
    (backsplash/shower/flooring/patio/fireplace) by keyword match, or None
    if nothing matches (falls back to searching across all categories)."""
    lowered = (prompt or '').lower()
    best_category, best_hits = None, 0
    for category, keywords in _CATEGORY_KEYWORDS.items():
        hits = sum(1 for kw in keywords if kw in lowered)
        if hits > best_hits:
            best_category, best_hits = category, hits
    return best_category


def _gallery_candidates(prompt, limit=6):
    queryset = GalleryImage.objects.filter(is_active=True).select_related('category')
    category = _guess_gallery_category(prompt)
    if category:
        queryset = queryset.filter(category__name=category)

    keywords = [w for w in (prompt or '').lower().split() if len(w) > 3][:6]
    if keywords:
        keyword_query = Q()
        for word in keywords:
            keyword_query |= Q(title__icontains=word) | Q(description__icontains=word)
        keyword_matched = queryset.filter(keyword_query)
        if keyword_matched.exists():
            queryset = keyword_matched
        # else: no title/description overlap -- fall back to the whole
        # (possibly category-filtered) queryset rather than returning nothing.

    return [
        {
            'id': img.id,
            'thumbnail_url': img.image.url if img.image else None,
            'full_url': img.image.url if img.image else None,
            'title': img.title,
            'category': img.category.name,
        }
        for img in queryset[:limit]
    ]


def fetch_candidates_for_placeholder(prompt, aspect_ratio='16:9'):
    """Query the automatable image sources for one placeholder's prompt.
    Returns the `candidates` dict shape stored on a media_plan entry:
    {"ai": [...], "gallery": [...], "web": []}. `web` always starts empty --
    see module docstring -- and gets appended to later via
    add_web_image_candidate. Never raises -- each source is wrapped
    independently.
    """
    candidates = {'ai': [], 'gallery': [], 'web': []}

    try:
        service = ImageGenerationService()
        enhanced_prompt = service.enhance_prompt(prompt)
        result = service.generate_image(enhanced_prompt, aspect_ratio=aspect_ratio)
        if result and 'url' in result:
            candidates['ai'] = [{
                'thumbnail_url': result['url'],
                'full_url': result['url'],
                'credit': 'AI-generated',
            }]
    except Exception:
        logger.warning('AI image generation failed for prompt %r', prompt, exc_info=True)

    try:
        candidates['gallery'] = _gallery_candidates(prompt)
    except Exception:
        logger.warning('Gallery candidate search failed for prompt %r', prompt, exc_info=True)

    return candidates
