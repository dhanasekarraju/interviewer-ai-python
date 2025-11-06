# Quick Reference Card

## Startup Commands

**Backend (Terminal 1):**
\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
# Visit: http://localhost:5000/health
\`\`\`

**Frontend (Terminal 2):**
\`\`\`bash
cd frontend
npm install
npm run dev
# Visit: http://localhost:3000
\`\`\`

## Login Credentials

| Role | Email | Password | URL |
|------|-------|----------|-----|
| Admin/HR | admin@test.com | password | /login → /hr/dashboard |
| Candidate | (create via HR invite) | (temp password emailed) | /login → /candidate |

## Key Environment Variables

| Variable | Backend | Frontend | Value |
|----------|---------|----------|-------|
| API URL | DATABASE_URL | NEXT_PUBLIC_API_BASE | http://localhost:5000 |
| AI Key | ANTHROPIC_API_KEY | - | sk-ant-xxxxx |
| Database | DATABASE_URL | - | postgresql://... |

## API Key Setup

1. Go: https://console.anthropic.com
2. Login/Register
3. Click "API Keys"
4. Create new key
5. Copy key starting with `sk-ant-`
6. Add to `backend/.env`: `ANTHROPIC_API_KEY=sk-ant-xxxxx`
7. Restart Flask

## File Locations

\`\`\`
backend/.env                    ← Add ANTHROPIC_API_KEY here
frontend/.env.local             ← Add NEXT_PUBLIC_API_BASE here
backend/app.py                  ← Main Python app
frontend/app/page.tsx           ← Main React app
\`\`\`

## Common Ports

| Service | Port |
|---------|------|
| Flask Backend | 5000 |
| Next.js Frontend | 3000 |
| PostgreSQL | 5432 |

## Create Test Database

\`\`\`bash
createdb interview_app
\`\`\`

## Test the Setup

\`\`\`bash
# Backend health check
curl http://localhost:5000/health

# Frontend available
open http://localhost:3000
\`\`\`

## How to Use

**HR Flow:**
1. Login as admin@test.com
2. Click "Invite Candidate"
3. Upload resume → System creates account
4. Candidate receives temp password
5. View dashboard → All candidates listed

**Candidate Flow:**
1. Login with email + temp password
2. Click "Start New Interview"
3. Answer 5 AI questions (2 min each)
4. Get instant scores and feedback
5. Download report

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Backend won't start | `createdb interview_app` |
| "API key not found" | Check `backend/.env` has ANTHROPIC_API_KEY |
| 404 from frontend | Check NEXT_PUBLIC_API_BASE=http://localhost:5000 |
| CORS error | Backend running? Check port 5000 |
| Database error | Ensure PostgreSQL running |

## Useful Links

- Claude Console: https://console.anthropic.com
- Anthropic Docs: https://docs.anthropic.com
- Next.js Docs: https://nextjs.org/docs
- Flask Docs: https://flask.palletsprojects.com
