from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, GalleryImage
from .serializers import (
    CategorySerializer,
    CategoryWithImagesSerializer,
    GalleryImageSerializer,
    GalleryImageCreateSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for gallery categories."""

    queryset = Category.objects.all()
    lookup_field = 'name'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CategoryWithImagesSerializer
        return CategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class GalleryImageViewSet(viewsets.ModelViewSet):
    """ViewSet for gallery images."""

    queryset = GalleryImage.objects.all()
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category__name', 'is_active']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return GalleryImageCreateSerializer
        return GalleryImageSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = GalleryImage.objects.all()

        # Filter by category name
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__name=category)

        # Only show active images for non-admin users
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)

        return queryset.select_related('category')

    @action(detail=False, methods=['get'])
    def all_images(self, request):
        """Get all active images without pagination."""
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def reorder(self, request):
        """Reorder images by updating their order field."""
        orders = request.data.get('orders', [])
        for item in orders:
            GalleryImage.objects.filter(id=item['id']).update(order=item['order'])
        return Response({'status': 'success'})
