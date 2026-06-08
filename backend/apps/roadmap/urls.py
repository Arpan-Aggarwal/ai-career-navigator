from django.urls import path
from .views import GenerateRoadmapView, ActiveRoadmapView, RoadmapListView, CompleteMilestoneView

urlpatterns = [
    path('generate/', GenerateRoadmapView.as_view(), name='roadmap-generate'),
    path('active/', ActiveRoadmapView.as_view(), name='roadmap-active'),
    path('', RoadmapListView.as_view(), name='roadmap-list'),
    path('milestones/<int:milestone_id>/complete/', CompleteMilestoneView.as_view(), name='milestone-complete'),
]
