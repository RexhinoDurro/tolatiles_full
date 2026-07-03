import re

from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

RESERVED_SUBDOMAINS = {
    'www', 'api', 'admin', 'quote', 'quotes', 'mail', 'ftp', 'tolatiles',
    'app', 'staging', 'dev', 'test', 'blog', 'portal',
}

SUBDOMAIN_RE = re.compile(r'^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$')


def validate_subdomain_label(value):
    """DNS-label-safe: lowercase alnum/hyphen, no leading/trailing hyphen, <=63 chars, not reserved."""
    if not SUBDOMAIN_RE.match(value):
        raise ValidationError(
            'Subdomain must be lowercase letters, numbers, and hyphens only, '
            'and cannot start or end with a hyphen.'
        )
    if value in RESERVED_SUBDOMAINS:
        raise ValidationError(f'"{value}" is a reserved subdomain and cannot be used.')


class LandingPage(models.Model):
    """Admin-manageable marketing landing page served on its own subdomain."""

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
    ]

    # Internal identification
    name = models.CharField(
        max_length=200,
        help_text='Internal label, e.g. "Bathroom Remodel - Meta Ads"'
    )
    subdomain = models.SlugField(
        max_length=63,
        unique=True,
        validators=[validate_subdomain_label],
        help_text='e.g. "bathroom" -> bathroom.tolatiles.com'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    published_at = models.DateTimeField(null=True, blank=True)

    # SEO — mirrors BlogPost
    page_title = models.CharField(max_length=200, help_text='<title> tag content')
    meta_title = models.CharField(
        max_length=60, blank=True,
        help_text='SEO title (max 60 chars). Falls back to page_title if empty.'
    )
    meta_description = models.CharField(
        max_length=160, blank=True,
        help_text='SEO description (max 160 chars).'
    )
    canonical_url = models.URLField(blank=True)
    is_indexed = models.BooleanField(
        default=False,
        help_text='Allow search engines to index this page (default off — ad landing pages are typically noindex)'
    )
    og_image = models.ImageField(upload_to='landingpages/og/', blank=True, null=True)

    # Tracking — all admin-editable, independent of the main site's env-var-driven Analytics
    meta_pixel_id = models.CharField(max_length=30, blank=True, help_text='Meta (Facebook) Pixel ID')
    gtm_container_id = models.CharField(max_length=20, blank=True, help_text='Google Tag Manager container ID')
    ga_measurement_id = models.CharField(max_length=20, blank=True, help_text='Google Analytics measurement ID')
    custom_head_scripts = models.TextField(
        blank=True,
        help_text='Raw <script> HTML injected into <head>. Admin-trust-level input — executes as-is.'
    )
    custom_body_scripts = models.TextField(
        blank=True,
        help_text='Raw <script> HTML injected before </body>. Admin-trust-level input — executes as-is.'
    )

    # Shared content
    phone_number = models.CharField(
        max_length=20, blank=True,
        help_text='Click-to-call target shared across sections, e.g. +19048661738'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Landing Page'
        verbose_name_plural = 'Landing Pages'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} ({self.subdomain}.tolatiles.com)'

    def save(self, *args, **kwargs):
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

    @property
    def effective_meta_title(self):
        return self.meta_title or self.page_title

    @property
    def effective_meta_description(self):
        return self.meta_description

    @property
    def is_published(self):
        return self.status == 'published'


class LandingPageSection(models.Model):
    """One content block on a LandingPage. Section types are a fixed set — not a generic block editor."""

    SECTION_TYPE_CHOICES = [
        ('hero', 'Hero'),
        ('headline', 'Headline'),
        ('cta', 'Call to Action'),
        ('lead_form', 'Lead Form'),
        ('reviews', 'Reviews'),
        ('gallery', 'Gallery'),
        ('custom_code', 'Custom Code'),
    ]

    landing_page = models.ForeignKey(
        LandingPage,
        on_delete=models.CASCADE,
        related_name='sections'
    )
    section_type = models.CharField(max_length=20, choices=SECTION_TYPE_CHOICES)
    order = models.PositiveIntegerField(default=0)
    is_enabled = models.BooleanField(default=True)
    config = models.JSONField(
        default=dict, blank=True,
        help_text=(
            'Shape depends on section_type, e.g. hero: {headline, subheadline, media_type, '
            'image, video_url}; custom_code: {html} — raw HTML/CSS/JS, admin-trust-level input'
        )
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Landing Page Section'
        verbose_name_plural = 'Landing Page Sections'
        ordering = ['order']
        indexes = [
            models.Index(fields=['landing_page', 'order']),
        ]

    def __str__(self):
        return f'{self.landing_page.subdomain} - {self.get_section_type_display()} (#{self.order})'
