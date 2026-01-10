"""
Management command to import gallery images from the Next.js client.
"""
import os
import shutil
from pathlib import Path
from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings
from gallery.models import Category, GalleryImage


# Gallery data from client/data/gallery.ts
GALLERY_DATA = {
    'backsplash': {
        'label': 'Backsplashes',
        'description': 'Beautiful kitchen backsplash installations',
        'images': [
            {'title': 'Subway Tile Backsplash', 'description': 'Classic white subway tile', 'file': '1.webp'},
            {'title': 'Mosaic Glass Backsplash', 'description': 'Colorful glass mosaic', 'file': '2.webp'},
            {'title': 'Natural Stone Backsplash', 'description': 'Elegant natural stone', 'file': '3.webp'},
            {'title': 'Hexagon Tile Backsplash', 'description': 'Modern hexagon pattern', 'file': '4.webp'},
            {'title': 'Marble Backsplash', 'description': 'Luxury marble finish', 'file': '5.webp'},
            {'title': 'Ceramic Backsplash', 'description': 'Handcrafted ceramic tiles', 'file': '6.webp'},
            {'title': 'Ceramic Backsplash', 'description': 'Handcrafted ceramic tiles', 'file': '7.webp'},
            {'title': 'Ceramic Backsplash', 'description': 'Handcrafted ceramic tiles', 'file': '8.webp'},
            {'title': 'Ceramic Backsplash', 'description': 'Handcrafted ceramic tiles', 'file': '9.webp'},
            {'title': 'Ceramic Backsplash', 'description': 'Handcrafted ceramic tiles', 'file': '10.webp'},
        ],
        'source_folder': 'backsplash',
    },
    'patio': {
        'label': 'Patios',
        'description': 'Outdoor patio tile installations',
        'images': [
            {'title': 'Outdoor Slate Patio', 'description': 'Durable slate tiles', 'file': '1.webp'},
            {'title': 'Outdoor Slate Patio', 'description': 'Durable slate tiles', 'file': '2.webp'},
            {'title': 'Outdoor Slate Patio', 'description': 'Durable slate tiles', 'file': '3.webp'},
            {'title': 'Outdoor Slate Patio', 'description': 'Durable slate tiles', 'file': '4.webp'},
            {'title': 'Outdoor Slate Patio', 'description': 'Durable slate tiles', 'file': '5.webp'},
            {'title': 'Outdoor Slate Patio', 'description': 'Durable slate tiles', 'file': '6.webp'},
            {'title': 'Outdoor Slate Patio', 'description': 'Durable slate tiles', 'file': '7.webp'},
        ],
        'source_folder': 'patio',
    },
    'shower': {
        'label': 'Showers',
        'description': 'Shower tile installations and remodels',
        'images': [
            {'title': 'Marble Shower Walls', 'description': 'Luxurious marble shower', 'file': '1.webp'},
            {'title': 'Marble Shower Walls', 'description': 'Luxurious marble shower', 'file': '2.webp'},
            {'title': 'Marble Shower Walls', 'description': 'Luxurious marble shower', 'file': '3.webp'},
            {'title': 'Marble Shower Walls', 'description': 'Luxurious marble shower', 'file': '4.webp'},
            {'title': 'Marble Shower Walls', 'description': 'Luxurious marble shower', 'file': '5.webp'},
            {'title': 'Marble Shower Walls', 'description': 'Luxurious marble shower', 'file': '6.webp'},
            {'title': 'Marble Shower Walls', 'description': 'Luxurious marble shower', 'file': '7.webp'},
            {'title': 'Marble Shower Walls', 'description': 'Luxurious marble shower', 'file': '8.webp'},
        ],
        'source_folder': 'shower',
    },
    'flooring': {
        'label': 'Flooring',
        'description': 'Floor tile installations',
        'images': [
            {'title': 'Hardwood Look Tiles', 'description': 'Wood-look porcelain', 'file': '1.webp'},
            {'title': 'Hardwood Look Tiles', 'description': 'Wood-look porcelain', 'file': '2.webp'},
            {'title': 'Hardwood Look Tiles', 'description': 'Wood-look porcelain', 'file': '3.webp'},
            {'title': 'Hardwood Look Tiles', 'description': 'Wood-look porcelain', 'file': '4.webp'},
            {'title': 'Hardwood Look Tiles', 'description': 'Wood-look porcelain', 'file': '5.webp'},
            {'title': 'Hardwood Look Tiles', 'description': 'Wood-look porcelain', 'file': '6.webp'},
            {'title': 'Hardwood Look Tiles', 'description': 'Wood-look porcelain', 'file': '7.webp'},
            {'title': 'Hardwood Look Tiles', 'description': 'Wood-look porcelain', 'file': '8.webp'},
            {'title': 'Hardwood Look Tiles', 'description': 'Wood-look porcelain', 'file': '9.webp'},
        ],
        'source_folder': 'flooring',
    },
    'fireplace': {
        'label': 'Fireplaces',
        'description': 'Fireplace surround installations',
        'images': [
            {'title': 'Stone Fireplace Surround', 'description': 'Natural stone surround', 'file': '1.webp'},
            {'title': 'Stone Fireplace Surround', 'description': 'Natural stone surround', 'file': '2.webp'},
            {'title': 'Stone Fireplace Surround', 'description': 'Natural stone surround', 'file': '3.webp'},
            {'title': 'Stone Fireplace Surround', 'description': 'Natural stone surround', 'file': '4.webp'},
            {'title': 'Stone Fireplace Surround', 'description': 'Natural stone surround', 'file': '5.webp'},
            {'title': 'Stone Fireplace Surround', 'description': 'Natural stone surround', 'file': '6.webp'},
            {'title': 'Stone Fireplace Surround', 'description': 'Natural stone surround', 'file': '7.webp'},
            {'title': 'Stone Fireplace Surround', 'description': 'Natural stone surround', 'file': '8.webp'},
        ],
        'source_folder': 'fireplace',
    },
}


