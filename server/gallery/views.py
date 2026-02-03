from rest_framework import viewsets, status
from rest_framework.decorators import action, parser_classes as parser_classes_decorator
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from PIL import Image
import os

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
    parser_classes = [MultiPartParser, FormParser, JSONParser]
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

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def all_images(self, request):
        """Get all images without pagination. Staff users see all, others see active only."""
        queryset = self.get_queryset()  # get_queryset already handles staff/non-staff filtering
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def reorder(self, request):
        """Reorder images by updating their order field."""
        orders = request.data.get('orders', [])
        for item in orders:
            GalleryImage.objects.filter(id=item['id']).update(order=item['order'])
        return Response({'status': 'success'})

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def transform(self, request, pk=None):
        """Transform image: rotate or flip."""
        image_obj = self.get_object()
        transform_type = request.data.get('type')

        if transform_type not in ['rotate_left', 'rotate_right', 'flip_horizontal', 'flip_vertical']:
            return Response(
                {'error': 'Invalid transform type. Use: rotate_left, rotate_right, flip_horizontal, flip_vertical'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            image_path = image_obj.image.path

            # Open image
            img = Image.open(image_path)
            original_format = img.format or 'WEBP'

            # Apply transformation (these are very fast operations)
            if transform_type == 'rotate_left':
                transformed = img.transpose(Image.Transpose.ROTATE_90)
            elif transform_type == 'rotate_right':
                transformed = img.transpose(Image.Transpose.ROTATE_270)
            elif transform_type == 'flip_horizontal':
                transformed = img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            elif transform_type == 'flip_vertical':
                transformed = img.transpose(Image.Transpose.FLIP_TOP_BOTTOM)

            # Save with optimized settings
            if original_format == 'PNG':
                transformed.save(image_path, 'PNG')
            elif original_format == 'WEBP':
                transformed.save(image_path, 'WEBP', quality=85, method=4)
            else:
                transformed.save(image_path, 'JPEG', quality=85, optimize=False)

            img.close()
            transformed.close()

            # Update timestamp
            image_obj.save(update_fields=['updated_at'])

            serializer = self.get_serializer(image_obj)
            return Response(serializer.data)

        except Exception as e:
            return Response(
                {'error': f'Failed to transform image: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
