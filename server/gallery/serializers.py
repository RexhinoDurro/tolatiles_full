from rest_framework import serializers
from .models import Category, GalleryImage


class GalleryImageSerializer(serializers.ModelSerializer):
    """Serializer for gallery images."""

    image_url = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_label = serializers.CharField(source='category.label', read_only=True)

    class Meta:
        model = GalleryImage
        fields = [
            'id',
            'category',
            'category_name',
            'category_label',
            'title',
            'description',
            'image',
            'image_url',
            'order',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        elif obj.image:
            return obj.image.url
        return None


class GalleryImageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating gallery images."""

    class Meta:
        model = GalleryImage
        fields = [
            'id',
            'category',
            'title',
            'description',
            'image',
            'order',
            'is_active',
        ]


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for categories without images."""

    image_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'label',
            'description',
            'image_count',
            'created_at',
        ]

    def get_image_count(self, obj):
        return obj.images.filter(is_active=True).count()


class CategoryWithImagesSerializer(serializers.ModelSerializer):
    """Serializer for categories with their images."""

    images = GalleryImageSerializer(many=True, read_only=True)
    image_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'label',
            'description',
            'images',
            'image_count',
            'created_at',
        ]

    def get_image_count(self, obj):
        return obj.images.filter(is_active=True).count()
