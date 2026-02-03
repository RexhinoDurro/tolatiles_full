from rest_framework import serializers
from .models import BlogPost, BlogCategory


class BlogCategorySerializer(serializers.ModelSerializer):
    """Serializer for blog categories."""
    post_count = serializers.SerializerMethodField()

    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug', 'description', 'post_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_post_count(self, obj):
        return obj.posts.filter(status='published').count()


class BlogCategoryMinimalSerializer(serializers.ModelSerializer):
    """Minimal serializer for category references."""

    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug']


class BlogPostListSerializer(serializers.ModelSerializer):
    """Serializer for blog post list views."""
    categories = BlogCategoryMinimalSerializer(many=True, read_only=True)
    reading_time = serializers.ReadOnlyField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'author_name',
            'featured_image', 'featured_image_alt',
            'categories', 'status', 'publish_date',
            'reading_time', 'created_at', 'last_updated'
        ]


class BlogPostDetailSerializer(serializers.ModelSerializer):
    """Full serializer for blog post detail views."""
    categories = BlogCategoryMinimalSerializer(many=True, read_only=True)
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=BlogCategory.objects.all(),
        many=True,
        write_only=True,
        source='categories',
        required=False
    )
    reading_time = serializers.ReadOnlyField()
    effective_meta_title = serializers.ReadOnlyField()
    effective_meta_description = serializers.ReadOnlyField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 'author_name',
            'featured_image', 'featured_image_alt',
            'meta_title', 'meta_description', 'canonical_url', 'is_indexed',
            'has_faq_schema', 'faq_data',
            'categories', 'category_ids',
            'status', 'publish_date', 'scheduled_publish_date',
            'reading_time', 'effective_meta_title', 'effective_meta_description',
            'created_at', 'last_updated'
        ]
        read_only_fields = ['id', 'created_at', 'last_updated', 'reading_time']

    def validate_slug(self, value):
        """Ensure slug is unique, excluding current instance."""
        instance = self.instance
        if BlogPost.objects.filter(slug=value).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError("A post with this slug already exists.")
        return value

    def validate_faq_data(self, value):
        """Validate FAQ data structure."""
        if not isinstance(value, list):
            raise serializers.ValidationError("FAQ data must be a list")

        for item in value:
            if not isinstance(item, dict):
                raise serializers.ValidationError("Each FAQ item must be an object")
            if 'question' not in item or 'answer' not in item:
                raise serializers.ValidationError("Each FAQ item must have 'question' and 'answer' fields")

        return value


class BlogPostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating blog posts."""
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=BlogCategory.objects.all(),
        many=True,
        write_only=True,
        required=False
    )

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 'author_name',
            'featured_image', 'featured_image_alt',
            'meta_title', 'meta_description', 'canonical_url', 'is_indexed',
            'has_faq_schema', 'faq_data',
            'category_ids',
            'status', 'scheduled_publish_date'
        ]
        read_only_fields = ['id']

    def validate_slug(self, value):
        """Ensure slug is unique."""
        if BlogPost.objects.filter(slug=value).exists():
            raise serializers.ValidationError("A post with this slug already exists.")
        return value

    def create(self, validated_data):
        category_ids = validated_data.pop('category_ids', [])
        post = BlogPost.objects.create(**validated_data)
        if category_ids:
            post.categories.set(category_ids)
        return post


class BlogPostSitemapSerializer(serializers.ModelSerializer):
    """Minimal serializer for sitemap data."""

    class Meta:
        model = BlogPost
        fields = ['slug', 'last_updated', 'publish_date']


class BlogPostPublicSerializer(serializers.ModelSerializer):
    """Serializer for public blog post views."""
    categories = BlogCategoryMinimalSerializer(many=True, read_only=True)
    reading_time = serializers.ReadOnlyField()
    effective_meta_title = serializers.ReadOnlyField()
    effective_meta_description = serializers.ReadOnlyField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 'author_name',
            'featured_image', 'featured_image_alt',
            'effective_meta_title', 'effective_meta_description',
            'canonical_url', 'is_indexed',
            'has_faq_schema', 'faq_data',
            'categories',
            'publish_date', 'reading_time', 'last_updated'
        ]


class AIGeneratePostSerializer(serializers.Serializer):
    """Serializer for AI post generation request."""
    topic = serializers.CharField(max_length=500)
    keywords = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        default=list
    )
    tone = serializers.ChoiceField(
        choices=['professional', 'friendly', 'informative'],
        default='professional'
    )


class AIGenerateSectionSerializer(serializers.Serializer):
    """Serializer for AI section generation request."""
    section_type = serializers.ChoiceField(
        choices=['intro', 'body', 'conclusion', 'faq']
    )
    context = serializers.CharField(max_length=1000)
    existing_content = serializers.CharField(required=False, allow_blank=True)


class AIGenerateSEOSerializer(serializers.Serializer):
    """Serializer for AI SEO generation request."""
    title = serializers.CharField(max_length=200)
    content = serializers.CharField()


class ImageUploadSerializer(serializers.Serializer):
    """Serializer for image upload."""
    image = serializers.ImageField()
    alt_text = serializers.CharField(max_length=200, required=False, default='')


class AIEnhancePromptSerializer(serializers.Serializer):
    """Serializer for AI image prompt enhancement request."""
    prompt = serializers.CharField(max_length=500)
    context = serializers.CharField(required=False, allow_blank=True)


class AIGenerateImageSerializer(serializers.Serializer):
    """Serializer for AI image generation request."""
    prompt = serializers.CharField(max_length=500)
    aspect_ratio = serializers.ChoiceField(
        choices=['1:1', '3:4', '4:3', '9:16', '16:9'],
        default='1:1'
    )
    enhanced = serializers.BooleanField(default=False)
    context = serializers.CharField(required=False, allow_blank=True)


class BlogPostCalendarSerializer(serializers.ModelSerializer):
    """Lightweight serializer for calendar view."""
    categories = BlogCategoryMinimalSerializer(many=True, read_only=True)
    display_date = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'status',
            'scheduled_publish_date', 'publish_date', 'created_at',
            'categories', 'display_date'
        ]

    def get_display_date(self, obj):
        """Get the date to display on calendar based on status."""
        if obj.status == 'scheduled' and obj.scheduled_publish_date:
            return obj.scheduled_publish_date.isoformat()
        elif obj.status == 'published' and obj.publish_date:
            return obj.publish_date.isoformat()
        return obj.created_at.isoformat()


class RescheduleSerializer(serializers.Serializer):
    """Serializer for rescheduling posts."""
    scheduled_publish_date = serializers.DateTimeField()


class QuickDraftSerializer(serializers.ModelSerializer):
    """Serializer for quick draft creation from calendar."""
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=BlogCategory.objects.all(),
        many=True,
        write_only=True,
        required=False
    )

    class Meta:
        model = BlogPost
        fields = ['title', 'slug', 'category_ids', 'scheduled_publish_date', 'status']
        read_only_fields = []

    def validate_slug(self, value):
        """Ensure slug is unique."""
        if BlogPost.objects.filter(slug=value).exists():
            raise serializers.ValidationError("A post with this slug already exists.")
        return value

    def create(self, validated_data):
        category_ids = validated_data.pop('category_ids', [])
        # Set default content for quick drafts
        validated_data['content'] = ''
        validated_data['excerpt'] = ''
        post = BlogPost.objects.create(**validated_data)
        if category_ids:
            post.categories.set(category_ids)
        return post
