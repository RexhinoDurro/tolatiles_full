"""
Import blog/guide/design-idea/story drafts from server/blog/content_drafts/*.md
into BlogPost/BlogCategory.

Drafts are authored in Obsidian (Marketing/Blog Drafts/ — see
"Content & SEO System" note there for the full field reference) and copied
here verbatim by whoever/whatever is running the sync; this command is the
second half of that pipeline, turning the markdown into real rows.

Safe to re-run: upserts by slug. Never overwrites a post that's already
'published' or 'scheduled' — doing so would both unpublish a live page and
erase any CTA link BlogPost.save() auto-appended on publish, since that
content isn't part of the Obsidian source. New/still-draft posts land as
status='draft' unless a Scheduled Publish Date is given, in which case they
land as status='scheduled' (see the blog calendar / publish_scheduled_posts).

Media plan candidates (AI-generate, gallery) are pre-fetched automatically
at import time for every unresolved image placeholder, so they're sitting
ready the moment a human opens the post in the admin. There is no automated
web-image search -- "web" candidates only ever come from the
add_web_image_candidate management command, run after a real web image has
actually been found and vetted (by an agent/session with real web access,
not a live third-party search API). Already-resolved/skipped placeholders
are left untouched on re-import (never re-fetched, never overwritten). The
featured image goes through the exact same candidate-fetch/never-overwrite
pipeline via the optional **Featured Image (JSON):** block -- see
featured_image_plan on BlogPost and resolve_featured_image on the API side.
Internal link suggestions are computed once, only when a post has none yet
-- re-run via the refresh_internal_link_suggestions admin action to pick up
new matches later.
"""
import json
import re
from datetime import datetime
from pathlib import Path

from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from blog.models import BlogCategory, BlogPost, RELATED_SERVICE_PAGE_LABELS
from blog.services import fetch_candidates_for_placeholder, suggest_internal_links, insert_link_markers


BULLET_RE = re.compile(r'^\*\s+\*\*(.+?):\*\*\s*(.*)$', re.MULTILINE)
BACKTICK_RE = re.compile(r'`([^`]+)`')
FAQ_JSON_RE = re.compile(r'\*\*FAQ Data \(JSON\):\*\*\s*```json\s*(.*?)```', re.DOTALL)
MEDIA_PLAN_JSON_RE = re.compile(r'\*\*Media Plan \(JSON\):\*\*\s*```json\s*(.*?)```', re.DOTALL)
FEATURED_IMAGE_JSON_RE = re.compile(r'\*\*Featured Image \(JSON\):\*\*\s*```json\s*(.*?)```', re.DOTALL)
HTML_FENCE_RE = re.compile(r'```html\s*(.*)', re.DOTALL)
MEDIA_MARKER_RE = re.compile(r'data-media-marker="(\d+)"')

CONTENT_TYPE_LABEL_TO_VALUE = {label.lower(): value for value, label in BlogPost.CONTENT_TYPE_CHOICES}
LOCATION_VALUES = {value for value, _ in BlogPost.LOCATION_CHOICES}

SCHEDULED_DATE_FORMATS = ('%Y-%m-%d %H:%M', '%Y-%m-%d')


class DraftParseError(Exception):
    """Any problem parsing or validating a single draft file — always caught per-file."""


def _first_backtick(value, field_name):
    match = BACKTICK_RE.search(value)
    if not match:
        raise DraftParseError(f'{field_name}: expected a backtick-wrapped value, got {value!r}')
    return match.group(1)


def _parse_scheduled_date(value):
    """Parse the optional Scheduled Publish Date field ("YYYY-MM-DD HH:MM"
    or "YYYY-MM-DD"). Returns None if the field is absent/blank."""
    value = (value or '').strip()
    if not value:
        return None
    for fmt in SCHEDULED_DATE_FORMATS:
        try:
            naive = datetime.strptime(value, fmt)
            return timezone.make_aware(naive)
        except ValueError:
            continue
    raise DraftParseError(
        f'unrecognized Scheduled Publish Date format: {value!r} '
        f'(expected "YYYY-MM-DD" or "YYYY-MM-DD HH:MM")'
    )


