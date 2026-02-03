from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import Notification, PushSubscription, NotificationPreference, DailyStats


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model."""

    related_object_type_name = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'title', 'message', 'priority',
            'related_object_type', 'related_object_type_name',
            'related_object_id', 'is_read', 'read_at',
            'delivered_via_websocket', 'delivered_via_push',
            'data', 'created_at'
        ]
        read_only_fields = [
            'id', 'type', 'title', 'message', 'priority',
            'related_object_type', 'related_object_id',
            'delivered_via_websocket', 'delivered_via_push',
            'data', 'created_at'
        ]

    def get_related_object_type_name(self, obj):
        if obj.related_object_type:
            return obj.related_object_type.model
        return None


class PushSubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for PushSubscription model."""

    class Meta:
        model = PushSubscription
        fields = [
            'id', 'endpoint', 'p256dh_key', 'auth_key',
            'device_name', 'user_agent', 'is_active',
            'last_used_at', 'created_at'
        ]
        read_only_fields = ['id', 'is_active', 'last_used_at', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        endpoint = validated_data['endpoint']

        # Update existing subscription or create new one
        subscription, created = PushSubscription.objects.update_or_create(
            endpoint=endpoint,
            defaults={
                'user': user,
                'p256dh_key': validated_data['p256dh_key'],
                'auth_key': validated_data['auth_key'],
                'device_name': validated_data.get('device_name', ''),
                'user_agent': validated_data.get('user_agent', ''),
                'is_active': True,
                'failed_count': 0,
            }
        )
        return subscription


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for NotificationPreference model."""

    class Meta:
        model = NotificationPreference
        fields = [
            'new_lead_enabled', 'lead_status_enabled',
            'quote_status_enabled', 'invoice_paid_enabled',
            'system_enabled', 'push_enabled', 'sound_enabled'
        ]


class DailyStatsSerializer(serializers.ModelSerializer):
    """Serializer for DailyStats model."""

    total_new_leads = serializers.IntegerField(read_only=True)

    class Meta:
        model = DailyStats
        fields = [
            'date', 'new_leads_website', 'new_leads_local_ads',
            'total_new_leads', 'leads_contacted', 'leads_converted',
            'quotes_created', 'quotes_sent', 'quotes_accepted',
            'quotes_total_value', 'invoices_created', 'invoices_paid',
            'invoices_paid_value'
        ]
