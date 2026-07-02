from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from gallery.views import CategoryViewSet, GalleryImageViewSet
from leads.views import ContactLeadViewSet, LocalAdsLeadViewSet
from authentication.views import (
    LoginView, LogoutView, CurrentUserView,
    QuotesPortalLoginView, QuotesManagerListCreateView, QuotesManagerDetailView,
)
from quotes.views import (
    CompanySettingsView,
    CustomerViewSet,
    QuoteViewSet,
    InvoiceViewSet,
    PublicQuoteView,
    PublicInvoiceView,
    EstimateViewSet,
    DealViewSet,
    EstimateVisitViewSet,
    AppointmentViewSet,
    CustomJobTypeViewSet,
    CustomLeadSourceViewSet,
    QuotesPortalViewSet,
    PortalCustomerSearchView,
    PortalCustomerCreateView,
)
from api.views import GoogleReviewsView
from integrations.urls import api_urlpatterns as integration_api_urls
from landingpages.views import LandingPageViewSet, LandingPageSectionViewSet


# Create router and register viewsets
router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('gallery', GalleryImageViewSet, basename='gallery')
router.register('leads', ContactLeadViewSet, basename='lead')
router.register('admin/leads/local-ads', LocalAdsLeadViewSet, basename='local-ads-lead')
router.register('customers', CustomerViewSet, basename='customer')
router.register('quotes', QuoteViewSet, basename='quote')
router.register('invoices', InvoiceViewSet, basename='invoice')
router.register('estimates', EstimateViewSet, basename='estimate')
router.register('deals', DealViewSet, basename='deal')
router.register('estimate-visits', EstimateVisitViewSet, basename='estimate-visit')
router.register('appointments', AppointmentViewSet, basename='appointment')
router.register('job-types', CustomJobTypeViewSet, basename='job-type')
router.register('lead-sources', CustomLeadSourceViewSet, basename='lead-source')
router.register('portal/quotes', QuotesPortalViewSet, basename='portal-quote')
router.register('landing-pages', LandingPageViewSet, basename='landing-page')
router.register('landing-page-sections', LandingPageSectionViewSet, basename='landing-page-section')


urlpatterns = [
    # API routes
    path('', include(router.urls)),

    # Authentication endpoints
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth_refresh'),
    path('auth/me/', CurrentUserView.as_view(), name='auth_me'),
    path('auth/portal-login/', QuotesPortalLoginView.as_view(), name='portal_login'),
    path('auth/quotes-managers/', QuotesManagerListCreateView.as_view(), name='quotes_managers'),
    path('auth/quotes-managers/<int:pk>/', QuotesManagerDetailView.as_view(), name='quotes_manager_detail'),
    path('portal/customers/', PortalCustomerCreateView.as_view(), name='portal_customer_create'),
    path('portal/customers/search/', PortalCustomerSearchView.as_view(), name='portal_customer_search'),

    # Company settings (singleton)
    path('company-settings/', CompanySettingsView.as_view(), name='company_settings'),

    # Public quote/invoice views (no auth required)
    path('quotes/public/<str:reference>/', PublicQuoteView.as_view(), name='public_quote'),
    path('invoices/public/<str:reference>/', PublicInvoiceView.as_view(), name='public_invoice'),

    # Google Reviews
    path('google-reviews/', GoogleReviewsView.as_view(), name='google_reviews'),

    # Integrations API
    path('integrations/', include(integration_api_urls)),

    # Notifications API
    path('notifications/', include('notifications.urls')),

    # Blog API
    path('blog/', include('blog.urls')),

    # Projects API
    path('projects/', include('projects.urls')),

    # FAQs API
    path('faqs/', include('faqs.urls')),
]
