# services/ai_interview_service.py
import os
from openai import OpenAI
from utils.json_utils import safe_json_loads

class AIInterviewService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None
        self.model = "gpt-4o-mini"

    def enabled(self):
        return self.client is not None

    def _supports_json_mode(self):
        # best-effort feature detection: try a dry run with response_format and catch TypeError
        return os.getenv("OPENAI_JSON_MODE", "auto")  # allow override; "off" to force disable

    def generate_questions(self, resume_text, difficulty='medium', num_questions=5):
        if not self.enabled():
            return []

        prompt = f"""
        You are generating interview questions from a resume.
        - Return diverse, non-duplicated questions tailored to the resume content.
        - Cover technical, problem-solving, and behavioral aspects.
        - Difficulty: {difficulty}
        - Count: {num_questions}

        Resume:
        {resume_text}

        Return ONLY a JSON array of objects:
        [
          {{
            "question_text": "string",
            "category": "technical|behavioral|domain|general",
            "difficulty": "easy|medium|hard",
            "time_limit_seconds": 120
          }}
        ]
        """

        try:
            use_json_mode = self._supports_json_mode() != "off"
            kwargs = dict(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            if use_json_mode == "on":
                kwargs["response_format"] = {"type": "json_object"}  # may raise TypeError on older SDKs

            try:
                resp = self.client.chat.completions.create(**kwargs)
            except TypeError:
                # SDK doesn’t support response_format; retry without it
                resp = self.client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.3
                )

            content = resp.choices[0].message.content
            items = safe_json_loads(content) or []
            if isinstance(items, list):
                sanitized = []
                for it in items:
                    sanitized.append({
                        "question_text": (it.get("question_text") or "").strip() or "General question",
                        "category": it.get("category", "general"),
                        "difficulty": it.get("difficulty", difficulty),
                        "time_limit_seconds": int(it.get("time_limit_seconds", 120)),
                    })
                return sanitized[:num_questions]
        except Exception as e:
            print(f"[OpenAI] generate_questions failed: {e}")
        return []

    def score_answer(self, question_text, candidate_answer, difficulty='medium'):
        if not self.enabled():
            return {}
        prompt = f"""
        Evaluate the candidate's answer.

        Question: {question_text}
        Difficulty: {difficulty}
        Candidate's Answer: {candidate_answer}

        Return ONLY JSON:
        {{
          "score": 0-100,
          "feedback": "string",
          "strengths": ["s1","s2"],
          "areas_for_improvement": ["a1","a2"]
        }}
        """
        try:
            try:
                resp = self.client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.3,
                    response_format={"type": "json_object"}
                )
            except TypeError:
                resp = self.client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.3
                )
            content = resp.choices[0].message.content
            obj = safe_json_loads(content) or {}
            return {
                "score": float(obj.get("score", 70)),
                "feedback": obj.get("feedback", "Good effort."),
                "strengths": obj.get("strengths", []),
                "areas_for_improvement": obj.get("areas_for_improvement", [])
            }
        except Exception as e:
            print(f"[OpenAI] score_answer failed: {e}")
            return {}

    def generate_report(self, candidate_name, questions_and_scores):
        if not self.enabled():
            return {}
        summary = "\n".join([
            f"- {q.get('category','general')}: {q.get('score',0)}/100 ({(q.get('feedback','') or '')[:120]}...)"
            for q in questions_and_scores
        ])
        prompt = f"""
        Generate a concise interview report.

        Candidate: {candidate_name}
        Questions and Scores:
        {summary}

        Return ONLY JSON:
        {{
          "overall_score": <average>,
          "strengths": ["..."],
          "weaknesses": ["..."],
          "recommendations": ["..."]
        }}
        """
        try:
            try:
                resp = self.client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.3,
                    response_format={"type": "json_object"}
                )
            except TypeError:
                resp = self.client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.3
                )
            content = resp.choices[0].message.content
            obj = safe_json_loads(content) or {}
            return {
                "overall_score": float(obj.get("overall_score", 0)),
                "strengths": obj.get("strengths", []),
                "weaknesses": obj.get("weaknesses", []),
                "recommendations": obj.get("recommendations", [])
            }
        except Exception as e:
            print(f"[OpenAI] generate_report failed: {e}")
            return {}