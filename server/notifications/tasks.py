"""Celery tasks for notifications."""

import logging
from datetime import date, timedelta
from celery import shared_task
from django.db.models import Sum, Count, Q
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_push_notification(self, notification_id: int):
    """
    Send push notification to user's devices.

    Args:
        notification_id: The ID of the Notification to send
    """
    from .models import Notification
    from .services import send_push_notification_to_user

    try:
        notification = Notification.objects.get(id=notification_id)

        successful = send_push_notification_to_user(
            notification.user,
            notification
        )

        if successful > 0:
            notification.delivered_via_push = True
            notification.save(update_fields=['delivered_via_push'])

        return {'status': 'success', 'delivered_to': successful}

    except Notification.DoesNotExist:
        logger.error(f"Notification {notification_id} not found")
        return {'status': 'error', 'message': 'notification not found'}

    except Exception as exc:
        logger.error(f"Failed to send push notification: {exc}")
        raise self.retry(exc=exc)


@shared_task
def aggregate_daily_stats(target_date: str = None):
    """
    Aggregate daily statistics.

    Args:
        target_date: ISO format date string (YYYY-MM-DD). Defaults to yesterday.
    """
    from leads.models import ContactLead, LocalAdsLead
    from quotes.models import Quote, Invoice
    from .models import DailyStats

    if target_date:
        stats_date = date.fromisoformat(target_date)
    else:
        stats_date = date.today() - timedelta(days=1)

    start_datetime = timezone.make_aware(
        timezone.datetime.combine(stats_date, timezone.datetime.min.time())
    )
    end_datetime = timezone.make_aware(
        timezone.datetime.combine(stats_date, timezone.datetime.max.time())
    )

    logger.info(f"Aggregating stats for {stats_date}")

    # Lead stats
    new_leads_website = ContactLead.objects.filter(
        created_at__date=stats_date
    ).count()

    new_leads_local_ads = LocalAdsLead.objects.filter(
        created_at__date=stats_date
    ).count()

    leads_contacted = ContactLead.objects.filter(
        status='contacted',
        updated_at__date=stats_date
    ).count()

    leads_converted = ContactLead.objects.filter(
        status='converted',
        updated_at__date=stats_date
    ).count()

    # Quote stats
    quotes_created = Quote.objects.filter(
        created_at__date=stats_date
    ).count()

    quotes_sent = Quote.objects.filter(
        status='sent',
        updated_at__date=stats_date
    ).count()

    quotes_accepted = Quote.objects.filter(
        status='accepted',
        updated_at__date=stats_date
    ).count()

    quotes_value = Quote.objects.filter(
        created_at__date=stats_date
    ).aggregate(total=Sum('total'))['total'] or 0

    # Invoice stats
    invoices_created = Invoice.objects.filter(
        created_at__date=stats_date
    ).count()

    invoices_paid = Invoice.objects.filter(
        status='paid',
        updated_at__date=stats_date
    ).count()

    invoices_paid_value = Invoice.objects.filter(
        status='paid',
        updated_at__date=stats_date
    ).aggregate(total=Sum('total'))['total'] or 0

    # Create or update stats record
    stats, created = DailyStats.objects.update_or_create(
        date=stats_date,
        defaults={
            'new_leads_website': new_leads_website,
            'new_leads_local_ads': new_leads_local_ads,
            'leads_contacted': leads_contacted,
            'leads_converted': leads_converted,
            'quotes_created': quotes_created,
            'quotes_sent': quotes_sent,
            'quotes_accepted': quotes_accepted,
            'quotes_total_value': quotes_value,
            'invoices_created': invoices_created,
            'invoices_paid': invoices_paid,
            'invoices_paid_value': invoices_paid_value,
        }
    )

    action = 'Created' if created else 'Updated'
    logger.info(f"{action} daily stats for {stats_date}")

    return {
        'status': 'success',
        'date': stats_date.isoformat(),
        'total_leads': new_leads_website + new_leads_local_ads
    }


@shared_task
def backfill_daily_stats(days: int = 30):
    """
    Backfill daily stats for the past N days.

    Args:
        days: Number of days to backfill
    """
    today = date.today()
    results = []

    for i in range(1, days + 1):
        target = today - timedelta(days=i)
        result = aggregate_daily_stats(target.isoformat())
        results.append(result)

    return {'status': 'success', 'days_processed': len(results)}


@shared_task
def cleanup_old_notifications(days: int = 90):
    """
    Delete notifications older than N days.

    Args:
        days: Age threshold in days
    """
    from .models import Notification

    cutoff = timezone.now() - timedelta(days=days)
    deleted_count, _ = Notification.objects.filter(
        created_at__lt=cutoff,
        is_read=True
    ).delete()

    logger.info(f"Deleted {deleted_count} old notifications")
    return {'status': 'success', 'deleted': deleted_count}
