from django.contrib import admin

from .models import LandingPage, LandingPageSection


class LandingPageSectionInline(admin.TabularInline):
    model = LandingPageSection
    extra = 0
    fields = ['section_type', 'order', 'is_enabled', 'config']
    ordering = ['order']


@admin.register(LandingPage)
class LandingPageAdmin(admin.ModelAdmin):
    list_display = ['name', 'subdomain', 'status', 'is_indexed', 'updated_at']
    list_filter = ['status', 'is_indexed']
    search_fields = ['name', 'subdomain', 'page_title']
    prepopulated_fields = {'subdomain': ('name',)}
    readonly_fields = ['published_at', 'created_at', 'updated_at']
    inlines = [LandingPageSectionInline]

    fieldsets = (
        ('Identification', {
            'fields': ('name', 'subdomain', 'status', 'published_at')
        }),
        ('SEO', {
            'fields': ('page_title', 'meta_title', 'meta_description', 'canonical_url', 'is_indexed', 'og_image')
        }),
        ('Tracking', {
            'fields': (
                'meta_pixel_id', 'gtm_container_id', 'ga_measurement_id',
                'custom_head_scripts', 'custom_body_scripts',
            )
        }),
        ('Content', {
            'fields': ('phone_number',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(LandingPageSection)
class LandingPageSectionAdmin(admin.ModelAdmin):
    list_display = ['landing_page', 'section_type', 'order', 'is_enabled']
    list_filter = ['section_type', 'is_enabled']
    ordering = ['landing_page', 'order']
