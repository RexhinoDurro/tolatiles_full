"""
Celery tasks for quote/invoice PDF generation and email delivery.
"""
import os
import logging
from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def generate_quote_pdf(self, quote_id: int) -> dict:
    """
    Generate PDF for a quote using xhtml2pdf.

    Args:
        quote_id: The ID of the Quote to generate PDF for

    Returns:
        dict with status and pdf_path on success
    """
    from quotes.models import Quote, CompanySettings

    try:
        from xhtml2pdf import pisa

        quote = Quote.objects.select_related('customer').prefetch_related('line_items').get(id=quote_id)
        company = CompanySettings.get_instance()

        # Render HTML template
        html_content = render_to_string('quotes/quote_pdf.html', {
            'quote': quote,
            'company': company,
            'line_items': quote.line_items.all(),
        })

        # Ensure PDF directory exists
        pdf_dir = os.path.join(settings.MEDIA_ROOT, 'quotes')
        os.makedirs(pdf_dir, exist_ok=True)

        # Generate unique filename
        pdf_filename = f"quote_{quote.reference}.pdf"
        pdf_path = os.path.join(pdf_dir, pdf_filename)

        # Generate PDF using xhtml2pdf
        with open(pdf_path, 'wb') as pdf_file:
            pisa_status = pisa.CreatePDF(html_content, dest=pdf_file)

        if pisa_status.err:
            logger.error(f"Error generating PDF: {pisa_status.err}")
            return {'status': 'error', 'reason': 'pdf_generation_failed'}

        # Set file permissions so nginx can read
        os.chmod(pdf_path, 0o644)

        # Update quote with PDF path
        quote.pdf_file.name = f"quotes/{pdf_filename}"
        quote.pdf_generated_at = timezone.now()
        quote.save(update_fields=['pdf_file', 'pdf_generated_at'])

        logger.info(f"Generated PDF for quote {quote.reference}")
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
    """
    Generate PDF for an invoice using xhtml2pdf.

    Args:
        invoice_id: The ID of the Invoice to generate PDF for

    Returns:
        dict with status and pdf_path on success
    """
    from quotes.models import Invoice, CompanySettings

    try:
        from xhtml2pdf import pisa

        invoice = Invoice.objects.select_related('customer').prefetch_related('line_items').get(id=invoice_id)
        company = CompanySettings.get_instance()

        # Render HTML template
        html_content = render_to_string('quotes/invoice_pdf.html', {
            'invoice': invoice,
            'company': company,
            'line_items': invoice.line_items.all(),
        })

        # Ensure PDF directory exists
        pdf_dir = os.path.join(settings.MEDIA_ROOT, 'invoices')
        os.makedirs(pdf_dir, exist_ok=True)

        # Generate unique filename
        pdf_filename = f"invoice_{invoice.reference}.pdf"
        pdf_path = os.path.join(pdf_dir, pdf_filename)

        # Generate PDF using xhtml2pdf
        with open(pdf_path, 'wb') as pdf_file:
            pisa_status = pisa.CreatePDF(html_content, dest=pdf_file)

        if pisa_status.err:
            logger.error(f"Error generating PDF: {pisa_status.err}")
            return {'status': 'error', 'reason': 'pdf_generation_failed'}

        # Set file permissions so nginx can read
        os.chmod(pdf_path, 0o644)

        # Update invoice with PDF path
        invoice.pdf_file.name = f"invoices/{pdf_filename}"
        invoice.pdf_generated_at = timezone.now()
        invoice.save(update_fields=['pdf_file', 'pdf_generated_at'])

        logger.info(f"Generated PDF for invoice {invoice.reference}")
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
