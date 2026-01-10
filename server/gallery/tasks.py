"""
Celery tasks for gallery image processing.
"""
import os
import logging
from celery import shared_task
from PIL import Image
from django.conf import settings

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def convert_image_to_webp(self, image_id: int) -> dict:
    """
    Convert an uploaded image to WebP format.

    Args:
        image_id: The ID of the GalleryImage to convert

    Returns:
        dict with status and new image path
    """
    from gallery.models import GalleryImage

    try:
        image_obj = GalleryImage.objects.get(id=image_id)
        original_path = image_obj.image.path

        # Skip if already WebP
        if original_path.lower().endswith('.webp'):
            logger.info(f'Image {image_id} is already WebP, skipping conversion')
            return {'status': 'skipped', 'reason': 'already_webp'}

        # Check if file exists
        if not os.path.exists(original_path):
            logger.error(f'Original image not found: {original_path}')
            return {'status': 'error', 'reason': 'file_not_found'}

        # Generate WebP path
        base_path = os.path.splitext(original_path)[0]
        webp_path = f'{base_path}.webp'

        # Open and convert image
        with Image.open(original_path) as img:
            # Convert to RGB if necessary (for PNG with transparency)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Create white background for transparent images
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')

            # Resize if too large
            max_size = getattr(settings, 'IMAGE_MAX_SIZE', (1920, 1920))
            img.thumbnail(max_size, Image.Resampling.LANCZOS)

            # Save as WebP
            quality = getattr(settings, 'IMAGE_WEBP_QUALITY', 85)
            img.save(webp_path, 'WEBP', quality=quality, method=6)

        # Update model with new path
        relative_path = os.path.relpath(webp_path, settings.MEDIA_ROOT)
        image_obj.image.name = relative_path
        image_obj.save(update_fields=['image'])

        # Delete original file
        if os.path.exists(original_path) and original_path != webp_path:
            os.remove(original_path)
            logger.info(f'Deleted original file: {original_path}')

        logger.info(f'Successfully converted image {image_id} to WebP: {webp_path}')
        return {
            'status': 'success',
            'original_path': original_path,
            'webp_path': webp_path,
        }

    except GalleryImage.DoesNotExist:
        logger.error(f'GalleryImage {image_id} not found')
        return {'status': 'error', 'reason': 'image_not_found'}

    except Exception as exc:
        logger.exception(f'Error converting image {image_id}: {exc}')
        # Retry on failure
        raise self.retry(exc=exc)


@shared_task
def cleanup_orphaned_images():
    """
    Clean up image files that are no longer referenced in the database.
    Run this periodically to free up disk space.
    """
    from gallery.models import GalleryImage

    media_gallery_path = os.path.join(settings.MEDIA_ROOT, 'gallery')

    if not os.path.exists(media_gallery_path):
        return {'status': 'skipped', 'reason': 'gallery_path_not_found'}

    # Get all image paths from database
    db_images = set(GalleryImage.objects.values_list('image', flat=True))
    db_image_paths = {os.path.join(settings.MEDIA_ROOT, img) for img in db_images if img}

    deleted_count = 0

    # Walk through gallery directory
    for root, dirs, files in os.walk(media_gallery_path):
        for filename in files:
            filepath = os.path.join(root, filename)
            if filepath not in db_image_paths:
                os.remove(filepath)
                deleted_count += 1
                logger.info(f'Deleted orphaned image: {filepath}')

    return {'status': 'success', 'deleted_count': deleted_count}
