"""Notification service for creating and delivering notifications."""

import json
import logging
from typing import Optional, Dict, Any, List
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.conf import settings
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for managing notifications."""

    @staticmethod
    def create_notification(
        user: User,
        notification_type: str,
        title: str,
        message: str,
        priority: str = 'normal',
        related_object: Any = None,
        data: Optional[Dict] = None
    ) -> 'Notification':
        """
        Create a notification and attempt delivery.

        Args:
            user: The user to notify
            notification_type: One of 'new_lead', 'lead_status', 'quote_status',
                             'invoice_paid', 'system'
            title: Notification title
            message: Notification message
            priority: 'low', 'normal', or 'high'
            related_object: Optional model instance to link to
            data: Optional additional data dict

        Returns:
            The created Notification instance
        """
        from .models import Notification, NotificationPreference

        # Check user preferences
        try:
            prefs = NotificationPreference.objects.get(user=user)
            pref_field = f"{notification_type}_enabled"
            if hasattr(prefs, pref_field) and not getattr(prefs, pref_field):
                logger.debug(f"Notification type {notification_type} disabled for user {user.username}")
                return None
        except NotificationPreference.DoesNotExist:
            pass  # Default to enabled if no preferences set

        # Build content type info for related object
        content_type = None
        object_id = None
        if related_object:
            content_type = ContentType.objects.get_for_model(related_object)
            object_id = related_object.pk

        # Create notification
        notification = Notification.objects.create(
            user=user,
            type=notification_type,
            title=title,
            message=message,
            priority=priority,
            related_object_type=content_type,
            related_object_id=object_id,
            data=data or {}
        )

        # Attempt WebSocket delivery
        websocket_delivered = NotificationService._send_websocket(notification)
        if websocket_delivered:
            notification.delivered_via_websocket = True
            notification.save(update_fields=['delivered_via_websocket'])

        # Queue push notification (handled async by Celery)
        from .tasks import send_push_notification
        send_push_notification.delay(notification.id)

        return notification

    @staticmethod
    def create_notification_for_all_staff(
        notification_type: str,
        title: str,
        message: str,
        priority: str = 'normal',
        related_object: Any = None,
        data: Optional[Dict] = None
    ) -> List['Notification']:
        """Create notifications for all staff users."""
        staff_users = User.objects.filter(is_staff=True)
        notifications = []

        for user in staff_users:
            notification = NotificationService.create_notification(
                user=user,
                notification_type=notification_type,
                title=title,
                message=message,
                priority=priority,
                related_object=related_object,
                data=data
            )
            if notification:
                notifications.append(notification)

        return notifications

    @staticmethod
    def _send_websocket(notification: 'Notification') -> bool:
        """
        Send notification via WebSocket to the user.

        Returns True if successfully sent, False otherwise.
        """
        try:
            channel_layer = get_channel_layer()
            if not channel_layer:
                logger.warning("No channel layer configured")
                return False

            group_name = f"notifications_{notification.user.id}"

            # Serialize notification data
            notification_data = {
                'id': notification.id,
                'type': notification.type,
                'title': notification.title,
                'message': notification.message,
                'priority': notification.priority,
                'related_object_type': notification.related_object_type.model if notification.related_object_type else None,
                'related_object_id': notification.related_object_id,
                'data': notification.data,
                'created_at': notification.created_at.isoformat(),
            }

            # Send to user's notification group
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'notification_message',
                    'notification': notification_data
                }
            )

            logger.info(f"WebSocket notification sent to user {notification.user.username}")
            return True

        except Exception as e:
            logger.error(f"Failed to send WebSocket notification: {e}")
            return False

    @staticmethod
    def send_unread_count_update(user: User):
        """Send updated unread count to user via WebSocket."""
        try:
            from .models import Notification

            channel_layer = get_channel_layer()
            if not channel_layer:
                return

            count = Notification.objects.filter(user=user, is_read=False).count()
            group_name = f"notifications_{user.id}"

            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'unread_count_update',
                    'count': count
                }
            )

        except Exception as e:
            logger.error(f"Failed to send unread count update: {e}")


def send_push_notification_to_user(user: User, notification: 'Notification') -> int:
    """
    Send push notification to all of a user's subscribed devices.

    Returns the number of successful deliveries.
    """
    from .models import PushSubscription, NotificationPreference
    from pywebpush import webpush, WebPushException

    # Check if push is enabled for user
    try:
        prefs = NotificationPreference.objects.get(user=user)
        if not prefs.push_enabled:
            return 0
    except NotificationPreference.DoesNotExist:
        pass  # Default to enabled

    # Get VAPID settings
    vapid_private_key = getattr(settings, 'VAPID_PRIVATE_KEY', None)
    vapid_claims = {
        'sub': f"mailto:{getattr(settings, 'VAPID_CLAIMS_EMAIL', 'admin@tolatiles.com')}"
    }

    if not vapid_private_key:
        logger.warning("VAPID_PRIVATE_KEY not configured, skipping push notifications")
        return 0

    # Get active subscriptions
    subscriptions = PushSubscription.objects.filter(
        user=user,
        is_active=True
    )

    # Prepare payload
    payload = json.dumps({
        'title': notification.title,
        'body': notification.message,
        'icon': '/images/logo.png',
        'badge': '/images/badge-72.png',
        'tag': f'notification-{notification.id}',
        'data': {
            'notification_id': notification.id,
            'type': notification.type,
            'related_type': notification.related_object_type.model if notification.related_object_type else None,
            'related_id': notification.related_object_id,
            'url': notification.data.get('url', '/admin/notifications')
        },
        'requireInteraction': notification.priority == 'high',
        'vibrate': [200, 100, 200] if notification.priority != 'low' else None
    })

    successful = 0
    for subscription in subscriptions:
        try:
            webpush(
                subscription_info={
                    'endpoint': subscription.endpoint,
                    'keys': {
                        'p256dh': subscription.p256dh_key,
                        'auth': subscription.auth_key
                    }
                },
                data=payload,
                vapid_private_key=vapid_private_key,
                vapid_claims=vapid_claims
            )

            subscription.last_used_at = timezone.now()
            subscription.failed_count = 0
            subscription.save(update_fields=['last_used_at', 'failed_count'])
            successful += 1

            logger.info(f"Push notification sent to {subscription.device_name or 'device'}")

        except WebPushException as e:
            logger.error(f"Push notification failed: {e}")
            subscription.failed_count += 1

            # Disable subscription after too many failures
            if subscription.failed_count >= 3:
                subscription.is_active = False
                logger.warning(f"Disabling subscription {subscription.id} after {subscription.failed_count} failures")

            subscription.save(update_fields=['failed_count', 'is_active'])

    return successful
