import json
import re
import logging
import os
import requests
from typing import Optional

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

def _parse_json(text: str) -> Optional[dict]:
    if not text:
        return None

    # Remove <think>...</think> blocks
    text = re.sub(
        r"<think>.*?</think>",
        "",
        text,
        flags=re.DOTALL | re.IGNORECASE
    )

    # Remove Markdown code fences
    text = re.sub(r"```json\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"```\s*", "", text)

    text = text.strip()

    # First: try the complete response as JSON
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Second: extract JSON object from surrounding text
    start = text.find("{")
    end = text.rfind("}")

    if start != -1 and end != -1 and end > start:
        json_text = text[start:end + 1]

        try:
            return json.loads(json_text)
        except json.JSONDecodeError:
            pass

    logger.error(
        "Failed to parse JSON: %s",
        text[:300]
    )

    return None


def generate_questions_with_gemini() -> list:
    logger.info("=== GEMINI: Starting question generation ===")

    if not GEMINI_API_KEY:
        logger.error("=== GEMINI: GEMINI_API_KEY not set ===")
        return []

    logger.info(f"=== GEMINI: Key found (prefix: {GEMINI_API_KEY[:8]}...), calling API ===")

    prompt = """Generate exactly 15 multiple choice questions for an aptitude assessment — 3 per category.

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
- Return ONLY valid JSON, no explanation, no markdown, no code fences

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

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
    "temperature": 0.85,
    "maxOutputTokens": 8192,
    "responseMimeType": "application/json"
}
    }

    try:
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=60
        )

        logger.info(f"=== GEMINI: Response status: {response.status_code} ===")

        if response.status_code != 200:
            logger.error(f"=== GEMINI: API error {response.status_code}: {response.text[:300]} ===")
            return []

        result = response.json()
        raw = result['candidates'][0]['content']['parts'][0]['text']
        logger.info(f"=== GEMINI: Got response, length={len(raw)} chars ===")

        data = _parse_json(raw)
        if not data or 'questions' not in data:
            logger.error(f"=== GEMINI: Invalid JSON. Preview: {raw[:300]} ===")
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
        logger.info(f"=== GEMINI: Successfully generated {len(all_questions)} questions ===")
        return all_questions

    except Exception as e:
        logger.error(f"=== GEMINI: Exception: {type(e).__name__}: {e} ===")
        return []