def _parse_media_plan(metadata_section):
    """Parse the optional **Media Plan (JSON):** block into a list of raw
    entries (no candidates/status yet -- those get filled in by the caller).
    Returns [] if the field is absent."""
    match = MEDIA_PLAN_JSON_RE.search(metadata_section)
    if not match:
        return []
    try:
        entries = json.loads(match.group(1))
    except json.JSONDecodeError as e:
        raise DraftParseError(f'invalid Media Plan JSON: {e}')
    if not isinstance(entries, list):
        raise DraftParseError('Media Plan JSON must be a list')
    for entry in entries:
        if not isinstance(entry, dict) or 'id' not in entry or 'type' not in entry or 'prompt' not in entry:
            raise DraftParseError(f'each Media Plan entry needs at least id/type/prompt, got {entry!r}')
        if entry['type'] not in ('image', 'video'):
            raise DraftParseError(f'Media Plan entry type must be "image" or "video", got {entry["type"]!r}')
    return entries


def _parse_featured_image(metadata_section):
    """Parse the optional **Featured Image (JSON):** block into
    {"prompt": str, "alt_text": str}, or None if the field is absent."""
    match = FEATURED_IMAGE_JSON_RE.search(metadata_section)
    if not match:
        return None
    try:
        entry = json.loads(match.group(1))
    except json.JSONDecodeError as e:
        raise DraftParseError(f'invalid Featured Image JSON: {e}')
    if not isinstance(entry, dict) or 'prompt' not in entry:
        raise DraftParseError(f'Featured Image entry needs at least a "prompt", got {entry!r}')
    return entry


def parse_draft(text):
    """Parse one content_drafts/*.md file's text into a dict of BlogPost field values."""
    if '## HTML Content' not in text:
        raise DraftParseError('missing "## HTML Content" section')
    metadata_section, _, content_section = text.partition('## HTML Content')

    html_match = HTML_FENCE_RE.search(content_section)
    if not html_match:
        raise DraftParseError('no ```html fence found under "## HTML Content"')
    # Take everything from the opening fence to end-of-file, then strip at
    # most one trailing closing fence — not a lazy match to "the next ```",
    # since a Guide/Story post could legitimately contain its own nested
    # code sample inside the body.
    content_html = html_match.group(1).rstrip()
    if content_html.endswith('```'):
        content_html = content_html[:-3].rstrip()
    if not content_html:
        raise DraftParseError('HTML Content block is empty')
    content_html += '\n'

    fields = {}
    for label, value in BULLET_RE.findall(metadata_section):
        fields[label.strip()] = value.strip()

    faq_match = FAQ_JSON_RE.search(metadata_section)
    if faq_match:
        try:
            faq_data = json.loads(faq_match.group(1))
        except json.JSONDecodeError as e:
            raise DraftParseError(f'invalid FAQ Data JSON: {e}')
    else:
        faq_data = []

    media_plan_raw = _parse_media_plan(metadata_section)
    # Every media_plan entry must have a corresponding marker already placed
    # in the HTML content — otherwise there'd be no way to ever resolve it
    # in-place (this is an authoring-time check, catching my own mistakes
    # when hand-placing markers while drafting).
    marker_ids_in_content = set(MEDIA_MARKER_RE.findall(content_html))
    for entry in media_plan_raw:
        if str(entry['id']) not in marker_ids_in_content:
            raise DraftParseError(
                f'Media Plan entry id={entry["id"]} has no matching '
                f'<span data-media-marker="{entry["id"]}"> in the HTML Content'
            )

    content_type_raw = fields.get('Content Type', '')
    content_type_token = content_type_raw.split(' (', 1)[0].strip().lower()
    content_type = CONTENT_TYPE_LABEL_TO_VALUE.get(content_type_token)
    if content_type is None:
        raise DraftParseError(f'unrecognized Content Type: {content_type_raw!r}')

    location = _first_backtick(fields.get('Location', ''), 'Location')
    if location not in LOCATION_VALUES:
        raise DraftParseError(f'unrecognized Location: {location!r}')

    slug = _first_backtick(fields.get('Slug', ''), 'Slug')
    if slug != slugify(slug):
        raise DraftParseError(f'Slug is not a valid slug: {slug!r}')

    has_faq_schema = _first_backtick(fields.get('Has FAQ Schema', ''), 'Has FAQ Schema').lower() == 'true'

    related_service_page = ''
    rsp_match = BACKTICK_RE.search(fields.get('Related Service Page', ''))
    if rsp_match:
        related_service_page = rsp_match.group(1)
        if related_service_page not in RELATED_SERVICE_PAGE_LABELS:
            raise DraftParseError(f'unrecognized Related Service Page path: {related_service_page!r}')

    scheduled_publish_date = _parse_scheduled_date(fields.get('Scheduled Publish Date', ''))
    if scheduled_publish_date is not None and content_type == 'blog' and not related_service_page:
        # BlogPost.save() unconditionally raises if a blog post transitions
        # to 'published' with no related_service_page (see
        # _validate_related_service_page). publish_scheduled_posts would hit
        # that exception uncaught for every post in that Celery run — refuse
        # to schedule at import time instead of creating a ticking time bomb.
        raise DraftParseError(
            'cannot set a Scheduled Publish Date on a Blog post with no Related Service Page — '
            'it would crash publish_scheduled_posts when the schedule fires'
        )

    category_names = [
        name.strip()
        for name in fields.get('Categories', '').split(' (', 1)[0].split(',')
        if name.strip()
    ]

    title = fields.get('Title', '').strip()
    if not title:
        raise DraftParseError('missing Title')

    featured_image_raw = _parse_featured_image(metadata_section)

    return {
        'title': title,
        'content_type': content_type,
        'slug': slug,
        'location': location,
        'category_names': category_names,
        'related_service_page': related_service_page,
        'author_name': fields.get('Author Name', '').strip(),
        'excerpt': fields.get('Excerpt', '').strip(),
        'meta_title': fields.get('Meta Title', '').strip(),
        'meta_description': fields.get('Meta Description', '').strip(),
        'has_faq_schema': has_faq_schema,
        'faq_data': faq_data,
        'content': content_html,
        'media_plan_raw': media_plan_raw,
        'featured_image_raw': featured_image_raw,
        'scheduled_publish_date': scheduled_publish_date,
    }


