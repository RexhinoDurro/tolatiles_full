from django.contrib import admin
from .models import ContactLead, LocalAdsLead


@admin.register(ContactLead)
class ContactLeadAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'project_type', 'status', 'created_at']
    list_filter = ['status', 'project_type', 'created_at']
    search_fields = ['first_name', 'last_name', 'email', 'message']
    list_editable = ['status']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    fieldsets = (
        ('Contact Information', {
            'fields': ('first_name', 'last_name', 'email', 'phone')
        }),
        ('Project Details', {
            'fields': ('project_type', 'message')
        }),
        ('Status', {
            'fields': ('status', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = 'Name'


@admin.register(LocalAdsLead)
class LocalAdsLeadAdmin(admin.ModelAdmin):
    list_display = [
        'customer_phone',
        'customer_name',
        'job_type',
        'lead_type',
        'charge_status',
        'status',
        'lead_received',
    ]
    list_filter = ['status', 'lead_type', 'charge_status', 'lead_received']
    search_fields = ['customer_phone', 'customer_name', 'job_type', 'location', 'message']
    list_editable = ['status']
    readonly_fields = ['google_lead_id', 'created_at', 'updated_at', 'lead_received', 'last_activity']
    ordering = ['-lead_received']
    date_hierarchy = 'lead_received'
    raw_id_fields = ['customer']

    fieldsets = (
        ('Customer Information', {
            'fields': ('customer_phone', 'customer_name', 'location')
        }),
        ('Lead Details', {
            'fields': ('job_type', 'lead_type', 'charge_status', 'message', 'call_duration')
        }),
        ('Google LSA Data', {
            'fields': ('google_lead_id', 'lead_received', 'last_activity', 'metadata'),
            'classes': ('collapse',)
        }),
        ('Internal Status', {
            'fields': ('status', 'notes', 'customer')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
