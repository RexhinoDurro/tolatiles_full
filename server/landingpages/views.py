from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import RESERVED_SUBDOMAINS, LandingPage, LandingPageSection, SUBDOMAIN_RE
from .serializers import (
    LandingPageDetailSerializer,
    LandingPageListSerializer,
    LandingPagePublicSerializer,
    LandingPageSectionSerializer,
)


class LandingPageViewSet(viewsets.ModelViewSet):
    """Admin CRUD for landing pages, plus public by-subdomain lookup and subdomain availability check."""

    queryset = LandingPage.objects.all()

    def get_permissions(self):
        if self.action in ['by_subdomain', 'check_subdomain']:
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def get_serializer_class(self):
        if self.action == 'list':
            return LandingPageListSerializer
        return LandingPageDetailSerializer

    @action(detail=False, methods=['get'], url_path='by-subdomain/(?P<subdomain>[a-z0-9-]+)')
    def by_subdomain(self, request, subdomain=None):
        """Public read endpoint used by the Next.js landing-page route. Published pages only."""
        try:
            landing_page = LandingPage.objects.prefetch_related('sections').get(
                subdomain=subdomain.lower(), status='published'
            )
        except LandingPage.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = LandingPagePublicSerializer(landing_page, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def check_subdomain(self, request):
        """Live availability/format check for the admin UI's subdomain field."""
        subdomain = (request.query_params.get('subdomain') or '').lower().strip()
        exclude_id = request.query_params.get('exclude_id')

        if not subdomain:
            return Response({'available': False, 'reason': 'Subdomain is required.'})
        if not SUBDOMAIN_RE.match(subdomain):
            return Response({
                'available': False,
                'reason': 'Must be lowercase letters, numbers, and hyphens only, no leading/trailing hyphen.',
            })
        if subdomain in RESERVED_SUBDOMAINS:
            return Response({'available': False, 'reason': 'This subdomain is reserved.'})

        qs = LandingPage.objects.filter(subdomain=subdomain)
        if exclude_id:
            qs = qs.exclude(pk=exclude_id)
        if qs.exists():
            return Response({'available': False, 'reason': 'This subdomain is already in use.'})

        return Response({'available': True, 'reason': None})

    def perform_update(self, serializer):
        instance = self.get_object()
        was_published = instance.status == 'published'
        landing_page = serializer.save()
        if landing_page.status == 'published' and not was_published and not landing_page.published_at:
            landing_page.published_at = timezone.now()
            landing_page.save(update_fields=['published_at'])


class LandingPageSectionViewSet(viewsets.ModelViewSet):
    """Admin CRUD for landing page sections, flat-registered and filtered by ?landing_page=<id>."""

    queryset = LandingPageSection.objects.all()
    serializer_class = LandingPageSectionSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['landing_page', 'section_type']

    @action(detail=False, methods=['patch'])
    def reorder(self, request):
        """Bulk-update section order in one call: {landing_page, order: [section_id, ...]}."""
        landing_page_id = request.data.get('landing_page')
        order = request.data.get('order', [])

        if not landing_page_id or not isinstance(order, list):
            return Response(
                {'error': 'landing_page and order (list of section ids) are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        sections = LandingPageSection.objects.filter(
            landing_page_id=landing_page_id, id__in=order
        )
        sections_by_id = {s.id: s for s in sections}

        for index, section_id in enumerate(order):
            section = sections_by_id.get(section_id)
            if section:
                section.order = index
                section.save(update_fields=['order'])

        return Response({'status': 'success'})
