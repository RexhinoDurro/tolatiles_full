from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0008_blogpost_featured_image_plan'),
    ]

    operations = [
        migrations.AddField(
            model_name='blogpost',
            name='last_published_at',
            field=models.DateTimeField(
                blank=True,
                null=True,
                help_text='When this post was last pushed live via Publish/Publish Changes.',
            ),
        ),
        migrations.AddField(
            model_name='blogpost',
            name='pending_snapshot',
            field=models.JSONField(
                blank=True,
                default=None,
                null=True,
                help_text='Autosaved unpublished edits for an already-published post; null when there are none.',
            ),
        ),
    ]
