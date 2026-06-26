from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Project, Phase, ProjectMedia, HomepageSlot, ServiceProjectPin,
    LOCATION_CHOICES, SERVICE_TYPE_CHOICES
)
from .serializers import (
    ProjectListSerializer, ProjectDetailSerializer, PhaseSerializer,
    ProjectMediaSerializer, HomepageSlotSerializer, ServicePinSerializer,
    ProjectListSerializer
)


class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'location', 'is_featured']
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


class HomepageSlotsView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    def get(self, request, location):
        slots = HomepageSlot.objects.filter(location=location).select_related(
            'project', 'before_media', 'after_media'
        )
        serializer = HomepageSlotSerializer(slots, many=True, context={'request': request})
        return Response(serializer.data)

    def put(self, request, location):
        slot_type = request.data.get('slot_type')
        try:
            slot = HomepageSlot.objects.get(location=location, slot_type=slot_type)
        except HomepageSlot.DoesNotExist:
            return Response({'detail': 'Slot not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = HomepageSlotSerializer(slot, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ServicePinsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, location, service_slug):
        pins = ServiceProjectPin.objects.filter(
            location=location, service_slug=service_slug
        ).select_related('project').order_by('order')
        serializer = ServicePinSerializer(pins, many=True, context={'request': request})
        return Response(serializer.data)

    def put(self, request, location, service_slug):
        items = request.data  # [{project_id, order}]
        with transaction.atomic():
            ServiceProjectPin.objects.filter(location=location, service_slug=service_slug).delete()
            for item in items:
                try:
                    project = Project.objects.get(pk=item['project_id'])
                    ServiceProjectPin.objects.create(
                        location=location,
                        service_slug=service_slug,
                        project=project,
                        order=item.get('order', 0)
                    )
                except Project.DoesNotExist:
                    pass
        pins = ServiceProjectPin.objects.filter(
            location=location, service_slug=service_slug
        ).select_related('project').order_by('order')
        serializer = ServicePinSerializer(pins, many=True, context={'request': request})
        return Response(serializer.data)


class PublicHomepageView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, location):
        slots = HomepageSlot.objects.filter(location=location).select_related(
            'project', 'before_media', 'after_media'
        ).prefetch_related('project__phases__media', 'project__job_types')
        serializer = HomepageSlotSerializer(slots, many=True, context={'request': request})
        return Response(serializer.data)


class PublicServiceProjectsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, location, service_slug):
        # Pinned projects first
        pins = ServiceProjectPin.objects.filter(
            location=location, service_slug=service_slug
        ).select_related('project').prefetch_related(
            'project__phases__media', 'project__job_types'
        ).order_by('order')

        pinned_ids = [pin.project.id for pin in pins]
        pinned_projects = [pin.project for pin in pins]

        # Up to 6 total: fill with unpinned matching projects
        remaining = 6 - len(pinned_projects)
        unpinned = []
        if remaining > 0:
            unpinned = list(
                Project.objects.filter(
                    location=location,
                    job_types__slug=service_slug,
                    status='completed'
                ).exclude(id__in=pinned_ids).prefetch_related(
                    'phases__media', 'job_types'
                )[:remaining]
            )

        all_projects = pinned_projects + unpinned
        serializer = ProjectListSerializer(all_projects, many=True, context={'request': request})
        return Response(serializer.data)
