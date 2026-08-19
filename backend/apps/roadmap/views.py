from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.db import transaction
from django.utils import timezone

from apps.assessment.models import AssessmentResult
from services.groq_service import generate_roadmap
from .models import Roadmap, RoadmapMilestone
from .serializers import RoadmapSerializer, MilestoneSerializer


class GenerateRoadmapView(APIView):
    def post(self, request):
        career = request.data.get('career')
        duration_months = request.data.get('duration_months')

        if duration_months is not None:
            try:
                duration_months = int(duration_months)
                if duration_months < 1 or duration_months > 24:
                    return Response(
                        {'error': 'duration_months must be between 1 and 24.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except (ValueError, TypeError):
                return Response(
                    {'error': 'duration_months must be a number.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        if not career:
            return Response({'error': 'career is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get assessment scores
        try:
            assessment = AssessmentResult.objects.get(user=request.user, is_latest=True)
        except AssessmentResult.DoesNotExist:
            return Response({'error': 'Please complete the assessment first.'}, status=status.HTTP_400_BAD_REQUEST)

        profile = getattr(request.user, 'profile', None)
        scores = {
            'logical_reasoning': assessment.logical_reasoning_score,
            'programming_aptitude': assessment.programming_aptitude_score,
            'mathematical_thinking': assessment.mathematical_thinking_score,
            'problem_solving': assessment.problem_solving_score,
            'communication': assessment.communication_score,
            'creativity': assessment.creativity_score,
            'total': assessment.total_score,
        }
        profile_dict = {}
        if profile:
            profile_dict = {
                'education': profile.education_level,
                'skills': profile.current_skills,
                'interests': profile.areas_of_interest,
                'goals': profile.career_goals,
            }

        roadmap_data = generate_roadmap(
    career=career,
    scores=scores,
    profile=profile_dict,
    assessment_id=assessment.id,
    duration_months=duration_months,
)

        if not roadmap_data:
            roadmap_data = _get_fallback_roadmap(career, duration_months or 6)

        with transaction.atomic():
            # Deactivate old roadmaps
            Roadmap.objects.filter(user=request.user, is_active=True).update(is_active=False)

            roadmap = Roadmap.objects.create(
                user=request.user,
                career=career,
                data=roadmap_data,
                total_duration_months=roadmap_data.get('total_duration_months', 6),
                is_active=True,
            )

            # Create milestones from phases
            for phase in roadmap_data.get('phases', []):
                for i, milestone in enumerate(phase.get('milestones', [])):
                    RoadmapMilestone.objects.create(
                        roadmap=roadmap,
                        phase_number=phase['phase_number'],
                        title=milestone,
                        order=i,
                    )

        return Response(RoadmapSerializer(roadmap).data, status=status.HTTP_201_CREATED)


class ActiveRoadmapView(generics.RetrieveAPIView):
    serializer_class = RoadmapSerializer

    def get_object(self):
        roadmap = Roadmap.objects.filter(user=self.request.user, is_active=True).first()
        if not roadmap:
            from rest_framework.exceptions import NotFound
            raise NotFound('No active roadmap found.')
        return roadmap


class RoadmapListView(generics.ListAPIView):
    serializer_class = RoadmapSerializer

    def get_queryset(self):
        return Roadmap.objects.filter(user=self.request.user)


class CompleteMilestoneView(APIView):
    def post(self, request, milestone_id):
        try:
            milestone = RoadmapMilestone.objects.get(
                id=milestone_id,
                roadmap__user=request.user
            )
        except RoadmapMilestone.DoesNotExist:
            return Response({'error': 'Milestone not found.'}, status=status.HTTP_404_NOT_FOUND)

        milestone.is_completed = not milestone.is_completed
        milestone.completed_at = timezone.now() if milestone.is_completed else None
        milestone.save()

        # Recalculate completion
        roadmap = milestone.roadmap
        total = roadmap.milestones.count()
        completed = roadmap.milestones.filter(is_completed=True).count()
        roadmap.completion_percentage = (completed / total * 100) if total else 0
        roadmap.save()

        return Response({
            'milestone': MilestoneSerializer(milestone).data,
            'completion_percentage': roadmap.completion_percentage,
        })


def _get_fallback_roadmap(career: str, duration_months: int = 6) -> dict:
    total_weeks = duration_months * 4
    # Distribute weeks across 5 phases proportionally (same ratio as before)
    ratios = [6, 8, 8, 4, 4]  # original week ratios
    ratio_total = sum(ratios)
    phase_weeks = [max(1, round((r / ratio_total) * total_weeks)) for r in ratios]
    # Fix rounding drift so weeks add up exactly
    diff = total_weeks - sum(phase_weeks)
    phase_weeks[-1] = max(1, phase_weeks[-1] + diff)

    return {
        "career": career,
        "total_duration_months": duration_months,
        "phases": [
            {
                "phase_number": 1,
                "title": "Fundamentals",
                "duration_weeks": phase_weeks[0],
                "description": "Build the foundational knowledge required.",
                "topics": [
                    {"name": "Core Concepts", "description": "Learn the basics.", "resources": ["Official Docs", "YouTube"], "estimated_hours": phase_weeks[0] * 10}
                ],
                "projects": ["Build a basic project"],
                "certifications": [],
                "milestones": ["Complete fundamentals", "Build first project"]
            },
            {
                "phase_number": 2,
                "title": "Intermediate Skills",
                "duration_weeks": phase_weeks[1],
                "description": "Deepen your knowledge with hands-on practice.",
                "topics": [{"name": "Intermediate Topics", "description": "Expand skills.", "resources": ["Udemy", "Coursera"], "estimated_hours": phase_weeks[1] * 10}],
                "projects": ["Build an intermediate project"],
                "certifications": ["Relevant certification"],
                "milestones": ["Complete intermediate level", "Get certification"]
            },
            {
                "phase_number": 3,
                "title": "Advanced Skills",
                "duration_weeks": phase_weeks[2],
                "description": "Master advanced concepts and industry tools.",
                "topics": [{"name": "Advanced Topics", "description": "Master the domain.", "resources": ["Research papers", "GitHub"], "estimated_hours": phase_weeks[2] * 10}],
                "projects": ["Build a full-scale project"],
                "certifications": [],
                "milestones": ["Complete advanced topics", "Build portfolio project"]
            },
            {
                "phase_number": 4,
                "title": "Interview Preparation",
                "duration_weeks": phase_weeks[3],
                "description": "Prepare for technical interviews and DSA.",
                "topics": [{"name": "DSA & System Design", "description": "Practice coding problems.", "resources": ["LeetCode", "HackerRank"], "estimated_hours": phase_weeks[3] * 10}],
                "projects": [],
                "certifications": [],
                "milestones": ["Solve 100 LeetCode problems", "Complete 5 mock interviews"]
            },
            {
                "phase_number": 5,
                "title": "Job Readiness",
                "duration_weeks": phase_weeks[4],
                "description": "Polish your portfolio and start applying.",
                "topics": [{"name": "Portfolio & Resume", "description": "Finalize your application materials.", "resources": ["Resume templates", "LinkedIn"], "estimated_hours": phase_weeks[4] * 10}],
                "projects": ["Final capstone project"],
                "certifications": [],
                "milestones": ["Complete portfolio", "Apply to 10 companies"]
            },
        ],
        "key_skills": ["Core Skills", "Problem Solving"],
        "tools": ["VS Code", "Git", "GitHub"],
        "job_titles": [career, "Senior " + career]
    }
