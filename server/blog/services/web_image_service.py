"""
Downloads and saves an externally-hosted image into local media storage, so
the blog ends up referencing a file this app actually hosts -- never a
hotlink to wherever the image was originally found.

There is no live "search the web for images" API anywhere in this app.
Finding the actual image happens via an agent/session with real web access
(Claude, using its own search/browsing tools) while drafting a post; this
module only ever downloads a URL that's already been found and vetted, via
either the add_web_image_candidate management command or a human pasting a
URL directly in the admin picker (resolve_media_placeholder).
"""
import uuid
import mimetypes

import requests

from ..storage import save_media_bytes, blog_media_url

MAX_DOWNLOAD_BYTES = 15 * 1024 * 1024  # 15MB safety cap
ALLOWED_CONTENT_TYPES = {'image/jpeg', 'image/png', 'image/webp', 'image/gif'}


class WebImageDownloadError(Exception):
    """Raised when a URL can't be fetched or isn't a usable image."""


def download_and_save_image(url, subdir='blog/web-sourced'):
    """Download `url` and save it into blog media storage (local disk or
    R2, see blog/storage.py) under {subdir}/.

    Returns {'url': ..., 'filename': ...} (same shape ImageGenerationService
    returns) pointing at the app's own hosted copy. Raises
    WebImageDownloadError on any failure -- never falls back silently, since
    the caller needs to know the save didn't happen rather than end up
    hotlinking the original URL.
    """
    try:
        response = requests.get(
            url,
            headers={'User-Agent': 'Mozilla/5.0 (compatible; TolaTiles/1.0)'},
            timeout=20,
            stream=True,
        )
        response.raise_for_status()
    except requests.RequestException as e:
        raise WebImageDownloadError(f'Failed to fetch {url}: {e}')

    content_type = response.headers.get('Content-Type', '').split(';')[0].strip().lower()
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise WebImageDownloadError(f'{url} is not a supported image type (got {content_type or "unknown"})')

    content_length = response.headers.get('Content-Length')
    if content_length and int(content_length) > MAX_DOWNLOAD_BYTES:
        raise WebImageDownloadError(f'{url} is too large ({content_length} bytes, max {MAX_DOWNLOAD_BYTES})')

    body = bytearray()
    for chunk in response.iter_content(chunk_size=65536):
        body.extend(chunk)
        if len(body) > MAX_DOWNLOAD_BYTES:
            raise WebImageDownloadError(f'{url} exceeded the {MAX_DOWNLOAD_BYTES}-byte download limit')

    extension = mimetypes.guess_extension(content_type) or '.jpg'
    if extension == '.jpe':
        extension = '.jpg'
    filename = f'web_{uuid.uuid4().hex[:12]}{extension}'

    key = save_media_bytes(f'{subdir}/{filename}', bytes(body))

    return {
        'url': blog_media_url(key),
        'filename': filename,
    }
