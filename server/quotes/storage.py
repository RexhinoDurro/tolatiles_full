"""
Storage backend + helpers for financial documents (quote PDFs, invoice PDFs,
invoice/installment receipt PDFs, estimate PDFs).

Scoped to the quotes app only -- every other app is unaffected. Unlike blog
media, this bucket is PRIVATE: no custom domain, no public access. These are
customer financial documents, so financial_media_url() returns a short-lived
signed URL (expires after settings.R2_FINANCIAL_URL_EXPIRE_SECONDS) generated
on request rather than a permanent public link. Falls back to local disk
(same behavior as before) until R2_FINANCIAL_* env vars are set.

Every place in the quotes app that reads/writes/deletes/archives a PDF should
go through the helpers below instead of raw os.*/open() calls or
obj.pdf_file.path -- that's what makes the same code work against either
backend. A "financial key" is a path relative to storage root, e.g.
'quotes/quote_ABC123.pdf' -- exactly what you'd pass to
storage.save()/open()/delete()/exists().
"""
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import FileSystemStorage


def _build_storage():
    if getattr(settings, 'USE_R2_FINANCIAL_STORAGE', False):
        from storages.backends.s3boto3 import S3Boto3Storage
        return S3Boto3Storage(
            bucket_name=settings.R2_FINANCIAL_BUCKET_NAME,
            access_key=settings.R2_FINANCIAL_ACCESS_KEY_ID,
            secret_key=settings.R2_FINANCIAL_SECRET_ACCESS_KEY,
            endpoint_url=settings.R2_ENDPOINT_URL,
            region_name='auto',
            # No custom_domain -- bucket is private, never served directly.
            # Every URL is a short-lived presigned request instead.
            querystring_auth=True,
            querystring_expire=settings.R2_FINANCIAL_URL_EXPIRE_SECONDS,
            # Quote/invoice/receipt PDFs are regenerated under the SAME
            # deterministic filename on purpose (e.g. quote_ABC123.pdf) --
            # _archive_pdf() copies the previous version to a versioned key
            # first, then this overwrites the canonical one. file_overwrite
            # must be True here, unlike blog media, or R2 would silently
            # rename every regenerated PDF with a random suffix.
            file_overwrite=True,
            addressing_style='path',
            signature_version='s3v4',
        )
    return FileSystemStorage(location=settings.MEDIA_ROOT, base_url=settings.MEDIA_URL)


# Built once at import time and reused.
financial_media_storage = _build_storage()


def save_pdf_bytes(key: str, content: bytes) -> str:
    """Save raw PDF bytes at storage key `key` (e.g. 'quotes/quote_ABC.pdf'),
    overwriting any existing file at that key. Returns the key saved under
    (always == `key` since file_overwrite=True / local os.replace semantics)."""
    if financial_media_storage.exists(key):
        financial_media_storage.delete(key)
    return financial_media_storage.save(key, ContentFile(content))


def financial_media_url(key: str):
    """Signed (R2) or local /media/ URL for a previously-saved key, or None
    if `key` is falsy."""
    if not key:
        return None
    return financial_media_storage.url(key)


def open_financial_file(key: str):
    """Open a previously-saved PDF for reading (binary mode)."""
    return financial_media_storage.open(key, 'rb')


def read_financial_file(key: str) -> bytes:
    with open_financial_file(key) as f:
        return f.read()


def financial_file_exists(key: str) -> bool:
    return bool(key) and financial_media_storage.exists(key)


def copy_financial_file(src_key: str, dest_key: str) -> str:
    """Copy the file at `src_key` to `dest_key` (used by _archive_pdf to
    snapshot the previous version before it gets overwritten). Returns
    dest_key. No-op-safe: raises if src_key doesn't exist, same as the old
    shutil.copy2 behavior did."""
    with financial_media_storage.open(src_key, 'rb') as f:
        content = f.read()
    if financial_media_storage.exists(dest_key):
        financial_media_storage.delete(dest_key)
    return financial_media_storage.save(dest_key, ContentFile(content))


def delete_financial_file(key: str) -> None:
    if key and financial_media_storage.exists(key):
        financial_media_storage.delete(key)


def is_local_storage() -> bool:
    return isinstance(financial_media_storage, FileSystemStorage)
