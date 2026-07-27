"""
Pure-Python weighted-term-frequency + category-bonus matching for
suggesting internal cross-links between blog/guide/design-idea/story posts.

No new dependencies, no Postgres-specific full-text search: this app falls
back to SQLite whenever DATABASE_URL is unset (see config/settings.py), and
django.contrib.postgres isn't installed, so a Postgres-only search API
(SearchVector/TrigramSimilarity) would break outside prod.

Deliberately NOT classic TF-IDF: corpus-relative IDF needs hundreds of
documents to have real discriminating range, and actively misbehaves at
Tola Tiles' actual scale (10s of posts) -- see _term_vector's docstring for
the concrete failure mode this was tuned against.
"""
import math
import re
from collections import Counter

TAG_RE = re.compile(r'<[^>]+>')
WORD_RE = re.compile(r"[a-z']{3,}")

# Hardcoded stopwords: generic English words plus terms that appear in nearly
# every Tola Tiles post regardless of topic (brand name, boilerplate CTAs) --
# both would otherwise swamp the topical signal TF-IDF is supposed to isolate.
STOPWORDS = frozenset({
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'your', 'with', 'this',
    'that', 'have', 'has', 'from', 'they', 'will', 'can', 'all', 'our',
    'their', 'was', 'were', 'been', 'being', 'about', 'into', 'more', 'when',
    'what', 'how', 'why', 'who', 'which', 'than', 'then', 'them', 'these',
    'those', 'its', "it's", 'out', 'off', 'over', 'under', 'again',
    'further', 'once', 'here', 'there', 'each', 'few', 'most', 'other',
    'some', 'such', 'only', 'own', 'same', 'too', 'very', 'just', 'don',
    'should', 'now', 'also', 'like', 'get', 'gets', 'one', 'two', 'three',
    'need', 'needs', 'want', 'wants', 'make', 'makes', 'made', 'use', 'used',
    'using', 'well', 'good', 'great', 'best', 'new', 'day', 'days', 'time',
    'year', 'years', 'home', 'homes', 'work', 'works', 'call', 'contact',
    'today', 'free', 'florida', 'tola', 'tiles', 'tile', 'company',
    'installation', 'installer', 'installers', 'installing', 'installed',
    'project', 'projects', 'service', 'services', 'process', 'question',
    'questions', 'answer', 'answers', 'read', 'learn', 'discover',
    'ready', 'schedule', 'estimate', 'crew', 'team', 'family', 'owned',
    'warranty', 'quality', 'experience', 'jacksonville', 'augustine', 'saint',
})


def _tokenize(text):
    text = TAG_RE.sub(' ', text or '').lower()
    return [w for w in WORD_RE.findall(text) if w not in STOPWORDS]


def _document_tokens(post):
    """Field-weighted tokens: title/excerpt repeated so a long body can't
    drown out the (usually more topically precise) title/excerpt."""
    content_tokens = _tokenize(post.content)[:400]
    return _tokenize(post.title) * 3 + _tokenize(post.excerpt) * 2 + content_tokens


def _term_vector(tokens):
    """Sublinear term-frequency vector -- deliberately NOT classic TF-IDF.

    Corpus-relative IDF needs a large, stable corpus (hundreds of documents)
    to have real discriminating range; at Tola Tiles' actual scale (a
    content calendar of 10s of posts, not 100s+), IDF's log(n_docs/(1+df))
    term compresses toward a narrow band and actively suppresses genuinely
    meaningful shared vocabulary (e.g. "schluter"/"kerdi"/"membrane" between
    two shower-waterproofing-adjacent posts) just because it's common across
    the small set of topically-related posts already in the corpus.
    STOPWORDS already does the job IDF would otherwise do (filtering out
    ubiquitous, non-discriminating domain terms), via a hand-curated list
    instead of a data-driven one -- appropriate at this corpus size.
    """
    tf = Counter(tokens)
    return {term: 1 + math.log(count) for term, count in tf.items()}


def _cosine(v1, v2):
    common = set(v1) & set(v2)
    if not common:
        return 0.0
    dot = sum(v1[t] * v2[t] for t in common)
    n1 = math.sqrt(sum(v * v for v in v1.values()))
    n2 = math.sqrt(sum(v * v for v in v2.values()))
    return dot / (n1 * n2) if n1 and n2 else 0.0


