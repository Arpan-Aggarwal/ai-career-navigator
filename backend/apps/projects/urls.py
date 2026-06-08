from django.urls import path
from .views import ProjectRecommendationsView

urlpatterns = [
    path('recommendations/', ProjectRecommendationsView.as_view(), name='project-recommendations'),
]
