# services/resume_service.py
import io
import os
from typing import List

from pdfminer.high_level import extract_text as pdf_extract_text
from docx import Document  # correct docx parser

class ResumeService:
    @staticmethod
    def extract_text_from_file(file_path, ext):
        """
        Returns extracted text or empty string if any error happens.
        ext: expected lowercase extension without leading dot (e.g., 'pdf', 'docx', 'txt')
        """
        ext = (ext or '').lower().strip().lstrip('.')
        try:
            if ext == 'txt':
                # Try utf-8 first; fallback to latin-1 to avoid empty on decode issues
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        return f.read() or ""
                except Exception:
                    with open(file_path, 'r', encoding='latin-1', errors='ignore') as f:
                        return f.read() or ""

            elif ext == 'pdf':
                text = pdf_extract_text(file_path) or ""
                return text

            elif ext == 'docx':
                doc = Document(file_path)
                paragraphs = [p.text for p in doc.paragraphs if p.text]
                return "\n".join(paragraphs) or ""

            else:
                # Unsupported extension
                return ""
        except Exception as e:
            # Log for troubleshooting; avoid returning error text to downstream
            print(f"[ResumeService] Failed to extract text from {file_path} ({ext}): {e}")
            return ""

    @staticmethod
    def parse_resume_info(resume_text):
        info = {
            'skills': [],
            'experience_years': 0,
            'roles': [],
            'education': []
        }
        text = (resume_text or "").lower()
        # Expand skill map a bit and avoid substring collisions by basic word boundaries where possible
        skill_map = [
            'python', 'java', 'react', 'sql', 'javascript', 'aws', 'docker', 'kubernetes',
            'django', 'spring', 'node', 'typescript', 'azure', 'gcp', 'terraform', 'git',
            'rest', 'graphql', 'flask', 'pandas', 'spark', 'hadoop'
        ]
        info['skills'] = [s.capitalize() for s in skill_map if s in text]
        # You can further enhance: regex for years of experience, roles by titles, education by degrees.
        return info