"""Signal handlers for creating notifications."""

import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from leads.models import ContactLead, LocalAdsLead

logger = logging.getLogger(__name__)


@receiver(post_save, sender=ContactLead)
def notify_on_new_contact_lead(sender, instance, created, **kwargs):
    """Create notification when a new website contact lead is submitted."""
    if created:
        from .services import NotificationService

        logger.info(f"New contact lead received: {instance.full_name}")

        NotificationService.create_notification_for_all_staff(
            notification_type='new_lead',
            title='New Website Lead',
            message=f"{instance.full_name} submitted a {instance.get_project_type_display()} inquiry",
            priority='high',
            related_object=instance,
            data={
                'lead_type': 'website',
                'lead_id': instance.id,
                'name': instance.full_name,
                'email': instance.email,
                'phone': instance.phone,
                'project_type': instance.project_type,
                'url': f'/admin/leads?highlight={instance.id}'
            }
        )


@receiver(post_save, sender=LocalAdsLead)
def notify_on_new_local_ads_lead(sender, instance, created, **kwargs):
    """Create notification when a new Google Local Ads lead is received."""
    if created:
        from .services import NotificationService

        logger.info(f"New Local Ads lead received: {instance.customer_phone}")

        lead_type_display = 'Phone Call' if instance.lead_type == 'phone' else 'Message'

        NotificationService.create_notification_for_all_staff(
            notification_type='new_lead',
            title=f'New Local Ads Lead ({lead_type_display})',
            message=f"{instance.customer_name or instance.customer_phone} - {instance.job_type}",
            priority='high',
            related_object=instance,
            data={
                'lead_type': 'local_ads',
                'lead_id': instance.id,
                'name': instance.customer_name,
                'phone': instance.customer_phone,
                'job_type': instance.job_type,
                'url': f'/admin/leads?tab=local-ads&highlight={instance.id}'
            }
        )


def register_quote_signals():
    """Register signals for quote events (called from apps.py if quotes app is loaded)."""
    try:
        from quotes.models import Quote, Invoice

        @receiver(post_save, sender=Quote)
        def notify_on_quote_accepted(sender, instance, created, **kwargs):
            """Create notification when a quote is accepted."""
            if not created and instance.status == 'accepted':
                from .services import NotificationService

                NotificationService.create_notification_for_all_staff(
                    notification_type='quote_status',
                    title='Quote Accepted',
                    message=f"Quote {instance.reference} for {instance.customer.name} was accepted",
                    priority='high',
                    related_object=instance,
                    data={
                        'quote_id': instance.id,
                        'reference': instance.reference,
                        'customer_name': instance.customer.name,
                        'total': str(instance.total),
                        'url': f'/admin/quotes/{instance.id}'
                    }
                )

        @receiver(post_save, sender=Invoice)
        def notify_on_invoice_paid(sender, instance, created, **kwargs):
            """Create notification when an invoice is paid."""
            if not created and instance.status == 'paid':
                from .services import NotificationService

                NotificationService.create_notification_for_all_staff(
                    notification_type='invoice_paid',
                    title='Invoice Paid',
                    message=f"Invoice {instance.reference} for ${instance.total} has been paid",
                    priority='normal',
                    related_object=instance,
                    data={
                        'invoice_id': instance.id,
                        'reference': instance.reference,
                        'customer_name': instance.customer.name,
                        'total': str(instance.total),
                        'url': f'/admin/invoices/{instance.id}'
                    }
                )

        logger.info("Quote/Invoice notification signals registered")

    except ImportError:
        logger.warning("Quotes app not available, skipping quote signals")


# Register quote signals
register_quote_signals()
