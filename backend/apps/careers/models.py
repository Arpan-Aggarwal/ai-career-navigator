from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

CAREER_DEFINITIONS = {
    "AI Engineer": {
        "icon": "🤖",
        "description": "Build and deploy AI/ML systems at scale.",
        "required_skills": ["Python", "Machine Learning", "Deep Learning", "TensorFlow/PyTorch", "MLOps", "Cloud Platforms"],
        "score_weights": {"programming_aptitude": 0.35, "mathematical_thinking": 0.30, "logical_reasoning": 0.20, "problem_solving": 0.15},
        "interest_match": ["AI", "Machine Learning", "Data Science", "Automation"],
        "avg_salary": "$120,000 - $180,000",
        "job_market": "Excellent",
    },
    "Machine Learning Engineer": {
        "icon": "🧠",
        "description": "Develop ML models and production ML infrastructure.",
        "required_skills": ["Python", "ML Algorithms", "Statistics", "Scikit-learn", "Feature Engineering", "Model Deployment"],
        "score_weights": {"mathematical_thinking": 0.35, "programming_aptitude": 0.30, "logical_reasoning": 0.20, "problem_solving": 0.15},
        "interest_match": ["Machine Learning", "Data Science", "Research", "AI"],
        "avg_salary": "$110,000 - $170,000",
        "job_market": "Excellent",
    },
    "Data Scientist": {
        "icon": "📊",
        "description": "Extract insights from data to drive business decisions.",
        "required_skills": ["Python/R", "Statistics", "SQL", "Data Visualization", "Machine Learning", "Storytelling"],
        "score_weights": {"mathematical_thinking": 0.30, "logical_reasoning": 0.25, "programming_aptitude": 0.25, "communication": 0.20},
        "interest_match": ["Data Analysis", "Statistics", "Research", "Business"],
        "avg_salary": "$95,000 - $150,000",
        "job_market": "Very Good",
    },
    "Backend Developer": {
        "icon": "⚙️",
        "description": "Build robust APIs, databases, and server-side systems.",
        "required_skills": ["Python/Node.js/Java", "REST APIs", "Databases", "System Design", "Docker", "Cloud"],
        "score_weights": {"programming_aptitude": 0.35, "logical_reasoning": 0.25, "problem_solving": 0.25, "mathematical_thinking": 0.15},
        "interest_match": ["Web Development", "System Design", "APIs", "Databases"],
        "avg_salary": "$85,000 - $140,000",
        "job_market": "Excellent",
    },
    "Full Stack Developer": {
        "icon": "🌐",
        "description": "Build end-to-end web applications from frontend to backend.",
        "required_skills": ["JavaScript/TypeScript", "React/Vue", "Node.js", "Databases", "REST APIs", "Deployment"],
        "score_weights": {"programming_aptitude": 0.30, "problem_solving": 0.25, "creativity": 0.25, "logical_reasoning": 0.20},
        "interest_match": ["Web Development", "UI/UX", "JavaScript", "Apps"],
        "avg_salary": "$90,000 - $145,000",
        "job_market": "Excellent",
    },
    "Cloud Engineer": {
        "icon": "☁️",
        "description": "Design and manage cloud infrastructure at scale.",
        "required_skills": ["AWS/GCP/Azure", "Infrastructure as Code", "Networking", "Security", "Docker", "Kubernetes"],
        "score_weights": {"logical_reasoning": 0.30, "problem_solving": 0.30, "programming_aptitude": 0.25, "mathematical_thinking": 0.15},
        "interest_match": ["Cloud Computing", "Infrastructure", "DevOps", "Systems"],
        "avg_salary": "$100,000 - $160,000",
        "job_market": "Excellent",
    },
    "DevOps Engineer": {
        "icon": "🔄",
        "description": "Bridge development and operations with automation and CI/CD.",
        "required_skills": ["Linux", "Docker", "Kubernetes", "CI/CD", "Scripting", "Monitoring"],
        "score_weights": {"problem_solving": 0.35, "logical_reasoning": 0.25, "programming_aptitude": 0.25, "communication": 0.15},
        "interest_match": ["Automation", "Infrastructure", "DevOps", "Systems"],
        "avg_salary": "$95,000 - $155,000",
        "job_market": "Very Good",
    },
    "Data Analyst": {
        "icon": "📈",
        "description": "Analyze data and create dashboards to support business decisions.",
        "required_skills": ["SQL", "Excel", "Python/R", "Data Visualization", "Statistics", "Business Intelligence"],
        "score_weights": {"mathematical_thinking": 0.30, "logical_reasoning": 0.30, "communication": 0.25, "programming_aptitude": 0.15},
        "interest_match": ["Data Analysis", "Business", "Reporting", "Statistics"],
        "avg_salary": "$65,000 - $100,000",
        "job_market": "Good",
    },
    "Cybersecurity Engineer": {
        "icon": "🔒",
        "description": "Protect systems and networks from threats and vulnerabilities.",
        "required_skills": ["Networking", "Linux", "Security Protocols", "Penetration Testing", "Cryptography", "Incident Response"],
        "score_weights": {"logical_reasoning": 0.35, "problem_solving": 0.30, "programming_aptitude": 0.20, "communication": 0.15},
        "interest_match": ["Security", "Networking", "Systems", "Ethical Hacking"],
        "avg_salary": "$100,000 - $160,000",
        "job_market": "Excellent",
    },
}


class CareerRecommendation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='career_recommendations')
    assessment = models.ForeignKey('assessment.AssessmentResult', on_delete=models.SET_NULL, null=True, related_name='recommendations')
    recommendations = models.JSONField(default=list)  # List of {career, match_score, explanation}
    top_career = models.CharField(max_length=200)
    generated_at = models.DateTimeField(auto_now_add=True)
    is_latest = models.BooleanField(default=True)

    class Meta:
        ordering = ['-generated_at']

    def __str__(self):
        return f"{self.user.email} - {self.top_career}"
