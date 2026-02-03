"""
Google Ads Local Services Leads Service.
Handles OAuth flow and fetching LSA leads from Google Ads API.
"""
import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

from django.conf import settings
from django.utils import timezone
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow

from .models import GoogleAdsCredential
from leads.models import LocalAdsLead

logger = logging.getLogger(__name__)

# OAuth2 scopes for Google Ads
GOOGLE_ADS_SCOPES = [
    'https://www.googleapis.com/auth/adwords',
]

# OAuth2 redirect URI
OAUTH_REDIRECT_PATH = '/integrations/google/ads/callback/'


class GoogleAdsLSAService:
    """Service for interacting with Google Ads Local Services Leads API."""

    def __init__(self, credential: Optional[GoogleAdsCredential] = None):
        self.credential = credential
        self._client = None

    def get_authorization_url(self, redirect_uri: str, state: str = None) -> str:
        """
        Generate OAuth2 authorization URL for Google Ads.

        Args:
            redirect_uri: The URI to redirect to after authorization
            state: Optional state parameter for CSRF protection

        Returns:
            The authorization URL
        """
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_ADS_CLIENT_ID,
                    "client_secret": settings.GOOGLE_ADS_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=GOOGLE_ADS_SCOPES,
        )
        flow.redirect_uri = redirect_uri

        authorization_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent',
            state=state,
        )

        return authorization_url

    def exchange_code_for_tokens(self, code: str, redirect_uri: str) -> Dict[str, Any]:
        """
        Exchange authorization code for access and refresh tokens.

        Args:
            code: The authorization code from Google
            redirect_uri: The redirect URI used in the authorization request

        Returns:
            Dict containing access_token, refresh_token, and expiry
        """
        import requests

        # Use raw requests to avoid scope validation issues when user has
        # previously authorized other Google scopes (like Search Console)
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            'client_id': settings.GOOGLE_ADS_CLIENT_ID,
            'client_secret': settings.GOOGLE_ADS_CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri,
        }

        response = requests.post(token_url, data=data)
        response.raise_for_status()
        token_data = response.json()

        # Calculate expiry time
        expires_in = token_data.get('expires_in', 3600)
        expiry = datetime.now() + timedelta(seconds=expires_in)

        return {
            'access_token': token_data.get('access_token'),
            'refresh_token': token_data.get('refresh_token'),
            'expiry': expiry,
        }

    def _get_client(self) -> GoogleAdsClient:
        """Get or create GoogleAdsClient instance."""
        if self._client is None:
            if not self.credential or not self.credential.refresh_token:
                raise ValueError("No valid credentials available")

            # Create client using load_from_dict for proper configuration
            # Note: Do NOT include login_customer_id - the accounts are directly accessible
            config = {
                "developer_token": settings.GOOGLE_ADS_DEVELOPER_TOKEN,
                "client_id": settings.GOOGLE_ADS_CLIENT_ID,
                "client_secret": settings.GOOGLE_ADS_CLIENT_SECRET,
                "refresh_token": self.credential.refresh_token,
                "use_proto_plus": True,
            }

            self._client = GoogleAdsClient.load_from_dict(config)

        return self._client

    def fetch_local_services_leads(
        self,
        days_back: int = 90,
        customer_id: str = None
    ) -> List[Dict[str, Any]]:
        """
        Fetch Local Services leads from Google Ads API.

        Args:
            days_back: Number of days to look back for leads
            customer_id: The Google Ads customer ID (defaults to settings)

        Returns:
            List of lead dictionaries
        """
        # Try customer ID first, fall back to login customer ID for LSA
        customer_id = customer_id or settings.GOOGLE_ADS_CUSTOMER_ID
        logger.info(f"Fetching LSA leads for customer_id: {customer_id}")
        client = self._get_client()
        ga_service = client.get_service("GoogleAdsService")

        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)

        # Query for Local Services leads
        # Note: contact_details fields (phone_number, email, consumer_name) require
        # Basic or Standard access level. Explorer access only has limited fields.
        query = f"""
            SELECT
                local_services_lead.id,
                local_services_lead.category_id,
                local_services_lead.service_id,
                local_services_lead.lead_type,
                local_services_lead.lead_status,
                local_services_lead.creation_date_time,
                local_services_lead.locale,
                local_services_lead.lead_charged
            FROM local_services_lead
            WHERE local_services_lead.creation_date_time >= '{start_date.strftime("%Y-%m-%d")}'
            AND local_services_lead.creation_date_time <= '{end_date.strftime("%Y-%m-%d")}'
            ORDER BY local_services_lead.creation_date_time DESC
        """

        leads = []
        try:
            response = ga_service.search(customer_id=customer_id, query=query)

            for row in response:
                lead = row.local_services_lead
                leads.append({
                    'google_lead_id': str(lead.id),
                    'category_id': lead.category_id,
                    'service_id': lead.service_id,
                    # Note: contact_details require Basic/Standard access level
                    'phone_number': '',
                    'email': '',
                    'consumer_name': '',
                    'lead_type': lead.lead_type.name if lead.lead_type else 'UNKNOWN',
                    'lead_status': lead.lead_status.name if lead.lead_status else 'UNKNOWN',
                    'creation_date_time': lead.creation_date_time,
                    'locale': lead.locale,
                    'lead_charged': lead.lead_charged,
                    'credit_state': 'UNKNOWN',  # credit_details may also require higher access
                })

        except GoogleAdsException as ex:
            logger.error(f"Google Ads API error: {ex}")
            for error in ex.failure.errors:
                logger.error(f"Error: {error.message}")
            raise

        return leads

    def fetch_lead_conversation(
        self,
        lead_id: str,
        customer_id: str = None
    ) -> Dict[str, Any]:
        """
        Fetch conversation details for a specific lead.

        Args:
            lead_id: The lead ID
            customer_id: The Google Ads customer ID

        Returns:
            Lead conversation details
        """
        customer_id = customer_id or settings.GOOGLE_ADS_CUSTOMER_ID
        client = self._get_client()
        ga_service = client.get_service("GoogleAdsService")

        query = f"""
            SELECT
                local_services_lead_conversation.id,
                local_services_lead_conversation.conversation_channel,
                local_services_lead_conversation.participant_type,
                local_services_lead_conversation.text,
                local_services_lead_conversation.event_date_time
            FROM local_services_lead_conversation
            WHERE local_services_lead_conversation.lead = 'customers/{customer_id}/localServicesLeads/{lead_id}'
            ORDER BY local_services_lead_conversation.event_date_time ASC
        """

        messages = []
        try:
            response = ga_service.search(customer_id=customer_id, query=query)

            for row in response:
                conv = row.local_services_lead_conversation
                messages.append({
                    'id': str(conv.id),
                    'channel': conv.conversation_channel.name,
                    'participant': conv.participant_type.name,
                    'text': conv.text,
                    'timestamp': conv.event_date_time,
                })

        except GoogleAdsException as ex:
            logger.error(f"Google Ads API error fetching conversation: {ex}")
            raise

        return {'messages': messages}

    def sync_leads_to_database(self, days_back: int = 90) -> Dict[str, int]:
        """
        Sync Local Services leads from Google Ads to the database.

        Args:
            days_back: Number of days to look back for leads

        Returns:
            Dict with counts of created, updated, and skipped leads
        """
        leads = self.fetch_local_services_leads(days_back=days_back)

        stats = {'created': 0, 'updated': 0, 'skipped': 0, 'errors': 0}

        for lead_data in leads:
            try:
                # Map lead type
                lead_type = 'phone' if 'PHONE' in lead_data.get('lead_type', '') else 'message'

                # Map charge status
                charge_status = 'charged' if lead_data.get('lead_charged') else 'not_charged'

                # Parse datetime
                creation_dt = lead_data.get('creation_date_time')
                if creation_dt:
                    if isinstance(creation_dt, str):
                        lead_received = datetime.fromisoformat(creation_dt.replace('Z', '+00:00'))
                    else:
                        lead_received = creation_dt
                else:
                    lead_received = timezone.now()

                # Determine job type from category/service
                job_type = f"Service {lead_data.get('service_id', 'Unknown')}"

                # Check if lead exists
                existing = LocalAdsLead.objects.filter(
                    google_lead_id=lead_data['google_lead_id']
                ).first()

                if existing:
                    # Update charge status if changed
                    if existing.charge_status != charge_status:
                        existing.charge_status = charge_status
                        existing.last_activity = timezone.now()
                        existing.save()
                        stats['updated'] += 1
                    else:
                        stats['skipped'] += 1
                else:
                    # Create new lead
                    LocalAdsLead.objects.create(
                        google_lead_id=lead_data['google_lead_id'],
                        customer_phone=lead_data.get('phone_number', 'Unknown'),
                        customer_name=lead_data.get('consumer_name', ''),
                        job_type=job_type,
                        location=lead_data.get('locale', ''),
                        lead_type=lead_type,
                        charge_status=charge_status,
                        lead_received=lead_received,
                        last_activity=lead_received,
                        metadata={
                            'category_id': lead_data.get('category_id'),
                            'service_id': lead_data.get('service_id'),
                            'lead_status': lead_data.get('lead_status'),
                            'credit_state': lead_data.get('credit_state'),
                            'email': lead_data.get('email'),
                        }
                    )
                    stats['created'] += 1

            except Exception as e:
                logger.error(f"Error processing lead {lead_data.get('google_lead_id')}: {e}")
                stats['errors'] += 1

        # Update credential sync info
        if self.credential:
            self.credential.last_sync_at = timezone.now()
            self.credential.last_sync_status = 'success' if stats['errors'] == 0 else 'partial'
            self.credential.last_sync_count = stats['created'] + stats['updated']
            self.credential.save()

        return stats
