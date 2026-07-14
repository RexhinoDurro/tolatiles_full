import re

from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


# Related Service Page choices: the 2 city hubs + 6 services x 2 cities.
# Slugs must stay in sync with next.config.js redirects and the
# serviceIdToSlug maps in ServiceDetailPage(Location).tsx.
RELATED_SERVICE_PAGE_CHOICES = [
    ('Jacksonville', [
        ('/jacksonville', 'Jacksonville — City Hub'),
        ('/jacksonville/services/kitchen-backsplash-installation', 'Jacksonville — Kitchen Backsplash'),
        ('/jacksonville/services/bathroom-tile-installation', 'Jacksonville — Bathroom Tile'),
        ('/jacksonville/services/floor-tile-installation', 'Jacksonville — Floor Tile'),
        ('/jacksonville/services/patio-tile-installation', 'Jacksonville — Patio Tile'),
        ('/jacksonville/services/fireplace-tile-installation', 'Jacksonville — Fireplace Tile'),
        ('/jacksonville/services/shower-tile-installation', 'Jacksonville — Shower Tile'),
    ]),
    ('St. Augustine', [
        ('/st-augustine', 'St. Augustine — City Hub'),
        ('/st-augustine/services/kitchen-backsplash-installation', 'St. Augustine — Kitchen Backsplash'),
        ('/st-augustine/services/bathroom-tile-installation', 'St. Augustine — Bathroom Tile'),
        ('/st-augustine/services/floor-tile-installation', 'St. Augustine — Floor Tile'),
        ('/st-augustine/services/patio-tile-installation', 'St. Augustine — Patio Tile'),
        ('/st-augustine/services/fireplace-tile-installation', 'St. Augustine — Fireplace Tile'),
        ('/st-augustine/services/shower-tile-installation', 'St. Augustine — Shower Tile'),
    ]),
]

RELATED_SERVICE_PAGE_LABELS = {
    value: label
    for _, options in RELATED_SERVICE_PAGE_CHOICES
    for value, label in options
}


