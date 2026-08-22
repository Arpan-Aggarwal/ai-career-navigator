import json
import re
import logging
import os
import requests
from typing import Optional

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent'

def _parse_json(text: str) -> Optional[dict]:
    if not text:
        return None
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
    logger.info("=== GEMINI: Starting question generation (2 batches) ===")

    if not GEMINI_API_KEY:
        logger.error("=== GEMINI: GEMINI_API_KEY not set ===")
        return []

    all_questions = []
    question_id = 1

    # Split 6 categories into 2 batches of 3 — each batch generates 9 questions
    # Total = 18 but we validate and take what's good, targeting 15+
    batches = [
        {
            'categories': ['logical_reasoning', 'programming_aptitude', 'mathematical_thinking'],
            'topics': {
                'logical_reasoning': 'series completion, syllogisms, blood relations, seating arrangements, coding-decoding',
                'programming_aptitude': 'data structures, algorithms, time complexity, code output prediction, debugging',
                'mathematical_thinking': 'algebra, probability, statistics, calculus basics, percentages, ratios',
            }
        },
        {
            'categories': ['problem_solving', 'communication', 'creativity'],
            'topics': {
                'problem_solving': 'real-world problem decomposition, optimization, debugging scenarios, systems thinking',
                'communication': 'professional communication, conflict resolution, technical explanation, stakeholder management',
                'creativity': 'lateral thinking, innovative solutions, design thinking, unconventional approaches',
            }
        }
    ]

    for batch_num, batch in enumerate(batches, 1):
        logger.info(f"=== GEMINI: Sending batch {batch_num}/2 ===")

        categories_text = '\n'.join([
            f"{i+1}. {cat}: {batch['topics'][cat]}"
            for i, cat in enumerate(batch['categories'])
        ])

        prompt = f"""Generate exactly 9 multiple choice questions for an aptitude assessment — 3 per category.

Categories and topics:
{categories_text}

Rules:
- For EACH category: 1 easy question (difficulty 1), 1 medium question (difficulty 2), 1 hard question (difficulty 3)
- Each question has EXACTLY 4 options
- correct is the integer index 0, 1, 2, or 3 of the correct answer in the options array
- Be creative — use real-world scenarios, novel situations, not standard textbook examples
- Never use the same questions as previous sessions
- Return ONLY valid JSON, no explanation, no markdown, no code fences

Return exactly this JSON structure:
{{
  "questions": [
    {{
      "category": "{batch['categories'][0]}",
      "difficulty": 1,
      "question": "Full question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0
    }},
    {{
      "category": "{batch['categories'][0]}",
      "difficulty": 2,
      "question": "Full question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 2
    }},
    {{
      "category": "{batch['categories'][0]}",
      "difficulty": 3,
      "question": "Full question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 1
    }},
    {{
      "category": "{batch['categories'][1]}",
      "difficulty": 1,
      "question": "Full question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 3
    }},
    {{
      "category": "{batch['categories'][1]}",
      "difficulty": 2,
      "question": "Full question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0
    }},
    {{
      "category": "{batch['categories'][1]}",
      "difficulty": 3,
      "question": "Full question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 2
    }},
    {{
      "category": "{batch['categories'][2]}",
      "difficulty": 1,
      "question": "Full question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 1
    }},
    {{
      "category": "{batch['categories'][2]}",
      "difficulty": 2,
      "question": "Full question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0
    }},
    {{
      "category": "{batch['categories'][2]}",
      "difficulty": 3,
      "question": "Full question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 3
    }}
  ]
}}"""

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.9,
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

            logger.info(f"=== GEMINI: Batch {batch_num} status: {response.status_code} ===")

            if response.status_code != 200:
                logger.error(f"=== GEMINI: Batch {batch_num} error: {response.text[:200]} ===")
                continue

            result = response.json()
            raw = result['candidates'][0]['content']['parts'][0]['text']
            logger.info(f"=== GEMINI: Batch {batch_num} response length: {len(raw)} chars ===")

            data = _parse_json(raw)
            if not data or 'questions' not in data:
                logger.error(f"=== GEMINI: Batch {batch_num} JSON invalid. Preview: {raw[:200]} ===")
                continue

            valid_categories = [
                'logical_reasoning', 'programming_aptitude', 'mathematical_thinking',
                'problem_solving', 'communication', 'creativity'
            ]

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

            logger.info(f"=== GEMINI: Batch {batch_num} added questions, running total: {len(all_questions)} ===")

        except Exception as e:
            logger.error(f"=== GEMINI: Batch {batch_num} exception: {type(e).__name__}: {e} ===")
            continue

    import random
    random.shuffle(all_questions)
    logger.info(f"=== GEMINI: Total questions generated: {len(all_questions)} ===")
    return all_questions