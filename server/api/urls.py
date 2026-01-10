from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from gallery.views import CategoryViewSet, GalleryImageViewSet
from leads.views import ContactLeadViewSet
from authentication.views import LoginView, LogoutView, CurrentUserView


# Create router and register viewsets
router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('gallery', GalleryImageViewSet, basename='gallery')
router.register('leads', ContactLeadViewSet, basename='lead')


urlpatterns = [
    # API routes
    path('', include(router.urls)),

    # Authentication endpoints
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth_refresh'),
    path('auth/me/', CurrentUserView.as_view(), name='auth_me'),
]
