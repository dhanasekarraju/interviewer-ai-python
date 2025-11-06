"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { apiFetch, getAuthRole, clearAuth, getUserId } from "@/lib/api"

interface Interview {
  id: number
  status: string
  started_at: string
  completed_at: string
  total_score: number
}

export default function CandidatePage() {
  const router = useRouter()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const role = getAuthRole()
  const userId = getUserId()

  useEffect(() => {
    if (role !== "CANDIDATE") {
      router.replace("/login")
      return
    }
    fetchInterviews()
  }, [role, router])

  // Fetch interviews
  const fetchInterviews = async () => {
    try {
      setLoading(true)
      // First get the candidate id from backend
      const candidateData = await apiFetch<{ id: number }>(`/api/candidates/user/${userId}`)
      const candidateId = candidateData.id

      const data = await apiFetch<Interview[]>(`/api/candidates/${candidateId}/interviews`)
      setInterviews(data)
    } catch (error) {
      console.error("Failed to fetch interviews:", error)
    } finally {
      setLoading(false)
    }
  }

  // Start interview handler
  const handleStartInterview = async () => {
    try {
      setStarting(true)
      // Get candidate id first
      const candidateData = await apiFetch<{ id: number }>(`/api/candidates/user/${userId}`)
      const candidateId = candidateData.id

      interface StartInterviewResponse {
        id: number
        status: string
      }

      const result = await apiFetch<StartInterviewResponse>("/api/interviews/start", {
        method: "POST",
        body: { candidate_id: candidateId },
      })

      // Generate questions
      await apiFetch(`/api/interviews/${result.id}/generate-questions`, {
        method: "POST",
        body: { num_questions: 5, difficulty: "medium" },
      })

      // Redirect to interview page
      router.push(`/candidate/interview/${result.id}`)
    } catch (error) {
      console.error("Failed to start interview:", error)
      alert("Failed to start interview. Please try again.")
    } finally {
      setStarting(false)
    }
  }

  const handleLogout = () => {
    clearAuth()
    router.replace("/login")
  }

  return (
      <div className="space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Candidate Portal</h1>
            <p className="text-muted-foreground">Take AI-powered interviews and view results</p>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </header>

        {/* Start Interview Card */}
        <Card className="p-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Ready for an Interview?</h2>
              <p className="text-muted-foreground mt-2">
                Start a new AI interview. You'll have 2 minutes per question to answer thoughtfully.
              </p>
            </div>
            <Button size="lg" onClick={handleStartInterview} disabled={starting}>
              {starting ? "Starting..." : "Start New Interview"}
            </Button>
          </div>
        </Card>

        {/* Previous Interviews */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Your Interviews</h2>

          {loading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
          ) : interviews.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No interviews yet. Start one above to get feedback on your skills.
              </p>
          ) : (
              <div className="space-y-3">
                {interviews.map((interview) => (
                    <div
                        key={interview.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50"
                    >
                      <div>
                        <p className="font-semibold">Interview #{interview.id}</p>
                        <p className="text-sm text-muted-foreground">
                          Status: <span className="capitalize font-medium">{interview.status}</span>
                        </p>
                        {interview.completed_at && (
                            <p className="text-sm text-muted-foreground">
                              Score:{" "}
                              <span className="font-semibold text-primary">{Math.round(interview.total_score)}/100</span>
                            </p>
                        )}
                      </div>
                      <Button
                          variant="outline"
                          disabled={interview.status !== "completed"}
                          onClick={() => router.push(`/hr/report/${interview.id}`)}
                      >
                        {interview.status === "completed" ? "View Report" : "In Progress"}
                      </Button>
                    </div>
                ))}
              </div>
          )}
        </Card>
      </div>
  )
}
