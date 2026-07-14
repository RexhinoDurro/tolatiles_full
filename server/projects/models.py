import os
import re
from django.db import models
from django.utils.text import slugify


STATUS_CHOICES = [
    ('draft', 'Draft'),
    ('published', 'Published'),
]

WORK_STATUS_CHOICES = [
    ('started', 'Started'),
    ('in_progress', 'In Progress'),
    ('completed', 'Completed'),
]

VIDEO_EXTENSIONS = {'.mp4', '.mov', '.webm', '.avi', '.mkv'}

YOUTUBE_PATTERNS = [
    r'(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]{11})',
    r'youtube\.com/embed/([a-zA-Z0-9_-]{11})',
]


def extract_youtube_id(url):
    if not url:
        return None
    for pattern in YOUTUBE_PATTERNS:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


class ProjectServiceType(models.Model):
    slug = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Project(models.Model):
    MAIN_VIDEO_TYPE_CHOICES = [
        ('none', 'None'),
        ('video', 'Uploaded Video'),
        ('youtube', 'YouTube Video'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    work_status = models.CharField(max_length=20, choices=WORK_STATUS_CHOICES, default='started')
    is_featured = models.BooleanField(default=False)
    job_types = models.ManyToManyField(ProjectServiceType, blank=True)
    main_video = models.FileField(upload_to='projects/main_videos/', null=True, blank=True)
    main_video_url = models.URLField(max_length=500, blank=True, default='')
    main_video_type = models.CharField(max_length=10, choices=MAIN_VIDEO_TYPE_CHOICES, default='none')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._generate_unique_slug()
        if self.main_video_url:
            self.main_video_type = 'youtube'
        elif self.main_video:
            self.main_video_type = 'video'
        else:
            self.main_video_type = 'none'
        super().save(*args, **kwargs)

    def _generate_unique_slug(self):
        base_slug = slugify(self.title) or 'project'
        slug = base_slug
        counter = 2
        while Project.objects.exclude(pk=self.pk).filter(slug=slug).exists():
            slug = f'{base_slug}-{counter}'
            counter += 1
        return slug

    @property
    def main_video_embed_url(self):
        vid = extract_youtube_id(self.main_video_url)
        return f'https://www.youtube.com/embed/{vid}' if vid else None

    @property
    def main_video_thumbnail(self):
        vid = extract_youtube_id(self.main_video_url)
        return f'https://img.youtube.com/vi/{vid}/maxresdefault.jpg' if vid else None


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
        ('youtube', 'YouTube Video'),
    ]

    phase = models.ForeignKey(Phase, related_name='media', on_delete=models.CASCADE)
    file = models.FileField(upload_to='projects/media/', null=True, blank=True)
    youtube_url = models.URLField(max_length=500, blank=True, default='')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES, default='image')
    order = models.PositiveIntegerField(default=0)
    alt_text = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.phase} - {self.media_type} #{self.order}"

    def save(self, *args, **kwargs):
        if self.youtube_url:
            self.media_type = 'youtube'
        elif self.file:
            ext = os.path.splitext(str(self.file.name))[1].lower()
            self.media_type = 'video' if ext in VIDEO_EXTENSIONS else 'image'
        super().save(*args, **kwargs)

    @property
    def youtube_video_id(self):
        return extract_youtube_id(self.youtube_url)

    @property
    def youtube_embed_url(self):
        vid = extract_youtube_id(self.youtube_url)
        return f'https://www.youtube.com/embed/{vid}' if vid else None

    @property
    def youtube_thumbnail(self):
        vid = extract_youtube_id(self.youtube_url)
        return f'https://img.youtube.com/vi/{vid}/maxresdefault.jpg' if vid else None
