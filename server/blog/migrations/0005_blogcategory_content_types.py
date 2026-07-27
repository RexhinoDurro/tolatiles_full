from django.db import migrations, models
from django.utils.text import slugify


# Curated, closed category pools per content type — replaces the previously
# freeform category list that let every post (regardless of section) create
# and pick from the same unbounded set, fragmenting archive pages and
# diluting topical/SEO authority (see Marketing/Content & SEO System.md).
CATEGORY_SEED = {
    'blog': [
        'Bathroom Renovation',
        'Kitchen Renovation',
        'Custom Showers',
        'Floor Tiling',
        'Outdoor Living',
        'Fireplace & Living Spaces',
    ],
    'guide': [
        'Planning Guides',
        'Technical Guides',
        'Materials',
        'Waterproofing & Prep',
    ],
    'design_idea': [
        'Kitchen Design',
        'Bathroom Design',
        'Flooring Design',
        'Outdoor Design',
        'Color & Trends',
    ],
    'story': [
        'Bathroom Projects',
        'Kitchen Projects',
        'Whole-Home Projects',
        'Customer Reviews',
    ],
}

# Seeded in 0004_seed_city_categories; marked here as valid across all four
# content types since city relevance applies regardless of section.
SHARED_CITY_CATEGORIES = ['Jacksonville', 'St. Augustine']


def seed_predefined_categories(apps, schema_editor):
    BlogCategory = apps.get_model('blog', 'BlogCategory')

    for name in SHARED_CITY_CATEGORIES:
        BlogCategory.objects.filter(name=name).update(content_types=[])

    for content_type, names in CATEGORY_SEED.items():
        for name in names:
            category, _ = BlogCategory.objects.get_or_create(
                name=name,
                defaults={'slug': slugify(name)}
            )
            existing = set(category.content_types or [])
            if content_type not in existing:
                category.content_types = sorted(existing | {content_type})
                category.save(update_fields=['content_types'])


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0004_seed_city_categories'),
    ]

    operations = [
        migrations.AddField(
            model_name='blogcategory',
            name='content_types',
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='Which content type(s) this category can be applied to (blog/guide/design_idea/story). Empty list means it applies to all four — use that for cross-cutting tags like city names.'
            ),
        ),
        migrations.RunPython(seed_predefined_categories, noop_reverse),
    ]
