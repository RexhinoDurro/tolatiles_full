from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='FAQ',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question', models.CharField(max_length=500)),
                ('answer', models.TextField()),
                ('category', models.CharField(
                    choices=[
                        ('general', 'General Questions'),
                        ('services', 'Services & Installation'),
                        ('pricing', 'Pricing & Timeline'),
                        ('materials', 'Materials & Design'),
                        ('maintenance', 'Care & Maintenance'),
                    ],
                    default='general',
                    max_length=50,
                )),
                ('order', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'FAQ',
                'verbose_name_plural': 'FAQs',
                'ordering': ['category', 'order', 'created_at'],
            },
        ),
    ]
