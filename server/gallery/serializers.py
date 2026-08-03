import os

from django.conf import settings
from rest_framework import serializers
from config.media_utils import rename_local_media_file, slugify_filename
from .models import Category, GalleryImage


class GalleryImageSerializer(serializers.ModelSerializer):
    """Serializer for gallery images."""

    image_url = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_label = serializers.CharField(source='category.label', read_only=True)
    file_name = serializers.SerializerMethodField()

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
            'alt_text',
            'file_name',
            'order',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if not obj.image:
            return None
        if not request:
            return obj.image.url
        if request.get_host().split(':')[0] == 'backend':
            return f"{settings.PUBLIC_MEDIA_BASE_URL}{obj.image.url}"
        return request.build_absolute_uri(obj.image.url)

    def get_file_name(self, obj):
        if not obj.image:
            return ''
        return os.path.splitext(os.path.basename(obj.image.name))[0]


class GalleryImageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating gallery images. `file_name` isn't a
    model field -- it renames the actual stored file on save (see update()/
    create()) rather than being persisted as separate metadata, so there's
    never a name that drifts from the real file."""

    file_name = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = GalleryImage
        fields = [
            'id',
            'category',
            'title',
            'description',
            'image',
            'alt_text',
            'file_name',
            'order',
            'is_active',
        ]

    def _apply_file_rename(self, instance, file_name):
        if not file_name or not instance.image:
            return
        current_basename = os.path.splitext(os.path.basename(instance.image.name))[0]
        if slugify_filename(file_name) == current_basename:
            return
        new_relative_path = rename_local_media_file(instance.image.name, file_name)
        instance.image.name = new_relative_path
        instance.save(update_fields=['image'])

    def create(self, validated_data):
        file_name = validated_data.pop('file_name', None)
        instance = super().create(validated_data)
        self._apply_file_rename(instance, file_name)
        return instance

    def update(self, instance, validated_data):
        file_name = validated_data.pop('file_name', None)
        instance = super().update(instance, validated_data)
        self._apply_file_rename(instance, file_name)
        return instance


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
