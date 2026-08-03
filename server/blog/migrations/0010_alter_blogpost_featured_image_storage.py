from django.db import migrations, models

import blog.storage


class Migration(migrations.Migration):
    """No DB schema change -- `storage` isn't a column, just tells Django
    which Storage backend to read/write featured_image through (local disk
    or Cloudflare R2, see blog/storage.py). Needed so `makemigrations`
    doesn't flag this as a pending change after adding storage=... to the
    field in models.py."""

    dependencies = [
        ('blog', '0009_blogpost_pending_snapshot'),
    ]

    operations = [
        migrations.AlterField(
            model_name='blogpost',
            name='featured_image',
            field=models.ImageField(
                blank=True,
                null=True,
                storage=blog.storage.blog_media_storage,
                upload_to='blog/featured/',
            ),
        ),
    ]
