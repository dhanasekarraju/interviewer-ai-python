# API Reference

## Authentication

### POST /api/auth/register
Register a new user (HR, Admin, or Candidate)

**Request:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "secure-password",
  "role": "CANDIDATE"  // or "HR", "ADMIN"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": 1,
  "email": "user@example.com",
  "role": "CANDIDATE"
}
\`\`\`

### POST /api/auth/login
Login with email and password

**Request:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "secure-password"
}
\`\`\`

**Response:**
\`\`\`json
{
  "token": "eyJ0eXAiOiJKV1QiLC...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "CANDIDATE"
  }
}
\`\`\`

**Use token in header:**
\`\`\`
Authorization: Bearer <token>
\`\`\`

## Candidate Endpoints

### GET /api/candidates/:candidate_id/interviews
Get all interviews for a candidate

**Response:**
\`\`\`json
[
  {
    "id": 1,
    "status": "completed",
    "started_at": "2024-01-15T10:30:00",
    "completed_at": "2024-01-15T10:45:00",
    "total_score": 78.5
  }
]
\`\`\`

## Interview Endpoints

### POST /api/interviews/start
Start a new interview for a candidate

**Request:**
\`\`\`json
{
  "candidate_id": 1
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": 5,
  "status": "active",
  "started_at": "2024-01-15T10:30:00"
}
\`\`\`

### GET /api/interviews/:interview_id/questions
Get all questions for an interview

**Response:**
\`\`\`json
[
  {
    "id": 1,
    "question_text": "What is your experience with Python?",
    "category": "technical",
    "difficulty": "medium",
    "time_limit_seconds": 120,
    "score": 0,
    "feedback": null
  }
]
\`\`\`

### POST /api/interviews/:interview_id/generate-questions
Generate AI questions based on candidate resume

**Request:**
\`\`\`json
{
  "num_questions": 5,
  "difficulty": "medium"
}
\`\`\`

**Response:**
\`\`\`json
{
  "interview_id": 5,
  "questions": [
    {
      "question_text": "...",
      "category": "technical",
      "difficulty": "medium",
      "time_limit_seconds": 120
    }
  ],
  "count": 5
}
\`\`\`

### POST /api/interview-questions/:question_id/answer
Submit an answer to a question

**Request:**
\`\`\`json
{
  "answer": "I have 5 years of Python experience..."
}
\`\`\`

**Response:**
\`\`\`json
{
  "score": 82,
  "feedback": "Great response showing strong understanding...",
  "strengths": ["Clear explanation", "Relevant examples"],
  "areas_for_improvement": ["Could mention testing"]
}
\`\`\`

### POST /api/interviews/:interview_id/complete
Mark interview as complete and calculate final score

**Response:**
\`\`\`json
{
  "status": "completed",
  "score": 78.5
}
\`\`\`

## HR Endpoints

### POST /api/hr/invite
Invite a candidate with resume

**Request (FormData):**
- email: "candidate@example.com"
- full_name: "John Doe"
- resume: (File object)

**Response:**
\`\`\`json
{
  "id": 2,
  "email": "candidate@example.com",
  "full_name": "John Doe",
  "temp_password": "generated-temp-password"
}
\`\`\`

### GET /api/hr/candidates
Get all candidates

**Response:**
\`\`\`json
[
  {
    "id": 1,
    "full_name": "Jane Smith",
    "user_email": "jane@example.com",
    "created_at": "2024-01-14T15:20:00",
    "interview_count": 2
  }
]
\`\`\`

## Report Endpoints

### GET /api/reports/:interview_id
Get report for a completed interview

**Response:**
\`\`\`json
{
  "id": 1,
  "candidate_name": "John Doe",
  "overall_score": 78.5,
  "strengths": [
    "Strong technical knowledge",
    "Clear communication"
  ],
  "weaknesses": [
    "Needs more practical experience",
    "Could improve problem-solving approach"
  ],
  "recommendations": [
    "Practice system design problems",
    "Build more real-world projects"
  ],
  "generated_at": "2024-01-15T11:00:00"
}
\`\`\`

## Error Responses

### 400 Bad Request
\`\`\`json
{
  "error": "Email and full name required"
}
\`\`\`

### 401 Unauthorized
\`\`\`json
{
  "error": "Invalid credentials"
}
\`\`\`

### 404 Not Found
\`\`\`json
{
  "error": "Interview not found"
}
\`\`\`

### 500 Server Error
\`\`\`json
{
  "error": "Internal server error"
}
\`\`\`

## Rate Limiting

- No rate limiting in development
- Production: 100 requests/minute per IP

## Pagination

Not yet implemented. All results return in single response.

## WebSocket Support

Not yet implemented. Use polling for real-time updates.
