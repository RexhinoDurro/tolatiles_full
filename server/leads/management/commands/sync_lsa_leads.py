"""
Management command to sync Local Services Ads leads from Google Ads API.
"""
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from integrations.models import GoogleAdsCredential
from integrations.google_ads_service import GoogleAdsLSAService


class Command(BaseCommand):
    help = 'Sync Local Services Ads leads from Google Ads API'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=90,
            help='Number of days to look back for leads (default: 90)'
        )
        parser.add_argument(
            '--user',
            type=str,
            default='admin',
            help='Username with Google Ads credentials (default: admin)'
        )

    def handle(self, *args, **options):
        days = options['days']
        username = options['user']

        self.stdout.write(f"Syncing LSA leads from the last {days} days...")

        # Get user and credentials
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise CommandError(f"User '{username}' does not exist")

        try:
            credential = GoogleAdsCredential.objects.get(user=user)
        except GoogleAdsCredential.DoesNotExist:
            raise CommandError(
                f"No Google Ads credentials found for user '{username}'. "
                "Please connect Google Ads first."
            )

        if not credential.is_connected or not credential.refresh_token:
            raise CommandError(
                "Google Ads is not connected. Please complete the OAuth flow first."
            )

        # Create service and sync
        service = GoogleAdsLSAService(credential=credential)

        try:
            stats = service.sync_leads_to_database(days_back=days)

            self.stdout.write(self.style.SUCCESS(
                f"Sync completed! "
                f"Created: {stats['created']}, "
                f"Updated: {stats['updated']}, "
                f"Skipped: {stats['skipped']}, "
                f"Errors: {stats['errors']}"
            ))

        except Exception as e:
            raise CommandError(f"Error syncing leads: {e}")
