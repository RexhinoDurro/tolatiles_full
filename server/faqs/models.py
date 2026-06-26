from django.db import models


class FAQ(models.Model):
    CATEGORY_CHOICES = [
        ('general', 'General Questions'),
        ('services', 'Services & Installation'),
        ('pricing', 'Pricing & Timeline'),
        ('materials', 'Materials & Design'),
        ('maintenance', 'Care & Maintenance'),
    ]

    question = models.CharField(max_length=500)
    answer = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'order', 'created_at']
        verbose_name = 'FAQ'
        verbose_name_plural = 'FAQs'

    def __str__(self):
        return self.question
