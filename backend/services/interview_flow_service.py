# services/interview_flow_service.py
from typing import List, Dict

from services.ai_interview_service import AIInterviewService
from services.resume_service import ResumeService

class InterviewFlowService:
    def __init__(self):
        self.resume_service = ResumeService()
        self.ai_service = AIInterviewService()

    def extract_resume_text(self, filepath, ext):
        text = self.resume_service.extract_text_from_file(filepath, ext)
        if not text or len(text.strip()) < 30:
            print("[InterviewFlowService] Resume text appears empty or too short; check file path/extension and parser.")
        return text

    def generate_questions(self, resume_text: str, difficulty: str, num_questions: int) -> List[Dict]:
        # Try AI first
        if self.ai_service.enabled():
            questions = self.ai_service.generate_questions(resume_text, difficulty, num_questions)
            if isinstance(questions, list) and questions:
                return questions

        # Fallback: heuristic based on parsed skills
        info = self.resume_service.parse_resume_info(resume_text)
        parsed_skills = info.get('skills', [])
        # If we didn’t parse any skills, broaden defaults but vary templates
        skills = parsed_skills or ['SQL', 'Python', 'Problem-solving', 'Teamwork', 'Communication', 'AWS', 'Docker']
        templates = [
            "Describe a project where you used {skill}. What was your role and impact?",
            "Tell me about a challenge involving {skill} and how you resolved it.",
            "How do you approach design decisions when working with {skill}?",
            "What common pitfalls have you seen with {skill}, and how do you avoid them?",
            "Share a time you mentored someone on {skill}. What was the outcome?"
        ]
        questions = []
        for i in range(num_questions):
            skill = skills[i % len(skills)]
            tmpl = templates[i % len(templates)]
            questions.append({
                "question_text": tmpl.format(skill=skill),
                "category": "technical" if skill.lower() not in ["teamwork", "communication", "problem-solving"] else "behavioral",
                "difficulty": difficulty,
                "time_limit_seconds": 180
            })
        return questions