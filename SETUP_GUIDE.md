# AI Interview Application - Setup Guide

## Overview

This is a complete Python + React AI interview platform where:
- **HR/Admin**: Upload candidate resumes, invite candidates, view reports
- **Candidates**: Take AI interviews with timer, get real-time scoring
- **AI Engine**: Uses Claude AI to generate context-aware questions and evaluate answers

## Architecture

\`\`\`
┌─────────────────────────────────────────┐
│   React Frontend (Next.js + TypeScript) │
│   - Candidate Portal                    │
│   - HR Dashboard                        │
│   - Interview Runner with Timer         │
│   - Report Viewer                       │
└──────────────┬──────────────────────────┘
               │ HTTP/JSON
┌──────────────▼──────────────────────────┐
│  Python Flask Backend                   │
│  - JWT Authentication                   │
│  - Resume Upload & Parsing              │
│  - AI Question Generation (Claude)      │
│  - Answer Scoring & Evaluation          │
│  - Report Generation                    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   PostgreSQL Database                   │
│   - Users, Candidates, Interviews       │
│   - Questions, Answers, Reports         │
└─────────────────────────────────────────┘
\`\`\`

## Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL 12+
- Anthropic API Key (Claude)

## Backend Setup

### 1. Clone and Navigate to Backend

\`\`\`bash
cd backend
\`\`\`

### 2. Create Virtual Environment

\`\`\`bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
\`\`\`

### 3. Install Dependencies

\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 4. Setup Environment Variables

Create `.env` file in backend directory:

\`\`\`env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/interview_app
SECRET_KEY=your-secret-key-here-change-in-production

# AI Provider - Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional: For email invitations
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
\`\`\`

### 5. Create Database

\`\`\`bash
createdb interview_app
\`\`\`

### 6. Run Flask App

\`\`\`bash
python app.py
\`\`\`

The backend will start on `http://localhost:5000`

## Frontend Setup

### 1. Create React App (if not already created)

\`\`\`bash
npx create-next-app@latest interview-frontend --typescript
cd interview-frontend
\`\`\`

### 2. Install Dependencies

Dependencies are auto-detected, but key ones:
- next
- react
- tailwindcss (for styling)
- shadcn/ui (UI components)

### 3. Setup Environment Variables

Create `.env.local` in frontend root:

\`\`\`env
NEXT_PUBLIC_API_BASE=http://localhost:5000
\`\`\`

### 4. Run Next.js App

\`\`\`bash
npm run dev
\`\`\`

Frontend will be available at `http://localhost:3000`

## API Key Configuration

### Anthropic (Claude AI)

