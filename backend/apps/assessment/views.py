from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction

from .models import AssessmentResult, QUESTIONS
from .serializers import AssessmentSubmitSerializer, AssessmentResultSerializer


def calculate_scores(answers: dict) -> dict:
    """Calculate category scores from submitted answers."""
    category_scores = {
        'logical_reasoning': {'correct': 0, 'total': 0},
        'programming_aptitude': {'correct': 0, 'total': 0},
        'mathematical_thinking': {'correct': 0, 'total': 0},
        'problem_solving': {'correct': 0, 'total': 0},
        'communication': {'correct': 0, 'total': 0},
        'creativity': {'correct': 0, 'total': 0},
    }

    for question in QUESTIONS:
        qid = str(question['id'])
        cat = question['category']
        category_scores[cat]['total'] += 1

        if qid in answers and answers[qid] == question['correct']:
            category_scores[cat]['correct'] += 1

    result = {}
    for cat, data in category_scores.items():
        if data['total'] > 0:
            result[cat] = round((data['correct'] / data['total']) * 100, 1)
        else:
            result[cat] = 0.0

    # Weighted total score
    weights = {
        'logical_reasoning': 0.20,
        'programming_aptitude': 0.25,
        'mathematical_thinking': 0.20,
        'problem_solving': 0.15,
        'communication': 0.10,
        'creativity': 0.10,
    }
    total = sum(result.get(cat, 0) * weight for cat, weight in weights.items())
    result['total'] = round(total, 1)
    return result


class QuestionsView(APIView):
    """Return assessment questions (without correct answers)."""

    def get(self, request):
        safe_questions = []
        for q in QUESTIONS:
            safe_questions.append({
                'id': q['id'],
                'category': q['category'],
                'question': q['question'],
                'options': q['options'],
                'difficulty': q['difficulty'],
            })
        return Response({'questions': safe_questions, 'total': len(safe_questions)})


class SubmitAssessmentView(APIView):
    def post(self, request):
        serializer = AssessmentSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        answers = serializer.validated_data['answers']
        time_taken = serializer.validated_data.get('time_taken_seconds', 0)

        scores = calculate_scores(answers)

        with transaction.atomic():
            # Mark previous as not latest
            AssessmentResult.objects.filter(user=request.user, is_latest=True).update(is_latest=False)

            result = AssessmentResult.objects.create(
                user=request.user,
                answers=answers,
                scores=scores,
                total_score=scores['total'],
                logical_reasoning_score=scores.get('logical_reasoning', 0),
                programming_aptitude_score=scores.get('programming_aptitude', 0),
                mathematical_thinking_score=scores.get('mathematical_thinking', 0),
                problem_solving_score=scores.get('problem_solving', 0),
                communication_score=scores.get('communication', 0),
                creativity_score=scores.get('creativity', 0),
                time_taken_seconds=time_taken,
                is_latest=True,
            )

        return Response({
            'result': AssessmentResultSerializer(result).data,
            'message': 'Assessment completed successfully.',
        }, status=status.HTTP_201_CREATED)


class AssessmentResultView(generics.RetrieveAPIView):
    serializer_class = AssessmentResultSerializer

    def get_object(self):
        try:
            return AssessmentResult.objects.get(user=self.request.user, is_latest=True)
        except AssessmentResult.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('No assessment found. Please take the assessment first.')


class AssessmentHistoryView(generics.ListAPIView):
    serializer_class = AssessmentResultSerializer

    def get_queryset(self):
        return AssessmentResult.objects.filter(user=self.request.user).order_by('-completed_at')[:10]
