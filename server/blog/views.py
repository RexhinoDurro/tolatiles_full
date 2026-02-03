import os
import uuid
from django.conf import settings
from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import BlogPost, BlogCategory
from .serializers import (
    BlogCategorySerializer,
    BlogPostListSerializer,
    BlogPostDetailSerializer,
    BlogPostCreateSerializer,
    BlogPostSitemapSerializer,
    BlogPostPublicSerializer,
    BlogPostCalendarSerializer,
    RescheduleSerializer,
    QuickDraftSerializer,
    AIGeneratePostSerializer,
    AIGenerateSectionSerializer,
    AIGenerateSEOSerializer,
    ImageUploadSerializer,
)
from .services import AIService, ImageService


class BlogCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing blog categories."""
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]


class BlogPostViewSet(viewsets.ModelViewSet):
    """ViewSet for managing blog posts with AI generation features."""
    queryset = BlogPost.objects.all()
    lookup_field = 'slug'
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'categories', 'is_indexed', 'has_faq_schema']
    search_fields = ['title', 'content', 'excerpt']
    ordering_fields = ['publish_date', 'created_at', 'last_updated', 'title']
    ordering = ['-publish_date', '-created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'sitemap_data', 'related']:
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def get_serializer_class(self):
        if self.action == 'list':
            return BlogPostListSerializer
        if self.action == 'create':
            return BlogPostCreateSerializer
        if self.action == 'sitemap_data':
            return BlogPostSitemapSerializer
        if self.action in ['retrieve'] and not self.request.user.is_authenticated:
            return BlogPostPublicSerializer
        return BlogPostDetailSerializer

    def get_queryset(self):
        queryset = BlogPost.objects.all()

        # For public access, only show published posts
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(status='published')

        # Filter by category slug
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(categories__slug=category_slug)

        return queryset.prefetch_related('categories')

    def perform_create(self, serializer):
        instance = serializer.save()
        # Process featured image if provided
        if instance.featured_image:
            self._process_featured_image(instance)

    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_image = old_instance.featured_image.name if old_instance.featured_image else None

        instance = serializer.save()

        # Process new featured image if changed
        new_image = instance.featured_image.name if instance.featured_image else None
        if new_image and new_image != old_image:
            self._process_featured_image(instance)

    def _process_featured_image(self, instance):
        """Process and convert featured image to WebP."""
        if not instance.featured_image:
            return

        try:
            # Open the current image
            image_file = instance.featured_image.open('rb')

            # Validate image
            is_valid, error = ImageService.validate_image(image_file)
            if not is_valid:
                return

            # Process image to WebP
            processed_image = ImageService.process_image(image_file)

            # Save the processed image
            old_path = instance.featured_image.path
            instance.featured_image.save(processed_image.name, processed_image, save=False)
            instance.save(update_fields=['featured_image'])

            # Set file permissions to 644 so nginx can serve the file
            os.chmod(instance.featured_image.path, 0o644)

            # Remove old image if different
            if os.path.exists(old_path) and old_path != instance.featured_image.path:
                os.remove(old_path)
        except Exception as e:
            print(f"Error processing featured image: {e}")

    @action(detail=False, methods=['get'])
    def sitemap_data(self, request):
        """Get minimal blog post data for sitemap generation."""
        posts = BlogPost.objects.filter(
            status='published',
            is_indexed=True
        ).values('slug', 'last_updated', 'publish_date')

        return Response(list(posts))

    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        """Get related posts based on shared categories."""
        post = self.get_object()
        category_ids = post.categories.values_list('id', flat=True)

        related_posts = BlogPost.objects.filter(
            status='published',
            categories__id__in=category_ids
        ).exclude(id=post.id).distinct()[:4]

        serializer = BlogPostListSerializer(related_posts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def ai_generate_post(self, request):
        """Generate a complete blog post using AI."""
        serializer = AIGeneratePostSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            ai_service = AIService()
            result = ai_service.generate_full_post(
                topic=serializer.validated_data['topic'],
                keywords=serializer.validated_data.get('keywords'),
                tone=serializer.validated_data.get('tone', 'professional')
            )

            if 'error' in result:
                return Response(
                    {'error': result['error'], 'raw_response': result.get('raw_response')},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            return Response(result)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def ai_generate_section(self, request):
        """Generate a specific section using AI."""
        serializer = AIGenerateSectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            ai_service = AIService()
            result = ai_service.generate_section(
                section_type=serializer.validated_data['section_type'],
                context=serializer.validated_data['context'],
                existing_content=serializer.validated_data.get('existing_content')
            )

            if 'error' in result:
                return Response(
                    {'error': result['error']},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            return Response(result)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def ai_generate_seo(self, request):
        """Generate SEO metadata using AI."""
        serializer = AIGenerateSEOSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            ai_service = AIService()
            result = ai_service.generate_seo(
                title=serializer.validated_data['title'],
                content=serializer.validated_data['content']
            )

            if 'error' in result:
                return Response(
                    {'error': result['error']},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            return Response(result)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def upload_image(self, request):
        """Upload and process an image for blog content."""
        serializer = ImageUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        image_file = serializer.validated_data['image']
        alt_text = serializer.validated_data.get('alt_text', '')

        # Validate image
        is_valid, error = ImageService.validate_image(image_file)
        if not is_valid:
            return Response(
                {'error': error},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Process image to WebP
            processed_image = ImageService.process_image(image_file)

            # Save to media directory
            upload_dir = os.path.join(settings.MEDIA_ROOT, 'blog', 'content')
            os.makedirs(upload_dir, exist_ok=True)

            file_path = os.path.join(upload_dir, processed_image.name)
            with open(file_path, 'wb') as f:
                f.write(processed_image.read())

            # Generate URL
            url = f"{settings.MEDIA_URL}blog/content/{processed_image.name}"

            return Response({
                'url': url,
                'alt_text': alt_text,
                'filename': processed_image.name
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def ai_enhance_prompt(self, request):
        """Enhance an image generation prompt using AI."""
        from .serializers import AIEnhancePromptSerializer

        serializer = AIEnhancePromptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            from .services import ImageGenerationService
            service = ImageGenerationService()
            enhanced = service.enhance_prompt(
                prompt=serializer.validated_data['prompt'],
                context=serializer.validated_data.get('context')
            )
            return Response({'enhanced_prompt': enhanced})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def ai_generate_image(self, request):
        """Generate an image using AI."""
        from .serializers import AIGenerateImageSerializer

        serializer = AIGenerateImageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            from .services import ImageGenerationService
            service = ImageGenerationService()

            prompt = serializer.validated_data['prompt']

            # Optionally enhance the prompt first
            if serializer.validated_data.get('enhanced'):
                prompt = service.enhance_prompt(
                    prompt=prompt,
                    context=serializer.validated_data.get('context')
                )

            result = service.generate_image(
                prompt=prompt,
                aspect_ratio=serializer.validated_data['aspect_ratio']
            )

            if 'error' in result:
                return Response(
                    {'error': result['error']},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return Response(result)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsAdminUser])
    def ai_image_options(self, request):
        """Get available options for AI image generation."""
        try:
            from .services import ImageGenerationService
            service = ImageGenerationService()
            return Response({
                'aspect_ratios': service.get_available_aspect_ratios()
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsAdminUser])
    def calendar(self, request):
        """Get blog posts for calendar view within a date range."""
        from datetime import datetime, timedelta
        from django.utils import timezone

        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        # Default to current month if no dates provided
        if not start_date_str:
            today = timezone.now()
            start_date = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start_date = timezone.make_aware(datetime.strptime(start_date_str, '%Y-%m-%d'))

        if not end_date_str:
            # Default to end of month
            next_month = start_date.replace(day=28) + timedelta(days=4)
            end_date = next_month - timedelta(days=next_month.day)
            end_date = end_date.replace(hour=23, minute=59, second=59)
        else:
            end_date = timezone.make_aware(datetime.strptime(end_date_str, '%Y-%m-%d'))
            end_date = end_date.replace(hour=23, minute=59, second=59)

        # Query posts based on their display date
        # Scheduled posts: use scheduled_publish_date
        # Published posts: use publish_date
        # Drafts: use created_at
        posts = BlogPost.objects.filter(
            Q(status='scheduled', scheduled_publish_date__range=[start_date, end_date]) |
            Q(status='published', publish_date__range=[start_date, end_date]) |
            Q(status='draft', created_at__range=[start_date, end_date])
        ).prefetch_related('categories').order_by('scheduled_publish_date', 'publish_date', 'created_at')

        serializer = BlogPostCalendarSerializer(posts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsAdminUser])
    def reschedule(self, request, slug=None):
        """Quick reschedule of a blog post."""
        post = self.get_object()

        # Cannot reschedule published posts
        if post.status == 'published':
            return Response(
                {'error': 'Cannot reschedule published posts'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = RescheduleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        post.scheduled_publish_date = serializer.validated_data['scheduled_publish_date']
        post.status = 'scheduled'
        post.save(update_fields=['scheduled_publish_date', 'status'])

        return Response(BlogPostCalendarSerializer(post).data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def quick_draft(self, request):
        """Create a quick draft from the calendar view."""
        serializer = QuickDraftSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        post = serializer.save()

        return Response(
            BlogPostCalendarSerializer(post).data,
            status=status.HTTP_201_CREATED
        )
