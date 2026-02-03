from django.db import models
from django.utils import timezone
from django.utils.text import slugify


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

    def save(self, *args, **kwargs):
        # Set publish_date when publishing for the first time
        if self.status == 'published' and not self.publish_date:
            self.publish_date = timezone.now()
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
