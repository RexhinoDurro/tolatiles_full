"""
Data migration: for every existing Invoice, create one default InvoiceInstallment
and reassign all its InvoiceLineItems to that installment.
"""
from django.db import migrations


def create_default_installments(apps, schema_editor):
    Invoice = apps.get_model('quotes', 'Invoice')
    InvoiceInstallment = apps.get_model('quotes', 'InvoiceInstallment')
    InvoiceLineItem = apps.get_model('quotes', 'InvoiceLineItem')

    for invoice in Invoice.objects.all():
        # Map invoice status to installment status
        if invoice.status == 'paid':
            inst_status = 'paid'
        else:
            inst_status = 'pending'

        installment = InvoiceInstallment.objects.create(
            invoice=invoice,
            title='Installment 1',
            order=0,
            due_date=invoice.due_date,
            paid_date=invoice.paid_at.date() if invoice.paid_at else None,
            status=inst_status,
        )

        # Reassign all existing line items to this installment
        InvoiceLineItem.objects.filter(invoice=invoice).update(installment=installment)


def reverse_migration(apps, schema_editor):
    InvoiceLineItem = apps.get_model('quotes', 'InvoiceLineItem')
    InvoiceInstallment = apps.get_model('quotes', 'InvoiceInstallment')

    # Restore invoice FK from installment FK
    for item in InvoiceLineItem.objects.select_related('installment__invoice').all():
        if item.installment:
            item.invoice = item.installment.invoice
            item.save(update_fields=['invoice'])

    InvoiceInstallment.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('quotes', '0009_installments_and_new_fields'),
    ]

    operations = [
        migrations.RunPython(create_default_installments, reverse_migration),
    ]
