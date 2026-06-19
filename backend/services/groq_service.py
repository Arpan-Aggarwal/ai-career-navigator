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


def generate_roadmap(career: str, scores: dict, profile: dict, assessment_id: int, duration_months: int = None) -> Optional[dict]:
    """Generate a personalized learning roadmap with optional custom duration."""

    target = duration_months or 6

    messages = [
        {
            "role": "system",
            "content": """You are an expert career coach and curriculum designer. Generate detailed, personalized learning roadmaps.
Always respond with valid JSON only. No markdown, no explanations outside the JSON."""
        },
        {
            "role": "user",
            "content": f"""
Generate a 5-phase learning roadmap for becoming a {career}.

Assessment Scores: {json.dumps(scores)}
User Profile: {json.dumps(profile)}

STRICT REQUIREMENT: This roadmap MUST be exactly {target} months long.
- total_duration_months MUST be {target}
- All 5 phase duration_weeks values MUST add up to exactly {target * 4} weeks
- Each phase gets roughly {round((target * 4) / 5)} weeks
- Adjust topic depth to fit: short plans = essentials only, long plans = comprehensive

Return ONLY this JSON structure:
{{
  "career": "{career}",
  "total_duration_months": {target},
  "phases": [
    {{
      "phase_number": 1,
      "title": "Phase title",
      "duration_weeks": {round((target * 4) / 5)},
      "description": "Brief description",
      "topics": [
        {{
          "name": "Topic name",
          "description": "What to learn",
          "resources": ["resource1", "resource2"],
          "estimated_hours": <number>
        }}
      ],
      "projects": ["Project idea 1"],
      "certifications": ["Cert name"],
      "milestones": ["Milestone 1", "Milestone 2"]
    }}
  ],
  "key_skills": ["skill1", "skill2"],
  "tools": ["tool1", "tool2"],
  "job_titles": ["title1", "title2"]
}}"""
        }
    ]

    raw = call_groq_with_fallback(messages, max_tokens=3000, temperature=0.5)
    if not raw:
        return None

    roadmap_data = parse_json_response(raw)
    if not roadmap_data:
        return None

    # ── Hard enforce duration regardless of what Groq returned ────────────────
    # This is the critical fix — we never trust Groq to get the duration right
    roadmap_data = _enforce_duration(roadmap_data, target)
    return roadmap_data


def _enforce_duration(roadmap_data: dict, target_months: int) -> dict:
    """
    Forcefully rescale all phase durations to match the target.
    This runs AFTER Groq responds so it cannot be ignored.
    """
    target_weeks = target_months * 4
    phases = roadmap_data.get('phases', [])

    if not phases:
        return roadmap_data

    # Calculate what Groq actually returned
    current_total_weeks = sum(p.get('duration_weeks', 0) for p in phases)

    if current_total_weeks == 0:
        # Groq returned no durations — distribute evenly
        weeks_per_phase = target_weeks // len(phases)
        remainder = target_weeks % len(phases)
        for i, phase in enumerate(phases):
            phase['duration_weeks'] = weeks_per_phase + (1 if i < remainder else 0)
    else:
        # Rescale proportionally so they sum to target_weeks
        scaled_weeks = []
        for phase in phases:
            proportion = phase.get('duration_weeks', 0) / current_total_weeks
            scaled_weeks.append(max(1, round(proportion * target_weeks)))

        # Fix rounding drift — adjust last phase so total is exact
        diff = target_weeks - sum(scaled_weeks)
        scaled_weeks[-1] = max(1, scaled_weeks[-1] + diff)

        for i, phase in enumerate(phases):
            phase['duration_weeks'] = scaled_weeks[i]

    # Always enforce the top-level field
    roadmap_data['total_duration_months'] = target_months
    roadmap_data['phases'] = phases
    return roadmap_data


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
# ── Assessment Question Generator ─────────────────────────────────────────────

CATEGORY_TOPICS = {
    'logical_reasoning': 'logical reasoning, series completion, syllogisms, blood relations, seating arrangements, coding-decoding',
    'programming_aptitude': 'programming concepts, data structures, algorithms, complexity, code output prediction, debugging',
    'mathematical_thinking': 'algebra, probability, statistics, calculus basics, number theory, percentages, ratios',
    'problem_solving': 'real-world problem decomposition, optimization, debugging scenarios, systems thinking',
    'communication': 'professional communication, conflict resolution, technical explanation, stakeholder management',
    'creativity': 'lateral thinking, innovative solutions, design thinking, unconventional approaches',
}


