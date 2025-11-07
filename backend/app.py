import os
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

from models import db, User, Candidate, Interview, InterviewQuestion, Report
from services.interview_flow_service import InterviewFlowService

load_dotenv()

app = Flask(__name__)
CORS(app)

# Config
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/interviewdb')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-prod')
app.config['OPENAI_API_KEY'] = os.getenv('OPENAI_API_KEY')

print(os.getenv('OPENAI_API_KEY'))

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'pdf', 'txt', 'docx'}

db.init_app(app)

flow = InterviewFlowService()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def serialize_question(q: InterviewQuestion):
    return {
        'id': q.id,
        'question_text': q.question_text,
        'category': q.category,
        'difficulty': q.difficulty,
        'time_limit_seconds': q.time_limit_seconds,
        'score': float(q.score or 0),
        'feedback': q.feedback or ""
    }

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200

# Serve uploaded files
@app.route('/uploads/<path:filename>', methods=['GET'])
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=False)

# Auth
@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return ('', 204)
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip()
    password = data.get('password') or ''

    demo_enabled = os.getenv('DEMO_ENABLED', 'true').lower() == 'true'
    demo_email = os.getenv('DEMO_EMAIL', 'admin@test.com')
    demo_password = os.getenv('DEMO_PASSWORD', 'password')

    if demo_enabled and email == demo_email and password == demo_password:
        return jsonify({
            'message': 'Logged in as demo admin',
            'user': {'id': 'demo', 'email': demo_email, 'role': 'ADMIN', 'username': 'admin'},
            'token': 'demo-token'
        }), 200

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password_hash, password):
        return jsonify({
            'message': 'Logged in',
            'user': {'id': user.id, 'email': user.email, 'role': user.role, 'username': user.username},
            'token': f'user-{user.id}-token'
        }), 200

    return jsonify({'error': 'Invalid credentials'}), 401

