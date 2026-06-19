"""
Celery tasks for quote/invoice PDF generation and email delivery.
"""
import os
import shutil
import logging
from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.utils import timezone

logger = logging.getLogger(__name__)


def _archive_pdf(obj, pdf_dir, base_filename):
    """
    If obj already has a PDF file, copy it to a versioned filename and
    append an entry to obj.pdf_versions. Returns the updated version number.
    Does NOT save the object — caller must save.
    """
    if not obj.pdf_file:
        return obj.pdf_version

    current_path = obj.pdf_file.path if obj.pdf_file else None
    if current_path and os.path.exists(current_path):
        version = obj.pdf_version
        versioned_filename = f"{base_filename}_v{version}.pdf"
        versioned_path = os.path.join(pdf_dir, versioned_filename)
        try:
            shutil.copy2(current_path, versioned_path)
            os.chmod(versioned_path, 0o644)
        except Exception as exc:
            logger.warning(f"Could not archive PDF version: {exc}")
            return version

        versions = list(obj.pdf_versions or [])
        versions.append({
            'version': version,
            'file': versioned_filename,
            'generated_at': obj.pdf_generated_at.isoformat() if obj.pdf_generated_at else None,
        })
        obj.pdf_versions = versions
        obj.pdf_version = version + 1

    return obj.pdf_version


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def generate_quote_pdf(self, quote_id: int) -> dict:
    """Generate PDF for a quote, archiving any previous version."""
    from quotes.models import Quote, CompanySettings

    try:
        from xhtml2pdf import pisa

        quote = Quote.objects.select_related('customer').prefetch_related('line_items').get(id=quote_id)
        company = CompanySettings.get_instance()

        pdf_dir = os.path.join(settings.MEDIA_ROOT, 'quotes')
        os.makedirs(pdf_dir, exist_ok=True)

        # Archive existing PDF before overwriting
        _archive_pdf(quote, pdf_dir, f"quote_{quote.reference}")

        html_content = render_to_string('quotes/quote_pdf.html', {
            'quote': quote,
            'company': company,
            'line_items': quote.line_items.all(),
        })

        pdf_filename = f"quote_{quote.reference}.pdf"
        pdf_path = os.path.join(pdf_dir, pdf_filename)

        with open(pdf_path, 'wb') as pdf_file:
            pisa_status = pisa.CreatePDF(html_content, dest=pdf_file)

        if pisa_status.err:
            logger.error(f"Error generating PDF: {pisa_status.err}")
            return {'status': 'error', 'reason': 'pdf_generation_failed'}

        os.chmod(pdf_path, 0o644)

        quote.pdf_file.name = f"quotes/{pdf_filename}"
        quote.pdf_generated_at = timezone.now()
        quote.save(update_fields=['pdf_file', 'pdf_generated_at', 'pdf_version', 'pdf_versions'])

        logger.info(f"Generated PDF v{quote.pdf_version - 1} for quote {quote.reference}")
        return {'status': 'success', 'pdf_path': pdf_path, 'reference': quote.reference}

    except Quote.DoesNotExist:
        logger.error(f"Quote {quote_id} not found")
        return {'status': 'error', 'reason': 'quote_not_found'}

    except ImportError as exc:
        logger.error(f"xhtml2pdf not installed: {exc}")
        return {'status': 'error', 'reason': 'xhtml2pdf_not_installed'}

    except Exception as exc:
        logger.exception(f"Error generating PDF for quote {quote_id}: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=120)
def send_quote_email(self, quote_id: int) -> dict:
    """
    Send quote email with PDF attachment.

    Args:
        quote_id: The ID of the Quote to send

    Returns:
        dict with status on success
    """
    from quotes.models import Quote, CompanySettings

    try:
        quote = Quote.objects.select_related('customer').get(id=quote_id)
        company = CompanySettings.get_instance()

        if not quote.customer.email:
            logger.warning(f"Quote {quote.reference} customer has no email")
            return {'status': 'error', 'reason': 'no_customer_email'}

        # Generate PDF first if not exists
        if not quote.pdf_file:
            result = generate_quote_pdf(quote_id)
            if result.get('status') != 'success':
                return {'status': 'error', 'reason': 'pdf_generation_failed'}
            quote.refresh_from_db()

        # Build public URL
        public_url = f"{settings.CORS_ALLOWED_ORIGINS[0]}/quotes/{quote.reference}"

        # Render email HTML
        email_html = render_to_string('quotes/quote_email.html', {
            'quote': quote,
            'company': company,
            'public_url': public_url,
        })

        # Create email
        subject = f"Quote {quote.reference}: {quote.title}"
        email = EmailMessage(
            subject=subject,
            body=email_html,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[quote.customer.email],
            reply_to=[company.email],
        )
        email.content_subtype = 'html'

        # Attach PDF
        if quote.pdf_file and os.path.exists(quote.pdf_file.path):
            email.attach_file(quote.pdf_file.path)

        # Send email
        email.send()

        # Update quote status if draft
        if quote.status == 'draft':
            quote.status = 'sent'
            quote.save(update_fields=['status'])

        logger.info(f"Sent quote {quote.reference} to {quote.customer.email}")
        return {'status': 'success', 'email': quote.customer.email}

    except Quote.DoesNotExist:
        logger.error(f"Quote {quote_id} not found")
        return {'status': 'error', 'reason': 'quote_not_found'}

    except Exception as exc:
        logger.exception(f"Error sending quote email: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def generate_invoice_pdf(self, invoice_id: int) -> dict:
    """Generate PDF for an invoice, archiving any previous version."""
    from quotes.models import Invoice, CompanySettings

    try:
        from xhtml2pdf import pisa

        invoice = Invoice.objects.select_related('customer').prefetch_related(
            'installments__line_items'
        ).get(id=invoice_id)
        company = CompanySettings.get_instance()

        pdf_dir = os.path.join(settings.MEDIA_ROOT, 'invoices')
        os.makedirs(pdf_dir, exist_ok=True)

        # Archive existing PDF before overwriting
        _archive_pdf(invoice, pdf_dir, f"invoice_{invoice.reference}")

        html_content = render_to_string('quotes/invoice_pdf.html', {
            'invoice': invoice,
            'company': company,
            'installments': invoice.installments.prefetch_related('line_items').all(),
        })

        pdf_filename = f"invoice_{invoice.reference}.pdf"
        pdf_path = os.path.join(pdf_dir, pdf_filename)

        with open(pdf_path, 'wb') as pdf_file:
            pisa_status = pisa.CreatePDF(html_content, dest=pdf_file)

        if pisa_status.err:
            logger.error(f"Error generating PDF: {pisa_status.err}")
            return {'status': 'error', 'reason': 'pdf_generation_failed'}

        os.chmod(pdf_path, 0o644)

        invoice.pdf_file.name = f"invoices/{pdf_filename}"
        invoice.pdf_generated_at = timezone.now()
        invoice.save(update_fields=['pdf_file', 'pdf_generated_at', 'pdf_version', 'pdf_versions'])

        logger.info(f"Generated PDF v{invoice.pdf_version - 1} for invoice {invoice.reference}")
        return {'status': 'success', 'pdf_path': pdf_path, 'reference': invoice.reference}

    except Invoice.DoesNotExist:
        logger.error(f"Invoice {invoice_id} not found")
        return {'status': 'error', 'reason': 'invoice_not_found'}

    except ImportError as exc:
        logger.error(f"xhtml2pdf not installed: {exc}")
        return {'status': 'error', 'reason': 'xhtml2pdf_not_installed'}

    except Exception as exc:
        logger.exception(f"Error generating PDF for invoice {invoice_id}: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def generate_installment_receipt_pdf(self, installment_id: int) -> dict:
    """Generate a receipt PDF for a single paid installment."""
    from quotes.models import InvoiceInstallment, CompanySettings

    try:
        from xhtml2pdf import pisa

        installment = InvoiceInstallment.objects.select_related(
            'invoice__customer'
        ).prefetch_related('line_items').get(id=installment_id)
        company = CompanySettings.get_instance()

        pdf_dir = os.path.join(settings.MEDIA_ROOT, 'receipts', 'installments')
        os.makedirs(pdf_dir, exist_ok=True)

        html_content = render_to_string('quotes/installment_receipt_pdf.html', {
            'installment': installment,
            'invoice': installment.invoice,
            'company': company,
        })

        pdf_filename = f"receipt_{installment.invoice.reference}_inst{installment.id}.pdf"
        pdf_path = os.path.join(pdf_dir, pdf_filename)

        with open(pdf_path, 'wb') as pdf_file:
            pisa_status = pisa.CreatePDF(html_content, dest=pdf_file)

        if pisa_status.err:
            return {'status': 'error', 'reason': 'pdf_generation_failed'}

        os.chmod(pdf_path, 0o644)

        installment.receipt_pdf_file.name = f"receipts/installments/{pdf_filename}"
        installment.receipt_generated_at = timezone.now()
        installment.save(update_fields=['receipt_pdf_file', 'receipt_generated_at'])

        logger.info(f"Generated installment receipt for {installment}")
        return {'status': 'success', 'pdf_path': pdf_path}

    except InvoiceInstallment.DoesNotExist:
        return {'status': 'error', 'reason': 'installment_not_found'}
    except ImportError:
        return {'status': 'error', 'reason': 'xhtml2pdf_not_installed'}
    except Exception as exc:
        logger.exception(f"Error generating installment receipt {installment_id}: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def generate_invoice_receipt_pdf(self, invoice_id: int) -> dict:
    """Generate a master receipt PDF for an invoice (shows all installment payment status)."""
    from quotes.models import Invoice, CompanySettings

    try:
        from xhtml2pdf import pisa

        invoice = Invoice.objects.select_related('customer').prefetch_related(
            'installments__line_items'
        ).get(id=invoice_id)
        company = CompanySettings.get_instance()

        pdf_dir = os.path.join(settings.MEDIA_ROOT, 'receipts', 'invoices')
        os.makedirs(pdf_dir, exist_ok=True)

        html_content = render_to_string('quotes/invoice_receipt_pdf.html', {
            'invoice': invoice,
            'company': company,
            'installments': invoice.installments.prefetch_related('line_items').all(),
        })

        pdf_filename = f"receipt_{invoice.reference}.pdf"
        pdf_path = os.path.join(pdf_dir, pdf_filename)

        with open(pdf_path, 'wb') as pdf_file:
            pisa_status = pisa.CreatePDF(html_content, dest=pdf_file)

        if pisa_status.err:
            return {'status': 'error', 'reason': 'pdf_generation_failed'}

        os.chmod(pdf_path, 0o644)

        invoice.receipt_pdf_file.name = f"receipts/invoices/{pdf_filename}"
        invoice.receipt_generated_at = timezone.now()
        invoice.save(update_fields=['receipt_pdf_file', 'receipt_generated_at'])

        logger.info(f"Generated invoice receipt for {invoice.reference}")
        return {'status': 'success', 'pdf_path': pdf_path}

    except Invoice.DoesNotExist:
        return {'status': 'error', 'reason': 'invoice_not_found'}
    except ImportError:
        return {'status': 'error', 'reason': 'xhtml2pdf_not_installed'}
    except Exception as exc:
        logger.exception(f"Error generating invoice receipt {invoice_id}: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=120)
def send_invoice_email(self, invoice_id: int) -> dict:
    """
    Send invoice email with PDF attachment.

    Args:
        invoice_id: The ID of the Invoice to send

    Returns:
        dict with status on success
    """
    from quotes.models import Invoice, CompanySettings

    try:
        invoice = Invoice.objects.select_related('customer').get(id=invoice_id)
        company = CompanySettings.get_instance()

        if not invoice.customer.email:
            logger.warning(f"Invoice {invoice.reference} customer has no email")
            return {'status': 'error', 'reason': 'no_customer_email'}

        # Generate PDF first if not exists
        if not invoice.pdf_file:
            result = generate_invoice_pdf(invoice_id)
            if result.get('status') != 'success':
                return {'status': 'error', 'reason': 'pdf_generation_failed'}
            invoice.refresh_from_db()

        # Build public URL
        public_url = f"{settings.CORS_ALLOWED_ORIGINS[0]}/invoices/{invoice.reference}"

        # Render email HTML
        email_html = render_to_string('quotes/invoice_email.html', {
            'invoice': invoice,
            'company': company,
            'public_url': public_url,
        })

        # Create email
        subject = f"Invoice {invoice.reference}: {invoice.title}"
        email = EmailMessage(
            subject=subject,
            body=email_html,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[invoice.customer.email],
            reply_to=[company.email],
        )
        email.content_subtype = 'html'

        # Attach PDF
        if invoice.pdf_file and os.path.exists(invoice.pdf_file.path):
            email.attach_file(invoice.pdf_file.path)

        # Send email
        email.send()

        # Update invoice status if draft
        if invoice.status == 'draft':
            invoice.status = 'sent'
            invoice.save(update_fields=['status'])

        logger.info(f"Sent invoice {invoice.reference} to {invoice.customer.email}")
        return {'status': 'success', 'email': invoice.customer.email}

    except Invoice.DoesNotExist:
        logger.error(f"Invoice {invoice_id} not found")
        return {'status': 'error', 'reason': 'invoice_not_found'}

    except Exception as exc:
        logger.exception(f"Error sending invoice email: {exc}")
        raise self.retry(exc=exc)


@shared_task
def check_expired_quotes():
    """
    Periodic task to mark expired quotes.
    Run this daily via Celery Beat.
    """
    from quotes.models import Quote

    expired_count = Quote.objects.filter(
        status='sent',
        expires_at__lt=timezone.now().date()
    ).update(status='expired')

    logger.info(f"Marked {expired_count} quotes as expired")
    return {'expired_count': expired_count}


@shared_task
def check_overdue_invoices():
    """
    Periodic task to mark overdue invoices.
    Run this daily via Celery Beat.
    """
    from quotes.models import Invoice

    overdue_count = Invoice.objects.filter(
        status='sent',
        due_date__lt=timezone.now().date()
    ).update(status='overdue')

    logger.info(f"Marked {overdue_count} invoices as overdue")
    return {'overdue_count': overdue_count}
