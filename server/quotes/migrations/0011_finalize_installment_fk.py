"""
Schema cleanup: make InvoiceLineItem.installment non-nullable, remove old invoice FK.
"""
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('quotes', '0010_migrate_line_items_to_installments'),
    ]

    operations = [
        # Make installment FK non-nullable
        migrations.AlterField(
            model_name='invoicelineitem',
            name='installment',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='line_items',
                to='quotes.invoiceinstallment',
            ),
        ),

        # Remove old invoice FK
        migrations.RemoveField(
            model_name='invoicelineitem',
            name='invoice',
        ),
    ]
