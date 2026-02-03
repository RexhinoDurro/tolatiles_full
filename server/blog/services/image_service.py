import io
import os
import uuid
from PIL import Image
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.conf import settings


class ImageService:
    """Service for image processing and WebP conversion."""

    MAX_WIDTH = 1200
    MAX_HEIGHT = 1200
    QUALITY = 85
    THUMBNAIL_SIZE = (400, 300)

    @classmethod
    def process_image(cls, image_file, max_width=None, max_height=None, quality=None):
        """
        Process an image: resize if needed and convert to WebP.

        Args:
            image_file: Django uploaded file or file-like object
            max_width: Maximum width (default: 1200)
            max_height: Maximum height (default: 1200)
            quality: WebP quality (default: 85)

        Returns:
            ContentFile with WebP image data and new filename
        """
        max_width = max_width or cls.MAX_WIDTH
        max_height = max_height or cls.MAX_HEIGHT
        quality = quality or cls.QUALITY

        # Open image
        img = Image.open(image_file)

        # Convert to RGB if necessary (for PNG with transparency)
        if img.mode in ('RGBA', 'P'):
            # Create white background for transparent images
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        # Resize if larger than max dimensions
        if img.width > max_width or img.height > max_height:
            img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)

        # Save as WebP
        buffer = io.BytesIO()
        img.save(buffer, format='WEBP', quality=quality, optimize=True)
        buffer.seek(0)

        # Generate new filename
        original_name = getattr(image_file, 'name', 'image')
        base_name = os.path.splitext(original_name)[0]
        new_filename = f"{base_name}_{uuid.uuid4().hex[:8]}.webp"

        return ContentFile(buffer.read(), name=new_filename)

    @classmethod
    def create_thumbnail(cls, image_file, size=None):
        """
        Create a thumbnail from an image.

        Args:
            image_file: Django uploaded file or file-like object
            size: Tuple (width, height) for thumbnail size

        Returns:
            ContentFile with WebP thumbnail data
        """
        size = size or cls.THUMBNAIL_SIZE

        img = Image.open(image_file)

        # Convert to RGB if necessary
        if img.mode in ('RGBA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        # Create thumbnail maintaining aspect ratio
        img.thumbnail(size, Image.Resampling.LANCZOS)

        buffer = io.BytesIO()
        img.save(buffer, format='WEBP', quality=80, optimize=True)
        buffer.seek(0)

        original_name = getattr(image_file, 'name', 'image')
        base_name = os.path.splitext(original_name)[0]
        new_filename = f"{base_name}_thumb_{uuid.uuid4().hex[:8]}.webp"

        return ContentFile(buffer.read(), name=new_filename)

    @classmethod
    def get_image_dimensions(cls, image_file):
        """Get dimensions of an image file."""
        img = Image.open(image_file)
        return {'width': img.width, 'height': img.height}

    @classmethod
    def validate_image(cls, image_file, max_size_mb=10):
        """
        Validate an uploaded image.

        Args:
            image_file: Django uploaded file
            max_size_mb: Maximum file size in MB

        Returns:
            Tuple (is_valid, error_message)
        """
        # Check file size
        if hasattr(image_file, 'size'):
            max_bytes = max_size_mb * 1024 * 1024
            if image_file.size > max_bytes:
                return False, f"Image size exceeds {max_size_mb}MB limit"

        # Check if it's a valid image
        try:
            img = Image.open(image_file)
            img.verify()
            image_file.seek(0)  # Reset file pointer after verify
        except Exception as e:
            return False, f"Invalid image file: {str(e)}"

        # Check format
        allowed_formats = ['JPEG', 'PNG', 'GIF', 'WEBP']
        img = Image.open(image_file)
        if img.format not in allowed_formats:
            return False, f"Unsupported image format. Allowed: {', '.join(allowed_formats)}"

        image_file.seek(0)
        return True, None
