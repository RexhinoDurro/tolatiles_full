from django.db import migrations, models

import quotes.storage


class Migration(migrations.Migration):

    dependencies = [
        ('quotes', '0015_quote_portal_contact_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='quote',
            name='pdf_file',
            field=models.FileField(blank=True, null=True, storage=quotes.storage.financial_media_storage, upload_to='quotes/'),
        ),
        migrations.AlterField(
            model_name='invoice',
            name='pdf_file',
            field=models.FileField(blank=True, null=True, storage=quotes.storage.financial_media_storage, upload_to='invoices/'),
        ),
        migrations.AlterField(
            model_name='invoice',
            name='receipt_pdf_file',
            field=models.FileField(blank=True, null=True, storage=quotes.storage.financial_media_storage, upload_to='receipts/invoices/'),
        ),
        migrations.AlterField(
            model_name='invoiceinstallment',
            name='receipt_pdf_file',
            field=models.FileField(blank=True, null=True, storage=quotes.storage.financial_media_storage, upload_to='receipts/installments/'),
        ),
        migrations.AlterField(
            model_name='estimate',
            name='pdf_file',
            field=models.FileField(blank=True, null=True, storage=quotes.storage.financial_media_storage, upload_to='estimates/'),
        ),
    ]
