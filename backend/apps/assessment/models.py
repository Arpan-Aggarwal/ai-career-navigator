from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

QUESTIONS = [
    # Logical Reasoning
    {
        "id": 1, "category": "logical_reasoning",
        "question": "If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely Lazzies?",
        "options": ["True", "False", "Cannot be determined", "Only sometimes"],
        "correct": 0, "difficulty": 1
    },
    {
        "id": 2, "category": "logical_reasoning",
        "question": "What comes next in the series: 2, 6, 12, 20, 30, ?",
        "options": ["40", "42", "44", "46"],
        "correct": 1, "difficulty": 2
    },
    {
        "id": 3, "category": "logical_reasoning",
        "question": "A is the father of B. B is the sister of C. C is the son of D. How is A related to D?",
        "options": ["Father-in-law", "Brother-in-law", "Son-in-law", "Cannot be determined"],
        "correct": 0, "difficulty": 3
    },
    # Programming Aptitude
    {
        "id": 4, "category": "programming_aptitude",
        "question": "What is the output of: print(type(1/2)) in Python 3?",
        "options": ["<class 'int'>", "<class 'float'>", "<class 'double'>", "Error"],
        "correct": 1, "difficulty": 1
    },
    {
        "id": 5, "category": "programming_aptitude",
        "question": "Which data structure operates on LIFO (Last In First Out) principle?",
        "options": ["Queue", "Stack", "Linked List", "Tree"],
        "correct": 1, "difficulty": 1
    },
    {
        "id": 6, "category": "programming_aptitude",
        "question": "What is the time complexity of binary search?",
        "options": ["O(n)", "O(n²)", "O(log n)", "O(n log n)"],
        "correct": 2, "difficulty": 2
    },
    # Mathematical Thinking
    {
        "id": 7, "category": "mathematical_thinking",
        "question": "What is the derivative of x² + 3x + 5?",
        "options": ["2x + 3", "x + 3", "2x", "x² + 3"],
        "correct": 0, "difficulty": 2
    },
    {
        "id": 8, "category": "mathematical_thinking",
        "question": "If a data set has mean=50 and standard deviation=10, what percentage of data falls within one standard deviation?",
        "options": ["50%", "68%", "95%", "99.7%"],
        "correct": 1, "difficulty": 2
    },
    {
        "id": 9, "category": "mathematical_thinking",
        "question": "What is the probability of getting exactly 2 heads in 4 coin flips?",
        "options": ["1/4", "3/8", "1/2", "3/16"],
        "correct": 1, "difficulty": 3
    },
    # Problem Solving
    {
        "id": 10, "category": "problem_solving",
        "question": "You have a 3-gallon and 5-gallon jug. How do you measure exactly 4 gallons?",
        "options": [
            "Fill the 5, pour into 3, empty 3, pour remaining into 3, fill 5, pour into 3",
            "Fill the 3 twice and pour into 5",
            "Fill the 5 and subtract 1",
            "It is impossible"
        ],
        "correct": 0, "difficulty": 3
    },
    {
        "id": 11, "category": "problem_solving",
        "question": "A palindrome is a word that reads the same backwards. How many palindromes are there of length 5 using only digits 0-9?",
        "options": ["100", "1000", "10000", "100000"],
        "correct": 1, "difficulty": 3
    },
    # Communication Skills
    {
        "id": 12, "category": "communication",
        "question": "When explaining a complex technical concept to a non-technical stakeholder, the BEST approach is:",
        "options": [
            "Use technical jargon to appear knowledgeable",
            "Use analogies and simple language avoiding jargon",
            "Give them detailed documentation to read",
            "Skip the explanation and just show the result"
        ],
        "correct": 1, "difficulty": 1
    },
    {
        "id": 13, "category": "communication",
        "question": "During code review, a colleague's code has a fundamental design flaw. You should:",
        "options": [
            "Rewrite it yourself without telling them",
            "Ignore it if it works",
            "Explain the issue constructively and suggest alternatives",
            "Report them to the manager"
        ],
        "correct": 2, "difficulty": 2
    },
    # Creativity
    {
        "id": 14, "category": "creativity",
        "question": "A company's search feature is slow. Which approach shows the most creative problem solving?",
        "options": [
            "Ask users to wait",
            "Upgrade the server",
            "Implement caching + indexing + UX perceived performance improvements simultaneously",
            "Add a loading animation"
        ],
        "correct": 2, "difficulty": 2
    },
    {
        "id": 15, "category": "creativity",
        "question": "How many unique ways can you use a paperclip? This tests:",
        "options": [
            "Memory recall",
            "Divergent thinking and creativity",
            "Mathematical reasoning",
            "Language skills"
        ],
        "correct": 1, "difficulty": 1
    },
]


class AssessmentResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assessments')
    answers = models.JSONField(default=dict)
    scores = models.JSONField(default=dict)
    total_score = models.FloatField(default=0.0)
    logical_reasoning_score = models.FloatField(default=0.0)
    programming_aptitude_score = models.FloatField(default=0.0)
    mathematical_thinking_score = models.FloatField(default=0.0)
    problem_solving_score = models.FloatField(default=0.0)
    communication_score = models.FloatField(default=0.0)
    creativity_score = models.FloatField(default=0.0)
    time_taken_seconds = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(auto_now_add=True)
    is_latest = models.BooleanField(default=True)

    class Meta:
        ordering = ['-completed_at']

    def __str__(self):
        return f"{self.user.email} - {self.total_score:.1f}% - {self.completed_at}"
