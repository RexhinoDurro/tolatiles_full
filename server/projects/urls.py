from django.urls import path
from .views import (
    ProjectViewSet,
    PublicProjectsView,
    PublicProjectDetailView,
    PublicServiceProjectsView,
)

project_list = ProjectViewSet.as_view({'get': 'list', 'post': 'create'})
project_detail = ProjectViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})
project_main_video = ProjectViewSet.as_view({'post': 'main_video', 'delete': 'main_video'})
project_phases = ProjectViewSet.as_view({'get': 'phases', 'post': 'phases'})
project_phase_detail = ProjectViewSet.as_view({'put': 'phase_detail', 'delete': 'phase_detail'})
project_phases_reorder = ProjectViewSet.as_view({'post': 'phases_reorder'})
project_phase_media = ProjectViewSet.as_view({'get': 'phase_media', 'post': 'phase_media'})
project_phase_media_delete = ProjectViewSet.as_view({'delete': 'phase_media_delete'})
project_phase_media_reorder = ProjectViewSet.as_view({'post': 'phase_media_reorder'})

urlpatterns = [
    # Project CRUD
    path('', project_list, name='project-list'),
    path('<int:pk>/', project_detail, name='project-detail'),

    # Main video
    path('<int:pk>/main-video/', project_main_video, name='project-main-video'),

    # Phases
    path('<int:pk>/phases/', project_phases, name='project-phases'),
    path('<int:pk>/phases/reorder/', project_phases_reorder, name='project-phases-reorder'),
    path('<int:pk>/phases/<int:phase_id>/', project_phase_detail, name='project-phase-detail'),

    # Media
    path('<int:pk>/phases/<int:phase_id>/media/', project_phase_media, name='project-phase-media'),
    path('<int:pk>/phases/<int:phase_id>/media/reorder/', project_phase_media_reorder, name='project-phase-media-reorder'),
    path('<int:pk>/phases/<int:phase_id>/media/<int:media_id>/', project_phase_media_delete, name='project-phase-media-delete'),

    # Public endpoints
    path('public/', PublicProjectsView.as_view(), name='public-projects'),
    path('public/<int:pk>/', PublicProjectDetailView.as_view(), name='public-project-detail'),
    path('public/service/<str:service_slug>/', PublicServiceProjectsView.as_view(), name='public-service-projects'),
]
