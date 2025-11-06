"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { apiFetch, getAuthRole, clearAuth } from "@/lib/api"
import ResumeUpload from "@/components/hr/resume-upload"

interface Candidate {
  id: number
  full_name: string
  user_email: string
  created_at: string
  interview_count: number
}

export default function HRDashboard() {
  const router = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const role = getAuthRole()

  useEffect(() => {
    if (role !== "HR" && role !== "ADMIN") {
      router.replace("/login")
      return
    }
    fetchCandidates()
  }, [role, router])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<Candidate[]>("/api/hr/candidates")
      setCandidates(data)
    } catch (error) {
      console.error("Failed to fetch candidates:", error)
    } finally {
      setLoading(false)
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
          <h1 className="text-3xl font-bold">HR Dashboard</h1>
          <p className="text-muted-foreground">Manage candidates and interviews</p>
        </div>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </header>

      <ResumeUpload onSuccess={fetchCandidates} />

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Candidates</h2>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : candidates.length === 0 ? (
          <p className="text-center text-muted-foreground">No candidates yet. Upload a resume to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Interviews</th>
                  <th className="text-left py-3 px-4 font-semibold">Joined</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.id} className="border-b hover:bg-secondary/50">
                    <td className="py-3 px-4">{candidate.full_name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{candidate.user_email}</td>
                    <td className="py-3 px-4">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold">
                        {candidate.interview_count}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {new Date(candidate.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/hr/candidates/${candidate.id}`)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
