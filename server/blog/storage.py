"""
Storage backend + helpers for blog media (AI-generated images, web-sourced
images, inline content images, the featured image).

This is scoped to the blog app only -- gallery/projects/etc. keep using
Django's normal local-disk storage untouched. Blog media goes to Cloudflare
R2 in production once the R2_* env vars are set (see settings.py); until
then (e.g. local dev, or if R2 isn't configured yet) it transparently falls
back to the same local FileSystemStorage behavior this app always had, so
nothing breaks for anyone without an R2 account.

Every place in the blog app that reads/writes/renames/deletes a media file
should go through the helpers below instead of raw os.*/open() calls or
settings.MEDIA_ROOT/MEDIA_URL string manipulation -- that's what makes the
same code work against either backend. A "media key" is a path relative to
storage root, e.g. 'blog/ai-generated/ai_generated_abc123.png' -- exactly
what you'd pass to storage.save()/open()/delete()/exists(). A "media URL"
is the public URL blog_media_url() returns for that key.
"""
import os
import re
import unicodedata

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import FileSystemStorage


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
            # Plain, permanent, cacheable URLs -- not presigned/expiring.
            # These URLs get baked into post.content HTML and stored in
            # media_plan/featured_image_plan JSON, so they must never expire.
            querystring_auth=False,
            # Never silently clobber a same-named file -- matches the
            # dedup expectations the rest of this module relies on.
            file_overwrite=False,
            addressing_style='path',
            signature_version='s3v4',
        )
    # Same defaults Django would have used anyway; spelled out explicitly
    # so this function always returns a real Storage instance either way.
    return FileSystemStorage(location=settings.MEDIA_ROOT, base_url=settings.MEDIA_URL)


# Built once at import time and reused -- mirrors how django.core.files.storage
# .default_storage itself is a module-level singleton.
blog_media_storage = _build_storage()


def slugify_filename(name: str) -> str:
    """ASCII-fold and reduce to a safe `[a-z0-9-]` file basename (no
    extension, no path separators). Falls back to 'image' if nothing
    usable survives (e.g. input was empty or all symbols)."""
    name = unicodedata.normalize('NFKD', name or '').encode('ascii', 'ignore').decode('ascii')
    name = re.sub(r'[^a-zA-Z0-9]+', '-', name).strip('-').lower()
    return name or 'image'


def save_media_bytes(key: str, content: bytes) -> str:
    """Save raw bytes at storage key `key` (e.g. 'blog/ai-generated/x.png').
    Returns the actual key saved under (the storage backend appends a
    dedup suffix if `key` is already taken)."""
    return blog_media_storage.save(key, ContentFile(content))


def blog_media_url(key: str) -> str:
    """Public URL for a previously-saved media key."""
    return blog_media_storage.url(key)


def blog_media_key_from_url(url: str):
    """Reverse of blog_media_url(): if `url` points at a file this app's
    blog media storage actually hosts, return its key; otherwise None
    (caller should treat it as an external URL that needs downloading
    first, or as belonging to a different app's storage, e.g. Gallery)."""
    if not url:
        return None
    prefix = settings.MEDIA_PUBLIC_URL_PREFIX
    if url.startswith(prefix):
        return url[len(prefix):]
    return None


def open_media_file(key: str):
    """Open a previously-saved media file for reading (binary mode)."""
    return blog_media_storage.open(key, 'rb')


def delete_media_file(key: str) -> None:
    if key and blog_media_storage.exists(key):
        blog_media_storage.delete(key)


def rename_media_file(key: str, desired_basename: str) -> str:
    """Rename (local storage) or copy+delete (R2/remote storage) the file
    at `key` to slugify_filename(desired_basename) + its existing
    extension, in the same 'directory'. Returns the new key (unchanged if
    the slugified name already matches the current basename). De-dupes
    with a -1, -2, ... suffix if the target name is already taken by a
    different file."""
    directory = os.path.dirname(key)
    _, ext = os.path.splitext(key)
    base = slugify_filename(desired_basename)
    new_key = os.path.join(directory, f'{base}{ext}') if directory else f'{base}{ext}'

    if new_key == key:
        return key

    counter = 1
    while blog_media_storage.exists(new_key):
        candidate = f'{base}-{counter}{ext}'
        new_key = os.path.join(directory, candidate) if directory else candidate
        counter += 1

    with blog_media_storage.open(key, 'rb') as f:
        blog_media_storage.save(new_key, ContentFile(f.read()))
    blog_media_storage.delete(key)
    return new_key


def is_local_storage() -> bool:
    return isinstance(blog_media_storage, FileSystemStorage)