def generate_assessment_questions(num_per_category: int = 3) -> list:
    """
    Calls Groq to generate fresh unique MCQ questions every session.
    Returns flat list of dicts: id, category, difficulty, question, options, correct
    """
    all_questions = []
    question_id = 1

    for category, topics in CATEGORY_TOPICS.items():
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an expert question setter for aptitude and technical assessments. "
                    "Generate fresh, unique, high-quality MCQs every time — never repeat standard textbook examples. "
                    "Respond with valid JSON only — no markdown, no text outside JSON."
                )
            },
            {
                "role": "user",
                "content": f"""Generate exactly {num_per_category} multiple choice questions about: {topics}

Rules:
- 1 question difficulty 1 (easy), 1 difficulty 2 (medium), 1 difficulty 3 (hard)
- Each question has exactly 4 options
- Questions must be unique and creative — not standard textbook examples
- correct is the index (0, 1, 2, or 3) of the correct option in the options array

Return ONLY this JSON:
{{
  "questions": [
    {{
      "difficulty": 1,
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0
    }},
    {{
      "difficulty": 2,
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 2
    }},
    {{
      "difficulty": 3,
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 1
    }}
  ]
}}"""
            }
        ]

        raw = call_groq_with_fallback(messages, max_tokens=1200, temperature=0.9)
        if not raw:
            logger.error(f"Groq returned nothing for category: {category}")
            continue

        data = parse_json_response(raw)
        if not data or 'questions' not in data:
            logger.error(f"Failed to parse questions for category: {category}")
            continue

        for q in data['questions'][:num_per_category]:
            if not all(k in q for k in ['question', 'options', 'correct', 'difficulty']):
                continue
            if len(q['options']) != 4:
                continue
            if q['correct'] not in [0, 1, 2, 3]:
                continue

            all_questions.append({
                'id': question_id,
                'category': category,
                'difficulty': q['difficulty'],
                'question': q['question'],
                'options': q['options'],
                'correct': q['correct'],
            })
            question_id += 1

    import random
    random.shuffle(all_questions)
    return all_questions


def get_fallback_questions() -> list:
    """Used only if Groq is completely unavailable."""
    return [
        {"id": 1, "category": "logical_reasoning", "difficulty": 1,
         "question": "What comes next: 2, 6, 12, 20, 30, ?",
         "options": ["40", "42", "44", "46"], "correct": 1},
        {"id": 2, "category": "logical_reasoning", "difficulty": 2,
         "question": "A is the father of B. B is the sister of C. C is the son of D. How is A related to D?",
         "options": ["Father-in-law", "Brother-in-law", "Son-in-law", "Cannot be determined"], "correct": 0},
        {"id": 3, "category": "logical_reasoning", "difficulty": 3,
         "question": "If the day before yesterday was Thursday, what day will it be the day after tomorrow?",
         "options": ["Sunday", "Monday", "Tuesday", "Wednesday"], "correct": 0},
        {"id": 4, "category": "programming_aptitude", "difficulty": 1,
         "question": "What is the output of print(type(1/2)) in Python 3?",
         "options": ["<class 'int'>", "<class 'float'>", "<class 'double'>", "Error"], "correct": 1},
        {"id": 5, "category": "programming_aptitude", "difficulty": 2,
         "question": "What is the time complexity of binary search?",
         "options": ["O(n)", "O(n²)", "O(log n)", "O(n log n)"], "correct": 2},
        {"id": 6, "category": "programming_aptitude", "difficulty": 3,
         "question": "What is the space complexity of merge sort?",
         "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"], "correct": 2},
        {"id": 7, "category": "mathematical_thinking", "difficulty": 1,
         "question": "What is 15% of 200?",
         "options": ["25", "30", "35", "40"], "correct": 1},
        {"id": 8, "category": "mathematical_thinking", "difficulty": 2,
         "question": "What is the derivative of x² + 3x + 5?",
         "options": ["2x + 3", "x + 3", "2x", "x² + 3"], "correct": 0},
        {"id": 9, "category": "mathematical_thinking", "difficulty": 3,
         "question": "Probability of exactly 2 heads in 4 coin flips?",
         "options": ["1/4", "3/8", "1/2", "3/16"], "correct": 1},
        {"id": 10, "category": "problem_solving", "difficulty": 1,
         "question": "App is slow. First step to diagnose?",
         "options": ["Rewrite the app", "Profile the code to find bottlenecks", "Add more servers", "Ask users for faster device"], "correct": 1},
        {"id": 11, "category": "problem_solving", "difficulty": 2,
         "question": "3-gallon and 5-gallon jug. How to measure exactly 4 gallons?",
         "options": ["Fill 5, pour into 3, empty 3, pour remaining, fill 5, top up 3", "Fill 3 twice into 5", "Fill 5 subtract 1", "Impossible"], "correct": 0},
        {"id": 12, "category": "problem_solving", "difficulty": 3,
         "question": "8 identical balls, one heavier. Minimum balance weighings to find it?",
         "options": ["1", "2", "3", "4"], "correct": 1},
        {"id": 13, "category": "communication", "difficulty": 1,
         "question": "Best way to explain a complex technical concept to a non-technical stakeholder?",
         "options": ["Use jargon", "Use analogies and simple language", "Give documentation", "Skip explanation"], "correct": 1},
        {"id": 14, "category": "communication", "difficulty": 2,
         "question": "During code review you find a fundamental design flaw. You should:",
         "options": ["Rewrite it yourself", "Ignore it", "Explain constructively and suggest alternatives", "Report to manager"], "correct": 2},
        {"id": 15, "category": "communication", "difficulty": 3,
         "question": "Your team is split on two technical approaches. As a neutral developer you should:",
         "options": ["Pick the senior's side", "Facilitate a structured pros/cons discussion", "Let them argue", "Escalate to management"], "correct": 1},
        {"id": 16, "category": "creativity", "difficulty": 1,
         "question": "Competitor launches identical product. Most creative response?",
         "options": ["Lower prices", "Copy features", "Find underserved niche and dominate it", "Shut down"], "correct": 2},
        {"id": 17, "category": "creativity", "difficulty": 2,
         "question": "Company search feature is slow. Most creative fix?",
         "options": ["Ask users to wait", "Upgrade server", "Caching + indexing + perceived performance tricks", "Add loading animation"], "correct": 2},
        {"id": 18, "category": "creativity", "difficulty": 3,
         "question": "Limited budget, need to validate idea fast. Best approach?",
         "options": ["Build full product", "Landing page with signup to measure interest first", "Abandon idea", "Wait for funding"], "correct": 1},
    ]
