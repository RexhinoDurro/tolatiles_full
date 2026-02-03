"""
Google Search Console Integration Views

OAuth endpoints:
- /integrations/google/search-console/connect/ - Start OAuth flow
- /integrations/google/search-console/callback/ - Handle OAuth callback

API endpoints:
- /api/integrations/search-console/status/ - Check connection status
- /api/integrations/search-console/disconnect/ - Disconnect integration
- /api/integrations/search-console/sites/ - List verified sites
- /api/integrations/search-console/performance/ - Get performance data
"""

import secrets
from datetime import timedelta

from django.shortcuts import redirect
from django.conf import settings
from django.utils import timezone
from django.http import JsonResponse
from django.views import View

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status

from .models import GoogleSearchConsoleCredential, GoogleAdsCredential
from .services import SearchConsoleService
from .google_ads_service import GoogleAdsLSAService


class SearchConsoleConnectView(View):
    """
    GET /integrations/google/search-console/connect/

    Initiates the Google OAuth flow for Search Console.
    Redirects to Google's authorization endpoint.
    """

    def get(self, request):
        # Verify user is authenticated and is admin
        if not request.user.is_authenticated or not request.user.is_staff:
            return redirect(f"{settings.FRONTEND_URL}/admin/login")

        # Generate secure state parameter for CSRF protection
        state = secrets.token_urlsafe(32)
        request.session['google_oauth_state'] = state
        request.session['google_oauth_user_id'] = request.user.id

        # Determine redirect URI based on environment
        if settings.DEBUG:
            redirect_uri = 'http://127.0.0.1:8000/integrations/google/search-console/callback'
        else:
            redirect_uri = 'https://tolatiles.com/integrations/google/search-console/callback/'

        # Get authorization URL
        service = SearchConsoleService()
        auth_url = service.get_authorization_url(redirect_uri, state)

        return redirect(auth_url)


class SearchConsoleCallbackView(View):
    """
    GET /integrations/google/search-console/callback/

    Handles the OAuth callback from Google.
    Exchanges code for tokens and stores them securely.
    """

    def get(self, request):
        # Check for error from Google
        error = request.GET.get('error')
        if error:
            return redirect(f"{settings.FRONTEND_URL}/admin/stats?error={error}")

        # Get authorization code
        code = request.GET.get('code')
        if not code:
            return redirect(f"{settings.FRONTEND_URL}/admin/stats?error=no_code")

        # Validate state parameter - find credential with matching state
        state = request.GET.get('state')
        if not state:
            return redirect(f"{settings.FRONTEND_URL}/admin/stats?error=invalid_state")

        try:
            # Find the credential with this state (stored in scope field temporarily)
            credential = GoogleSearchConsoleCredential.objects.get(scope=state)
            user = credential.user

            # Determine redirect URI (must match the one used in connect)
            if settings.DEBUG:
                redirect_uri = 'http://127.0.0.1:8000/integrations/google/search-console/callback'
            else:
                redirect_uri = 'https://tolatiles.com/integrations/google/search-console/callback/'

            # Exchange code for tokens
            service = SearchConsoleService()
            token_data = service.exchange_code_for_tokens(code, redirect_uri)

            # Get user info
            user_info = service.get_user_info(token_data['access_token'])

            # Store tokens
            credential.refresh_token = token_data.get('refresh_token')
            credential.access_token = token_data.get('access_token')
            credential.token_expiry = timezone.now() + timedelta(
                seconds=token_data.get('expires_in', 3600)
            )
            credential.is_connected = True
            credential.connected_email = user_info.get('email')
            credential.scope = 'https://www.googleapis.com/auth/webmasters.readonly'  # Reset scope
            credential.save()

            return redirect(f"{settings.FRONTEND_URL}/admin/stats?success=search_console_connected")

        except GoogleSearchConsoleCredential.DoesNotExist:
            return redirect(f"{settings.FRONTEND_URL}/admin/stats?error=invalid_state")
        except Exception as e:
            print(f"OAuth callback error: {e}")
            return redirect(f"{settings.FRONTEND_URL}/admin/stats?error=token_exchange_failed")


class SearchConsoleAuthUrlView(APIView):
    """
    GET /api/integrations/search-console/auth-url/

    Get the Google OAuth authorization URL for Search Console.
    Returns the URL that the frontend should redirect to.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Generate secure state parameter
        state = secrets.token_urlsafe(32)

        # Store state in credential model for validation
        credential, _ = GoogleSearchConsoleCredential.objects.get_or_create(user=request.user)
        credential.scope = state  # Temporarily store state in scope field
        credential.save()

        # Determine redirect URI based on environment
        if settings.DEBUG:
            redirect_uri = 'http://127.0.0.1:8000/integrations/google/search-console/callback'
        else:
            redirect_uri = 'https://tolatiles.com/integrations/google/search-console/callback/'

        # Get authorization URL
        service = SearchConsoleService()
        auth_url = service.get_authorization_url(redirect_uri, state)

        return Response({'auth_url': auth_url})


class SearchConsoleStatusView(APIView):
    """
    GET /api/integrations/search-console/status/

    Check the Search Console connection status.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            credential = GoogleSearchConsoleCredential.objects.get(user=request.user)
            return Response({
                'is_connected': credential.is_connected,
                'connected_email': credential.connected_email,
                'connected_at': credential.created_at,
            })
        except GoogleSearchConsoleCredential.DoesNotExist:
            return Response({
                'is_connected': False,
                'connected_email': None,
                'connected_at': None,
            })


