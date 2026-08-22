from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction

from services.gemini_service import generate_questions_with_gemini
from services.groq_service import get_fallback_questions
from .models import AssessmentResult, CATEGORIES
from .serializers import AssessmentSubmitSerializer, AssessmentResultSerializer


def calculate_scores(answers: dict, questions: list) -> dict:
    category_scores = {cat: {'correct': 0, 'total': 0} for cat in CATEGORIES}

    for q in questions:
        qid = str(q['id'])
        cat = q['category']
        if cat not in category_scores:
            continue
        category_scores[cat]['total'] += 1
        if qid in answers and int(answers[qid]) == int(q['correct']):
            category_scores[cat]['correct'] += 1

    result = {}
    for cat, data in category_scores.items():
        result[cat] = round(
            (data['correct'] / data['total']) * 100, 1
        ) if data['total'] > 0 else 0.0

    weights = {
        'logical_reasoning': 0.20,
        'programming_aptitude': 0.25,
        'mathematical_thinking': 0.20,
        'problem_solving': 0.15,
        'communication': 0.10,
        'creativity': 0.10,
    }
    result['total'] = round(
        sum(result.get(c, 0) * w for c, w in weights.items()), 1
    )
    return result


class QuestionsView(APIView):
    """
    GET /api/assessment/questions/
    Calls Groq to generate 18 fresh unique questions (3 per category).
    Stores them in DB as a pending row (total_score=-1) so submit
    can retrieve them without any cache dependency.
    """

    def get(self, request):
        # Generate fresh questions from Groq — unique every session
        questions = generate_questions_with_gemini()

        # Fallback to static questions only if Groq completely fails
        if not questions or len(questions) < 12:
            questions = get_fallback_questions()

        # Store in DB as a pending row so submit can retrieve them
        with transaction.atomic():
            # Clean up any previous pending session for this user
            AssessmentResult.objects.filter(
                user=request.user,
                total_score=-1
            ).delete()

            # Save questions as pending assessment
            AssessmentResult.objects.create(
                user=request.user,
                answers={},
                questions_used=questions,
                scores={},
                total_score=-1,        # -1 = pending/in-progress marker
                is_latest=False,
            )

        # Send to frontend WITHOUT correct answers
        safe = [
            {k: v for k, v in q.items() if k != 'correct'}
            for q in questions
        ]
        return Response({'questions': safe, 'total': len(safe)})


class SubmitAssessmentView(APIView):
    """
    POST /api/assessment/submit/
    Retrieves the pending questions from DB, scores answers, saves result.
    """

    def post(self, request):
        serializer = AssessmentSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        answers = serializer.validated_data['answers']
        time_taken = serializer.validated_data.get('time_taken_seconds', 0)

        # Get the pending row that was saved during GET /questions/
        pending = AssessmentResult.objects.filter(
            user=request.user,
            total_score=-1
        ).order_by('-completed_at').first()

        if pending and pending.questions_used:
            questions = pending.questions_used
        else:
            # Fallback if pending row not found (session expired etc.)
            questions = get_fallback_questions()

        scores = calculate_scores(answers, questions)

        with transaction.atomic():
            # Mark all previous results as not latest
            AssessmentResult.objects.filter(
                user=request.user,
                is_latest=True
            ).update(is_latest=False)

            # Delete the pending row
            AssessmentResult.objects.filter(
                user=request.user,
                total_score=-1
            ).delete()

            # Save final scored result
            result = AssessmentResult.objects.create(
                user=request.user,
                answers=answers,
                questions_used=questions,
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
            return AssessmentResult.objects.get(
                user=self.request.user,
                is_latest=True
            )
        except AssessmentResult.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('No assessment found. Please take the assessment first.')


class AssessmentHistoryView(generics.ListAPIView):
    serializer_class = AssessmentResultSerializer

    def get_queryset(self):
        return AssessmentResult.objects.filter(
            user=self.request.user,
            total_score__gte=0       # Exclude pending rows
        ).order_by('-completed_at')[:10]