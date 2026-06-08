import json
import time
import logging
from typing import Optional
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


def _call_groq(messages: list, model: str, max_tokens: int = 2048, temperature: float = 0.7) -> Optional[str]:
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }
    try:
        resp = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        logger.error(f"Groq API error with model {model}: {e}")
        return None


def call_groq_with_fallback(messages: list, max_tokens: int = 2048, temperature: float = 0.7) -> Optional[str]:
    """Try primary model, fall back to secondary."""
    result = _call_groq(messages, settings.GROQ_PRIMARY_MODEL, max_tokens, temperature)
    if result:
        return result
    logger.warning("Primary model failed. Trying fallback model.")
    time.sleep(1)
    return _call_groq(messages, settings.GROQ_FALLBACK_MODEL, max_tokens, temperature)


def parse_json_response(text: str) -> Optional[dict]:
    """Extract and parse JSON from model response."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to extract JSON from markdown code blocks
        import re
        match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        logger.error(f"Failed to parse JSON from response: {text[:200]}")
        return None


def generate_career_explanation(career: str, scores: dict, profile: dict) -> str:
    """Generate personalized career explanation."""
    messages = [
        {
            "role": "system",
            "content": "You are an expert career counselor. Generate concise, encouraging, personalized career explanations. Be specific and actionable."
        },
        {
            "role": "user",
            "content": f"""
Generate a 2-3 paragraph personalized explanation for why this person is a good match for {career}.

Assessment Scores:
{json.dumps(scores, indent=2)}

User Profile:
{json.dumps(profile, indent=2)}

Be specific about their strengths based on scores, mention their existing skills, and give actionable next steps.
Keep it motivating and professional.
"""
        }
    ]
    result = call_groq_with_fallback(messages, max_tokens=500)
    return result or f"Based on your assessment results, {career} is an excellent career choice that aligns with your strengths and interests."


def generate_roadmap(career: str, scores: dict, profile: dict, assessment_id: int) -> Optional[dict]:
    """Generate a personalized learning roadmap."""
    messages = [
        {
            "role": "system",
            "content": """You are an expert career coach and curriculum designer. Generate detailed, personalized learning roadmaps.
Always respond with valid JSON only. No markdown, no explanations outside the JSON."""
        },
        {
            "role": "user",
            "content": f"""
Generate a comprehensive 5-phase learning roadmap for becoming a {career}.

Assessment Scores: {json.dumps(scores)}
User Profile: {json.dumps(profile)}

Return ONLY this JSON structure:
{{
  "career": "{career}",
  "total_duration_months": <number>,
  "phases": [
    {{
      "phase_number": 1,
      "title": "Phase title",
      "duration_weeks": <number>,
      "description": "Brief description",
      "topics": [
        {{
          "name": "Topic name",
          "description": "What to learn",
          "resources": ["resource1", "resource2"],
          "estimated_hours": <number>
        }}
      ],
      "projects": ["Project idea 1", "Project idea 2"],
      "certifications": ["Cert name"],
      "milestones": ["Milestone 1", "Milestone 2"]
    }}
  ],
  "key_skills": ["skill1", "skill2"],
  "tools": ["tool1", "tool2"],
  "job_titles": ["title1", "title2"]
}}

Tailor it based on the user's existing skills and assessment scores. Make phase durations realistic."""
        }
    ]

    raw = call_groq_with_fallback(messages, max_tokens=3000, temperature=0.5)
    if not raw:
        return None
    return parse_json_response(raw)


def generate_skill_gap_analysis(career: str, current_skills: list, scores: dict) -> Optional[dict]:
    """Generate skill gap analysis."""
    messages = [
        {
            "role": "system",
            "content": "You are a skills analyst. Return only valid JSON."
        },
        {
            "role": "user",
            "content": f"""
Analyze the skill gap for someone wanting to become a {career}.

Current Skills: {json.dumps(current_skills)}
Assessment Scores: {json.dumps(scores)}

Return ONLY this JSON:
{{
  "acquired_skills": ["skill1"],
  "missing_critical_skills": ["skill1", "skill2"],
  "missing_nice_to_have": ["skill1"],
  "readiness_score": <0-100>,
  "estimated_months_to_ready": <number>,
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"],
  "immediate_actions": ["action1", "action2"]
}}"""
        }
    ]
    raw = call_groq_with_fallback(messages, max_tokens=1000, temperature=0.3)
    if not raw:
        return None
    return parse_json_response(raw)


def generate_project_recommendations(career: str, skills: list, roadmap_phase: int = 1) -> Optional[dict]:
    """Generate project recommendations."""
    messages = [
        {
            "role": "system",
            "content": "You are a project mentor for developers. Return only valid JSON."
        },
        {
            "role": "user",
            "content": f"""
Recommend 6 projects for someone learning {career} at phase {roadmap_phase}/5 of their learning journey.
Current skills: {json.dumps(skills)}

Return ONLY:
{{
  "projects": [
    {{
      "title": "Project title",
      "level": "beginner|intermediate|advanced",
      "description": "What the project does",
      "skills_required": ["skill1"],
      "skills_gained": ["skill1"],
      "estimated_days": <number>,
      "learning_outcomes": ["outcome1"],
      "tech_stack": ["tech1"]
    }}
  ]
}}"""
        }
    ]
    raw = call_groq_with_fallback(messages, max_tokens=1500, temperature=0.6)
    if not raw:
        return None
    return parse_json_response(raw)
