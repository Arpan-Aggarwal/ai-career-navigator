from django.urls import path
from .views import RecommendCareersView, ReadinessScoreView, CareerListView

urlpatterns = [
    path('', CareerListView.as_view(), name='career-list'),
    path('recommend/', RecommendCareersView.as_view(), name='career-recommend'),
    path('readiness/', ReadinessScoreView.as_view(), name='readiness-score'),
]
