"""
One-time migration: upload every blog media file that still lives only on
local disk into blog_media_storage (R2 once configured, see blog/storage.py),
and rewrite every reference to it -- BlogPost.featured_image, the <img
src="..."> tags embedded in BlogPost.content, and resolved_url in media_plan/
featured_image_plan -- to point at the new location.

New files created after the R2 migration landed already go straight to
blog_media_storage; this only matters for files that predate it and are
still sitting on local disk under MEDIA_ROOT. Safe to re-run: a reference
whose local file no longer exists (already migrated, or genuinely missing)
is left untouched.

The same physical file is often referenced from more than one place (a
resolved media_plan entry's URL is also embedded in content's <img src>) --
migrated_cache ensures it's only ever uploaded once per run, so every
reference ends up pointing at the exact same new key/URL instead of two
different (but identical) copies.
"""
import os
import re

from django.conf import settings
from django.core.management.base import BaseCommand

from blog.models import BlogPost
from blog.storage import save_media_bytes, blog_media_url

IMG_SRC_RE = re.compile(r'<img\s+[^>]*?src="([^"]+)"')


def local_key_from_url(url, media_url_prefix):
    """If `url` is a local /media/... reference (relative, or with the
    site's own domain prepended), return the key relative to MEDIA_ROOT.
    Otherwise None (already an R2/external URL, or empty)."""
    if not url:
        return None
    if url.startswith(media_url_prefix):
        return url[len(media_url_prefix):]
    absolute_prefix = settings.PUBLIC_MEDIA_BASE_URL.rstrip('/') + media_url_prefix
    if url.startswith(absolute_prefix):
        return url[len(absolute_prefix):]
    return None


class Command(BaseCommand):
    help = (
        'Upload blog media files still on local disk to blog_media_storage '
        '(R2) and rewrite every reference to them. Use --dry-run first.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run', action='store_true',
            help="Print what would change; don't save or upload anything.",
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        media_url = settings.MEDIA_URL
        cache = {}  # local key -> (new_key, new_url); populated on first real upload
        stats = {'files_uploaded': 0, 'files_missing_locally': 0, 'posts_touched': 0}

        def migrate(key):
            """Ensure `key` is uploaded (real run) or confirmed present
            locally (dry run). Returns (new_key, new_url), with new_url
            None in dry-run mode (nothing was actually uploaded yet, so
            there's no real URL to report) -- or None entirely if there's
            no local file at that key to migrate."""
            if key in cache:
                return cache[key]
            local_path = os.path.join(settings.MEDIA_ROOT, key)
            if not os.path.isfile(local_path):
                stats['files_missing_locally'] += 1
                return None
            if dry_run:
                cache[key] = (key, None)
                stats['files_uploaded'] += 1
                return cache[key]
            with open(local_path, 'rb') as f:
                data = f.read()
            new_key = save_media_bytes(key, data)
            new_url = blog_media_url(new_key)
            cache[key] = (new_key, new_url)
            stats['files_uploaded'] += 1
            return cache[key]

        for post in BlogPost.objects.all().order_by('id'):
            update_fields = []
            log_lines = []

            # 1. featured_image
            if post.featured_image and post.featured_image.name:
                result = migrate(post.featured_image.name)
                if result:
                    new_key, _ = result
                    if new_key != post.featured_image.name:
                        log_lines.append(f'featured_image: {post.featured_image.name} -> {new_key}')
                        if not dry_run:
                            post.featured_image.name = new_key
                            update_fields.append('featured_image')
                    else:
                        log_lines.append(f'featured_image: {new_key} (uploaded, key unchanged)')

            # 2. content <img src="...">
            content = post.content or ''
            content_changed = False

            def repl(match):
                nonlocal content_changed
                src = match.group(1)
                key = local_key_from_url(src, media_url)
                if key is None:
                    return match.group(0)
                result = migrate(key)
                if result is None:
                    return match.group(0)
                new_key, new_url = result
                content_changed = True
                if dry_run or not new_url:
                    log_lines.append(f'content <img>: {src} (would migrate)')
                    return match.group(0)
                log_lines.append(f'content <img>: {src} -> {new_url}')
                return match.group(0).replace(src, new_url)

            new_content = IMG_SRC_RE.sub(repl, content) if content else content
            if content_changed and not dry_run:
                post.content = new_content
                update_fields.append('content')

            # 3. media_plan (list of placeholder dicts, each possibly resolved)
            media_plan = post.media_plan or []
            media_plan_changed = False
            for entry in media_plan:
                key = local_key_from_url(entry.get('resolved_url'), media_url)
                if key is None:
                    continue
                result = migrate(key)
                if result is None:
                    continue
                new_key, new_url = result
                media_plan_changed = True
                if not dry_run and new_url:
                    log_lines.append(f"media_plan#{entry.get('id')}: {entry['resolved_url']} -> {new_url}")
                    entry['resolved_url'] = new_url
                else:
                    log_lines.append(f"media_plan#{entry.get('id')}: {entry.get('resolved_url')} (would migrate)")
            if media_plan_changed and not dry_run:
                post.media_plan = media_plan
                update_fields.append('media_plan')

            # 4. featured_image_plan (single dict, same shape as one media_plan entry)
            plan = post.featured_image_plan if isinstance(post.featured_image_plan, dict) else {}
            plan_key = local_key_from_url(plan.get('resolved_url'), media_url)
            if plan_key is not None:
                result = migrate(plan_key)
                if result is not None:
                    new_key, new_url = result
                    if not dry_run and new_url:
                        log_lines.append(f"featured_image_plan: {plan['resolved_url']} -> {new_url}")
                        plan['resolved_url'] = new_url
                        post.featured_image_plan = plan
                        update_fields.append('featured_image_plan')
                    else:
                        log_lines.append(f"featured_image_plan: {plan.get('resolved_url')} (would migrate)")

            if log_lines:
                stats['posts_touched'] += 1
                self.stdout.write(f'Post {post.id} ({post.slug}):')
                for line in log_lines:
                    self.stdout.write(f'  {line}')

            if update_fields and not dry_run:
                # Raw queryset .update(), not post.save() -- BlogPost.save()
                # unconditionally re-validates related_service_page/media
                # resolution state on every save while published, which has
                # nothing to do with these URL rewrites and could abort an
                # unrelated post's migration over pre-existing legacy data
                # (see BlogPostViewSet._persist_post for the same reasoning).
                BlogPost.objects.filter(pk=post.pk).update(
                    **{f: getattr(post, f) for f in update_fields}
                )

        mode = 'DRY RUN' if dry_run else 'APPLIED'
        self.stdout.write(self.style.SUCCESS(
            f'{mode}: {stats["posts_touched"]} post(s) touched, '
            f'{stats["files_uploaded"]} file(s) uploaded, '
            f'{stats["files_missing_locally"]} reference(s) pointed at a '
            f'missing local file (left untouched).'
        ))
