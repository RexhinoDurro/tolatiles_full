from django.db import migrations
from django.utils.text import slugify

CITY_CATEGORIES = ['Jacksonville', 'St. Augustine']


def seed_city_categories(apps, schema_editor):
    BlogCategory = apps.get_model('blog', 'BlogCategory')
    for name in CITY_CATEGORIES:
        BlogCategory.objects.get_or_create(name=name, defaults={'slug': slugify(name)})


def unseed_city_categories(apps, schema_editor):
    BlogCategory = apps.get_model('blog', 'BlogCategory')
    BlogCategory.objects.filter(name__in=CITY_CATEGORIES).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0003_add_content_type_and_related_fields'),
    ]

    operations = [
        migrations.RunPython(seed_city_categories, unseed_city_categories),
    ]