def _best_anchor_paragraph(post_content, candidate_title_tokens):
    """Pick the source post's paragraph with the highest token overlap
    against the candidate's title tokens -- used as anchor_text_hint (the
    literal clickable link text once accepted) and as the insertion point
    for the link marker. Deliberately only considers real <p> paragraphs,
    not headings -- a heading's title reads oddly as inline link text."""
    # Split after EVERY </p> or heading close, so a heading and the
    # paragraph that follows it never end up concatenated into one chunk
    # (which would prefix the anchor text with an oddly-placed heading title).
    paragraphs = re.split(r'(?<=</p>)|(?<=</h[1-6]>)', post_content or '')
    best_text, best_score = '', -1
    candidate_set = set(candidate_title_tokens)
    for para in paragraphs:
        if '<p' not in para:
            continue  # skip non-paragraph chunks (headings, lists, tables)
        text = TAG_RE.sub(' ', para).strip()
        if not text:
            continue
        tokens = set(_tokenize(text))
        score = len(tokens & candidate_set)
        if score > best_score:
            best_score, best_text = score, text
    return best_text[:140]


def suggest_internal_links(post, limit=5, min_score=0.05):
    """Suggest other published posts to cross-link to, based on cosine
    similarity of weighted-term-frequency vectors over title/excerpt/content
    plus a bonus for shared (non-cross-cutting) categories.

    Returns a list of dicts WITHOUT 'id' (the caller/insert_link_markers
    assigns stable sequential ids when placing markers in content).
    """
    from ..models import BlogPost  # local import: avoid app-loading order issues

    candidates = list(
        BlogPost.objects.filter(status='published')
        .exclude(pk=post.pk)
        .prefetch_related('categories')
    )
    if not candidates:
        return []

    corpus = {c.pk: _document_tokens(c) for c in candidates}
    source_tokens = _document_tokens(post)

    source_vec = _term_vector(source_tokens)
    # Only categories with a specific (non-empty) content_types list carry
    # topical signal -- cross-cutting tags like the city categories (empty
    # list, per BlogCategory.applies_to()) are too generic to mean "these
    # two posts are about the same thing."
    source_cats = {c.id for c in post.categories.all() if c.content_types}

    results = []
    for cand in candidates:
        cand_vec = _term_vector(corpus[cand.pk])
        sim = _cosine(source_vec, cand_vec)
        cand_cats = {c.id for c in cand.categories.all() if c.content_types}
        bonus = 0.15 if (source_cats & cand_cats) else 0.0
        score = round(min(1.0, 0.85 * sim + bonus), 3)
        if score >= min_score:
            results.append({
                'target_slug': cand.slug,
                'target_title': cand.title,
                'target_content_type': cand.content_type,
                'score': score,
                'anchor_text_hint': _best_anchor_paragraph(post.content, _tokenize(cand.title)),
            })

    results.sort(key=lambda r: r['score'], reverse=True)
    return results[:limit]


def insert_link_markers(content, suggestions, start_id=1):
    """Insert a <span data-link-marker="N"> immediately after each
    suggestion's anchor paragraph, returning (new_content, suggested_links).

    suggested_links entries get 'status': 'suggested' and a stable
    sequential id starting at start_id, ready to store on BlogPost.
    """
    updated_content = content or ''
    suggested_links = []
    for offset, suggestion in enumerate(suggestions):
        link_id = start_id + offset
        anchor_text = suggestion.get('anchor_text_hint', '')
        marker = f'<span data-link-marker="{link_id}" style="display:none"></span>'

        insert_at = None
        idx = updated_content.find(anchor_text) if anchor_text else -1
        if idx != -1:
            close_idx = updated_content.find('</p>', idx)
            if close_idx != -1:
                insert_at = close_idx + len('</p>')
        if insert_at is not None:
            updated_content = updated_content[:insert_at] + marker + updated_content[insert_at:]
        else:
            # Anchor paragraph not found verbatim (e.g. content changed since
            # anchor selection) -- fall back to appending at the end rather
            # than dropping the suggestion.
            updated_content += marker

        suggested_links.append({
            'id': link_id,
            'anchor_text_hint': anchor_text,
            'target_slug': suggestion['target_slug'],
            'target_title': suggestion['target_title'],
            'target_content_type': suggestion.get('target_content_type', 'blog'),
            'score': suggestion['score'],
            'status': 'suggested',
        })
    return updated_content, suggested_links
