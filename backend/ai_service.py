import openai
import os
import json

class AIInterviewService:
    def __init__(self):
        # Use your OpenAI free-tier API key
        self.api_key = os.getenv("OPENAI_API_KEY")
        openai.api_key = self.api_key
        self.model = "gpt-3.5-turbo"

    def generate_questions(self, resume_text, difficulty='medium', num_questions=5):
        """
        Generate interview questions based on resume
        """
        prompt = f"""
        Based on the following resume, generate {num_questions} interview questions at {difficulty} difficulty.
        Questions should cover: technical skills, experience, problem-solving, and behavioral aspects.

        Resume:
        {resume_text}

        Return a JSON array with objects containing:
        - question_text: str
        - category: str (technical, behavioral, domain)
        - difficulty: str (easy, medium, hard)
        - time_limit_seconds: int (120-300)

        Return ONLY valid JSON, no markdown or extra text.
        """

        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1024,
                temperature=0.7
            )
            content = response['choices'][0]['message']['content']
            questions = json.loads(content)
            return questions
        except Exception as e:
            print(f"Error generating questions: {str(e)}")
            return []

    def score_answer(self, question_text, candidate_answer, difficulty='medium'):
        """
        Score and provide feedback on candidate's answer
        """
        prompt = f"""
        Evaluate the candidate's answer to an interview question.

        Question: {question_text}
        Difficulty: {difficulty}
        Candidate's Answer: {candidate_answer}

        Provide evaluation in JSON format:
        {{
            "score": <0-100>,
            "feedback": "<constructive feedback>",
            "strengths": ["<strength1>", "<strength2>"],
            "areas_for_improvement": ["<area1>", "<area2>"]
        }}

        Return ONLY valid JSON, no markdown.
        """

        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=512,
                temperature=0.7
            )
            content = response['choices'][0]['message']['content']
            evaluation = json.loads(content)
            return evaluation
        except Exception as e:
            print(f"Error scoring answer: {str(e)}")
            return {"score": 0, "feedback": "Could not evaluate", "strengths": [], "areas_for_improvement": []}

    def generate_report(self, candidate_name, questions_and_scores):
        """
        Generate a professional interview report
        """
        questions_summary = "\n".join([
            f"- {q['category']}: {q['score']}/100 ({q['feedback'][:100]}...)"
            for q in questions_and_scores
        ])

        prompt = f"""
        Generate a professional interview report summary.

        Candidate: {candidate_name}
        Questions and Scores:
        {questions_summary}

        Provide report in JSON:
        {{
            "overall_score": <average>,
            "strengths": ["<strength1>", "<strength2>", "<strength3>"],
            "weaknesses": ["<weakness1>", "<weakness2>"],
            "recommendations": ["<recommendation1>", "<recommendation2>"]
        }}

        Return ONLY valid JSON.
        """

        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1024,
                temperature=0.7
            )
            content = response['choices'][0]['message']['content']
            report = json.loads(content)
            return report
        except Exception as e:
            print(f"Error generating report: {str(e)}")
            return {"overall_score": 0, "strengths": [], "weaknesses": [], "recommendations": []}

# Singleton instance
ai_service = AIInterviewService()
