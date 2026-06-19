from django.db import migrations


LOCATIONS = ['florida', 'jacksonville', 'st-augustine']
SLOT_TYPES = ['hero', 'mid_slider', 'bottom_grid']


def create_homepage_slots(apps, schema_editor):
    HomepageSlot = apps.get_model('projects', 'HomepageSlot')
    for location in LOCATIONS:
        for slot_type in SLOT_TYPES:
            HomepageSlot.objects.get_or_create(location=location, slot_type=slot_type)


def delete_homepage_slots(apps, schema_editor):
    HomepageSlot = apps.get_model('projects', 'HomepageSlot')
    HomepageSlot.objects.all().delete()


def seed_service_types(apps, schema_editor):
    ProjectServiceType = apps.get_model('projects', 'ProjectServiceType')
    service_types = [
        ('kitchen-backsplash', 'Kitchen Backsplash'),
        ('bathroom-tile', 'Bathroom Tile'),
        ('floor-tile', 'Floor Tiling'),
        ('patio-tile', 'Patio & Outdoor'),
        ('fireplace-tile', 'Fireplace Tile'),
        ('shower-tile', 'Shower Installation'),
    ]
    for slug, name in service_types:
        ProjectServiceType.objects.get_or_create(slug=slug, defaults={'name': name})


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_homepage_slots, delete_homepage_slots),
        migrations.RunPython(seed_service_types, migrations.RunPython.noop),
    ]
