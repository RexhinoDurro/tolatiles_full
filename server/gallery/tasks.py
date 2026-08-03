"""
Celery tasks for gallery image processing.
"""
import io
import os
import logging
from celery import shared_task
from PIL import Image
from django.conf import settings

from .storage import (
    gallery_media_storage,
    read_media_bytes,
    save_media_bytes,
    delete_media_file,
    is_local_storage,
)

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def convert_image_to_webp(self, image_id: int) -> dict:
    """
    Convert an uploaded image to WebP format.

    Args:
        image_id: The ID of the GalleryImage to convert

    Returns:
        dict with status and new image key
    """
    from gallery.models import GalleryImage

    try:
        image_obj = GalleryImage.objects.get(id=image_id)
        original_key = image_obj.image.name

        # Skip if already WebP
        if original_key.lower().endswith('.webp'):
            logger.info(f'Image {image_id} is already WebP, skipping conversion')
            return {'status': 'skipped', 'reason': 'already_webp'}

        # Check if file exists
        if not gallery_media_storage.exists(original_key):
            logger.error(f'Original image not found: {original_key}')
            return {'status': 'error', 'reason': 'file_not_found'}

        # Generate WebP key
        base_key = os.path.splitext(original_key)[0]
        webp_key = f'{base_key}.webp'

        # Open and convert image
        with Image.open(io.BytesIO(read_media_bytes(original_key))) as img:
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
            buffer = io.BytesIO()
            img.save(buffer, 'WEBP', quality=quality, method=6)

        saved_key = save_media_bytes(webp_key, buffer.getvalue())

        # Update model with new key
        image_obj.image.name = saved_key
        image_obj.save(update_fields=['image'])

        # Delete original file
        if saved_key != original_key:
            delete_media_file(original_key)
            logger.info(f'Deleted original file: {original_key}')

        logger.info(f'Successfully converted image {image_id} to WebP: {saved_key}')
        return {
            'status': 'success',
            'original_key': original_key,
            'webp_key': saved_key,
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

    Local disk only for now -- when gallery media is on R2, this is a
    no-op (skipped) rather than silently walking/deleting the wrong thing;
    an R2-aware version would need to list bucket objects via boto3
    instead of os.walk.
    """
    from gallery.models import GalleryImage

    if not is_local_storage():
        return {'status': 'skipped', 'reason': 'remote_storage_not_supported'}

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
