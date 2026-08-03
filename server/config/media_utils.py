"""Shared helpers for renaming already-saved local media files (gallery
images, blog featured/body images) -- e.g. when an admin wants a more
descriptive, SEO-friendly file name after upload. Local filesystem only,
matching how MEDIA_ROOT/MEDIA_URL are used everywhere else in this project
(see blog/services/web_image_service.py for the same os.rename-style
pattern applied at download time)."""
import os
import re
import unicodedata

from django.conf import settings


def slugify_filename(name: str) -> str:
    """ASCII-fold and reduce to a safe `[a-z0-9-]` file basename (no
    extension, no path separators). Falls back to 'image' if nothing
    usable survives (e.g. input was empty or all symbols)."""
    name = unicodedata.normalize('NFKD', name or '').encode('ascii', 'ignore').decode('ascii')
    name = re.sub(r'[^a-zA-Z0-9]+', '-', name).strip('-').lower()
    return name or 'image'


def rename_local_media_file(relative_path: str, desired_basename: str) -> str:
    """Rename the file at MEDIA_ROOT/relative_path to slugify_filename(desired_basename)
    + its existing extension, in the same directory. Returns the new path
    relative to MEDIA_ROOT (unchanged if the slugified name already matches
    the current basename). De-duplicates with a -1, -2, ... suffix if the
    target name is already taken by a different file.
    """
    directory = os.path.dirname(relative_path)
    _, ext = os.path.splitext(relative_path)
    base = slugify_filename(desired_basename)

    old_abs = os.path.join(settings.MEDIA_ROOT, relative_path)
    new_relative = os.path.join(directory, f'{base}{ext}') if directory else f'{base}{ext}'
    new_abs = os.path.join(settings.MEDIA_ROOT, new_relative)

    if os.path.abspath(new_abs) == os.path.abspath(old_abs):
        return relative_path

    counter = 1
    while os.path.exists(new_abs):
        candidate = f'{base}-{counter}{ext}'
        new_relative = os.path.join(directory, candidate) if directory else candidate
        new_abs = os.path.join(settings.MEDIA_ROOT, new_relative)
        counter += 1

    os.makedirs(os.path.dirname(new_abs), exist_ok=True)
    os.rename(old_abs, new_abs)
    return new_relative
