"""
Google Search Console API Service

Provides functionality to:
- Authenticate via OAuth 2.0
- Refresh access tokens
- List verified sites/properties
- Fetch performance analytics (clicks, impressions, CTR, position)
"""

import requests
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from urllib.parse import urlencode

from .models import GoogleSearchConsoleCredential


# Google OAuth endpoints
GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

# Search Console API endpoints
SEARCH_CONSOLE_API_BASE = 'https://www.googleapis.com/webmasters/v3'
SEARCH_CONSOLE_SITES_URL = f'{SEARCH_CONSOLE_API_BASE}/sites'


class SearchConsoleService:
    """Service class for Google Search Console API operations."""

    def __init__(self, credential: GoogleSearchConsoleCredential = None):
        self.credential = credential
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET

    def get_authorization_url(self, redirect_uri: str, state: str) -> str:
        """
        Generate the Google OAuth authorization URL.

        Args:
            redirect_uri: The callback URL after authorization
            state: CSRF protection token stored in session

        Returns:
            The full authorization URL to redirect the user to
        """
        params = {
            'client_id': self.client_id,
            'redirect_uri': redirect_uri,
            'response_type': 'code',
            'scope': 'https://www.googleapis.com/auth/webmasters.readonly email profile',
            'access_type': 'offline',
            'prompt': 'consent',
            'state': state,
        }
        return f"{GOOGLE_AUTH_URL}?{urlencode(params)}"

    def exchange_code_for_tokens(self, code: str, redirect_uri: str) -> dict:
        """
        Exchange authorization code for access and refresh tokens.

        Args:
            code: The authorization code from Google callback
            redirect_uri: Must match the redirect_uri used in authorization

        Returns:
            dict with access_token, refresh_token, expires_in, token_type
        """
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri,
        }

        response = requests.post(GOOGLE_TOKEN_URL, data=data)
        response.raise_for_status()
        return response.json()

    def refresh_access_token(self) -> str:
        """
        Refresh the access token using the stored refresh token.

        Returns:
            New access token

        Raises:
            ValueError: If no credential or refresh token available
        """
        if not self.credential or not self.credential.refresh_token:
            raise ValueError("No refresh token available")

        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'refresh_token': self.credential.refresh_token,
            'grant_type': 'refresh_token',
        }

        response = requests.post(GOOGLE_TOKEN_URL, data=data)
        response.raise_for_status()
        token_data = response.json()

        # Update stored access token
        self.credential.access_token = token_data['access_token']
        self.credential.token_expiry = timezone.now() + timedelta(
            seconds=token_data.get('expires_in', 3600)
        )
        self.credential.save()

        return token_data['access_token']

    def get_valid_access_token(self) -> str:
        """
        Get a valid access token, refreshing if necessary.

        Returns:
            Valid access token
        """
        if not self.credential:
            raise ValueError("No credential available")

        # Check if token is expired or about to expire (5 min buffer)
        if self.credential.token_expiry:
            if timezone.now() >= self.credential.token_expiry - timedelta(minutes=5):
                return self.refresh_access_token()

        if self.credential.access_token:
            return self.credential.access_token

        return self.refresh_access_token()

    def get_user_info(self, access_token: str) -> dict:
        """
        Get user info from Google.

        Args:
            access_token: Valid access token

        Returns:
            dict with user info (email, name, etc.)
        """
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(GOOGLE_USERINFO_URL, headers=headers)
        response.raise_for_status()
        return response.json()

    def _make_api_request(self, method: str, url: str, **kwargs) -> dict:
        """
        Make an authenticated API request with automatic token refresh.

        Args:
            method: HTTP method (GET, POST, etc.)
            url: API endpoint URL
            **kwargs: Additional arguments for requests

        Returns:
            JSON response from API
        """
        access_token = self.get_valid_access_token()
        headers = kwargs.pop('headers', {})
        headers['Authorization'] = f'Bearer {access_token}'

        response = requests.request(method, url, headers=headers, **kwargs)

        # If unauthorized, try refreshing token once
        if response.status_code == 401:
            access_token = self.refresh_access_token()
            headers['Authorization'] = f'Bearer {access_token}'
            response = requests.request(method, url, headers=headers, **kwargs)

        response.raise_for_status()
        return response.json()

    def list_sites(self) -> list:
        """
        List all verified sites/properties in Search Console.

        Returns:
            List of site entries with siteUrl and permissionLevel

        Example response:
        [
            {
                "siteUrl": "https://tolatiles.com/",
                "permissionLevel": "siteOwner"
            },
            {
                "siteUrl": "sc-domain:tolatiles.com",
                "permissionLevel": "siteOwner"
            }
        ]
        """
        result = self._make_api_request('GET', SEARCH_CONSOLE_SITES_URL)
        return result.get('siteEntry', [])

    def query_search_analytics(
        self,
        site_url: str,
        start_date: str,
        end_date: str,
        dimensions: list = None,
        row_limit: int = 1000,
        start_row: int = 0,
        filters: list = None,
        aggregation_type: str = 'auto'
    ) -> dict:
        """
        Query Search Console search analytics data.

        Args:
            site_url: The site URL (e.g., 'https://tolatiles.com/' or 'sc-domain:tolatiles.com')
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format
            dimensions: List of dimensions (date, query, page, country, device, searchAppearance)
            row_limit: Maximum rows to return (default 1000, max 25000)
            start_row: Zero-based index of first row (for pagination)
            filters: List of filter objects with dimension, operator, expression
            aggregation_type: 'auto', 'byPage', or 'byProperty'

        Returns:
            dict with rows containing keys, clicks, impressions, ctr, position

        Example payloads:

        1. TOTALS (no dimensions):
        {
            "startDate": "2024-01-01",
            "endDate": "2024-01-31",
            "rowLimit": 1
        }
        Response:
        {
            "rows": [{
                "clicks": 1250,
                "impressions": 45000,
                "ctr": 0.0278,
                "position": 12.5
            }]
        }

        2. DAILY TREND (dimension=date):
        {
            "startDate": "2024-01-01",
            "endDate": "2024-01-31",
            "dimensions": ["date"]
        }
        Response:
        {
            "rows": [
                {"keys": ["2024-01-01"], "clicks": 45, "impressions": 1500, "ctr": 0.03, "position": 11.2},
                {"keys": ["2024-01-02"], "clicks": 52, "impressions": 1650, "ctr": 0.0315, "position": 10.8},
                ...
            ]
        }

        3. TOP QUERIES (dimension=query):
        {
            "startDate": "2024-01-01",
            "endDate": "2024-01-31",
            "dimensions": ["query"],
            "rowLimit": 10
        }
        Response:
        {
            "rows": [
                {"keys": ["tile installation jacksonville"], "clicks": 125, "impressions": 2500, "ctr": 0.05, "position": 3.2},
                {"keys": ["backsplash installer near me"], "clicks": 98, "impressions": 1800, "ctr": 0.0544, "position": 4.1},
                ...
            ]
        }

        4. TOP PAGES (dimension=page):
        {
            "startDate": "2024-01-01",
            "endDate": "2024-01-31",
            "dimensions": ["page"],
            "rowLimit": 10
        }
        Response:
        {
            "rows": [
                {"keys": ["https://tolatiles.com/services/kitchen-backsplash"], "clicks": 320, "impressions": 5500, "ctr": 0.0582, "position": 5.3},
                {"keys": ["https://tolatiles.com/gallery/backsplashes"], "clicks": 210, "impressions": 4200, "ctr": 0.05, "position": 6.1},
                ...
            ]
        }
        """
        # URL encode the site_url for the API path
        encoded_site_url = requests.utils.quote(site_url, safe='')
        url = f"{SEARCH_CONSOLE_SITES_URL}/{encoded_site_url}/searchAnalytics/query"

        payload = {
            'startDate': start_date,
            'endDate': end_date,
            'rowLimit': row_limit,
            'startRow': start_row,
            'aggregationType': aggregation_type,
        }

        if dimensions:
            payload['dimensions'] = dimensions

        if filters:
            payload['dimensionFilterGroups'] = [{
                'filters': filters
            }]

        return self._make_api_request('POST', url, json=payload)

    def get_totals(self, site_url: str, start_date: str, end_date: str) -> dict:
        """
        Get total metrics (clicks, impressions, CTR, position) for a date range.

        Returns:
            dict with clicks, impressions, ctr, position
        """
        result = self.query_search_analytics(
            site_url=site_url,
            start_date=start_date,
            end_date=end_date,
            row_limit=1
        )

        if result.get('rows'):
            row = result['rows'][0]
            return {
                'clicks': row.get('clicks', 0),
                'impressions': row.get('impressions', 0),
                'ctr': round(row.get('ctr', 0) * 100, 2),  # Convert to percentage
                'position': round(row.get('position', 0), 1),
            }

        return {'clicks': 0, 'impressions': 0, 'ctr': 0, 'position': 0}

    def get_daily_trend(
        self,
        site_url: str,
        start_date: str,
        end_date: str
    ) -> list:
        """
        Get daily performance metrics.

        Returns:
            List of dicts with date, clicks, impressions, ctr, position
        """
        result = self.query_search_analytics(
            site_url=site_url,
            start_date=start_date,
            end_date=end_date,
            dimensions=['date'],
            row_limit=1000
        )

        return [
            {
                'date': row['keys'][0],
                'clicks': row.get('clicks', 0),
                'impressions': row.get('impressions', 0),
                'ctr': round(row.get('ctr', 0) * 100, 2),
                'position': round(row.get('position', 0), 1),
            }
            for row in result.get('rows', [])
        ]

    def get_top_queries(
        self,
        site_url: str,
        start_date: str,
        end_date: str,
        limit: int = 10
    ) -> list:
        """
        Get top search queries.

        Returns:
            List of dicts with query, clicks, impressions, ctr, position
        """
        result = self.query_search_analytics(
            site_url=site_url,
            start_date=start_date,
            end_date=end_date,
            dimensions=['query'],
            row_limit=limit
        )

        return [
            {
                'query': row['keys'][0],
                'clicks': row.get('clicks', 0),
                'impressions': row.get('impressions', 0),
                'ctr': round(row.get('ctr', 0) * 100, 2),
                'position': round(row.get('position', 0), 1),
            }
            for row in result.get('rows', [])
        ]

    def get_top_pages(
        self,
        site_url: str,
        start_date: str,
        end_date: str,
        limit: int = 10
    ) -> list:
        """
        Get top performing pages.

        Returns:
            List of dicts with page, clicks, impressions, ctr, position
        """
        result = self.query_search_analytics(
            site_url=site_url,
            start_date=start_date,
            end_date=end_date,
            dimensions=['page'],
            row_limit=limit
        )

        return [
            {
                'page': row['keys'][0],
                'clicks': row.get('clicks', 0),
                'impressions': row.get('impressions', 0),
                'ctr': round(row.get('ctr', 0) * 100, 2),
                'position': round(row.get('position', 0), 1),
            }
            for row in result.get('rows', [])
        ]

    def get_performance_summary(
        self,
        site_url: str,
        days: int = 28
    ) -> dict:
        """
        Get a complete performance summary for the dashboard.

        Args:
            site_url: The Search Console property URL
            days: Number of days to look back (default 28)

        Returns:
            dict with totals, dailyTrend, topQueries, topPages, and comparison data
        """
        end_date = (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d')  # Data has 2-day delay
        start_date = (datetime.now() - timedelta(days=days + 2)).strftime('%Y-%m-%d')

        # Previous period for comparison
        prev_end_date = (datetime.now() - timedelta(days=days + 3)).strftime('%Y-%m-%d')
        prev_start_date = (datetime.now() - timedelta(days=(days * 2) + 3)).strftime('%Y-%m-%d')

        # Current period data
        totals = self.get_totals(site_url, start_date, end_date)
        daily_trend = self.get_daily_trend(site_url, start_date, end_date)
        top_queries = self.get_top_queries(site_url, start_date, end_date, limit=10)
        top_pages = self.get_top_pages(site_url, start_date, end_date, limit=10)

        # Previous period for comparison
        prev_totals = self.get_totals(site_url, prev_start_date, prev_end_date)

        # Calculate changes
        def calc_change(current, previous):
            if previous == 0:
                return 100 if current > 0 else 0
            return round(((current - previous) / previous) * 100, 1)

        comparison = {
            'clicks_change': calc_change(totals['clicks'], prev_totals['clicks']),
            'impressions_change': calc_change(totals['impressions'], prev_totals['impressions']),
            'ctr_change': round(totals['ctr'] - prev_totals['ctr'], 2),
            'position_change': round(prev_totals['position'] - totals['position'], 1),  # Lower is better
        }

        return {
            'period': {
                'start_date': start_date,
                'end_date': end_date,
                'days': days,
            },
            'totals': totals,
            'comparison': comparison,
            'daily_trend': daily_trend,
            'top_queries': top_queries,
            'top_pages': top_pages,
        }
