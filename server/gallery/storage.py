"""
Storage backend + helpers for gallery images (project photos shown at
/gallery).

Scoped to the gallery app only -- Projects keeps using Django's normal
local-disk storage untouched. Gallery images share the SAME public R2
bucket/custom domain as blog media (settings.R2_*) -- both are public,
permanently-cacheable marketing images, and Cloudflare keys already
provisioned for that bucket cover this without needing a second bucket or
token. Keys just live under their own 'gallery/...' prefix (see
GalleryImage.image's upload_to='gallery/%Y/%m/'), so there's no collision
with blog's 'blog/...' prefix. Falls back to local disk automatically if
R2 isn't configured, same as blog.

Every place in the gallery app that reads/writes/renames a media file
should go through the helpers below instead of raw os.*/open() calls or
obj.image.path -- that's what makes the same code work against either
backend (obj.image.path raises on S3Boto3Storage, which is why the image
transform/rotate feature needs this).
"""
import os

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import FileSystemStorage

from config.media_utils import slugify_filename


def _build_storage():
    if getattr(settings, 'USE_R2_STORAGE', False):
        from storages.backends.s3boto3 import S3Boto3Storage
        return S3Boto3Storage(
            bucket_name=settings.R2_BUCKET_NAME,
            access_key=settings.R2_ACCESS_KEY_ID,
            secret_key=settings.R2_SECRET_ACCESS_KEY,
            endpoint_url=settings.R2_ENDPOINT_URL,
            region_name='auto',
            custom_domain=settings.R2_CUSTOM_DOMAIN,
            # Permanent, cacheable URLs -- same reasoning as blog media.
            querystring_auth=False,
            file_overwrite=False,
            addressing_style='path',
            signature_version='s3v4',
        )
    return FileSystemStorage(location=settings.MEDIA_ROOT, base_url=settings.MEDIA_URL)


# Built once at import time and reused.
gallery_media_storage = _build_storage()


def save_media_bytes(key: str, content: bytes) -> str:
    """Save raw bytes at storage key `key` (e.g. 'gallery/2026/08/x.jpg').
    Returns the actual key saved under (the storage backend appends a
    dedup suffix if `key` is already taken)."""
    return gallery_media_storage.save(key, ContentFile(content))


def overwrite_media_bytes(key: str, content: bytes) -> None:
    """Replace the file at `key` in place with `content` -- used by the
    rotate/flip transform action, which edits an existing image and must
    keep the same key/URL rather than getting a deduped new one."""
    if gallery_media_storage.exists(key):
        gallery_media_storage.delete(key)
    gallery_media_storage.save(key, ContentFile(content))


def read_media_bytes(key: str) -> bytes:
    with gallery_media_storage.open(key, 'rb') as f:
        return f.read()


def gallery_media_url(key: str):
    if not key:
        return None
    return gallery_media_storage.url(key)


def delete_media_file(key: str) -> None:
    if key and gallery_media_storage.exists(key):
        gallery_media_storage.delete(key)


def rename_media_file(key: str, desired_basename: str) -> str:
    """Rename (local storage) or copy+delete (R2/remote storage) the file
    at `key` to slugify_filename(desired_basename) + its existing
    extension, in the same 'directory'. Returns the new key (unchanged if
    the slugified name already matches the current basename). De-dupes
    with a -1, -2, ... suffix if the target name is already taken by a
    different file. Mirrors blog/storage.py::rename_media_file."""
    directory = os.path.dirname(key)
    _, ext = os.path.splitext(key)
    base = slugify_filename(desired_basename)
    new_key = os.path.join(directory, f'{base}{ext}') if directory else f'{base}{ext}'

    if new_key == key:
        return key

    counter = 1
    while gallery_media_storage.exists(new_key):
        candidate = f'{base}-{counter}{ext}'
        new_key = os.path.join(directory, candidate) if directory else candidate
        counter += 1

    with gallery_media_storage.open(key, 'rb') as f:
        gallery_media_storage.save(new_key, ContentFile(f.read()))
    gallery_media_storage.delete(key)
    return new_key


def is_local_storage() -> bool:
    return isinstance(gallery_media_storage, FileSystemStorage)
