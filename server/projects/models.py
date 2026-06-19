import os
from django.db import models


LOCATION_CHOICES = [
    ('florida', 'Florida'),
    ('jacksonville', 'Jacksonville'),
    ('st-augustine', 'St. Augustine'),
]

STATUS_CHOICES = [
    ('draft', 'Draft'),
    ('in_progress', 'In Progress'),
    ('completed', 'Completed'),
    ('archived', 'Archived'),
]

SERVICE_TYPE_CHOICES = [
    ('kitchen-backsplash', 'Kitchen Backsplash'),
    ('bathroom-tile', 'Bathroom Tile'),
    ('floor-tile', 'Floor Tiling'),
    ('patio-tile', 'Patio & Outdoor'),
    ('fireplace-tile', 'Fireplace Tile'),
    ('shower-tile', 'Shower Installation'),
]

SLOT_TYPES = [
    ('hero', 'Hero Section'),
    ('mid_slider', 'Mid-Page Slider'),
    ('bottom_grid', 'Bottom Grid'),
]

DISPLAY_STYLES = [
    ('before_after_slider', 'Before/After Slider'),
    ('cinematic_video_header', 'Cinematic Video Header'),
    ('process_grid', 'Process Grid'),
]

VIDEO_EXTENSIONS = {'.mp4', '.mov', '.webm', '.avi', '.mkv'}


class ProjectServiceType(models.Model):
    slug = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    location = models.CharField(max_length=20, choices=LOCATION_CHOICES)
    job_types = models.ManyToManyField(ProjectServiceType, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Phase(models.Model):
    project = models.ForeignKey(Project, related_name='phases', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.project.title} - {self.title}"


class ProjectMedia(models.Model):
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]

    phase = models.ForeignKey(Phase, related_name='media', on_delete=models.CASCADE)
    file = models.FileField(upload_to='projects/media/')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES, default='image')
    order = models.PositiveIntegerField(default=0)
    alt_text = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.phase} - {self.media_type} #{self.order}"

    def save(self, *args, **kwargs):
        if self.file:
            ext = os.path.splitext(str(self.file.name))[1].lower()
            self.media_type = 'video' if ext in VIDEO_EXTENSIONS else 'image'
        super().save(*args, **kwargs)


class HomepageSlot(models.Model):
    location = models.CharField(max_length=20, choices=LOCATION_CHOICES)
    slot_type = models.CharField(max_length=20, choices=SLOT_TYPES)
    project = models.ForeignKey(
        Project, null=True, blank=True, on_delete=models.SET_NULL, related_name='homepage_slots'
    )
    display_style = models.CharField(max_length=30, choices=DISPLAY_STYLES, blank=True)
    before_media = models.ForeignKey(
        ProjectMedia, null=True, blank=True, on_delete=models.SET_NULL, related_name='before_slots'
    )
    after_media = models.ForeignKey(
        ProjectMedia, null=True, blank=True, on_delete=models.SET_NULL, related_name='after_slots'
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [('location', 'slot_type')]

    def __str__(self):
        return f"{self.get_location_display()} - {self.get_slot_type_display()}"


class ServiceProjectPin(models.Model):
    location = models.CharField(max_length=20, choices=LOCATION_CHOICES)
    service_slug = models.CharField(max_length=50, choices=SERVICE_TYPE_CHOICES)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='service_pins')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = [('location', 'service_slug', 'project')]
        ordering = ['order']

    def __str__(self):
        return f"{self.location} / {self.service_slug} - {self.project.title}"
