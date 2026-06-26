from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0002_seed_homepage_slots'),
    ]

    operations = [
        migrations.AddField(
            model_name='projectmedia',
            name='youtube_url',
            field=models.URLField(blank=True, default='', max_length=500),
        ),
        migrations.AlterField(
            model_name='projectmedia',
            name='file',
            field=models.FileField(blank=True, null=True, upload_to='projects/media/'),
        ),
        migrations.AlterField(
            model_name='projectmedia',
            name='media_type',
            field=models.CharField(
                choices=[('image', 'Image'), ('video', 'Video'), ('youtube', 'YouTube Video')],
                default='image',
                max_length=10,
            ),
        ),
    ]
