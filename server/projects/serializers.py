from rest_framework import serializers
from .models import Project, Phase, ProjectMedia, ProjectServiceType


class ProjectServiceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectServiceType
        fields = ['slug', 'name']


class ProjectMediaSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()
    youtube_embed_url = serializers.SerializerMethodField()
    youtube_thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = ProjectMedia
        fields = ['id', 'file', 'youtube_url', 'youtube_embed_url', 'youtube_thumbnail', 'media_type', 'order', 'alt_text', 'created_at']

    def get_file(self, obj):
        if not obj.file:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url

    def get_youtube_embed_url(self, obj):
        return obj.youtube_embed_url

    def get_youtube_thumbnail(self, obj):
        return obj.youtube_thumbnail


class PhaseSerializer(serializers.ModelSerializer):
    media = ProjectMediaSerializer(many=True, read_only=True)

    class Meta:
        model = Phase
        fields = ['id', 'title', 'description', 'order', 'media', 'created_at']


class MainVideoSerializerMixin(serializers.Serializer):
    main_video = serializers.SerializerMethodField()

    def get_main_video(self, obj):
        if not obj.main_video:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.main_video.url)
        return obj.main_video.url


class ProjectListSerializer(MainVideoSerializerMixin, serializers.ModelSerializer):
    job_types = serializers.SerializerMethodField()
    phase_count = serializers.SerializerMethodField()
    cover_image = serializers.SerializerMethodField()
    cover_media_type = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'title', 'status', 'work_status', 'is_featured', 'job_types', 'phase_count', 'main_video', 'main_video_type', 'cover_image', 'cover_media_type', 'created_at', 'updated_at']

    def get_job_types(self, obj):
        return list(obj.job_types.values_list('slug', flat=True))

    def get_phase_count(self, obj):
        return obj.phases.count()

    def _get_cover_media(self, obj):
        first_phase = obj.phases.order_by('order').first()
        if first_phase:
            return first_phase.media.order_by('order').first()
        return None

    def get_cover_image(self, obj):
        if obj.main_video_type == 'youtube' and obj.main_video_thumbnail:
            return obj.main_video_thumbnail
        media = self._get_cover_media(obj)
        if not media:
            return None
        if media.media_type == 'youtube':
            return media.youtube_thumbnail
        if media.file:
            request = self.context.get('request')
            return request.build_absolute_uri(media.file.url) if request else media.file.url
        return None

    def get_cover_media_type(self, obj):
        if obj.main_video_type == 'youtube':
            return 'youtube'
        media = self._get_cover_media(obj)
        return media.media_type if media else 'image'


class ProjectDetailSerializer(MainVideoSerializerMixin, serializers.ModelSerializer):
    phases = PhaseSerializer(many=True, read_only=True)
    job_types = serializers.SlugRelatedField(
        many=True,
        slug_field='slug',
        queryset=ProjectServiceType.objects.all(),
    )
    main_video_url = serializers.ReadOnlyField()
    main_video_type = serializers.ReadOnlyField()
    main_video_embed_url = serializers.ReadOnlyField()
    main_video_thumbnail = serializers.ReadOnlyField()

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'status', 'work_status', 'is_featured', 'job_types',
            'main_video', 'main_video_url', 'main_video_type', 'main_video_embed_url', 'main_video_thumbnail',
            'phases', 'created_at', 'updated_at'
        ]

    def update(self, instance, validated_data):
        job_types = validated_data.pop('job_types', None)
        instance = super().update(instance, validated_data)
        if job_types is not None:
            instance.job_types.set(job_types)
        return instance

    def create(self, validated_data):
        job_types = validated_data.pop('job_types', [])
        instance = super().create(validated_data)
        instance.job_types.set(job_types)
        return instance
