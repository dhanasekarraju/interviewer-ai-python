"use client"
import { useState } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"

type StartResp = { interviewId: string; status: string }
type Question = { questionId: string; content: string; category: string; difficulty: string }
type SubmitResp = { score: number; notes: string; hasMoreQuestions: boolean }

export function InterviewRunner() {
  const [interviewId, setInterviewId] = useState<string | null>(null)
  const [question, setQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startInterview() {
    setLoading(true)
    setError(null)
    setCompleted(false)
    setQuestion(null)
    try {
      const started = await apiFetch<StartResp>("/api/candidate/interviews/start", {
        method: "POST",
        body: { mode: "text", model: "openai/gpt-5-mini" },
      })
      setInterviewId(started.interviewId)
      // get first question
      const q = await apiFetch<Question>(`/api/candidate/interviews/${started.interviewId}/next-question`)
      setQuestion(q)
    } catch (err: any) {
      setError(err?.message || "Failed to start interview")
    } finally {
      setLoading(false)
    }
  }

  async function submitAnswer() {
    if (!interviewId || !question) return
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch<SubmitResp>(`/api/candidate/interviews/${interviewId}/submit-answer`, {
        method: "POST",
        body: { questionId: question.questionId, text: answer, audioUrl: null, transcript: null },
      })
      setAnswer("")
      if (res.hasMoreQuestions) {
        const q = await apiFetch<Question>(`/api/candidate/interviews/${interviewId}/next-question`)
        setQuestion(q)
      } else {
        setCompleted(true)
        setQuestion(null)
      }
    } catch (err: any) {
      setError(err?.message || "Failed to submit answer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview</CardTitle>
        <CardDescription>Answer questions to complete your interview</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {!interviewId ? (
          <Button onClick={startInterview} disabled={loading}>
            {loading ? "Starting..." : "Start Interview"}
          </Button>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {question ? (
          <div className="grid gap-3">
            <div className="p-3 rounded-md bg-muted">
              <p className="font-medium">Question</p>
              <p className="text-pretty">{question.content}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Category: {question.category} • Difficulty: {question.difficulty}
              </p>
            </div>
            <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer..." />
            <div className="flex items-center gap-2">
              <Button onClick={submitAnswer} disabled={loading || !answer.trim()}>
                {loading ? "Submitting..." : "Submit Answer"}
              </Button>
            </div>
          </div>
        ) : null}

        {completed ? (
          <div className="p-3 rounded-md bg-emerald-50 text-emerald-800">
            Interview completed. Thank you! HR will review your report.
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
