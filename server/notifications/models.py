from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class Notification(models.Model):
    """User notification model."""

    TYPE_CHOICES = [
        ('new_lead', 'New Lead'),
        ('lead_status', 'Lead Status Change'),
        ('quote_status', 'Quote Status Change'),
        ('invoice_paid', 'Invoice Paid'),
        ('system', 'System Notification'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='normal'
    )

    # Generic relation to any model
    related_object_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    related_object = GenericForeignKey('related_object_type', 'related_object_id')

    # Read status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    # Delivery tracking
    delivered_via_websocket = models.BooleanField(default=False)
    delivered_via_push = models.BooleanField(default=False)

    # Additional data as JSON
    data = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['type']),
        ]

    def __str__(self):
        return f"{self.user.username}: {self.title}"


class PushSubscription(models.Model):
    """Web Push notification subscription."""

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='push_subscriptions'
    )
    endpoint = models.URLField(max_length=500, unique=True)
    p256dh_key = models.CharField(max_length=200)
    auth_key = models.CharField(max_length=100)

    # Device info
    device_name = models.CharField(max_length=100, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)

    # Status tracking
    is_active = models.BooleanField(default=True)
    failed_count = models.PositiveIntegerField(default=0)
    last_used_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Push Subscription'
        verbose_name_plural = 'Push Subscriptions'
        indexes = [
            models.Index(fields=['user', 'is_active']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.device_name or 'Unknown device'}"


class NotificationPreference(models.Model):
    """User notification preferences."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='notification_preferences'
    )

    # Notification type preferences
    new_lead_enabled = models.BooleanField(default=True)
    lead_status_enabled = models.BooleanField(default=True)
    quote_status_enabled = models.BooleanField(default=True)
    invoice_paid_enabled = models.BooleanField(default=True)
    system_enabled = models.BooleanField(default=True)

    # Delivery method preferences
    push_enabled = models.BooleanField(default=True)
    sound_enabled = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Notification Preference'
        verbose_name_plural = 'Notification Preferences'

    def __str__(self):
        return f"Preferences for {self.user.username}"


class DailyStats(models.Model):
    """Daily performance statistics."""

    date = models.DateField(unique=True)

    # Lead metrics
    new_leads_website = models.PositiveIntegerField(default=0)
    new_leads_local_ads = models.PositiveIntegerField(default=0)
    leads_contacted = models.PositiveIntegerField(default=0)
    leads_converted = models.PositiveIntegerField(default=0)

    # Quote metrics
    quotes_created = models.PositiveIntegerField(default=0)
    quotes_sent = models.PositiveIntegerField(default=0)
    quotes_accepted = models.PositiveIntegerField(default=0)
    quotes_total_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    # Invoice metrics
    invoices_created = models.PositiveIntegerField(default=0)
    invoices_paid = models.PositiveIntegerField(default=0)
    invoices_paid_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        verbose_name = 'Daily Stats'
        verbose_name_plural = 'Daily Stats'

    def __str__(self):
        return f"Stats for {self.date}"

    @property
    def total_new_leads(self):
        return self.new_leads_website + self.new_leads_local_ads
