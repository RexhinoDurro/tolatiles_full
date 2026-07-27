import logging

from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task
def publish_scheduled_posts():
    """
    Check for scheduled posts that should be published and update their status.
    This task runs every 5 minutes via Celery Beat.

    Posts with unresolved media/link placeholders (see BlogPost.has_unresolved_media)
    are deliberately skipped rather than published incomplete or crashing the
    whole batch -- they stay 'scheduled' and get retried on the next tick.
    """
    from .models import BlogPost

    now = timezone.now()

    # Find all scheduled posts whose scheduled_publish_date has passed
    scheduled_posts = BlogPost.objects.filter(
        status='scheduled',
        scheduled_publish_date__lte=now
    )

    count = 0
    skipped = 0
    for post in scheduled_posts:
        if post.has_unresolved_media:
            logger.warning(
                'Skipping scheduled publish for "%s" (id=%s) -- unresolved media/link '
                'placeholders still present. Will retry next tick.',
                post.title, post.pk,
            )
            skipped += 1
            continue

        post.status = 'published'
        post.publish_date = post.scheduled_publish_date
        post.save(update_fields=['status', 'publish_date'])
        count += 1

    if count > 0:
        print(f"Published {count} scheduled blog post(s)")
    if skipped > 0:
        print(f"Skipped {skipped} scheduled blog post(s) with unresolved media/links")

    return f"Published {count} scheduled posts, skipped {skipped} incomplete"
