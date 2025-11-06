import uuid
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

load_dotenv()

app = Flask(__name__)
CORS(app)

# ==================== Config ====================
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres:postgres@localhost:5432/interviewdb'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-prod')

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'pdf', 'txt', 'docx'}

db = SQLAlchemy(app)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ==================== Models ====================

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

# ==================== Routes ====================

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200

# ---------- Candidate Invite ----------
@app.route('/api/hr/invite', methods=['POST'])
def invite_candidate():
    data = request.form
    email = data.get('email')
    full_name = data.get('full_name')
    file = request.files.get('resume')

    if not email or not full_name:
        return jsonify({'error': 'Email and full name required'}), 400

    # Check if user exists
    user = User.query.filter_by(email=email).first()
    if not user:
        temp_password = "Welcome123"
        user = User(
            email=email,
            password_hash=generate_password_hash(temp_password),
            role='CANDIDATE'
        )
        db.session.add(user)
        db.session.flush()  # to get user.id
    else:
        temp_password = None

    resume_text = ""
    resume_url = None
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        with open(filepath, 'r', errors='ignore') as f:
            resume_text = f.read()
        resume_url = f"/uploads/{filename}"

    candidate = Candidate(
        user_id=user.id,
        full_name=full_name,
        resume_text=resume_text,
        resume_url=resume_url
    )
    db.session.add(candidate)
    db.session.commit()

    return jsonify({
        'id': candidate.id,
        'email': email,
        'full_name': full_name,
        'temp_password': temp_password
    }), 201

# ---------- Start Interview ----------
@app.route('/api/interviews/start', methods=['POST'])
def start_interview():
    data = request.json
    candidate_id = data.get('candidate_id')

    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return jsonify({'error': f'Candidate {candidate_id} not found'}), 404

    interview = Interview(
        candidate_id=candidate.id,
        status='active',
        started_at=datetime.utcnow()
    )
    db.session.add(interview)
    db.session.commit()

    return jsonify({'id': interview.id, 'status': 'active'}), 201

@app.route('/api/candidates/user/<int:user_id>', methods=['GET'])
def get_candidate_by_user(user_id):
    candidate = Candidate.query.filter_by(user_id=user_id).first()
    if not candidate:
        return jsonify({'error': 'Candidate not found'}), 404
    return jsonify({'id': candidate.id, 'full_name': candidate.full_name}), 200

# ---------- Generate Questions ----------
@app.route('/api/interviews/<int:interview_id>/generate-questions', methods=['POST'])
def generate_questions(interview_id):
    interview = Interview.query.get(interview_id)
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404

    candidate = interview.candidate
    resume_text = candidate.resume_text or "No resume provided"
    data = request.json
    num_questions = data.get('num_questions', 5)
    difficulty = data.get('difficulty', 'medium')

    # Placeholder AI questions
    questions = [
        {'question_text': f"Question {i+1} based on resume", 'category': 'general', 'difficulty': difficulty}
        for i in range(num_questions)
    ]

    for q in questions:
        question = InterviewQuestion(
            interview_id=interview.id,
            question_text=q['question_text'],
            category=q['category'],
            difficulty=q['difficulty']
        )
        db.session.add(question)

    db.session.commit()
    return jsonify({'interview_id': interview.id, 'questions': questions, 'count': len(questions)}), 201

# ---------- Submit Answer ----------
@app.route('/api/interview-questions/<int:question_id>/answer', methods=['POST'])
def submit_answer(question_id):
    question = InterviewQuestion.query.get(question_id)
    if not question:
        return jsonify({'error': 'Question not found'}), 404

    data = request.json
    answer_text = data.get('answer')

    # Fake AI scoring
    score = 10  # max 10 points
    feedback = "Good answer"

    question.response_text = answer_text
    question.score = score
    question.feedback = feedback

    db.session.commit()
    return jsonify({'score': score, 'feedback': feedback}), 200

# ==================== App Entry ====================
if __name__ == '__main__':
    with app.app_context():
        db.create_all()

        # Create demo admin
        demo_admin_email = "admin@test.com"
        demo_admin_password = "password"
        demo_admin = User.query.filter_by(email=demo_admin_email).first()
        if not demo_admin:
            demo_admin = User(
                email=demo_admin_email,
                password_hash=generate_password_hash(demo_admin_password),
                role="ADMIN",
                username="admin"
            )
            db.session.add(demo_admin)
            db.session.commit()
            print(f"Demo admin created: {demo_admin_email} / {demo_admin_password}")
        else:
            print("Demo admin already exists")

    app.run(debug=True, port=5000)
