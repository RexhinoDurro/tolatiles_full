"""
One-time migration: upload every gallery image that still lives only on
local disk into gallery_media_storage (R2 once configured, see
gallery/storage.py), and update GalleryImage.image.name to match.

New images uploaded after the R2 migration landed already go straight to
gallery_media_storage; this only matters for images that predate it and are
still sitting on local disk under MEDIA_ROOT. Safe to re-run: an image
whose local file no longer exists (already migrated, or genuinely missing)
is left untouched.
"""
import os

from django.conf import settings
from django.core.management.base import BaseCommand

from gallery.models import GalleryImage
from gallery.storage import save_media_bytes


class Command(BaseCommand):
    help = (
        'Upload gallery images still on local disk to gallery_media_storage '
        '(R2). Use --dry-run first.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run', action='store_true',
            help="Print what would change; don't save or upload anything.",
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        uploaded = 0
        missing = 0

        for image in GalleryImage.objects.all().order_by('id'):
            if not image.image or not image.image.name:
                continue

            local_path = os.path.join(settings.MEDIA_ROOT, image.image.name)
            if not os.path.isfile(local_path):
                missing += 1
                continue

            if dry_run:
                self.stdout.write(f'Would upload GalleryImage #{image.id}: {image.image.name}')
                uploaded += 1
                continue

            with open(local_path, 'rb') as f:
                data = f.read()
            new_key = save_media_bytes(image.image.name, data)
            if new_key != image.image.name:
                self.stdout.write(f'GalleryImage #{image.id}: {image.image.name} -> {new_key}')
                GalleryImage.objects.filter(pk=image.pk).update(image=new_key)
            else:
                self.stdout.write(f'GalleryImage #{image.id}: {new_key} (uploaded, key unchanged)')
            uploaded += 1

        mode = 'DRY RUN' if dry_run else 'APPLIED'
        self.stdout.write(self.style.SUCCESS(
            f'{mode}: {uploaded} image(s) uploaded, {missing} reference(s) '
            f'pointed at a missing local file (left untouched).'
        ))
