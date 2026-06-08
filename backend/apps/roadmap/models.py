from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Roadmap(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='roadmaps')
    career = models.CharField(max_length=200)
    data = models.JSONField(default=dict)  # Full AI-generated roadmap
    total_duration_months = models.PositiveIntegerField(default=0)
    completion_percentage = models.FloatField(default=0.0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.career} roadmap"


class RoadmapMilestone(models.Model):
    roadmap = models.ForeignKey(Roadmap, on_delete=models.CASCADE, related_name='milestones')
    phase_number = models.PositiveIntegerField()
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['phase_number', 'order']

    def __str__(self):
        return f"Phase {self.phase_number}: {self.title}"
