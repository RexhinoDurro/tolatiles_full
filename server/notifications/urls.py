from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NotificationViewSet,
    NotificationPreferenceView,
    PushSubscriptionViewSet,
    VapidKeyView,
    DailyStatsView
)

router = DefaultRouter()
router.register('notifications', NotificationViewSet, basename='notification')
router.register('push-subscriptions', PushSubscriptionViewSet, basename='push-subscription')

urlpatterns = [
    path('', include(router.urls)),
    path('preferences/', NotificationPreferenceView.as_view(), name='notification-preferences'),
    path('vapid-key/', VapidKeyView.as_view(), name='vapid-key'),
    path('stats/daily/', DailyStatsView.as_view(), name='daily-stats'),
]
