import json
import PyPDF2

class ResumeService:
    @staticmethod
    def extract_text_from_pdf(file_path):
        """Extract text from PDF resume"""
        try:
            text = ""
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text()
            return text
        except Exception as e:
            return f"Error extracting PDF: {str(e)}"
    
    @staticmethod
    def parse_resume_info(resume_text):
        """Extract key info from resume"""
        info = {
            'skills': [],
            'experience_years': 0,
            'roles': [],
            'education': []
        }
        
        # Basic parsing - can be enhanced with NLP
        if 'python' in resume_text.lower():
            info['skills'].append('Python')
        if 'java' in resume_text.lower():
            info['skills'].append('Java')
        if 'react' in resume_text.lower():
            info['skills'].append('React')
        if 'sql' in resume_text.lower():
            info['skills'].append('SQL')
        
        return info

resume_service = ResumeService()
