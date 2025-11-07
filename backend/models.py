import uuid
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='CANDIDATE')  # ADMIN, HR, CANDIDATE
    status = db.Column(db.String(50), nullable=False, default='active')
    enabled = db.Column(db.Boolean, nullable=False, default=True)
    username = db.Column(db.String(255), nullable=False, default=lambda: 'user_' + str(uuid.uuid4())[:8])
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    candidates = db.relationship('Candidate', backref='user', lazy=True)

    def __repr__(self):
        return f"<User {self.email}>"

class Candidate(db.Model):
    __tablename__ = 'candidates'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    accent_preference = db.Column(db.String(50), default='us')  # us, uk, indian
    resume_url = db.Column(db.String(500))
    resume_text = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    interviews = db.relationship('Interview', backref='candidate', lazy=True)

    def __repr__(self):
        return f"<Candidate {self.full_name}>"

class Interview(db.Model):
    __tablename__ = 'interviews'
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidates.id'), nullable=False)
    status = db.Column(db.String(50), default='pending')  # pending, active, completed
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    mode = db.Column(db.String(50), default='text')  # text or voice
    total_score = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    questions = db.relationship('InterviewQuestion', backref='interview', lazy=True, cascade='all, delete-orphan')
    report = db.relationship('Report', backref='interview', uselist=False, cascade='all, delete-orphan')

    def __repr__(self):
        return f"<Interview {self.id} for Candidate {self.candidate_id}>"

class InterviewQuestion(db.Model):
    __tablename__ = 'interview_questions'
    id = db.Column(db.Integer, primary_key=True)
    interview_id = db.Column(db.Integer, db.ForeignKey('interviews.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100))
    difficulty = db.Column(db.String(20))
    time_limit_seconds = db.Column(db.Integer, default=120)
    asked_at = db.Column(db.DateTime, default=datetime.utcnow)
    response_text = db.Column(db.Text)
    score = db.Column(db.Float, default=0)
    feedback = db.Column(db.Text)

    def __repr__(self):
        return f"<Question {self.id} ({self.category})>"

class Report(db.Model):
    __tablename__ = 'reports'
    id = db.Column(db.Integer, primary_key=True)
    interview_id = db.Column(db.Integer, db.ForeignKey('interviews.id'), nullable=False)
    overall_score = db.Column(db.Float)
    strengths = db.Column(db.JSON)
    weaknesses = db.Column(db.JSON)
    recommendations = db.Column(db.JSON)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Report {self.id} (Interview {self.interview_id})>"