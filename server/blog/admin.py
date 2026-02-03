from django.contrib import admin
from .models import BlogPost, BlogCategory


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'author_name', 'publish_date', 'is_indexed', 'created_at']
    list_filter = ['status', 'is_indexed', 'has_faq_schema', 'categories', 'created_at']
    search_fields = ['title', 'content', 'excerpt']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['categories']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at', 'last_updated']

    fieldsets = (
        ('Content', {
            'fields': ('title', 'slug', 'content', 'excerpt', 'author_name')
        }),
        ('Featured Image', {
            'fields': ('featured_image', 'featured_image_alt')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description', 'canonical_url', 'is_indexed')
        }),
        ('FAQ Schema', {
            'fields': ('has_faq_schema', 'faq_data'),
            'classes': ('collapse',)
        }),
        ('Categories', {
            'fields': ('categories',)
        }),
        ('Publishing', {
            'fields': ('status', 'publish_date', 'scheduled_publish_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'last_updated'),
            'classes': ('collapse',)
        }),
    )
