from django import forms
from django.contrib import admin
from .models import BlogPost, BlogCategory


class BlogCategoryAdminForm(forms.ModelForm):
    content_types = forms.MultipleChoiceField(
        choices=BlogPost.CONTENT_TYPE_CHOICES,
        widget=forms.CheckboxSelectMultiple,
        required=False,
        help_text='Which content type(s) this category is selectable for. Leave all unchecked to '
                   'apply it to every type (use that for cross-cutting tags like city names).'
    )

    class Meta:
        model = BlogCategory
        fields = '__all__'

    def clean_content_types(self):
        return list(self.cleaned_data.get('content_types') or [])


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    form = BlogCategoryAdminForm
    list_display = ['name', 'slug', 'content_types_display', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']

    def content_types_display(self, obj):
        if not obj.content_types:
            return 'All types'
        labels = dict(BlogPost.CONTENT_TYPE_CHOICES)
        return ', '.join(labels.get(ct, ct) for ct in obj.content_types)
    content_types_display.short_description = 'Content Types'


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'content_type', 'status', 'author_name', 'publish_date', 'is_indexed', 'created_at']
    list_filter = ['content_type', 'status', 'is_indexed', 'has_faq_schema', 'categories', 'created_at']
    search_fields = ['title', 'content', 'excerpt']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['categories']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at', 'last_updated', 'related_link_auto_appended']

    fieldsets = (
        ('Content', {
            'fields': ('content_type', 'title', 'slug', 'content', 'excerpt', 'author_name')
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
        ('Related Service Page', {
            'fields': ('related_service_page', 'related_link_auto_appended'),
            'description': 'Required to publish for content type "Blog". Optional for Guides, Design Ideas, and Stories.'
        }),
        ('Publishing', {
            'fields': ('status', 'publish_date', 'scheduled_publish_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'last_updated'),
            'classes': ('collapse',)
        }),
    )
