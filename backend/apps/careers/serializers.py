from rest_framework import serializers
from .models import CareerRecommendation


class CareerRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerRecommendation
        fields = ['id', 'recommendations', 'top_career', 'generated_at', 'is_latest']
        read_only_fields = fields


class ReadinessScoreSerializer(serializers.Serializer):
    career = serializers.CharField()
    readiness_score = serializers.FloatField()
    acquired_skills = serializers.ListField(child=serializers.CharField())
    missing_skills = serializers.ListField(child=serializers.CharField())
    estimated_months = serializers.FloatField()
    job_market = serializers.CharField()
    avg_salary = serializers.CharField()
