from django.contrib import admin
from .models import Project, Phase, ProjectMedia, ProjectServiceType


class PhaseInline(admin.TabularInline):
    model = Phase
    extra = 0
    ordering = ['order']


class ProjectMediaInline(admin.TabularInline):
    model = ProjectMedia
    extra = 0
    ordering = ['order']


@admin.register(ProjectServiceType)
class ProjectServiceTypeAdmin(admin.ModelAdmin):
    list_display = ['slug', 'name']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'work_status', 'is_featured', 'created_at']
    list_filter = ['status', 'work_status', 'is_featured']
    search_fields = ['title', 'description']
    inlines = [PhaseInline]
    filter_horizontal = ['job_types']


@admin.register(Phase)
class PhaseAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'order']
    inlines = [ProjectMediaInline]
