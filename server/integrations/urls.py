from django.urls import path

from .views import (
    SearchConsoleConnectView,
    SearchConsoleCallbackView,
    SearchConsoleAuthUrlView,
    SearchConsoleStatusView,
    SearchConsoleDisconnectView,
    SearchConsoleSitesView,
    SearchConsolePerformanceView,
    GoogleAdsConnectView,
    GoogleAdsCallbackView,
    GoogleAdsAuthUrlView,
    GoogleAdsStatusView,
    GoogleAdsDisconnectView,
    GoogleAdsSyncLeadsView,
)

# OAuth endpoints (non-API, used for browser redirects)
oauth_urlpatterns = [
    path(
        'google/search-console/connect/',
        SearchConsoleConnectView.as_view(),
        name='search-console-connect'
    ),
    path(
        'google/search-console/callback/',
        SearchConsoleCallbackView.as_view(),
        name='search-console-callback'
    ),
    path(
        'google/search-console/callback',
        SearchConsoleCallbackView.as_view(),
        name='search-console-callback-no-slash'
    ),
    # Google Ads OAuth endpoints
    path(
        'google/ads/connect/',
        GoogleAdsConnectView.as_view(),
        name='google-ads-connect'
    ),
    path(
        'google/ads/callback/',
        GoogleAdsCallbackView.as_view(),
        name='google-ads-callback'
    ),
]

# API endpoints
api_urlpatterns = [
    path(
        'search-console/auth-url/',
        SearchConsoleAuthUrlView.as_view(),
        name='search-console-auth-url'
    ),
    path(
        'search-console/status/',
        SearchConsoleStatusView.as_view(),
        name='search-console-status'
    ),
    path(
        'search-console/disconnect/',
        SearchConsoleDisconnectView.as_view(),
        name='search-console-disconnect'
    ),
    path(
        'search-console/sites/',
        SearchConsoleSitesView.as_view(),
        name='search-console-sites'
    ),
    path(
        'search-console/performance/',
        SearchConsolePerformanceView.as_view(),
        name='search-console-performance'
    ),
    # Google Ads API endpoints
    path(
        'google-ads/auth-url/',
        GoogleAdsAuthUrlView.as_view(),
        name='google-ads-auth-url'
    ),
    path(
        'google-ads/status/',
        GoogleAdsStatusView.as_view(),
        name='google-ads-status'
    ),
    path(
        'google-ads/disconnect/',
        GoogleAdsDisconnectView.as_view(),
        name='google-ads-disconnect'
    ),
    path(
        'google-ads/sync-leads/',
        GoogleAdsSyncLeadsView.as_view(),
        name='google-ads-sync-leads'
    ),
]