class BlogCategory(models.Model):
    """Category for organizing blog posts."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Blog Category'
        verbose_name_plural = 'Blog Categories'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class BlogPost(models.Model):
    """Blog post with SEO features and AI generation support."""

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('scheduled', 'Scheduled'),
    ]

    LOCATION_CHOICES = [
        ('florida', 'Florida'),
        ('jacksonville', 'Jacksonville'),
        ('st-augustine', 'St. Augustine'),
    ]

    CONTENT_TYPE_CHOICES = [
        ('blog', 'Blog'),
        ('guide', 'Guide'),
        ('design_idea', 'Design Idea'),
        ('story', 'Story'),
    ]

    # Content type
    content_type = models.CharField(
        max_length=20,
        choices=CONTENT_TYPE_CHOICES,
        default='blog',
        db_index=True,
        help_text='Which site section this post belongs to'
    )

    # Core content
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    content = models.TextField(help_text='HTML content')
    excerpt = models.TextField(
        max_length=300,
        blank=True,
        help_text='Short summary for listings and meta description fallback'
    )
    author_name = models.CharField(
        max_length=100,
        default='Tola Tiles Team',
        help_text='Display name for the author'
    )

    # Featured image
    featured_image = models.ImageField(
        upload_to='blog/featured/',
        blank=True,
        null=True
    )
    featured_image_alt = models.CharField(
        max_length=200,
        blank=True,
        help_text='Alt text for the featured image'
    )

    # SEO fields
    meta_title = models.CharField(
        max_length=60,
        blank=True,
        help_text='SEO title (max 60 chars). Falls back to title if empty.'
    )
    meta_description = models.CharField(
        max_length=160,
        blank=True,
        help_text='SEO description (max 160 chars). Falls back to excerpt if empty.'
    )
    canonical_url = models.URLField(
        blank=True,
        help_text='Canonical URL if different from default'
    )
    is_indexed = models.BooleanField(
        default=True,
        help_text='Allow search engines to index this post'
    )

    # FAQ schema
    has_faq_schema = models.BooleanField(
        default=False,
        help_text='Enable FAQ schema markup'
    )
    faq_data = models.JSONField(
        default=list,
        blank=True,
        help_text='FAQ data as JSON array: [{"question": "...", "answer": "..."}]'
    )

    # Categories
    categories = models.ManyToManyField(
        BlogCategory,
        related_name='posts',
        blank=True
    )

    # Location targeting
    location = models.CharField(
        max_length=20,
        choices=LOCATION_CHOICES,
        default='florida',
        help_text='Target location for this blog post'
    )

    # Related Service Page (required to publish for content_type='blog';
    # optional for guide/design_idea/story)
    related_service_page = models.CharField(
        max_length=100,
        choices=RELATED_SERVICE_PAGE_CHOICES,
        blank=True,
        default='',
        help_text='Internal city/service page this post should support. Required to publish Blog posts.'
    )
    related_link_auto_appended = models.BooleanField(
        default=False,
        help_text='Set automatically when publishing appended a CTA link to Related Service Page because the '
                   'body did not already link to it. Flagged here for editorial review.'
    )

    # Publishing
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft'
    )
    publish_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Date when post was/will be published'
    )
    scheduled_publish_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Scheduled date for auto-publishing'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Blog Post'
        verbose_name_plural = 'Blog Posts'
        ordering = ['-publish_date', '-created_at']

    def __str__(self):
        return self.title

    def clean(self):
        super().clean()
        self._validate_related_service_page()

    def _validate_related_service_page(self):
        if self.status == 'published' and self.content_type == 'blog' and not self.related_service_page:
            raise ValidationError({
                'related_service_page': 'Related Service Page is required to publish a Blog post.'
            })

    def _content_links_to(self, path):
        """Plain regex scan for an existing href pointing at `path`."""
        pattern = r'href=["\'][^"\']*' + re.escape(path) + r'[^"\']*["\']'
        return re.search(pattern, self.content or '') is not None

    def _append_cta_link(self, path):
        """Append a CTA <p> linking to `path` and flag it for editorial review."""
        label = RELATED_SERVICE_PAGE_LABELS.get(path, path)
        cta_html = f'<p><a href="{path}">Learn more: {label}</a></p>'
        self.content = f'{self.content}\n{cta_html}' if self.content else cta_html
        self.related_link_auto_appended = True

    def save(self, *args, **kwargs):
        was_published = False
        if self.pk:
            was_published = BlogPost.objects.filter(pk=self.pk, status='published').exists()

        # Set publish_date when publishing for the first time
        if self.status == 'published' and not self.publish_date:
            self.publish_date = timezone.now()

        self._validate_related_service_page()

        # Hybrid enforcement on the transition to published: if the body
        # doesn't already link to the Related Service Page, auto-append a
        # CTA link and flag the post for editorial review. Runs through
        # save() (not just the DRF serializer) so Django admin and the
        # Celery publish_scheduled_posts task get the same guarantee.
        transitioning_to_published = self.status == 'published' and not was_published
        if transitioning_to_published and self.related_service_page and not self._content_links_to(self.related_service_page):
            self._append_cta_link(self.related_service_page)
            update_fields = kwargs.get('update_fields')
            if update_fields is not None:
                kwargs['update_fields'] = list(set(update_fields) | {'content', 'related_link_auto_appended'})

        super().save(*args, **kwargs)

    @property
    def effective_meta_title(self):
        """Return meta_title or fallback to title."""
        return self.meta_title or self.title

    @property
    def effective_meta_description(self):
        """Return meta_description or fallback to excerpt."""
        return self.meta_description or self.excerpt

    @property
    def is_published(self):
        """Check if post is currently published."""
        return self.status == 'published'

    @property
    def reading_time(self):
        """Estimate reading time in minutes."""
        word_count = len(self.content.split())
        return max(1, round(word_count / 200))
