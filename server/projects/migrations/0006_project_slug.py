from django.db import migrations, models
from django.utils.text import slugify


def backfill_slugs(apps, schema_editor):
    Project = apps.get_model('projects', 'Project')
    for project in Project.objects.all().order_by('created_at'):
        base_slug = slugify(project.title) or 'project'
        slug = base_slug
        counter = 2
        while Project.objects.exclude(pk=project.pk).filter(slug=slug).exists():
            slug = f'{base_slug}-{counter}'
            counter += 1
        project.slug = slug
        project.save(update_fields=['slug'])


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0005_project_work_status_alter_project_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='slug',
            field=models.SlugField(blank=True, max_length=220, null=True, unique=True),
        ),
        migrations.RunPython(backfill_slugs, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='project',
            name='slug',
            field=models.SlugField(blank=True, max_length=220, unique=True),
        ),
    ]
