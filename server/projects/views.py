from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import Project, Phase, ProjectMedia
from .serializers import (
    ProjectListSerializer, ProjectDetailSerializer, PhaseSerializer,
    ProjectMediaSerializer,
)


class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'work_status', 'is_featured']
    pagination_class = None  # return plain array, not paginated response

    def get_queryset(self):
        qs = Project.objects.prefetch_related('phases__media', 'job_types')
        job_type = self.request.query_params.get('job_type')
        if job_type:
            qs = qs.filter(job_types__slug=job_type)
        return qs

    def get_serializer_class(self):
        if self.action in ('list',):
            return ProjectListSerializer
        return ProjectDetailSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_destroy(self, instance):
        # DB-level CASCADE removes Phase/ProjectMedia rows but never touches the
        # underlying files on disk, so clean those up explicitly before the delete.
        if instance.main_video:
            instance.main_video.delete(save=False)
        for media in ProjectMedia.objects.filter(phase__project=instance).exclude(file=''):
            media.file.delete(save=False)
        instance.delete()

    @action(detail=True, methods=['post', 'delete'], url_path='main-video')
    def main_video(self, request, pk=None):
        project = self.get_object()

        if request.method == 'DELETE':
            if project.main_video:
                project.main_video.delete(save=False)
                project.main_video = None
            project.main_video_url = ''
            project.save()
            serializer = ProjectDetailSerializer(project, context={'request': request})
            return Response(serializer.data)

        file = request.FILES.get('file')
        youtube_url = (request.data.get('youtube_url') or '').strip()
        if not file and not youtube_url:
            return Response({'detail': 'No file or YouTube URL provided.'}, status=status.HTTP_400_BAD_REQUEST)

        if project.main_video:
            project.main_video.delete(save=False)
            project.main_video = None
        if youtube_url:
            project.main_video_url = youtube_url
        else:
            project.main_video_url = ''
            project.main_video = file
        project.save()
        serializer = ProjectDetailSerializer(project, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'])
    def phases(self, request, pk=None):
        project = self.get_object()
        if request.method == 'GET':
            phases = project.phases.order_by('order')
            serializer = PhaseSerializer(phases, many=True, context={'request': request})
            return Response(serializer.data)
        else:
            data = request.data.copy()
            data['project'] = project.id
            serializer = PhaseSerializer(data=data)
            if serializer.is_valid():
                serializer.save(project=project)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put', 'delete'], url_path='phases/(?P<phase_id>[^/.]+)')
    def phase_detail(self, request, pk=None, phase_id=None):
        project = self.get_object()
        try:
            phase = project.phases.get(pk=phase_id)
        except Phase.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'DELETE':
            phase.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        serializer = PhaseSerializer(phase, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='phases/reorder')
    def phases_reorder(self, request, pk=None):
        project = self.get_object()
        items = request.data
        with transaction.atomic():
            for item in items:
                project.phases.filter(pk=item['id']).update(order=item['order'])
        phases = project.phases.order_by('order')
        serializer = PhaseSerializer(phases, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'], url_path='phases/(?P<phase_id>[^/.]+)/media')
    def phase_media(self, request, pk=None, phase_id=None):
        project = self.get_object()
        try:
            phase = project.phases.get(pk=phase_id)
        except Phase.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            serializer = ProjectMediaSerializer(
                phase.media.order_by('order'), many=True, context={'request': request}
            )
            return Response(serializer.data)

        file = request.FILES.get('file')
        youtube_url = request.data.get('youtube_url', '').strip()
        if not file and not youtube_url:
            return Response({'detail': 'No file or YouTube URL provided.'}, status=status.HTTP_400_BAD_REQUEST)
        alt_text = request.data.get('alt_text', '')
        order = phase.media.count()
        if youtube_url:
            media = ProjectMedia(phase=phase, youtube_url=youtube_url, alt_text=alt_text, order=order)
        else:
            media = ProjectMedia(phase=phase, file=file, alt_text=alt_text, order=order)
        media.save()
        serializer = ProjectMediaSerializer(media, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='phases/(?P<phase_id>[^/.]+)/media/(?P<media_id>[^/.]+)')
    def phase_media_delete(self, request, pk=None, phase_id=None, media_id=None):
        project = self.get_object()
        try:
            phase = project.phases.get(pk=phase_id)
            media = phase.media.get(pk=media_id)
        except (Phase.DoesNotExist, ProjectMedia.DoesNotExist):
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if media.file:
            media.file.delete(save=False)
        media.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], url_path='phases/(?P<phase_id>[^/.]+)/media/reorder')
    def phase_media_reorder(self, request, pk=None, phase_id=None):
        project = self.get_object()
        try:
            phase = project.phases.get(pk=phase_id)
        except Phase.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        items = request.data
        with transaction.atomic():
            for item in items:
                phase.media.filter(pk=item['id']).update(order=item['order'])
        serializer = ProjectMediaSerializer(
            phase.media.order_by('order'), many=True, context={'request': request}
        )
        return Response(serializer.data)


class PublicProjectsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = Project.objects.filter(status='published').prefetch_related('phases__media', 'job_types')
        is_featured = request.query_params.get('is_featured')
        if is_featured is not None and is_featured.lower() in ('true', '1'):
            qs = qs.filter(is_featured=True)
        job_type = request.query_params.get('job_type')
        if job_type:
            qs = qs.filter(job_types__slug=job_type).distinct()
        serializer = ProjectListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


class PublicProjectDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            project = Project.objects.filter(status='published').prefetch_related(
                'phases__media', 'job_types'
            ).get(pk=pk)
        except Project.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProjectDetailSerializer(project, context={'request': request})
        return Response(serializer.data)


class PublicServiceProjectsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, service_slug):
        projects = Project.objects.filter(
            job_types__slug=service_slug,
            status='published'
        ).prefetch_related('phases__media', 'job_types').distinct()[:6]
        serializer = ProjectListSerializer(projects, many=True, context={'request': request})
        return Response(serializer.data)
