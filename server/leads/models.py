from django.db import models


class ContactLead(models.Model):
    """Contact form submission model."""

    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('qualified', 'Qualified'),
        ('converted', 'Converted'),
        ('closed', 'Closed'),
    ]

    PROJECT_TYPE_CHOICES = [
        ('kitchen-backsplash', 'Kitchen Backsplash'),
        ('bathroom', 'Bathroom Tiles'),
        ('flooring', 'Flooring'),
        ('patio', 'Patio/Outdoor'),
        ('fireplace', 'Fireplace'),
        ('commercial', 'Commercial Project'),
        ('other', 'Other'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    project_type = models.CharField(max_length=50, choices=PROJECT_TYPE_CHOICES)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    notes = models.TextField(blank=True, help_text='Internal notes about this lead')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Contact Lead'
        verbose_name_plural = 'Contact Leads'

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.project_type}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
