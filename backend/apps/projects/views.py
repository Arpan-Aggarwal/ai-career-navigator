from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.roadmap.models import Roadmap
from services.groq_service import generate_project_recommendations


class ProjectRecommendationsView(APIView):
    def get(self, request):
        career = request.query_params.get('career', '')
        phase = int(request.query_params.get('phase', 1))

        profile = getattr(request.user, 'profile', None)
        skills = profile.current_skills if profile else []

        # If no career specified, use active roadmap's career
        if not career:
            roadmap = Roadmap.objects.filter(user=request.user, is_active=True).first()
            if roadmap:
                career = roadmap.career
                phase = max(1, int(roadmap.completion_percentage / 20))

        if not career:
            return Response({'error': 'career parameter or active roadmap required.'}, status=status.HTTP_400_BAD_REQUEST)

        data = generate_project_recommendations(career, skills, phase)

        if not data:
            data = _fallback_projects(career)

        return Response(data)


def _fallback_projects(career: str) -> dict:
    return {
        "projects": [
            {
                "title": f"{career} Portfolio Site",
                "level": "beginner",
                "description": "Build a personal portfolio showcasing your work.",
                "skills_required": ["HTML", "CSS", "JavaScript"],
                "skills_gained": ["Web Development", "Deployment"],
                "estimated_days": 3,
                "learning_outcomes": ["Build a deployed website"],
                "tech_stack": ["HTML", "CSS", "JavaScript"]
            },
            {
                "title": "CRUD Application",
                "level": "beginner",
                "description": "Build a full CRUD application with a database.",
                "skills_required": ["Python", "SQL"],
                "skills_gained": ["Backend Development", "Database Design"],
                "estimated_days": 7,
                "learning_outcomes": ["REST API design", "Database CRUD operations"],
                "tech_stack": ["Python", "Django", "SQLite"]
            },
            {
                "title": f"{career} Dashboard",
                "level": "intermediate",
                "description": "Build an analytics dashboard with real data.",
                "skills_required": ["Python", "React"],
                "skills_gained": ["Data Visualization", "Frontend Development"],
                "estimated_days": 14,
                "learning_outcomes": ["Chart libraries", "API integration"],
                "tech_stack": ["React", "Python", "Recharts"]
            },
            {
                "title": "AI-Powered Feature",
                "level": "intermediate",
                "description": "Integrate AI into an existing application.",
                "skills_required": ["Python", "APIs"],
                "skills_gained": ["AI Integration", "API Development"],
                "estimated_days": 10,
                "learning_outcomes": ["LLM integration", "Prompt engineering"],
                "tech_stack": ["Python", "OpenAI API", "FastAPI"]
            },
            {
                "title": "Open Source Contribution",
                "level": "advanced",
                "description": "Contribute to a popular open source project in your domain.",
                "skills_required": ["Git", "Domain Knowledge"],
                "skills_gained": ["Collaboration", "Code Review", "Documentation"],
                "estimated_days": 21,
                "learning_outcomes": ["Real-world codebase navigation", "PR workflow"],
                "tech_stack": ["Git", "GitHub"]
            },
            {
                "title": f"Capstone: {career} System",
                "level": "advanced",
                "description": "Build a production-ready system demonstrating all your skills.",
                "skills_required": ["Full Stack", "Deployment"],
                "skills_gained": ["System Design", "Production Deployment"],
                "estimated_days": 30,
                "learning_outcomes": ["End-to-end system design", "Cloud deployment"],
                "tech_stack": ["Full Stack", "Docker", "Cloud"]
            },
        ]
    }
