"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { apiFetch, getAuthRole } from "@/lib/api"

interface Interview {
  id: number
  status: string
  started_at: string
  completed_at: string
  total_score: number
}

export default function CandidateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const role = getAuthRole()

  useEffect(() => {
    if (role !== "HR" && role !== "ADMIN") {
      router.replace("/login")
      return
    }
    fetchInterviews()
  }, [role, router])

  const fetchInterviews = async () => {
    try {
      setLoading(true)
      const candidateId = Number.parseInt(params.id as string)
      const data = await apiFetch<Interview[]>(`/api/candidates/${candidateId}/interviews`)
      setInterviews(data)
    } catch (error) {
      console.error("Failed to fetch interviews:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Candidate Interviews</h1>
          <p className="text-muted-foreground">View all interviews and reports</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <Card className="p-6">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : interviews.length === 0 ? (
          <p className="text-center text-muted-foreground">No interviews yet</p>
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
                      Score: <span className="font-semibold">{Math.round(interview.total_score)}/100</span>
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => router.push(`/hr/report/${interview.id}`)}
                  disabled={interview.status !== "completed"}
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
