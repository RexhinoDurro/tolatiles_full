from django.db import models


class Category(models.Model):
    """Gallery category model."""

    CATEGORY_CHOICES = [
        ('backsplash', 'Backsplash'),
        ('patio', 'Patio'),
        ('shower', 'Shower'),
        ('flooring', 'Flooring'),
        ('fireplace', 'Fireplace'),
    ]

    name = models.CharField(max_length=50, choices=CATEGORY_CHOICES, unique=True)
    label = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.label


class GalleryImage(models.Model):
    """Gallery image model."""

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='images'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='gallery/%Y/%m/')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = 'Gallery Image'
        verbose_name_plural = 'Gallery Images'

    def __str__(self):
        return f"{self.title} ({self.category.name})"
