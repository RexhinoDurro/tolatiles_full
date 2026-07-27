from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0005_blogcategory_content_types'),
    ]

    operations = [
        migrations.AddField(
            model_name='blogpost',
            name='media_plan',
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='Image/video placeholders: [{"id", "type", "placement_hint", "prompt", "alt_text", "status", "resolved_source", "resolved_url", "candidates"}]. status is "unresolved" | "resolved" | "skipped".'
            ),
        ),
        migrations.AddField(
            model_name='blogpost',
            name='suggested_links',
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='Auto-suggested internal cross-links to other posts (not external citations): [{"id", "anchor_text_hint", "target_slug", "target_title", "score", "status"}]. status is "suggested" | "accepted" | "rejected".'
            ),
        ),
    ]
