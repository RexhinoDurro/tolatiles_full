from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gallery', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='galleryimage',
            name='alt_text',
            field=models.CharField(
                blank=True,
                default='',
                help_text='Alt text for accessibility/SEO. Falls back to title-based text if empty.',
                max_length=255,
            ),
        ),
    ]
