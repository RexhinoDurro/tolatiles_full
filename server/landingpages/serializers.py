from rest_framework import serializers

from gallery.models import GalleryImage
from gallery.serializers import GalleryImageSerializer
from .models import LandingPage, LandingPageSection, RESERVED_SUBDOMAINS, SUBDOMAIN_RE


class LandingPageSectionSerializer(serializers.ModelSerializer):
    """Full CRUD serializer for a single section."""

    class Meta:
        model = LandingPageSection
        fields = [
            'id', 'landing_page', 'section_type', 'order', 'is_enabled', 'config',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


def _validate_subdomain(value, instance=None):
    value = value.lower().strip()
    if not SUBDOMAIN_RE.match(value):
        raise serializers.ValidationError(
            'Subdomain must be lowercase letters, numbers, and hyphens only, '
            'and cannot start or end with a hyphen.'
        )
    if value in RESERVED_SUBDOMAINS:
        raise serializers.ValidationError(f'"{value}" is a reserved subdomain and cannot be used.')
    qs = LandingPage.objects.filter(subdomain=value)
    if instance:
        qs = qs.exclude(pk=instance.pk)
    if qs.exists():
        raise serializers.ValidationError('A landing page with this subdomain already exists.')
    return value


class LandingPageListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for the admin list view."""

    lead_count = serializers.SerializerMethodField()

    class Meta:
        model = LandingPage
        fields = [
            'id', 'name', 'subdomain', 'status', 'updated_at', 'created_at', 'lead_count',
        ]

    def get_lead_count(self, obj):
        return obj.leads.count()


class LandingPageDetailSerializer(serializers.ModelSerializer):
    """Full admin CRUD serializer, including nested read-only sections."""

    sections = LandingPageSectionSerializer(many=True, read_only=True)
    effective_meta_title = serializers.ReadOnlyField()
    effective_meta_description = serializers.ReadOnlyField()

    class Meta:
        model = LandingPage
        fields = [
            'id', 'name', 'subdomain', 'status', 'published_at',
            'page_title', 'meta_title', 'meta_description', 'canonical_url',
            'is_indexed', 'og_image',
            'meta_pixel_id', 'gtm_container_id', 'ga_measurement_id',
            'custom_head_scripts', 'custom_body_scripts',
            'phone_number',
            'effective_meta_title', 'effective_meta_description',
            'sections',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'published_at', 'created_at', 'updated_at']

    def validate_subdomain(self, value):
        return _validate_subdomain(value, self.instance)


class LandingPagePublicSerializer(serializers.ModelSerializer):
    """Public read serializer — resolves gallery references, only used for published pages."""

    effective_meta_title = serializers.ReadOnlyField()
    effective_meta_description = serializers.ReadOnlyField()
    sections = serializers.SerializerMethodField()

    class Meta:
        model = LandingPage
        fields = [
            'id', 'name', 'subdomain',
            'page_title', 'effective_meta_title', 'effective_meta_description',
            'canonical_url', 'is_indexed', 'og_image',
            'meta_pixel_id', 'gtm_container_id', 'ga_measurement_id',
            'custom_head_scripts', 'custom_body_scripts',
            'phone_number', 'sections',
        ]

    def get_sections(self, obj):
        request = self.context.get('request')
        enabled_sections = obj.sections.filter(is_enabled=True).order_by('order')
        results = []
        for section in enabled_sections:
            data = LandingPageSectionSerializer(section).data
            if section.section_type == 'gallery':
                data['config'] = self._resolve_gallery_config(section.config, request)
            results.append(data)
        return results

    def _resolve_gallery_config(self, config, request):
        resolved = dict(config)
        image_ids = config.get('image_ids') or []
        gallery_category = config.get('gallery_category')

        if image_ids:
            images = GalleryImage.objects.filter(id__in=image_ids, is_active=True)
            # preserve requested order
            images_by_id = {img.id: img for img in images}
            ordered = [images_by_id[i] for i in image_ids if i in images_by_id]
        elif gallery_category:
            ordered = list(
                GalleryImage.objects.filter(category__name=gallery_category, is_active=True)
                .order_by('order', '-created_at')
            )
        else:
            ordered = []

        resolved['images'] = GalleryImageSerializer(ordered, many=True, context={'request': request}).data
        return resolved


class LandingPageSubdomainCheckSerializer(serializers.Serializer):
    """Query-param validator for the check_subdomain action."""
    subdomain = serializers.CharField(max_length=63)
