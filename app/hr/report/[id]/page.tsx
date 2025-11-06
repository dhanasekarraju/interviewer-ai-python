"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { apiFetch, getAuthRole } from "@/lib/api"

interface Report {
  id: number
  candidate_name: string
  overall_score: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  generated_at: string
}

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const role = getAuthRole()

  useEffect(() => {
    if (role !== "HR" && role !== "ADMIN") {
      router.replace("/login")
      return
    }
    fetchReport()
  }, [role, router])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const interviewId = Number.parseInt(params.id as string)
      const data = await apiFetch<Report>(`/api/reports/${interviewId}`)
      setReport(data)
    } catch (err: any) {
      setError(err.message || "Failed to load report")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!report) return
    // Simple PDF generation - can use libraries like jsPDF for more features
    const content = `
INTERVIEW REPORT
================
Candidate: ${report.candidate_name}
Overall Score: ${Math.round(report.overall_score)}/100
Generated: ${new Date(report.generated_at).toLocaleString()}

STRENGTHS
---------
${report.strengths.map((s, i) => `${i + 1}. ${s}`).join("\n")}

WEAKNESSES
----------
${report.weaknesses.map((w, i) => `${i + 1}. ${w}`).join("\n")}

RECOMMENDATIONS
---------------
${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}
    `
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content))
    element.setAttribute("download", `report-${report.candidate_name}-${report.id}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Interview Report</h1>
          <p className="text-muted-foreground">Candidate evaluation and feedback</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button onClick={handleDownloadPDF} disabled={!report}>
            Download
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className="p-8 text-center">
          <p>Loading report...</p>
        </Card>
      ) : error ? (
        <Card className="p-8 border-destructive bg-destructive/5">
          <p className="text-destructive">{error}</p>
        </Card>
      ) : report ? (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Overall Score</p>
                <p className="text-4xl font-bold">{Math.round(report.overall_score)}/100</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-sm">Candidate</p>
                <p className="text-xl font-semibold">{report.candidate_name}</p>
              </div>
            </div>
          </Card>

          {/* Strengths */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Strengths</h2>
            <div className="space-y-2">
              {report.strengths.length > 0 ? (
                report.strengths.map((strength, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <span className="text-green-600 dark:text-green-400 font-bold mt-0.5">✓</span>
                    <p className="text-sm">{strength}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No strengths recorded</p>
              )}
            </div>
          </Card>

          {/* Weaknesses */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Areas for Improvement</h2>
            <div className="space-y-2">
              {report.weaknesses.length > 0 ? (
                report.weaknesses.map((weakness, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                    <span className="text-yellow-600 dark:text-yellow-400 font-bold mt-0.5">!</span>
                    <p className="text-sm">{weakness}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No weaknesses recorded</p>
              )}
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Recommendations</h2>
            <div className="space-y-2">
              {report.recommendations.length > 0 ? (
                report.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">→</span>
                    <p className="text-sm">{rec}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No recommendations</p>
              )}
            </div>
          </Card>

          <Card className="p-4 bg-muted">
            <p className="text-xs text-muted-foreground">
              Report generated on {new Date(report.generated_at).toLocaleString()}
            </p>
          </Card>
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p>Report not found</p>
        </Card>
      )}
    </div>
  )
}