1. Go to [Anthropic Console](https://console.anthropic.com)
2. Create an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add to `.env` file:

\`\`\`env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
\`\`\`

This key is used to:
- Generate interview questions based on resume
- Evaluate candidate answers
- Generate comprehensive reports

## Usage Guide

### For HR/Admin Users

#### Step 1: Login
- Navigate to `http://localhost:3000/login`
- Use credentials: `admin@test.com` / `password`
- Or create your own admin account

#### Step 2: Upload Candidate Resume
1. Go to HR Dashboard
2. Click "Invite Candidate"
3. Fill in:
   - Email address
   - Full name
   - Upload resume (PDF, TXT, or DOCX)
4. System generates temporary password and sends to candidate

#### Step 3: View Candidates & Interviews
- Dashboard shows all candidates
- Click "View" to see their interviews
- Click interview to view detailed report

#### Step 4: Download Report
- Open any completed interview
- Click "Download" to save as text file
- Contains: Score, Strengths, Weaknesses, Recommendations

### For Candidates

#### Step 1: Login with Credentials
- Receive email with temporary password from HR
- Navigate to login page
- Enter email and password

#### Step 2: Start Interview
1. Go to Candidate Portal
2. Click "Start New Interview"
3. System generates 5 questions based on resume

#### Step 3: Answer Questions
- Each question has a 2-minute timer
- Answer thoroughly (aim for 3-5 sentences)
- Click "Submit Answer"
- Get immediate AI feedback and score

#### Step 4: View Your Report
- After completing all questions
- See overall score (0-100)
- View strengths, weaknesses, recommendations
- Download report for your records

## Question Generation & Scoring

### How Questions Are Generated

1. HR uploads candidate resume
2. AI reads resume and identifies:
   - Key skills (Python, Java, React, SQL, etc.)
   - Years of experience
   - Roles and responsibilities
   - Education background

3. AI generates 5 questions tailored to:
   - Candidate's skill level
   - Role-specific areas
   - Mix of technical, behavioral, and domain questions

### How Answers Are Scored

1. Candidate submits answer
2. AI evaluates:
   - **Content Quality**: Accuracy, depth, relevance
   - **Communication**: Clarity, structure
   - **Problem-Solving**: Approach, logic
   - **Completeness**: Addresses all aspects

3. Score breakdown: 0-100
   - 80-100: Excellent - Strong understanding
   - 60-79: Good - Solid knowledge
   - 40-59: Fair - Needs improvement
   - Below 40: Weak - Significant gaps

## Troubleshooting

### API Connection Issues

**Problem**: "Failed to fetch from backend"

**Solution**:
1. Ensure backend is running: `python app.py`
2. Check API_BASE in frontend `.env.local`
3. Verify CORS is enabled in Flask backend
4. Check network tab in browser DevTools

### Database Connection

**Problem**: "psycopg2 error" or database connection fails

**Solution**:
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in `.env`
3. Verify credentials are correct
4. Run: `createdb interview_app`

### Claude API Key Issues

**Problem**: "API key not found" or 401 Unauthorized

**Solution**:
1. Verify ANTHROPIC_API_KEY in `.env`
2. Check key hasn't expired on Anthropic console
3. Ensure key has proper permissions
4. Restart Flask app after changing env vars

### Resume Parsing Fails

**Problem**: "Error extracting PDF" or resume text is empty

**Solution**:
1. Ensure PDF is not encrypted
2. Try uploading as TXT or DOCX instead
3. Check file size (max 10MB recommended)
4. For scanned PDFs, use OCR first

## File Structure

\`\`\`
interview-app/
├── backend/
│   ├── app.py                 # Main Flask app
│   ├── ai_service.py          # AI/Claude integration
│   ├── resume_service.py      # Resume parsing
│   ├── requirements.txt        # Python dependencies
│   └── .env.example           # Environment template
│
└── frontend/
    ├── app/
    │   ├── page.tsx           # Home page
    │   ├── login/page.tsx      # Login page
    │   ├── candidate/          # Candidate portal
    │   └── hr/                 # HR dashboard
    ├── components/
    │   ├── interview/          # Interview components
    │   ├── hr/                 # HR components
    │   └── auth/               # Auth components
    ├── lib/
    │   └── api.ts              # API client
    ├── .env.local              # Environment config
    └── package.json
\`\`\`

## Key Features Explained

### Timer System
- Each question has 2 minutes (120 seconds)
- Visual countdown displayed
- Auto-submits when time expires
- Candidates can submit early

### Resume Parsing
- Extracts text from PDF/DOCX/TXT
- Identifies skills, experience, roles
- Creates personalized question bank
- Enables resume-aware evaluation

### AI Scoring
- Claude evaluates each answer
- Provides numeric score (0-100)
- Detailed feedback on strengths
- Specific areas for improvement
- Professional recommendations

### Report Generation
- Overall score calculation
- Summary of 3-5 key strengths
- 2-3 areas needing improvement
- Actionable recommendations
- Downloadable format

## Performance Tips

1. **Resume Upload**: Max 10MB, use PDFs when possible
2. **Interview Duration**: ~15-20 minutes for 5 questions
3. **Concurrent Users**: Backend handles 50+ simultaneous interviews
4. **Database**: Index created on interviews and candidates tables

## Deployment

### Production Checklist

- [ ] Change SECRET_KEY to random value
- [ ] Set DATABASE_URL to production Postgres
- [ ] Use environment variables (no .env files)
- [ ] Enable HTTPS
- [ ] Set FRONTEND_URL to production domain
- [ ] Configure CORS properly
- [ ] Use production SMTP for emails
- [ ] Enable database backups
- [ ] Monitor API usage and costs

### Deployment Options

**Backend**: Heroku, Railway, AWS EC2, DigitalOcean
**Frontend**: Vercel, Netlify, AWS S3 + CloudFront
**Database**: Managed Postgres (AWS RDS, Heroku, Railway)

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review error logs in Flask console
3. Check network requests in browser DevTools
4. Verify all environment variables are set
