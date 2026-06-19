from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ProjectServiceType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slug', models.CharField(max_length=100, unique=True)),
                ('name', models.CharField(max_length=200)),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('draft', 'Draft'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('archived', 'Archived')], default='draft', max_length=20)),
                ('is_featured', models.BooleanField(default=False)),
                ('location', models.CharField(choices=[('florida', 'Florida'), ('jacksonville', 'Jacksonville'), ('st-augustine', 'St. Augustine')], max_length=20)),
                ('job_types', models.ManyToManyField(blank=True, to='projects.projectservicetype')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Phase',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='phases', to='projects.project')),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        migrations.CreateModel(
            name='ProjectMedia',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to='projects/media/')),
                ('media_type', models.CharField(choices=[('image', 'Image'), ('video', 'Video')], default='image', max_length=10)),
                ('order', models.PositiveIntegerField(default=0)),
                ('alt_text', models.CharField(blank=True, max_length=500)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('phase', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='media', to='projects.phase')),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        migrations.CreateModel(
            name='HomepageSlot',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('location', models.CharField(choices=[('florida', 'Florida'), ('jacksonville', 'Jacksonville'), ('st-augustine', 'St. Augustine')], max_length=20)),
                ('slot_type', models.CharField(choices=[('hero', 'Hero Section'), ('mid_slider', 'Mid-Page Slider'), ('bottom_grid', 'Bottom Grid')], max_length=20)),
                ('display_style', models.CharField(blank=True, choices=[('before_after_slider', 'Before/After Slider'), ('cinematic_video_header', 'Cinematic Video Header'), ('process_grid', 'Process Grid')], max_length=30)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('project', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='homepage_slots', to='projects.project')),
                ('before_media', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='before_slots', to='projects.projectmedia')),
                ('after_media', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='after_slots', to='projects.projectmedia')),
            ],
            options={
                'unique_together': {('location', 'slot_type')},
            },
        ),
        migrations.CreateModel(
            name='ServiceProjectPin',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('location', models.CharField(choices=[('florida', 'Florida'), ('jacksonville', 'Jacksonville'), ('st-augustine', 'St. Augustine')], max_length=20)),
                ('service_slug', models.CharField(choices=[('kitchen-backsplash', 'Kitchen Backsplash'), ('bathroom-tile', 'Bathroom Tile'), ('floor-tile', 'Floor Tiling'), ('patio-tile', 'Patio & Outdoor'), ('fireplace-tile', 'Fireplace Tile'), ('shower-tile', 'Shower Installation')], max_length=50)),
                ('order', models.PositiveIntegerField(default=0)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='service_pins', to='projects.project')),
            ],
            options={
                'ordering': ['order'],
                'unique_together': {('location', 'service_slug', 'project')},
            },
        ),
    ]
