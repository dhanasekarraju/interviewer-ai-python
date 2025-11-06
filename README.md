# AI Interview Application

A production-ready AI-powered interview platform built with Python Flask backend and React frontend. Conduct intelligent interviews with real-time scoring, AI-generated questions based on resumes, and comprehensive candidate evaluation reports.

## Demo

**Live Demo**: [Interview App](http://localhost:3000)
- HR Login: `admin@test.com` / `password`
- Candidate: Create account on login page

## Features

- **AI-Powered Questions**: Claude AI generates resume-aware interview questions
- **Real-Time Scoring**: Instant feedback on each answer with scores 0-100
- **Interview Timer**: 2-minute countdown per question with auto-submit
- **Resume Parsing**: Extracts key skills and experience from PDF/DOCX/TXT
- **HR Dashboard**: Manage candidates, send invitations, view reports
- **Detailed Reports**: Strengths, weaknesses, recommendations, downloadable
- **Candidate Portal**: Take interviews, view results, track progress
- **Role-Based Access**: Admin, HR, and Candidate roles with permissions

## Tech Stack

**Backend:**
- Python 3.8+
- Flask (REST API)
- SQLAlchemy (ORM)
- PostgreSQL (Database)
- Anthropic Claude (AI)

**Frontend:**
- React 18+
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui (Components)

**Infrastructure:**
- Docker (optional)
- PostgreSQL 12+
- JWT Authentication

## Quick Start

### 1. Backend Setup (Python)

\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
\`\`\`

Create `.env`:
\`\`\`env
DATABASE_URL=postgresql://postgres:password@localhost:5432/interview_app
SECRET_KEY=your-secret-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
FRONTEND_URL=http://localhost:3000
\`\`\`

Run:
\`\`\`bash
python app.py
# Server runs on http://localhost:5000
\`\`\`

### 2. Frontend Setup (React)

\`\`\`bash
# Install dependencies (auto-detected by Next.js)
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_BASE=http://localhost:5000" > .env.local

# Run development server
npm run dev
# App available at http://localhost:3000
\`\`\`

### 3. Database Setup

\`\`\`bash
createdb interview_app
\`\`\`

The app will auto-create tables on first run.

## Getting Your API Key

### Anthropic (Claude AI) - Required

1. Visit [Anthropic Console](https://console.anthropic.com)
2. Create account or sign in
3. Click "API Keys" in left sidebar
4. Click "Create Key"
5. Name it (e.g., "Interview App")
6. Copy the key starting with `sk-ant-`
7. Add to backend `.env`:
   \`\`\`env
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
   \`\`\`

**What it costs:**
- Free tier: 5 API calls
- Pay-as-you-go: ~$0.003 per question generation, $0.001 per answer scoring
- For 100 candidates: ~$0.50

## Usage Guide

### For HR/Admin

1. **Login**: admin@test.com / password
2. **Upload Resume**: Click "Invite Candidate", select PDF/DOCX with resume
3. **System generates**: 
   - Candidate account
   - Temporary password (sent to email)
4. **View Results**: Dashboard shows all candidates and their interview scores
5. **Download Reports**: Click interview → "Download" for detailed report

### For Candidates

1. **Receive Invite**: Check email for temporary password
2. **Login**: Use email and temp password
3. **Start Interview**: Click "Start New Interview"
4. **Answer Questions**: 5 questions, 2 minutes each
   - AI reads your answer
   - Instant feedback and score
5. **View Report**: After completion, see overall score, strengths, weaknesses, recommendations

## File Structure

\`\`\`
.
├── backend/
│   ├── app.py                    # Flask app, routes, models
│   ├── ai_service.py             # Claude AI integration
│   ├── resume_service.py         # PDF/resume parsing
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example              # Env template
│   └── API_REFERENCE.md          # API documentation
│
├── frontend/ (Next.js App)
│   ├── app/
│   │   ├── page.tsx              # Home page
│   │   ├── login/page.tsx         # Login
│   │   ├── candidate/page.tsx     # Candidate portal
│   │   ├── candidate/interview/[id]/page.tsx
│   │   ├── hr/dashboard/page.tsx  # HR dashboard
│   │   ├── hr/candidates/[id]/page.tsx
│   │   └── hr/report/[id]/page.tsx
│   ├── components/
│   │   ├── interview/interview-runner.tsx
│   │   ├── hr/resume-upload.tsx
│   │   └── auth/login-form.tsx
│   ├── lib/api.ts                # API client
│   ├── .env.local                # Env config
│   └── package.json
│
├── SETUP_GUIDE.md                # Full setup instructions
└── README.md                     # This file
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login and get token

### Candidate
- `GET /api/candidates/:id/interviews` - Get candidate interviews
- `POST /api/interviews/start` - Start new interview
- `GET /api/interviews/:id/questions` - Get interview questions

### Interview
- `POST /api/interviews/:id/generate-questions` - AI generates questions
- `POST /api/interview-questions/:id/answer` - Submit answer, get score

### HR
- `POST /api/hr/invite` - Invite candidate with resume
- `GET /api/hr/candidates` - List all candidates

### Reports
- `GET /api/reports/:interview_id` - Get interview report

See `backend/API_REFERENCE.md` for full documentation.

## How AI Works

### Question Generation
1. HR uploads candidate resume (PDF/DOCX/TXT)
2. System extracts text using PyPDF2
3. Claude reads resume and:
   - Identifies skills (Python, Java, React, SQL, etc.)
   - Determines experience level
   - Notes roles and responsibilities
4. Generates 5 tailored questions:
   - Technical skills questions
   - Behavioral questions
   - Domain-specific questions
   - All related to resume content

### Answer Evaluation
1. Candidate types answer
2. System sends to Claude:
   - Original question
   - Candidate's answer
   - Question difficulty
3. Claude evaluates:
   - Content accuracy and depth
   - Communication clarity
   - Problem-solving approach
   - Completeness
4. Returns:
   - Score 0-100
   - Written feedback
   - Key strengths
   - Areas to improve

### Report Generation
1. All 5 questions answered and scored
2. Claude analyzes patterns:
   - Strongest areas (75+ average)
   - Weakest areas (below 60)
   - Unique recommendations
3. Generates comprehensive report:
   - Overall score (average of 5)
   - Top 3 strengths
   - Top 2 weaknesses
   - 2-3 actionable recommendations

## Scoring Breakdown

- **85-100**: Excellent - Hire immediately
- **70-84**: Good - Strong candidate
- **55-69**: Fair - Consider with caution
- **40-54**: Weak - Likely not suitable
- **Below 40**: Poor - Not recommended

## Troubleshooting

### Backend Won't Start
\`\`\`
Error: psycopg2.OperationalError
\`\`\`
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Run: `createdb interview_app`

### API Key Issues
\`\`\`
Error: ANTHROPIC_API_KEY not found
\`\`\`
- Ensure .env file in backend folder (not frontend)
- Key format: `sk-ant-xxxxx...`
- Restart Flask after changing .env

### Resume Upload Fails
\`\`\`
Error extracting PDF
\`\`\`
- Ensure PDF is not encrypted/password-protected
- Try uploading as TXT or DOCX
- Check file size (max 10MB)

### Frontend Can't Connect to Backend
\`\`\`
Failed to fetch from http://localhost:5000
\`\`\`
- Backend running? Check: `curl http://localhost:5000/health`
- Check NEXT_PUBLIC_API_BASE in .env.local
- Clear browser cache
- Check browser console for CORS errors

## Development

### Run Tests
\`\`\`bash
# Backend
pytest backend/tests/

# Frontend
npm test
\`\`\`

### Code Format
\`\`\`bash
# Backend
black backend/
flake8 backend/

# Frontend
npm run lint
\`\`\`

## Production Deployment

### Environment Variables
\`\`\`env
# Production
DATABASE_URL=postgresql://user:pass@prod-db:5432/interview_app
SECRET_KEY=<generate-random-key>
ANTHROPIC_API_KEY=sk-ant-xxxxx
FRONTEND_URL=https://yourdomain.com
FLASK_ENV=production
DEBUG=False
\`\`\`

### Backend Deployment (Example: Heroku)
\`\`\`bash
git push heroku main
\`\`\`

### Frontend Deployment (Example: Vercel)
\`\`\`bash
vercel deploy --prod
\`\`\`

## Cost Estimate

**Monthly costs** (100 active candidates):
- Claude API: ~$5-10 (question generation + scoring)
- PostgreSQL: $15-50 (managed database)
- Backend hosting: $10-50 (Heroku/Railway)
- Frontend hosting: $0 (Vercel free tier)
- **Total: ~$30-100/month**

## Security Notes

- JWT tokens expire after 24 hours
- Passwords hashed with werkzeug.security
- SQL injection protected (SQLAlchemy ORM)
- CORS configured for frontend origin
- API requires authentication
- Database credentials in env vars only
- Enable HTTPS in production
- Use environment secrets, not committed files

## Future Enhancements

- Voice interviews (text-to-speech/speech-to-text)
- Real-time video recording
- Plagiarism detection
- Skill-based question routing
- Interview scheduling
- Email notifications
- Advanced analytics/charts
- Multi-language support
- Interview templates by role

## Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add feature'`
4. Push: `git push origin feature/new-feature`
5. Submit pull request

## License

MIT License - feel free to use for personal or commercial projects

## Support

For issues:
1. Check SETUP_GUIDE.md
2. Review error logs
3. Check browser DevTools network tab
4. Open GitHub issue with:
   - Error message
   - Steps to reproduce
   - Logs from backend
   - Browser/OS info

---

**Built with** Python, Flask, React, Next.js, and Claude AI
**Last Updated**: January 2024
