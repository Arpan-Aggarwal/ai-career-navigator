import json
import re
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
GEMINI_MODEL = 'gemini-2.0-flash'


def _parse_json(text: str) -> Optional[dict]:
    """Robustly extract JSON from Gemini response."""
    if not text:
        return None
    # Strip thinking tags and markdown fences
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
    text = re.sub(r'```(?:json)?\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    try:
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start:end + 1])
    except json.JSONDecodeError:
        pass
    logger.error(f"Failed to parse JSON: {text[:300]}")
    return None


def generate_questions_with_gemini() -> list:
    """
    Single Gemini API call to generate all 18 assessment questions.
    Uses gemini-2.0-flash — free tier, 10 RPM, 1000 RPD.
    """
    if not GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY not set")
        return []

    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel(GEMINI_MODEL)

        prompt = """Generate exactly 18 multiple choice questions for an aptitude assessment — 3 per category.

Categories:
1. logical_reasoning: series, syllogisms, blood relations, seating arrangements, coding-decoding
2. programming_aptitude: data structures, algorithms, complexity, code output, debugging
3. mathematical_thinking: algebra, probability, statistics, percentages, ratios
4. problem_solving: real-world decomposition, optimization, systems thinking
5. communication: professional communication, conflict resolution, stakeholder management
6. creativity: lateral thinking, innovative solutions, design thinking

Rules:
- For EACH category: 1 easy (difficulty 1), 1 medium (difficulty 2), 1 hard (difficulty 3)
- Each question has EXACTLY 4 options
- correct is the integer index 0, 1, 2, or 3 of the correct answer
- Be creative — use real-world scenarios, not standard textbook examples
- Return ONLY valid JSON, no explanation, no markdown

Return exactly this JSON structure:
{
  "questions": [
    {
      "category": "logical_reasoning",
      "difficulty": 1,
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0
    }
  ]
}"""

        response = model.generate_content(prompt)
        raw = response.text

        data = _parse_json(raw)
        if not data or 'questions' not in data:
            logger.error("Gemini returned invalid JSON for questions")
            return []

        valid_categories = [
            'logical_reasoning', 'programming_aptitude', 'mathematical_thinking',
            'problem_solving', 'communication', 'creativity'
        ]

        all_questions = []
        question_id = 1

        for q in data['questions']:
            if not all(k in q for k in ['category', 'question', 'options', 'correct', 'difficulty']):
                continue
            if q['category'] not in valid_categories:
                continue
            if len(q['options']) != 4:
                continue
            if int(q['correct']) not in [0, 1, 2, 3]:
                continue

            all_questions.append({
                'id': question_id,
                'category': q['category'],
                'difficulty': int(q['difficulty']),
                'question': q['question'],
                'options': q['options'],
                'correct': int(q['correct']),
            })
            question_id += 1

        import random
        random.shuffle(all_questions)
        logger.info(f"Gemini generated {len(all_questions)} questions successfully")
        return all_questions

    except Exception as e:
        logger.error(f"Gemini question generation failed: {e}")
        return []