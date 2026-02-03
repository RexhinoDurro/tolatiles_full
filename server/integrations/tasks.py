"""
Celery tasks for integrations app.
"""
import logging
from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def sync_google_ads_leads(self, days_back=7):
    """
    Sync Local Services leads from Google Ads API.

    This task runs periodically to fetch new leads.

    Args:
        days_back: Number of days to look back for leads (default: 7)
    """
    from .models import GoogleAdsCredential
    from .google_ads_service import GoogleAdsLSAService

    logger.info(f"Starting Google Ads LSA leads sync (days_back={days_back})")

    # Get all connected Google Ads credentials
    credentials = GoogleAdsCredential.objects.filter(is_connected=True)

    if not credentials.exists():
        logger.info("No connected Google Ads credentials found, skipping sync")
        return {"status": "skipped", "reason": "no_credentials"}

    total_stats = {
        "credentials_processed": 0,
        "total_created": 0,
        "total_updated": 0,
        "total_skipped": 0,
        "total_errors": 0,
    }

    for credential in credentials:
        try:
            logger.info(f"Syncing leads for user: {credential.user.username}")

            service = GoogleAdsLSAService(credential=credential)
            stats = service.sync_leads_to_database(days_back=days_back)

            total_stats["credentials_processed"] += 1
            total_stats["total_created"] += stats.get("created", 0)
            total_stats["total_updated"] += stats.get("updated", 0)
            total_stats["total_skipped"] += stats.get("skipped", 0)
            total_stats["total_errors"] += stats.get("errors", 0)

            logger.info(f"Sync completed for {credential.user.username}: {stats}")

        except Exception as e:
            logger.error(f"Error syncing leads for {credential.user.username}: {e}")
            total_stats["total_errors"] += 1

            # Update credential with error status
            credential.last_sync_at = timezone.now()
            credential.last_sync_status = "error"
            credential.save()

    logger.info(f"Google Ads LSA leads sync completed: {total_stats}")
    return total_stats
