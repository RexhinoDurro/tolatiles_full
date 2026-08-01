"""
Attach a web-found image to a media_plan placeholder (or the post's
featured image) as a candidate, after an agent/session with real web access
has actually found and vetted it.

There is no live "search the web" step in this app -- the search/vetting
happens externally (Claude, using its own web search/browsing tools) while
drafting a post; this command is just the "download it and make it a
candidate" half. The image is downloaded and saved into local media storage
immediately (see blog/services/web_image_service.py), never referenced by
its original external URL, so the blog ends up hosting its own copy.

Usage:
    python manage.py add_web_image_candidate <slug> <media_id> <url> \\
        [--credit "Photo by ..."] [--source-page-url "https://..."]

    <media_id> is either a media_plan entry id (int), or the literal string
    "featured" to attach the candidate to the post's featured_image_plan
    instead of a media_plan entry.
"""
from django.core.management.base import BaseCommand, CommandError

from blog.models import BlogPost
from blog.services import download_and_save_image, WebImageDownloadError


class Command(BaseCommand):
    help = (
        'Download a web-found image and attach it as a candidate on a media_plan image '
        'placeholder, or on the featured image ("featured").'
    )

    def add_arguments(self, parser):
        parser.add_argument('slug', type=str, help='BlogPost slug')
        parser.add_argument(
            'media_id', type=str,
            help='media_plan entry id (must be type="image"), or "featured" for the featured image'
        )
        parser.add_argument('url', type=str, help='URL of the image to download and save')
        parser.add_argument('--credit', type=str, default='', help='Attribution text, e.g. "Photo by Jane Doe"')
        parser.add_argument('--source-page-url', type=str, default='', help='Page the image was found on')

    def handle(self, *args, **options):
        slug = options['slug']
        media_id = options['media_id']
        url = options['url']

        try:
            post = BlogPost.objects.get(slug=slug)
        except BlogPost.DoesNotExist:
            raise CommandError(f'No BlogPost with slug "{slug}"')

        try:
            saved = download_and_save_image(url)
        except WebImageDownloadError as e:
            raise CommandError(str(e))

        candidate = {
            'thumbnail_url': saved['url'],
            'full_url': saved['url'],
            'credit': options['credit'],
            'source_page_url': options['source_page_url'],
        }

        if media_id == 'featured':
            plan = post.featured_image_plan or {}
            plan.setdefault('candidates', {'ai': [], 'gallery': [], 'web': []})
            plan['candidates'].setdefault('web', [])
            plan['candidates']['web'].append(candidate)
            plan.setdefault('prompt', '')
            plan.setdefault('status', 'unresolved')
            plan.setdefault('resolved_source', None)

            post.featured_image_plan = plan
            post.save(update_fields=['featured_image_plan'])

            self.stdout.write(self.style.SUCCESS(
                f'Saved {url} -> {saved["url"]} as a web candidate for the featured image on "{slug}"'
            ))
            return

        try:
            media_id_int = int(media_id)
        except ValueError:
            raise CommandError(f'media_id must be an integer or "featured", got {media_id!r}')

        media_plan = post.media_plan or []
        entry = next((item for item in media_plan if item.get('id') == media_id_int), None)
        if entry is None:
            raise CommandError(f'No media_plan entry with id {media_id_int} on "{slug}"')
        if entry.get('type') != 'image':
            raise CommandError(
                f'media_plan entry {media_id_int} is type={entry.get("type")!r}, not "image" -- '
                f'web candidates only apply to image placeholders (video is embedded by URL directly)'
            )

        entry.setdefault('candidates', {'ai': [], 'gallery': [], 'web': []})
        entry['candidates'].setdefault('web', [])
        entry['candidates']['web'].append(candidate)

        post.media_plan = media_plan
        post.save(update_fields=['media_plan'])

        self.stdout.write(self.style.SUCCESS(
            f'Saved {url} -> {saved["url"]} as a web candidate for media #{media_id_int} on "{slug}"'
        ))
