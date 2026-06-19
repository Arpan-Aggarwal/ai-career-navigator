from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

CATEGORIES = [
    'logical_reasoning',
    'programming_aptitude',
    'mathematical_thinking',
    'problem_solving',
    'communication',
    'creativity',
]

class AssessmentResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assessments')
    answers = models.JSONField(default=dict)
    questions_used = models.JSONField(default=list)
    scores = models.JSONField(default=dict)
    total_score = models.FloatField(default=0.0)
    logical_reasoning_score = models.FloatField(default=0.0)
    programming_aptitude_score = models.FloatField(default=0.0)
    mathematical_thinking_score = models.FloatField(default=0.0)
    problem_solving_score = models.FloatField(default=0.0)
    communication_score = models.FloatField(default=0.0)
    creativity_score = models.FloatField(default=0.0)
    time_taken_seconds = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(auto_now_add=True)
    is_latest = models.BooleanField(default=True)

    class Meta:
        ordering = ['-completed_at']

    def __str__(self):
        return f"{self.user.email} - {self.total_score:.1f}% - {self.completed_at}"