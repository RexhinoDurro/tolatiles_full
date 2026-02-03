from django.contrib import admin
from .models import Notification, PushSubscription, NotificationPreference, DailyStats


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'type', 'priority', 'is_read', 'created_at']
    list_filter = ['type', 'priority', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'user__username']
    readonly_fields = ['created_at', 'read_at']
    ordering = ['-created_at']


@admin.register(PushSubscription)
class PushSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'device_name', 'is_active', 'failed_count', 'last_used_at', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['user__username', 'device_name']
    readonly_fields = ['endpoint', 'p256dh_key', 'auth_key', 'created_at', 'updated_at']


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'push_enabled', 'sound_enabled', 'new_lead_enabled']
    list_filter = ['push_enabled', 'sound_enabled']
    search_fields = ['user__username']


@admin.register(DailyStats)
class DailyStatsAdmin(admin.ModelAdmin):
    list_display = [
        'date', 'new_leads_website', 'new_leads_local_ads',
        'leads_converted', 'quotes_created', 'invoices_paid'
    ]
    list_filter = ['date']
    ordering = ['-date']
    readonly_fields = ['created_at', 'updated_at']
