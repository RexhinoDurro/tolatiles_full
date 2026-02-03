"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from integrations.urls import oauth_urlpatterns as integration_oauth_urls

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/', include('api.urls')),
    # OAuth endpoints for integrations (browser redirects)
    path('integrations/', include(integration_oauth_urls)),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