# ── Assessment Question Generator ─────────────────────────────────────────────

CATEGORY_TOPICS = {
    'logical_reasoning': 'logical reasoning, series completion, syllogisms, blood relations, seating arrangements, coding-decoding',
    'programming_aptitude': 'programming concepts, data structures, algorithms, time complexity, code output prediction, debugging',
    'mathematical_thinking': 'algebra, probability, statistics, calculus basics, number theory, percentages, ratios',
    'problem_solving': 'real-world problem decomposition, optimization, debugging scenarios, systems thinking',
    'communication': 'professional communication, conflict resolution, technical explanation, stakeholder management',
    'creativity': 'lateral thinking, innovative solutions, design thinking, unconventional approaches',
}


def generate_assessment_questions(num_per_category: int = 3) -> list:
    """
    Calls Groq to generate fresh unique MCQ questions every session.
    Makes one API call per category so questions are truly varied.
    Returns flat list: [{id, category, difficulty, question, options, correct}]
    """
    all_questions = []
    question_id = 1

    for category, topics in CATEGORY_TOPICS.items():
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an expert question setter for aptitude and technical assessments. "
                    "Generate fresh, unique, creative MCQs every single time — never use "
                    "standard textbook examples. Be inventive with real-world scenarios. "
                    "Respond with valid JSON only — absolutely no markdown or text outside JSON."
                )
            },
            {
                "role": "user",
                "content": f"""Generate exactly {num_per_category} multiple choice questions about: {topics}

Rules:
- MUST have 1 easy question (difficulty 1), 1 medium (difficulty 2), 1 hard (difficulty 3)
- Each question MUST have exactly 4 options
- Be creative — use real-world scenarios, code snippets, novel situations
- Never use the same questions as previous sessions
- correct is the integer index (0, 1, 2, or 3) of the correct answer in the options array

Return ONLY valid JSON, no other text:
{{
  "questions": [
    {{
      "difficulty": 1,
      "question": "Full question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0
    }},
    {{
      "difficulty": 2,
      "question": "Full question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 2
    }},
    {{
      "difficulty": 3,
      "question": "Full question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 1
    }}
  ]
}}"""
            }
        ]

        raw = call_groq_with_fallback(messages, max_tokens=1500, temperature=0.95)
        if not raw:
            logger.error(f"Groq returned nothing for category: {category}")
            continue

        data = parse_json_response(raw)
        if not data or 'questions' not in data:
            logger.error(f"Failed to parse questions for category: {category}")
            continue

        for q in data['questions'][:num_per_category]:
            # Validate structure
            if not all(k in q for k in ['question', 'options', 'correct', 'difficulty']):
                continue
            if len(q['options']) != 4:
                continue
            if int(q['correct']) not in [0, 1, 2, 3]:
                continue

            all_questions.append({
                'id': question_id,
                'category': category,
                'difficulty': int(q['difficulty']),
                'question': q['question'],
                'options': q['options'],
                'correct': int(q['correct']),
            })
            question_id += 1

    import random
    random.shuffle(all_questions)
    return all_questions