class SearchConsoleDisconnectView(APIView):
    """
    POST /api/integrations/search-console/disconnect/

    Disconnect the Search Console integration.
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        try:
            credential = GoogleSearchConsoleCredential.objects.get(user=request.user)
            credential.clear_tokens()
            return Response({'success': True, 'message': 'Search Console disconnected'})
        except GoogleSearchConsoleCredential.DoesNotExist:
            return Response(
                {'success': False, 'message': 'No connection found'},
                status=status.HTTP_404_NOT_FOUND
            )


class SearchConsoleSitesView(APIView):
    """
    GET /api/integrations/search-console/sites/

    List all verified sites/properties.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            credential = GoogleSearchConsoleCredential.objects.get(
                user=request.user,
                is_connected=True
            )
        except GoogleSearchConsoleCredential.DoesNotExist:
            return Response(
                {'error': 'Search Console not connected'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            service = SearchConsoleService(credential)
            sites = service.list_sites()
            return Response({'sites': sites})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SearchConsolePerformanceView(APIView):
    """
    GET /api/integrations/search-console/performance/

    Get performance metrics from Search Console.

    Query parameters:
    - site_url: The property URL (required)
    - start_date: Start date YYYY-MM-DD (optional, defaults to 28 days ago)
    - end_date: End date YYYY-MM-DD (optional, defaults to 2 days ago)
    - type: 'summary', 'daily', 'queries', 'pages' (optional, defaults to 'summary')
    - limit: Number of results for queries/pages (optional, defaults to 10)
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            credential = GoogleSearchConsoleCredential.objects.get(
                user=request.user,
                is_connected=True
            )
        except GoogleSearchConsoleCredential.DoesNotExist:
            return Response(
                {'error': 'Search Console not connected'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get parameters
        site_url = request.query_params.get('site_url')
        if not site_url:
            return Response(
                {'error': 'site_url parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        data_type = request.query_params.get('type', 'summary')
        limit = int(request.query_params.get('limit', 10))

        # Date range (default: last 28 days, with 2-day delay for data availability)
        end_date = request.query_params.get('end_date')
        start_date = request.query_params.get('start_date')

        if not end_date:
            end_date = (timezone.now() - timedelta(days=2)).strftime('%Y-%m-%d')
        if not start_date:
            start_date = (timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d')

        try:
            service = SearchConsoleService(credential)

            if data_type == 'summary':
                # Get full summary with comparison
                days = (timezone.datetime.strptime(end_date, '%Y-%m-%d') -
                       timezone.datetime.strptime(start_date, '%Y-%m-%d')).days
                data = service.get_performance_summary(site_url, days=days)
            elif data_type == 'daily':
                data = service.get_daily_trend(site_url, start_date, end_date)
            elif data_type == 'queries':
                data = service.get_top_queries(site_url, start_date, end_date, limit)
            elif data_type == 'pages':
                data = service.get_top_pages(site_url, start_date, end_date, limit)
            elif data_type == 'totals':
                data = service.get_totals(site_url, start_date, end_date)
            else:
                return Response(
                    {'error': f'Invalid type: {data_type}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return Response(data)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============ Google Ads / Local Services Ads Views ============

class GoogleAdsConnectView(View):
    """
    GET /integrations/google/ads/connect/

    Initiates the Google OAuth flow for Google Ads.
    """

    def get(self, request):
        if not request.user.is_authenticated or not request.user.is_staff:
            return redirect(f"{settings.FRONTEND_URL}/admin/login")

        state = secrets.token_urlsafe(32)
        request.session['google_ads_oauth_state'] = state

        if settings.DEBUG:
            redirect_uri = 'http://127.0.0.1:8000/integrations/google/ads/callback/'
        else:
            redirect_uri = 'https://tolatiles.com/integrations/google/ads/callback/'

        service = GoogleAdsLSAService()
        auth_url = service.get_authorization_url(redirect_uri, state)

        return redirect(auth_url)


class GoogleAdsCallbackView(View):
    """
    GET /integrations/google/ads/callback/

    Handles the OAuth callback from Google for Ads.
    """

    def get(self, request):
        import traceback

        error = request.GET.get('error')
        if error:
            print(f"Google Ads OAuth error from Google: {error}")
            return redirect(f"{settings.FRONTEND_URL}/admin/leads?tab=local_ads&error={error}")

        code = request.GET.get('code')
        if not code:
            print("Google Ads OAuth: No code received")
            return redirect(f"{settings.FRONTEND_URL}/admin/leads?tab=local_ads&error=no_code")

        state = request.GET.get('state')
        if not state:
            print("Google Ads OAuth: No state received")
            return redirect(f"{settings.FRONTEND_URL}/admin/leads?tab=local_ads&error=invalid_state")

        try:
            # Find the credential with this state (stored in connected_email field temporarily)
            credential = GoogleAdsCredential.objects.get(connected_email=state)
            user = credential.user
            print(f"Google Ads OAuth: Found credential for user {user.username}")

        except GoogleAdsCredential.DoesNotExist:
            print(f"Google Ads OAuth: No credential found with state {state}")
            return redirect(f"{settings.FRONTEND_URL}/admin/leads?tab=local_ads&error=invalid_state")

        try:
            if settings.DEBUG:
                redirect_uri = 'http://127.0.0.1:8000/integrations/google/ads/callback/'
            else:
                redirect_uri = 'https://tolatiles.com/integrations/google/ads/callback/'

            print(f"Google Ads OAuth: Exchanging code for tokens with redirect_uri={redirect_uri}")

            service = GoogleAdsLSAService()
            token_data = service.exchange_code_for_tokens(code, redirect_uri)

            print(f"Google Ads OAuth: Token exchange successful, got refresh_token: {bool(token_data.get('refresh_token'))}")

            # Store tokens
            credential.refresh_token = token_data.get('refresh_token')
            credential.access_token = token_data.get('access_token')
            credential.token_expiry = token_data.get('expiry')
            credential.is_connected = True
            credential.connected_email = None  # Clear the temporary state
            credential.save()

            print(f"Google Ads OAuth: Successfully saved credentials for user {user.username}")

            return redirect(f"{settings.FRONTEND_URL}/admin/leads?tab=local_ads&success=google_ads_connected")

        except Exception as e:
            print(f"Google Ads OAuth callback error: {e}")
            print(traceback.format_exc())
            return redirect(f"{settings.FRONTEND_URL}/admin/leads?tab=local_ads&error=token_exchange_failed")


class GoogleAdsAuthUrlView(APIView):
    """
    GET /api/integrations/google-ads/auth-url/

    Get the Google OAuth authorization URL for Google Ads.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        state = secrets.token_urlsafe(32)

        # Store state in credential model (not session - JWT doesn't share sessions)
        credential, _ = GoogleAdsCredential.objects.get_or_create(user=request.user)
        credential.connected_email = state  # Temporarily store state in connected_email field
        credential.save()

        if settings.DEBUG:
            redirect_uri = 'http://127.0.0.1:8000/integrations/google/ads/callback/'
        else:
            redirect_uri = 'https://tolatiles.com/integrations/google/ads/callback/'

        service = GoogleAdsLSAService()
        auth_url = service.get_authorization_url(redirect_uri, state)

        return Response({'auth_url': auth_url})


class GoogleAdsStatusView(APIView):
    """
    GET /api/integrations/google-ads/status/

    Check the Google Ads connection status.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            credential = GoogleAdsCredential.objects.get(user=request.user)
            return Response({
                'is_connected': credential.is_connected,
                'connected_email': credential.connected_email,
                'connected_at': credential.created_at,
                'last_sync_at': credential.last_sync_at,
                'last_sync_status': credential.last_sync_status,
                'last_sync_count': credential.last_sync_count,
            })
        except GoogleAdsCredential.DoesNotExist:
            return Response({
                'is_connected': False,
                'connected_email': None,
                'connected_at': None,
                'last_sync_at': None,
                'last_sync_status': None,
                'last_sync_count': 0,
            })


class GoogleAdsDisconnectView(APIView):
    """
    POST /api/integrations/google-ads/disconnect/

    Disconnect the Google Ads integration.
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        try:
            credential = GoogleAdsCredential.objects.get(user=request.user)
            credential.clear_tokens()
            return Response({'success': True, 'message': 'Google Ads disconnected'})
        except GoogleAdsCredential.DoesNotExist:
            return Response(
                {'success': False, 'message': 'No connection found'},
                status=status.HTTP_404_NOT_FOUND
            )


class GoogleAdsSyncLeadsView(APIView):
    """
    POST /api/integrations/google-ads/sync-leads/

    Manually trigger sync of Local Services leads from Google Ads.
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        days = request.data.get('days', 90)

        try:
            credential = GoogleAdsCredential.objects.get(
                user=request.user,
                is_connected=True
            )
        except GoogleAdsCredential.DoesNotExist:
            return Response(
                {'error': 'Google Ads not connected'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            service = GoogleAdsLSAService(credential=credential)
            stats = service.sync_leads_to_database(days_back=days)

            return Response({
                'success': True,
                'message': f"Sync completed",
                'stats': stats,
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