# Candidate Invite
@app.route('/api/hr/invite', methods=['POST'])
def invite_candidate():
    data = request.form
    email = data.get('email')
    full_name = data.get('full_name')
    file = request.files.get('resume')

    if not email or not full_name:
        return jsonify({'error': 'Email and full name required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        temp_password = "Welcome123"
        user = User(email=email, password_hash=generate_password_hash(temp_password), role='CANDIDATE')
        db.session.add(user)
        db.session.flush()
    else:
        temp_password = None

    resume_text = ""
    resume_url = None
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        ext = filename.rsplit('.', 1)[1].lower()
        resume_text = flow.extract_resume_text(filepath, ext)
        resume_url = f"/uploads/{filename}"

    candidate = Candidate(user_id=user.id, full_name=full_name, resume_text=resume_text, resume_url=resume_url)
    db.session.add(candidate)
    db.session.commit()

    return jsonify({
        'id': candidate.id,
        'email': email,
        'full_name': full_name,
        'temp_password': temp_password
    }), 201

# Start Interview
@app.route('/api/interviews/start', methods=['POST', 'OPTIONS'])
def start_interview():
    if request.method == 'OPTIONS':
        return ('', 204)

    data = request.get_json(silent=True) or {}
    candidate_id = data.get('candidate_id')
    user_id = data.get('user_id')  # optional if your frontend sends user_id

    # If candidate_id is not provided, try to resolve via user_id or token (if you have auth middleware)
    if not candidate_id and user_id:
        candidate = Candidate.query.filter_by(user_id=user_id).first()
        if not candidate:
            return jsonify({'error': f'No candidate found for user_id {user_id}. Ensure HR invite or candidate profile creation.'}), 404
        candidate_id = candidate.id

    if not candidate_id:
        return jsonify({'error': 'candidate_id is required. Pass {"candidate_id": <id>} in JSON body or include user_id.'}), 400

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

# Generate Questions (explicit)
@app.route('/api/interviews/<int:interview_id>/generate-questions', methods=['POST'])
def generate_questions(interview_id):
    interview = db.session.get(Interview, interview_id)  # SQLAlchemy 2 style
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404

    candidate = interview.candidate
    resume_text = (candidate.resume_text or "").strip()
    data = request.get_json(silent=True) or {}
    num_questions = int(data.get('num_questions', 5))
    difficulty = data.get('difficulty', 'medium')

    # Use flow to generate questions; it already handles empty resume_text with a heuristic fallback
    items = flow.generate_questions(resume_text, difficulty, num_questions)

    created = []
    for q in items[:num_questions]:
        question = InterviewQuestion(
            interview_id=interview.id,
            question_text=q.get('question_text', 'General question'),
            category=q.get('category', 'general'),
            difficulty=q.get('difficulty', difficulty),
            time_limit_seconds=int(q.get('time_limit_seconds', 120))
        )
        db.session.add(question)
        created.append(question)
    db.session.commit()

    return jsonify({
        'interview_id': interview.id,
        'questions': [serialize_question(q) for q in created],
        'count': len(created)
    }), 201

# Fetch Questions (auto-generate if none)
@app.route('/api/interviews/<int:interview_id>/questions', methods=['GET'])
def get_interview_questions(interview_id):
    interview = Interview.query.get(interview_id)
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404

    qs = InterviewQuestion.query.filter_by(interview_id=interview_id).order_by(InterviewQuestion.id.asc()).all()
    if not qs:
        candidate = interview.candidate
        resume_text = (candidate.resume_text or "").strip()
        if not resume_text:
            return jsonify({'error': 'Resume not uploaded or could not be parsed'}), 400
        items = flow.generate_questions(resume_text, 'medium', 5)
        for q in items:
            question = InterviewQuestion(
                interview_id=interview.id,
                question_text=q.get('question_text', 'General question'),
                category=q.get('category', 'general'),
                difficulty=q.get('difficulty', 'medium'),
                time_limit_seconds=int(q.get('time_limit_seconds', 120))
            )
            db.session.add(question)
        db.session.commit()
        qs = InterviewQuestion.query.filter_by(interview_id=interview_id).order_by(InterviewQuestion.id.asc()).all()

    return jsonify([serialize_question(q) for q in qs]), 200

# Submit Answer (with full feedback)
@app.route('/api/interviews/<int:interview_id>/submit', methods=['POST', 'OPTIONS'])
def submit_answer(interview_id):
    if request.method == 'OPTIONS':
        return ("", 200)

    payload = request.get_json(force=True)
    question = ...  # load question by interview_id or from payload
    answer_text = payload.get('answer_text', '')
    difficulty = getattr(question, 'difficulty', None) or 'medium'

    from services.interview_flow_service import InterviewFlowService
    flow = InterviewFlowService()

    # Debug:
    import inspect
    print("[submit_answer] InterviewFlowService source ok?", hasattr(flow, "score_answer"))
    result = flow.score_answer(question.question_text, answer_text, difficulty)
    return jsonify(result)

# Complete Interview + Generate Report
@app.route('/api/interviews/<int:interview_id>/complete', methods=['POST'])
def complete_interview(interview_id):
    interview = Interview.query.get(interview_id)
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404

    interview.status = 'completed'
    interview.completed_at = datetime.utcnow()

    questions = InterviewQuestion.query.filter_by(interview_id=interview_id).all()
    qa_results = []
    if questions:
        interview.total_score = sum(float(q.score or 0) for q in questions) / len(questions)
        qa_results = [{"category": q.category, "score": float(q.score or 0), "feedback": q.feedback or ""} for q in questions]

    # Generate report
    candidate = interview.candidate
    report_data = flow.generate_report(candidate.full_name, qa_results)

    # Persist report
    report = interview.report
    if report is None:
        report = Report(
            interview_id=interview.id,
            overall_score=float(report_data.get('overall_score', interview.total_score or 0)),
            strengths=report_data.get('strengths', []),
            weaknesses=report_data.get('weaknesses', []),
            recommendations=report_data.get('recommendations', [])
        )
        db.session.add(report)
    else:
        report.overall_score = float(report_data.get('overall_score', interview.total_score or 0))
        report.strengths = report_data.get('strengths', [])
        report.weaknesses = report_data.get('weaknesses', [])
        report.recommendations = report_data.get('recommendations', [])

    db.session.commit()
    return jsonify({
        'id': interview.id,
        'status': interview.status,
        'total_score': interview.total_score,
        'report': {
            'overall_score': report.overall_score,
            'strengths': report.strengths,
            'weaknesses': report.weaknesses,
            'recommendations': report.recommendations
        }
    }), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

        # Optional: seed demo admin for quick login
        demo_admin_email = os.getenv('DEMO_EMAIL', 'admin@test.com')
        demo_admin_password = os.getenv('DEMO_PASSWORD', 'password')
        from werkzeug.security import generate_password_hash
        existing = User.query.filter_by(email=demo_admin_email).first()
        if not existing:
            admin = User(
                email=demo_admin_email,
                password_hash=generate_password_hash(demo_admin_password),
                role="ADMIN",
                username="admin"
            )
            db.session.add(admin)
            db.session.commit()
            print(f"Demo admin created: {demo_admin_email} / {demo_admin_password}")
        else:
            print("Demo admin already exists")

    app.run(debug=True, port=8080)