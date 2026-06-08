from django.urls import path
from .views import QuestionsView, SubmitAssessmentView, AssessmentResultView, AssessmentHistoryView

urlpatterns = [
    path('questions/', QuestionsView.as_view(), name='assessment-questions'),
    path('submit/', SubmitAssessmentView.as_view(), name='assessment-submit'),
    path('result/', AssessmentResultView.as_view(), name='assessment-result'),
    path('history/', AssessmentHistoryView.as_view(), name='assessment-history'),
]
