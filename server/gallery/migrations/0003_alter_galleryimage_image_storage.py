from django.db import migrations, models

import gallery.storage


class Migration(migrations.Migration):

    dependencies = [
        ('gallery', '0002_galleryimage_alt_text'),
    ]

    operations = [
        migrations.AlterField(
            model_name='galleryimage',
            name='image',
            field=models.ImageField(storage=gallery.storage.gallery_media_storage, upload_to='gallery/%Y/%m/'),
        ),
    ]
