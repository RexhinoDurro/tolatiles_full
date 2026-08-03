import html
import os
import re
import uuid
from django.conf import settings
from django.core.files import File
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from config.media_utils import rename_local_media_file

from .models import BlogPost, BlogCategory

# Route prefix per content type for constructing internal cross-link hrefs --
# must stay in sync with CONTENT_TYPE_ROUTE_PREFIX in client/lib/contentTypes.ts
# (same duplication precedent as RELATED_SERVICE_PAGE_CHOICES's own comment
# in models.py, since there's no shared source of truth across Python/TS).
CONTENT_TYPE_ROUTE_PREFIX = {
    'blog': 'blog',
    'guide': 'guides',
    'design_idea': 'design-ideas',
    'story': 'stories',
}
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
    filterset_fields = ['status', 'categories', 'is_indexed', 'has_faq_schema', 'content_type']
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

        # Filter by location
        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(location=location)

        # Filter by content type (blog / guide / design_idea / story)
        content_type = self.request.query_params.get('content_type')
        if content_type:
            queryset = queryset.filter(content_type=content_type)

        return queryset.prefetch_related('categories')

    def perform_create(self, serializer):
        try:
            instance = serializer.save()
        except DjangoValidationError as e:
            raise DRFValidationError(e.message_dict if hasattr(e, 'message_dict') else e.messages)
        # Process featured image if provided
        if instance.featured_image:
            self._process_featured_image(instance)

    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_image = old_instance.featured_image.name if old_instance.featured_image else None

        try:
            instance = serializer.save()
        except DjangoValidationError as e:
            raise DRFValidationError(e.message_dict if hasattr(e, 'message_dict') else e.messages)

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
        ).prefetch_related('categories')

        serializer = BlogPostSitemapSerializer(posts, many=True)
        return Response(serializer.data)

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

    # Fields the editor's debounced autosave is allowed to touch -- a fixed
    # whitelist rather than trusting arbitrary request.data keys, since
    # published-post autosaves get merged into pending_snapshot and later
    # applied to the live model via setattr() in publish_changes.
    AUTOSAVE_FIELDS = {
        'title', 'slug', 'content', 'excerpt', 'author_name',
        'meta_title', 'meta_description', 'canonical_url', 'is_indexed',
        'has_faq_schema', 'faq_data', 'category_ids', 'location',
        'related_service_page',
    }

    def _persist_post(self, post, update_fields):
        """Save exactly `update_fields` via a raw queryset .update() --
        bypassing post.save()'s "ready to publish" validation
        (_validate_related_service_page/_validate_media_and_links), which
        runs unconditionally on every save() while status='published',
        regardless of update_fields. None of the fine-grained actions that
        call this (resolve_media_placeholder, resolve_featured_image,
        update_featured_image_meta, update_media_meta, autosave) ever touch
        related_service_page, and they can only ever move a media/link
        placeholder from unresolved towards resolved/skipped -- never the
        other way -- so that validation can never meaningfully block them;
        it can only spuriously 500 them against a post with pre-existing
        legacy-invalid data (e.g. missing related_service_page), exactly as
        it did here. Only publish_changes and the generic create/update
        flow -- the actual "am I allowed to publish this" boundaries --
        still go through post.save() and get the real check."""
        BlogPost.objects.filter(pk=post.pk).update(
            **{f: getattr(post, f) for f in update_fields}
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def autosave(self, request, slug=None):
        """Debounced autosave from the editor. A draft post's autosave writes
        straight to the live fields -- nothing's public yet, same as today's
        Save Draft. An already-published post's autosave instead merges into
        pending_snapshot, leaving the live page untouched until Publish
        Changes explicitly copies it over (see publish_changes)."""
        post = self.get_object()
        data = {k: v for k, v in request.data.items() if k in self.AUTOSAVE_FIELDS}

        if post.status != 'published':
            serializer = BlogPostDetailSerializer(
                post, data=data, partial=True, context={'request': request}
            )
            try:
                serializer.is_valid(raise_exception=True)
                serializer.save()
            except DRFValidationError as e:
                return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
            return Response(BlogPostDetailSerializer(post, context={'request': request}).data)

        snapshot = dict(post.pending_snapshot) if post.pending_snapshot is not None else {}
        snapshot.update(data)
        post.pending_snapshot = snapshot
        self._persist_post(post, ['pending_snapshot'])
        return Response(BlogPostDetailSerializer(post, context={'request': request}).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def publish_changes(self, request, slug=None):
        """Copy the pending draft snapshot onto the live fields and go live.
        Only meaningful for a published post that has autosaved changes
        sitting in pending_snapshot -- a still-unpublished post just uses the
        existing publish flow (PATCH status='published') since it has no
        snapshot layer to begin with."""
        post = self.get_object()
        if post.pending_snapshot is None:
            return Response({'error': 'No pending changes to publish'}, status=status.HTTP_400_BAD_REQUEST)

        snapshot = post.pending_snapshot
        category_ids = snapshot.pop('category_ids', None)
        for field, value in snapshot.items():
            if field in self.AUTOSAVE_FIELDS:
                setattr(post, field, value)

        post.pending_snapshot = None
        post.last_published_at = timezone.now()

        try:
            post.save()
        except DjangoValidationError as e:
            return Response(
                e.message_dict if hasattr(e, 'message_dict') else {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        if category_ids is not None:
            post.categories.set(category_ids)

        return Response(BlogPostDetailSerializer(post, context={'request': request}).data)

    def _effective_content(self, post):
        """The content string in-progress body-image edits should read from --
        the pending snapshot's copy if this published post has unpublished
        changes, else the live field. Keeps an in-progress image swap off the
        public page until Publish Changes, same as any other edited field.
        (Note: the featured image itself is NOT gated this way -- see
        resolve_featured_image/update_featured_image_meta -- it still takes
        effect immediately, same as today, since deferring it would need a
        second ImageField + a parallel WebP-processing path for one thumbnail.)
        """
        if post.pending_snapshot is not None:
            return post.pending_snapshot.get('content', post.content or '')
        return post.content or ''

    def _save_effective_content(self, post, new_content):
        """Writes back wherever _effective_content read from. Returns the
        update_fields the caller should include in its save()."""
        if post.pending_snapshot is not None:
            snapshot = dict(post.pending_snapshot)
            snapshot['content'] = new_content
            post.pending_snapshot = snapshot
            return ['pending_snapshot']
        post.content = new_content
        return ['content']

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def resolve_media_placeholder(self, request, slug=None):
        """Resolve (pick a candidate) or skip one media_plan placeholder,
        replacing its <span data-media-marker="N"> in `content` with the
        real <img>/<iframe> markup (or removing it entirely if skipped).
        Any image URL that isn't already ours gets downloaded and saved
        locally first -- never hotlinked (video URLs are embedded directly,
        since those point at YouTube/Vimeo's own player, not a stray site)."""
        post = self.get_object()
        media_id = request.data.get('media_id')
        if media_id is None:
            return Response({'error': 'media_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        media_id = str(media_id)

        media_plan = post.media_plan or []
        entry = next((item for item in media_plan if str(item.get('id')) == media_id), None)
        if entry is None:
            return Response(
                {'error': f'No media_plan entry with id {media_id}'},
                status=status.HTTP_404_NOT_FOUND
            )

        marker_pattern = r'<span[^>]*data-media-marker="' + re.escape(media_id) + r'"[^>]*>\s*</span>'
        content = self._effective_content(post)

        if request.data.get('status') == 'skipped':
            entry['status'] = 'skipped'
            entry['resolved_source'] = None
            entry['resolved_url'] = None
            content = re.sub(marker_pattern, '', content, count=1)
        else:
            resolved_source = request.data.get('resolved_source')
            resolved_url = request.data.get('resolved_url')
            if not resolved_source or not resolved_url:
                return Response(
                    {'error': 'resolved_source and resolved_url are required unless status is "skipped"'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Never hotlink an externally-hosted image, and never share a file
            # with another model either: 'ai' URLs are already local, blog-owned
            # copies, but 'gallery' candidates point straight at a GalleryImage's
            # own file (see media_plan_service._gallery_candidates), and a raw
            # pasted/'web' URL is someone else's file entirely -- anything not
            # already under blog/ gets downloaded into its own independent copy
            # here, so renaming or deleting it later can never affect (or be
            # affected by) an unrelated GalleryImage row.
            if entry.get('type') == 'image' and not resolved_url.startswith(f'{settings.MEDIA_URL}blog/'):
                from .services import download_and_save_image, WebImageDownloadError
                try:
                    saved = download_and_save_image(resolved_url)
                except WebImageDownloadError as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                resolved_url = saved['url']

            entry['status'] = 'resolved'
            entry['resolved_source'] = resolved_source
            entry['resolved_url'] = resolved_url

            if entry.get('type') == 'video':
                replacement = (
                    '<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;">'
                    f'<iframe src="{resolved_url}" style="position:absolute;top:0;left:0;width:100%;height:100%;" '
                    'frameborder="0" allowfullscreen loading="lazy"></iframe></div>'
                )
            else:
                alt_text = html.escape(entry.get('alt_text', '') or '', quote=True)
                # data-media-id lets update_media_meta find this exact tag
                # later to rewrite its src/alt in place (see TipTapEditor.tsx's
                # ResizableImage.addAttributes -- it's registered there too, or
                # the editor would strip it the first time this node round-trips).
                replacement = f'<img src="{resolved_url}" alt="{alt_text}" data-media-id="{media_id}" loading="lazy" />'

            content = re.sub(marker_pattern, replacement, content, count=1)

        post.media_plan = media_plan
        update_fields = self._save_effective_content(post, content) + ['media_plan']
        self._persist_post(post, update_fields)
        return Response(BlogPostDetailSerializer(post, context={'request': request}).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def resolve_featured_image(self, request, slug=None):
        """Resolve (pick a candidate) or skip the post's featured image --
        the same picker/candidate flow as resolve_media_placeholder, but
        there's exactly one of these per post and no <span data-media-marker>
        in `content` to rewrite; resolving just sets `featured_image` itself."""
        post = self.get_object()
        plan = post.featured_image_plan or {}

        if request.data.get('status') == 'skipped':
            plan['status'] = 'skipped'
            plan['resolved_source'] = None
            plan['resolved_url'] = None
            post.featured_image_plan = plan
            self._persist_post(post, ['featured_image_plan'])
            return Response(BlogPostDetailSerializer(post, context={'request': request}).data)

        resolved_source = request.data.get('resolved_source')
        resolved_url = request.data.get('resolved_url')
        if not resolved_source or not resolved_url:
            return Response(
                {'error': 'resolved_source and resolved_url are required unless status is "skipped"'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Same never-hotlink rule as resolve_media_placeholder: anything not
        # already ours gets downloaded and saved locally first.
        if not resolved_url.startswith(settings.MEDIA_URL):
            from .services import download_and_save_image, WebImageDownloadError
            try:
                saved = download_and_save_image(resolved_url)
            except WebImageDownloadError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            resolved_url = saved['url']

        # featured_image is an ImageField (a real file), not a URL string
        # embedded in `content` -- open the local copy we just resolved to
        # and assign it, reusing _process_featured_image for the existing
        # WebP conversion + chmod pipeline rather than duplicating it.
        relative_path = resolved_url[len(settings.MEDIA_URL):]
        local_path = os.path.join(settings.MEDIA_ROOT, relative_path)
        with open(local_path, 'rb') as f:
            post.featured_image.save(os.path.basename(local_path), File(f), save=False)

        plan['status'] = 'resolved'
        plan['resolved_source'] = resolved_source
        plan['resolved_url'] = resolved_url
        post.featured_image_plan = plan
        self._persist_post(post, ['featured_image', 'featured_image_plan'])
        self._process_featured_image(post)

        return Response(BlogPostDetailSerializer(post, context={'request': request}).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def update_featured_image_meta(self, request, slug=None):
        """Edit the featured image's file name and/or alt text. Immediate
        persist, same non-racy pattern as resolve_featured_image -- bypasses
        the generic serializer entirely so this can never collide with a
        Save Draft PATCH built from stale client-side form state."""
        post = self.get_object()
        name = request.data.get('name')
        alt_text = request.data.get('alt_text')
        update_fields = []

        if name and post.featured_image:
            new_relative_path = rename_local_media_file(post.featured_image.name, name)
            post.featured_image.name = new_relative_path
            update_fields.append('featured_image')

        if alt_text is not None:
            post.featured_image_alt = alt_text
            update_fields.append('featured_image_alt')

        if update_fields:
            self._persist_post(post, update_fields)

        return Response(BlogPostDetailSerializer(post, context={'request': request}).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def update_media_meta(self, request, slug=None):
        """Edit one media_plan image's file name and/or alt text. Alt text can
        be set before the placeholder is even resolved (it's picked up at
        resolve time, see resolve_media_placeholder); the file name only
        applies once resolved, since there's no file to rename before then.
        When resolved, the already-embedded <img> tag is kept in sync via its
        data-media-id marker rather than waiting for a future resolve/save."""
        post = self.get_object()
        media_id = request.data.get('media_id')
        if media_id is None:
            return Response({'error': 'media_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        media_id = str(media_id)

        media_plan = post.media_plan or []
        entry = next((item for item in media_plan if str(item.get('id')) == media_id), None)
        if entry is None:
            return Response(
                {'error': f'No media_plan entry with id {media_id}'},
                status=status.HTTP_404_NOT_FOUND
            )

        name = request.data.get('name')
        alt_text = request.data.get('alt_text')
        is_resolved = entry.get('status') == 'resolved' and entry.get('resolved_url')
        tag_pattern = r'(<img[^>]*data-media-id="' + re.escape(media_id) + r'"[^>]*>)'
        update_fields = ['media_plan']

        if alt_text is not None:
            entry['alt_text'] = alt_text
            if is_resolved:
                # Editorial content -- respects the pending-snapshot gate like
                # any other text edit, so it doesn't reach the live page early.
                escaped_alt = html.escape(alt_text, quote=True)
                content = re.sub(
                    tag_pattern,
                    lambda m: re.sub(r'alt="[^"]*"', f'alt="{escaped_alt}"', m.group(1)),
                    self._effective_content(post),
                    count=1,
                )
                update_fields += self._save_effective_content(post, content)

        if name and is_resolved:
            # Renaming moves the one physical file on disk -- a shared
            # resource, not draft-gated editorial content. Every place that
            # references it (the live content AND a pending snapshot's own
            # copy, if one exists) must be updated in lockstep, or whichever
            # copy still holds the old src would 404 the moment it's viewed.
            relative_path = entry['resolved_url'][len(settings.MEDIA_URL):]
            new_relative_path = rename_local_media_file(relative_path, name)
            new_url = f'{settings.MEDIA_URL}{new_relative_path}'
            entry['resolved_url'] = new_url

            def _fix_src(text):
                return re.sub(
                    tag_pattern,
                    lambda m: re.sub(r'src="[^"]*"', f'src="{new_url}"', m.group(1)),
                    text,
                    count=1,
                )

            post.content = _fix_src(post.content or '')
            update_fields.append('content')
            if post.pending_snapshot is not None and 'content' in post.pending_snapshot:
                snapshot = dict(post.pending_snapshot)
                snapshot['content'] = _fix_src(snapshot['content'])
                post.pending_snapshot = snapshot
                if 'pending_snapshot' not in update_fields:
                    update_fields.append('pending_snapshot')

        post.media_plan = media_plan
        self._persist_post(post, update_fields)

        return Response(BlogPostDetailSerializer(post, context={'request': request}).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def resolve_internal_link(self, request, slug=None):
        """Accept or reject one suggested_links entry. Accepting replaces its
        <span data-link-marker="N"> with a real <a> tag; rejecting strips the
        marker with no link."""
        post = self.get_object()
        link_id = request.data.get('link_id')
        link_action = request.data.get('action')
        if link_id is None or link_action not in ('accept', 'reject'):
            return Response(
                {'error': 'link_id and action ("accept" or "reject") are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        link_id = str(link_id)

        suggested_links = post.suggested_links or []
        entry = next((item for item in suggested_links if str(item.get('id')) == link_id), None)
        if entry is None:
            return Response(
                {'error': f'No suggested_links entry with id {link_id}'},
                status=status.HTTP_404_NOT_FOUND
            )

        marker_pattern = r'<span[^>]*data-link-marker="' + re.escape(link_id) + r'"[^>]*>\s*</span>'
        content = self._effective_content(post)

        if link_action == 'accept':
            entry['status'] = 'accepted'
            route_prefix = CONTENT_TYPE_ROUTE_PREFIX.get(entry.get('target_content_type', 'blog'), 'blog')
            anchor_text = entry.get('anchor_text_hint') or entry.get('target_title', '')
            replacement = f'<a href="/{route_prefix}/{entry["target_slug"]}">{anchor_text}</a>'
            content = re.sub(marker_pattern, replacement, content, count=1)
        else:
            entry['status'] = 'rejected'
            content = re.sub(marker_pattern, '', content, count=1)

        post.suggested_links = suggested_links
        update_fields = self._save_effective_content(post, content) + ['suggested_links']
        self._persist_post(post, update_fields)
        return Response(BlogPostDetailSerializer(post, context={'request': request}).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def refresh_internal_link_suggestions(self, request, slug=None):
        """Re-run internal-link matching against the current post corpus.
        Already-resolved (accepted/rejected) entries and their markers are
        left untouched; only entries still 'suggested' get replaced -- useful
        for a post imported early in the content calendar to pick up better
        matches once more posts exist later."""
        from .services import suggest_internal_links, insert_link_markers

        post = self.get_object()
        existing = post.suggested_links or []
        kept = [item for item in existing if item.get('status') != 'suggested']

        content = self._effective_content(post)
        for item in existing:
            if item.get('status') == 'suggested':
                pattern = r'<span[^>]*data-link-marker="' + re.escape(str(item.get('id'))) + r'"[^>]*>\s*</span>'
                content = re.sub(pattern, '', content)

        next_id = max([item.get('id', 0) for item in kept], default=0) + 1
        new_suggestions = suggest_internal_links(post)
        content, new_links = insert_link_markers(content, new_suggestions, start_id=next_id)

        post.suggested_links = kept + new_links
        update_fields = self._save_effective_content(post, content) + ['suggested_links']
        self._persist_post(post, update_fields)
        return Response(BlogPostDetailSerializer(post, context={'request': request}).data)
