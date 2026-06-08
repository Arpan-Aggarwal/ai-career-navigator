from rest_framework import serializers
from .models import AssessmentResult


class AssessmentSubmitSerializer(serializers.Serializer):
    answers = serializers.DictField(child=serializers.IntegerField())
    time_taken_seconds = serializers.IntegerField(min_value=0, required=False, default=0)


class AssessmentResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentResult
        fields = [
            'id', 'scores', 'total_score',
            'logical_reasoning_score', 'programming_aptitude_score',
            'mathematical_thinking_score', 'problem_solving_score',
            'communication_score', 'creativity_score',
            'time_taken_seconds', 'completed_at', 'is_latest',
        ]
        read_only_fields = fields
