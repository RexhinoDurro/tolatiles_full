from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quotes', '0007_customer_photos'),
    ]

    operations = [
        # 1. Add CustomJobType model
        migrations.CreateModel(
            name='CustomJobType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('slug', models.SlugField(max_length=100, unique=True)),
                ('order', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Job Type',
                'verbose_name_plural': 'Job Types',
                'ordering': ['order', 'name'],
            },
        ),
        # 2. Add CustomLeadSource model
        migrations.CreateModel(
            name='CustomLeadSource',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('slug', models.SlugField(max_length=100, unique=True)),
                ('order', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Lead Source',
                'verbose_name_plural': 'Lead Sources',
                'ordering': ['order', 'name'],
            },
        ),
        # 3. Alter stage field choices (remove invoice_sent/won/lost, add job_scheduled/job_completed/job_lost)
        migrations.AlterField(
            model_name='deal',
            name='stage',
            field=models.CharField(
                choices=[
                    ('new_deal', 'New Deal'),
                    ('estimate_scheduled', 'Estimate Scheduled'),
                    ('quote_sent', 'Quote Sent'),
                    ('job_scheduled', 'Job Scheduled'),
                    ('job_completed', 'Job Completed'),
                    ('job_lost', 'Job Lost'),
                ],
                default='new_deal',
                max_length=30,
            ),
        ),
        # 4. Migrate existing stage data
        migrations.RunSQL(
            sql="""
                UPDATE quotes_deal SET stage = 'job_scheduled' WHERE stage IN ('won', 'invoice_sent');
                UPDATE quotes_deal SET stage = 'job_lost' WHERE stage = 'lost';
            """,
            reverse_sql="""
                UPDATE quotes_deal SET stage = 'won' WHERE stage = 'job_scheduled';
                UPDATE quotes_deal SET stage = 'lost' WHERE stage = 'job_lost';
            """,
        ),
        # 5. Alter job_type field - remove choices constraint, increase length
        migrations.AlterField(
            model_name='deal',
            name='job_type',
            field=models.CharField(blank=True, max_length=100),
        ),
        # 6. Alter lead_source field - remove choices constraint, increase length
        migrations.AlterField(
            model_name='deal',
            name='lead_source',
            field=models.CharField(blank=True, max_length=100),
        ),
        # 7. Add reason field to Deal
        migrations.AddField(
            model_name='deal',
            name='reason',
            field=models.TextField(blank=True, help_text='Why was this deal won or lost'),
        ),
        # 8. Add is_reviewed field to Deal
        migrations.AddField(
            model_name='deal',
            name='is_reviewed',
            field=models.BooleanField(db_index=True, default=False),
        ),
        # 9. Add reviewed_at field to Deal
        migrations.AddField(
            model_name='deal',
            name='reviewed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        # 10. Seed initial job types
        migrations.RunPython(
            code=lambda apps, schema_editor: _seed_job_types(apps, schema_editor),
            reverse_code=migrations.RunPython.noop,
        ),
        # 11. Seed initial lead sources
        migrations.RunPython(
            code=lambda apps, schema_editor: _seed_lead_sources(apps, schema_editor),
            reverse_code=migrations.RunPython.noop,
        ),
    ]


def _seed_job_types(apps, schema_editor):
    CustomJobType = apps.get_model('quotes', 'CustomJobType')
    job_types = [
        ('Kitchen Backsplash', 'kitchen_backsplash', 0),
        ('Bathroom', 'bathroom', 1),
        ('Flooring', 'flooring', 2),
        ('Patio', 'patio', 3),
        ('Fireplace', 'fireplace', 4),
        ('Commercial', 'commercial', 5),
        ('Other', 'other', 6),
    ]
    for name, slug, order in job_types:
        CustomJobType.objects.get_or_create(slug=slug, defaults={'name': name, 'order': order})


def _seed_lead_sources(apps, schema_editor):
    CustomLeadSource = apps.get_model('quotes', 'CustomLeadSource')
    lead_sources = [
        ('Website', 'website', 0),
        ('Referral', 'referral', 1),
        ('Google Ads', 'google_ads', 2),
        ('Walk-in', 'walk_in', 3),
        ('Other', 'other', 4),
    ]
    for name, slug, order in lead_sources:
        CustomLeadSource.objects.get_or_create(slug=slug, defaults={'name': name, 'order': order})
