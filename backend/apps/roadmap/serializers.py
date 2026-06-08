from rest_framework import serializers
from .models import Roadmap, RoadmapMilestone


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadmapMilestone
        fields = ['id', 'phase_number', 'title', 'description', 'is_completed', 'completed_at', 'order']


class RoadmapSerializer(serializers.ModelSerializer):
    milestones = MilestoneSerializer(many=True, read_only=True)

    class Meta:
        model = Roadmap
        fields = ['id', 'career', 'data', 'total_duration_months', 'completion_percentage', 'is_active', 'created_at', 'updated_at', 'milestones']
        read_only_fields = fields
