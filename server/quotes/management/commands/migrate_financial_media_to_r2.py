"""
One-time migration: upload every quote/invoice/estimate/receipt PDF that
still lives only on local disk into financial_media_storage (R2 once
configured, see quotes/storage.py), and update the field's .name to match.

New PDFs generated after the R2 migration landed already go straight to
financial_media_storage; this only matters for PDFs that predate it and
are still sitting on local disk under MEDIA_ROOT. Safe to re-run: a PDF
whose local file no longer exists (already migrated, or genuinely missing)
is left untouched.
"""
import os

from django.conf import settings
from django.core.management.base import BaseCommand

from quotes.models import Quote, Invoice, InvoiceInstallment, Estimate
from quotes.storage import save_pdf_bytes

TARGETS = [
    (Quote, 'pdf_file'),
    (Invoice, 'pdf_file'),
    (Invoice, 'receipt_pdf_file'),
    (InvoiceInstallment, 'receipt_pdf_file'),
    (Estimate, 'pdf_file'),
]


class Command(BaseCommand):
    help = (
        'Upload quote/invoice/estimate/receipt PDFs still on local disk to '
        'financial_media_storage (R2). Use --dry-run first.'
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

        for model, field_name in TARGETS:
            for obj in model.objects.all().order_by('id'):
                field_file = getattr(obj, field_name)
                if not field_file or not field_file.name:
                    continue

                local_path = os.path.join(settings.MEDIA_ROOT, field_file.name)
                if not os.path.isfile(local_path):
                    missing += 1
                    continue

                label = f'{model.__name__} #{obj.pk}.{field_name}'
                if dry_run:
                    self.stdout.write(f'Would upload {label}: {field_file.name}')
                    uploaded += 1
                    continue

                with open(local_path, 'rb') as f:
                    data = f.read()
                # financial storage is file_overwrite=True (deterministic
                # filenames by design), so new_key always == field_file.name --
                # still calling through save_pdf_bytes rather than assuming
                # that, to stay consistent with the rest of this app.
                new_key = save_pdf_bytes(field_file.name, data)
                self.stdout.write(f'{label}: {field_file.name} -> {new_key}')
                model.objects.filter(pk=obj.pk).update(**{field_name: new_key})
                uploaded += 1

        mode = 'DRY RUN' if dry_run else 'APPLIED'
        self.stdout.write(self.style.SUCCESS(
            f'{mode}: {uploaded} file(s) uploaded, {missing} reference(s) '
            f'pointed at a missing local file (left untouched).'
        ))