def _merge_media_plan(existing_entries, parsed_entries, stdout):
    """Merge freshly-parsed Media Plan entries with whatever's already on
    the post (matched by id). Already-resolved/skipped entries are preserved
    completely untouched (never re-fetch candidates for a decision that's
    already been made); new or still-unresolved entries get fresh candidates
    fetched from every image source right now."""
    existing_by_id = {item.get('id'): item for item in (existing_entries or [])}
    merged = []
    for entry in parsed_entries:
        existing_entry = existing_by_id.get(entry['id'])
        if existing_entry and existing_entry.get('status') in ('resolved', 'skipped'):
            merged.append(existing_entry)
            continue

        new_entry = {
            'id': entry['id'],
            'type': entry['type'],
            'placement_hint': entry.get('placement_hint', ''),
            'prompt': entry['prompt'],
            'status': 'unresolved',
            'resolved_source': None,
            'resolved_url': None,
        }
        if entry['type'] == 'image':
            new_entry['alt_text'] = entry.get('alt_text', '')
            stdout.write(f'    fetching candidates for media #{entry["id"]}: "{entry["prompt"][:60]}"...')
            new_entry['candidates'] = fetch_candidates_for_placeholder(entry['prompt'])
        merged.append(new_entry)
    return merged


def _merge_featured_image_plan(existing_plan, parsed_entry, stdout):
    """Same resolved/skipped-preservation rule as _merge_media_plan, but for
    the single featured_image_plan slot: never re-fetch candidates for a
    decision that's already been made, and leave an absent Featured Image
    field alone entirely (some drafts may not specify one)."""
    if parsed_entry is None:
        return existing_plan or {}
    if existing_plan and existing_plan.get('status') in ('resolved', 'skipped'):
        return existing_plan

    stdout.write(f'    fetching candidates for featured image: "{parsed_entry["prompt"][:60]}"...')
    return {
        'prompt': parsed_entry['prompt'],
        'status': 'unresolved',
        'resolved_source': None,
        'candidates': fetch_candidates_for_placeholder(parsed_entry['prompt']),
    }