def get_fallback_questions() -> list:
    """Static fallback — used ONLY if Groq is completely unavailable."""
    return [
        {"id": 1, "category": "logical_reasoning", "difficulty": 1,
         "question": "What comes next in the series: 2, 6, 12, 20, 30, ?",
         "options": ["40", "42", "44", "46"], "correct": 1},
        {"id": 2, "category": "logical_reasoning", "difficulty": 2,
         "question": "A is the father of B. B is the sister of C. C is the son of D. How is A related to D?",
         "options": ["Father-in-law", "Brother-in-law", "Son-in-law", "Cannot be determined"], "correct": 0},
        {"id": 3, "category": "logical_reasoning", "difficulty": 3,
         "question": "If the day before yesterday was Thursday, what day will it be the day after tomorrow?",
         "options": ["Sunday", "Monday", "Tuesday", "Wednesday"], "correct": 0},
        {"id": 4, "category": "programming_aptitude", "difficulty": 1,
         "question": "What is the output of print(type(1/2)) in Python 3?",
         "options": ["<class 'int'>", "<class 'float'>", "<class 'double'>", "Error"], "correct": 1},
        {"id": 5, "category": "programming_aptitude", "difficulty": 2,
         "question": "What is the time complexity of binary search?",
         "options": ["O(n)", "O(n²)", "O(log n)", "O(n log n)"], "correct": 2},
        {"id": 6, "category": "programming_aptitude", "difficulty": 3,
         "question": "What is the space complexity of merge sort?",
         "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"], "correct": 2},
        {"id": 7, "category": "mathematical_thinking", "difficulty": 1,
         "question": "What is 15% of 200?",
         "options": ["25", "30", "35", "40"], "correct": 1},
        {"id": 8, "category": "mathematical_thinking", "difficulty": 2,
         "question": "What is the derivative of x² + 3x + 5?",
         "options": ["2x + 3", "x + 3", "2x", "x² + 3"], "correct": 0},
        {"id": 9, "category": "mathematical_thinking", "difficulty": 3,
         "question": "Probability of exactly 2 heads in 4 coin flips?",
         "options": ["1/4", "3/8", "1/2", "3/16"], "correct": 1},
        {"id": 10, "category": "problem_solving", "difficulty": 1,
         "question": "App is slow. First step to diagnose?",
         "options": ["Rewrite the app", "Profile code to find bottlenecks", "Add more servers", "Ask users for faster device"], "correct": 1},
        {"id": 11, "category": "problem_solving", "difficulty": 2,
         "question": "3-gallon and 5-gallon jug. How to measure exactly 4 gallons?",
         "options": ["Fill 5, pour into 3, empty 3, pour remaining, fill 5, top up 3", "Fill 3 twice into 5", "Fill 5 subtract 1", "Impossible"], "correct": 0},
        {"id": 12, "category": "problem_solving", "difficulty": 3,
         "question": "8 identical balls, one heavier. Min balance weighings to find it?",
         "options": ["1", "2", "3", "4"], "correct": 1},
        {"id": 13, "category": "communication", "difficulty": 1,
         "question": "Best way to explain a complex technical concept to a non-technical stakeholder?",
         "options": ["Use jargon", "Use analogies and simple language", "Give documentation", "Skip explanation"], "correct": 1},
        {"id": 14, "category": "communication", "difficulty": 2,
         "question": "During code review you find a fundamental design flaw. You should:",
         "options": ["Rewrite it yourself", "Ignore it", "Explain constructively and suggest alternatives", "Report to manager"], "correct": 2},
        {"id": 15, "category": "communication", "difficulty": 3,
         "question": "Team split on two technical approaches. As neutral developer you should:",
         "options": ["Pick senior's side", "Facilitate structured pros/cons discussion", "Let them argue", "Escalate to management"], "correct": 1},
        {"id": 16, "category": "creativity", "difficulty": 1,
         "question": "Competitor launches identical product. Most creative response?",
         "options": ["Lower prices", "Copy features", "Find underserved niche and dominate it", "Shut down"], "correct": 2},
        {"id": 17, "category": "creativity", "difficulty": 2,
         "question": "Company search feature is slow. Most creative fix?",
         "options": ["Ask users to wait", "Upgrade server", "Caching + indexing + perceived performance tricks", "Add loading animation"], "correct": 2},
        {"id": 18, "category": "creativity", "difficulty": 3,
         "question": "Limited budget, need to validate idea fast. Best approach?",
         "options": ["Build full product", "Landing page with signup to measure interest first", "Abandon idea", "Wait for funding"], "correct": 1},
    ]