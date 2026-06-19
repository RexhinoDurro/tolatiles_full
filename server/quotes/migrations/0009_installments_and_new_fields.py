"""
Schema migration: add InvoiceInstallment model, new Quote/Invoice fields,
and nullable installment FK on InvoiceLineItem (alongside existing invoice FK).
"""
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('quotes', '0008_crm_overhaul'),
    ]

    operations = [
        # ── Quote new fields ──────────────────────────────────────────────
        migrations.AddField(
            model_name='quote',
            name='discount_type',
            field=models.CharField(
                choices=[('percent', 'Percentage'), ('fixed', 'Fixed Amount')],
                default='percent',
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name='quote',
            name='pdf_version',
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AddField(
            model_name='quote',
            name='pdf_versions',
            field=models.JSONField(blank=True, default=list),
        ),

        # ── Invoice new fields ────────────────────────────────────────────
        migrations.AlterField(
            model_name='invoice',
            name='status',
            field=models.CharField(
                choices=[
                    ('draft', 'Draft'),
                    ('sent', 'Sent'),
                    ('partial', 'Partially Paid'),
                    ('paid', 'Paid'),
                    ('overdue', 'Overdue'),
                ],
                default='draft',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='invoice',
            name='discount_type',
            field=models.CharField(
                choices=[('percent', 'Percentage'), ('fixed', 'Fixed Amount')],
                default='fixed',
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name='invoice',
            name='discount_percent',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=5),
        ),
        migrations.AddField(
            model_name='invoice',
            name='pdf_version',
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AddField(
            model_name='invoice',
            name='pdf_versions',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='invoice',
            name='receipt_pdf_file',
            field=models.FileField(blank=True, null=True, upload_to='receipts/invoices/'),
        ),
        migrations.AddField(
            model_name='invoice',
            name='receipt_generated_at',
            field=models.DateTimeField(blank=True, null=True),
        ),

        # ── Create InvoiceInstallment ─────────────────────────────────────
        migrations.CreateModel(
            name='InvoiceInstallment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(default='Installment 1', max_length=200)),
                ('order', models.PositiveIntegerField(default=0)),
                ('start_date', models.DateField(blank=True, null=True)),
                ('due_date', models.DateField(blank=True, null=True)),
                ('paid_date', models.DateField(blank=True, null=True)),
                ('status', models.CharField(
                    choices=[('pending', 'Pending'), ('paid', 'Paid'), ('overdue', 'Overdue')],
                    default='pending',
                    max_length=20,
                )),
                ('notes', models.TextField(blank=True)),
                ('receipt_pdf_file', models.FileField(blank=True, null=True, upload_to='receipts/installments/')),
                ('receipt_generated_at', models.DateTimeField(blank=True, null=True)),
                ('invoice', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='installments',
                    to='quotes.invoice',
                )),
            ],
            options={
                'verbose_name': 'Invoice Installment',
                'verbose_name_plural': 'Invoice Installments',
                'ordering': ['order', 'id'],
            },
        ),

        # ── Add nullable installment FK to InvoiceLineItem ────────────────
        # (keep existing invoice FK for now; data migration follows)
        migrations.AddField(
            model_name='invoicelineitem',
            name='installment',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='line_items',
                to='quotes.invoiceinstallment',
            ),
        ),
    ]
