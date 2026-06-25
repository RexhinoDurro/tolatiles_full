from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quotes', '0013_quote_payment_terms'),
    ]

    operations = [
        migrations.AddField(
            model_name='quote',
            name='created_via_portal',
            field=models.BooleanField(db_index=True, default=False),
        ),
        migrations.AddField(
            model_name='quote',
            name='edited_by_admin',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='quote',
            name='admin_edited_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
