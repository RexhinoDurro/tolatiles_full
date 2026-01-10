"""
Django signals for gallery app.
"""
import logging
from django.db.models.signals import post_save
from django.dispatch import receiver

logger = logging.getLogger(__name__)


@receiver(post_save, sender='gallery.GalleryImage')
def trigger_image_conversion(sender, instance, created, **kwargs):
    """
    Trigger WebP conversion after a new image is uploaded.

    Only triggers for:
    - Newly created images
    - Images that are not already WebP format
    """
    # Only process new images or when image field changes
    if not instance.image:
        return

    image_path = instance.image.name.lower()

    # Skip if already WebP
    if image_path.endswith('.webp'):
        logger.debug(f'Image {instance.id} is already WebP, skipping conversion')
        return

    # Import here to avoid circular imports
    from gallery.tasks import convert_image_to_webp

    # Trigger async conversion
    logger.info(f'Triggering WebP conversion for image {instance.id}')
    convert_image_to_webp.delay(instance.id)
