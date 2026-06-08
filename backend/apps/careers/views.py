from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.db import transaction

from apps.assessment.models import AssessmentResult
from services.groq_service import generate_career_explanation
from .models import CareerRecommendation, CAREER_DEFINITIONS
from .serializers import CareerRecommendationSerializer, ReadinessScoreSerializer


def compute_match_score(career_def: dict, scores: dict, user_interests: list, user_skills: list) -> float:
    """Rule-based career match score computation."""
    aptitude_score = 0
    weights = career_def['score_weights']
    for score_key, weight in weights.items():
        aptitude_score += scores.get(score_key, 0) * weight

    # Interest bonus (up to 20 points)
    interest_matches = sum(1 for interest in user_interests if any(
        interest.lower() in match.lower() or match.lower() in interest.lower()
        for match in career_def['interest_match']
    ))
    interest_bonus = min(interest_matches * 5, 20)

    # Skills bonus (up to 15 points)
    required_skills_lower = [s.lower() for s in career_def['required_skills']]
    user_skills_lower = [s.lower() for s in user_skills]
    skill_matches = sum(1 for skill in user_skills_lower if any(
        skill in rs or rs in skill for rs in required_skills_lower
    ))
    skills_bonus = min(skill_matches * 3, 15)

    raw_score = aptitude_score + interest_bonus + skills_bonus
    return min(round(raw_score, 1), 100.0)


class RecommendCareersView(APIView):
    def get(self, request):
        # Get latest assessment
        try:
            assessment = AssessmentResult.objects.get(user=request.user, is_latest=True)
        except AssessmentResult.DoesNotExist:
            return Response(
                {'error': 'Please complete the assessment first.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check for existing latest recommendation
        existing = CareerRecommendation.objects.filter(user=request.user, is_latest=True).first()
        if existing and existing.assessment_id == assessment.id:
            return Response(CareerRecommendationSerializer(existing).data)

        # Get user profile data
        profile = getattr(request.user, 'profile', None)
        user_interests = profile.areas_of_interest if profile else []
        user_skills = profile.current_skills if profile else []

        scores = {
            'logical_reasoning': assessment.logical_reasoning_score,
            'programming_aptitude': assessment.programming_aptitude_score,
            'mathematical_thinking': assessment.mathematical_thinking_score,
            'problem_solving': assessment.problem_solving_score,
            'communication': assessment.communication_score,
            'creativity': assessment.creativity_score,
        }

        # Score all careers
        scored_careers = []
        for career_name, career_def in CAREER_DEFINITIONS.items():
            match_score = compute_match_score(career_def, scores, user_interests, user_skills)
            scored_careers.append({
                'career': career_name,
                'match_score': match_score,
                'icon': career_def['icon'],
                'description': career_def['description'],
                'avg_salary': career_def['avg_salary'],
                'job_market': career_def['job_market'],
                'required_skills': career_def['required_skills'],
            })

        scored_careers.sort(key=lambda x: x['match_score'], reverse=True)
        top_5 = scored_careers[:5]

        # Generate AI explanation for top career only (to keep it fast)
        top_career = top_5[0]['career']
        profile_dict = {}
        if profile:
            profile_dict = {
                'education': profile.education_level,
                'skills': profile.current_skills,
                'interests': profile.areas_of_interest,
                'goals': profile.career_goals,
            }

        explanation = generate_career_explanation(top_career, scores, profile_dict)
        top_5[0]['explanation'] = explanation

        with transaction.atomic():
            CareerRecommendation.objects.filter(user=request.user, is_latest=True).update(is_latest=False)
            rec = CareerRecommendation.objects.create(
                user=request.user,
                assessment=assessment,
                recommendations=top_5,
                top_career=top_career,
                is_latest=True,
            )

        return Response(CareerRecommendationSerializer(rec).data)


class ReadinessScoreView(APIView):
    def get(self, request):
        career = request.query_params.get('career')
        if not career:
            return Response({'error': 'career parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)

        career_def = CAREER_DEFINITIONS.get(career)
        if not career_def:
            return Response({'error': f'Unknown career: {career}'}, status=status.HTTP_404_NOT_FOUND)

        profile = getattr(request.user, 'profile', None)
        user_skills = profile.current_skills if profile else []
        user_skills_lower = [s.lower() for s in user_skills]
        required_skills = career_def['required_skills']
        required_lower = [s.lower() for s in required_skills]

        acquired = [s for s in required_skills if any(s.lower() in us or us in s.lower() for us in user_skills_lower)]
        missing = [s for s in required_skills if s not in acquired]

        # Base score from skills
        skill_score = (len(acquired) / len(required_skills)) * 60 if required_skills else 0

        # Add assessment score contribution
        try:
            assessment = AssessmentResult.objects.get(user=request.user, is_latest=True)
            aptitude_contribution = assessment.total_score * 0.40
        except AssessmentResult.DoesNotExist:
            aptitude_contribution = 0

        readiness_score = round(min(skill_score + aptitude_contribution, 100), 1)
        months_to_ready = max(0, round((100 - readiness_score) / 15, 1))

        return Response({
            'career': career,
            'readiness_score': readiness_score,
            'acquired_skills': acquired,
            'missing_skills': missing,
            'estimated_months': months_to_ready,
            'job_market': career_def['job_market'],
            'avg_salary': career_def['avg_salary'],
        })


class CareerListView(APIView):
    permission_classes = []

    def get(self, request):
        from rest_framework.permissions import AllowAny
        careers = [
            {
                'name': name,
                'icon': d['icon'],
                'description': d['description'],
                'avg_salary': d['avg_salary'],
                'job_market': d['job_market'],
                'required_skills': d['required_skills'][:4],
            }
            for name, d in CAREER_DEFINITIONS.items()
        ]
        return Response({'careers': careers})