class Command(BaseCommand):
    help = 'Import gallery images from the Next.js client public folder'

    def add_arguments(self, parser):
        parser.add_argument(
            '--client-path',
            type=str,
            default=None,
            help='Path to the client directory (default: ../client relative to server)',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing gallery data before importing',
        )

    def handle(self, *args, **options):
        # Determine client path
        if options['client_path']:
            client_path = Path(options['client_path'])
        else:
            # Default: client is sibling to server directory
            client_path = settings.BASE_DIR.parent / 'client'

        images_source = client_path / 'public' / 'images'

        if not images_source.exists():
            self.stderr.write(
                self.style.ERROR(f'Source images directory not found: {images_source}')
            )
            return

        # Clear existing data if requested
        if options['clear']:
            self.stdout.write('Clearing existing gallery data...')
            GalleryImage.objects.all().delete()
            Category.objects.all().delete()

        # Create media gallery directory
        gallery_media = settings.MEDIA_ROOT / 'gallery' / 'imported'
        gallery_media.mkdir(parents=True, exist_ok=True)

        total_images = 0

        for category_name, data in GALLERY_DATA.items():
            # Create or get category
            category, created = Category.objects.get_or_create(
                name=category_name,
                defaults={
                    'label': data['label'],
                    'description': data['description'],
                }
            )

            if created:
                self.stdout.write(f'Created category: {category.label}')
            else:
                self.stdout.write(f'Category exists: {category.label}')

            # Import images
            source_folder = images_source / data['source_folder']

            if not source_folder.exists():
                self.stderr.write(
                    self.style.WARNING(f'Source folder not found: {source_folder}')
                )
                continue

            for order, image_data in enumerate(data['images'], start=1):
                source_file = source_folder / image_data['file']

                if not source_file.exists():
                    self.stderr.write(
                        self.style.WARNING(f'Image not found: {source_file}')
                    )
                    continue

                # Check if image already exists
                existing = GalleryImage.objects.filter(
                    category=category,
                    title=image_data['title'],
                    order=order
                ).first()

                if existing:
                    self.stdout.write(
                        f'  Skipping existing: {image_data["title"]} ({order})'
                    )
                    continue

                # Copy image to media folder
                dest_folder = gallery_media / category_name
                dest_folder.mkdir(parents=True, exist_ok=True)
                dest_file = dest_folder / image_data['file']

                shutil.copy2(source_file, dest_file)

                # Create GalleryImage record
                with open(dest_file, 'rb') as f:
                    gallery_image = GalleryImage.objects.create(
                        category=category,
                        title=image_data['title'],
                        description=image_data['description'],
                        order=order,
                        is_active=True,
                    )
                    # Save the image file to the model
                    relative_path = f'gallery/imported/{category_name}/{image_data["file"]}'
                    gallery_image.image.name = relative_path
                    gallery_image.save()

                self.stdout.write(
                    self.style.SUCCESS(f'  Imported: {image_data["title"]}')
                )
                total_images += 1

        self.stdout.write(
            self.style.SUCCESS(f'\nSuccessfully imported {total_images} images!')
        )