class Command(BaseCommand):
    help = 'Import blog/guide/design-idea/story drafts from server/blog/content_drafts/*.md into BlogPost.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dir',
            type=str,
            default=None,
            help='Directory of *.md drafts to import (default: server/blog/content_drafts/)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Parse, validate, and attempt every write, then roll everything back — nothing is persisted.',
        )

    def handle(self, *args, **options):
        if options['dir']:
            drafts_dir = Path(options['dir'])
        else:
            drafts_dir = Path(__file__).resolve().parent.parent.parent / 'content_drafts'

        if not drafts_dir.exists():
            raise CommandError(f'Drafts directory not found: {drafts_dir}')

        paths = sorted(drafts_dir.glob('*.md'))
        if not paths:
            self.stdout.write(self.style.WARNING(f'No .md files found in {drafts_dir}'))
            return

        counts = {'created': 0, 'updated': 0, 'skipped_published': 0, 'skipped_error': 0, 'scheduled': 0}
        category_warnings = []

        for path in paths:
            try:
                with transaction.atomic():
                    text = path.read_text(encoding='utf-8')
                    parsed = parse_draft(text)

                    existing = BlogPost.objects.filter(slug=parsed['slug']).first()
                    if existing and existing.status in ('published', 'scheduled'):
                        self.stdout.write(self.style.WARNING(
                            f'  {path.name}: skipped — "{parsed["slug"]}" is already {existing.status}; '
                            f're-importing would overwrite live content, so leaving it untouched'
                        ))
                        counts['skipped_published'] += 1
                        continue

                    category_ids = []
                    for name in parsed['category_names']:
                        category = BlogCategory.objects.filter(name=name).first()
                        if category is None:
                            category_warnings.append(
                                f'{path.name}: category "{name}" does not exist — skipped, not auto-created'
                            )
                            continue
                        if not category.applies_to(parsed['content_type']):
                            category_warnings.append(
                                f'{path.name}: category "{name}" is not scoped to content type '
                                f'"{parsed["content_type"]}" — applied anyway, but check the taxonomy'
                            )
                        category_ids.append(category.id)

                    created = existing is None
                    post = existing or BlogPost(slug=parsed['slug'])
                    had_no_link_suggestions_yet = not (existing.suggested_links if existing else [])

                    post.title = parsed['title']
                    post.content_type = parsed['content_type']
                    post.content = parsed['content']
                    post.excerpt = parsed['excerpt']
                    post.author_name = parsed['author_name']
                    post.meta_title = parsed['meta_title']
                    post.meta_description = parsed['meta_description']
                    post.has_faq_schema = parsed['has_faq_schema']
                    post.faq_data = parsed['faq_data']
                    post.location = parsed['location']
                    post.related_service_page = parsed['related_service_page']

                    if parsed['scheduled_publish_date'] is not None:
                        post.status = 'scheduled'
                        post.scheduled_publish_date = parsed['scheduled_publish_date']
                        counts['scheduled'] += 1
                    else:
                        post.status = 'draft'

                    post.media_plan = _merge_media_plan(
                        existing.media_plan if existing else [], parsed['media_plan_raw'], self.stdout
                    )
                    post.featured_image_plan = _merge_featured_image_plan(
                        existing.featured_image_plan if existing else {}, parsed['featured_image_raw'], self.stdout
                    )
                    if parsed['featured_image_raw'] and not post.featured_image_alt:
                        alt_text = parsed['featured_image_raw'].get('alt_text', '').strip()
                        if alt_text:
                            post.featured_image_alt = alt_text

                    # Validate BEFORE writing — catches oversized fields (including
                    # `excerpt`, whose max_length=300 is enforced only here, not by
                    # Postgres, since it's a TextField) as one clean error instead
                    # of a raw DataError from the database.
                    post.full_clean(exclude=['featured_image', 'related_link_auto_appended', 'canonical_url'])
                    post.save()
                    post.categories.set(category_ids)

                    if had_no_link_suggestions_yet:
                        suggestions = suggest_internal_links(post)
                        if suggestions:
                            new_content, new_links = insert_link_markers(post.content, suggestions)
                            post.content = new_content
                            post.suggested_links = new_links
                            post.save(update_fields=['content', 'suggested_links'])

                    if options['dry_run']:
                        transaction.set_rollback(True)

                    verb = 'Created' if created else 'Updated'
                    schedule_note = f' [scheduled for {post.scheduled_publish_date}]' if post.status == 'scheduled' else ''
                    self.stdout.write(self.style.SUCCESS(
                        f'  {path.name}: {verb} "{post.title}" ({post.slug}){schedule_note}'
                    ))
                    counts['created' if created else 'updated'] += 1
            except (DraftParseError, ValidationError, ValueError) as e:
                self.stderr.write(self.style.ERROR(f'  {path.name}: {e}'))
                counts['skipped_error'] += 1
                continue

        self.stdout.write('')
        if category_warnings:
            self.stdout.write(self.style.WARNING('Category warnings:'))
            for warning in category_warnings:
                self.stdout.write(self.style.WARNING(f'  {warning}'))
            self.stdout.write('')

        mode = ' (DRY RUN — no changes were saved)' if options['dry_run'] else ''
        self.stdout.write(self.style.SUCCESS(
            f'Done{mode}: {counts["created"]} created, {counts["updated"]} updated, '
            f'{counts["scheduled"]} scheduled, '
            f'{counts["skipped_published"]} skipped (already published/scheduled), '
            f'{counts["skipped_error"]} skipped (errors).'
        ))
