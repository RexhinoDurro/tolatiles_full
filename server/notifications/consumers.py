import json
import logging
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Notification

logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    """WebSocket consumer for real-time notifications."""

    async def connect(self):
        """Handle WebSocket connection."""
        self.user = self.scope.get('user')

        if not self.user or self.user.is_anonymous:
            logger.warning("WebSocket connection rejected: no authenticated user")
            await self.close(code=4001)
            return

        # Create a unique group name for this user
        self.group_name = f"notifications_{self.user.id}"

        # Join the user's notification group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        # Send initial unread count
        unread_count = await self.get_unread_count()
        await self.send_json({
            'type': 'connection_established',
            'unread_count': unread_count
        })

        logger.info(f"WebSocket connected for user {self.user.username}")

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
            logger.info(f"WebSocket disconnected for user {self.user.username}")

    async def receive_json(self, content):
        """Handle incoming WebSocket messages."""
        message_type = content.get('type')

        if message_type == 'mark_read':
            notification_id = content.get('notification_id')
            if notification_id:
                await self.mark_notification_read(notification_id)
                unread_count = await self.get_unread_count()
                await self.send_json({
                    'type': 'unread_count_update',
                    'unread_count': unread_count
                })

        elif message_type == 'mark_all_read':
            await self.mark_all_notifications_read()
            await self.send_json({
                'type': 'unread_count_update',
                'unread_count': 0
            })

        elif message_type == 'ping':
            await self.send_json({'type': 'pong'})

    async def notification_message(self, event):
        """Handle notification messages from channel layer."""
        await self.send_json({
            'type': 'new_notification',
            'notification': event['notification']
        })

    async def unread_count_update(self, event):
        """Handle unread count update from channel layer."""
        await self.send_json({
            'type': 'unread_count_update',
            'unread_count': event['count']
        })

    @database_sync_to_async
    def get_unread_count(self):
        """Get the count of unread notifications for the user."""
        return Notification.objects.filter(
            user=self.user,
            is_read=False
        ).count()

    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """Mark a notification as read."""
        from django.utils import timezone
        Notification.objects.filter(
            id=notification_id,
            user=self.user,
            is_read=False
        ).update(is_read=True, read_at=timezone.now())

    @database_sync_to_async
    def mark_all_notifications_read(self):
        """Mark all notifications as read."""
        from django.utils import timezone
        Notification.objects.filter(
            user=self.user,
            is_read=False
        ).update(is_read=True, read_at=timezone.now())
