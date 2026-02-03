from celery import shared_task
from django.utils import timezone


@shared_task
def publish_scheduled_posts():
    """
    Check for scheduled posts that should be published and update their status.
    This task runs every 5 minutes via Celery Beat.
    """
    from .models import BlogPost

    now = timezone.now()

    # Find all scheduled posts whose scheduled_publish_date has passed
    scheduled_posts = BlogPost.objects.filter(
        status='scheduled',
        scheduled_publish_date__lte=now
    )

    count = 0
    for post in scheduled_posts:
        post.status = 'published'
        post.publish_date = post.scheduled_publish_date
        post.save(update_fields=['status', 'publish_date'])
        count += 1

    if count > 0:
        print(f"Published {count} scheduled blog post(s)")

    return f"Published {count} scheduled posts"
