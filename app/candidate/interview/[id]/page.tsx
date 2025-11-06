"use client"

import { useParams } from "next/navigation"
import InterviewRunner from "@/components/interview/interview-runner"
import { getAuthRole } from "@/lib/api"
import { useEffect, useState } from "react"

export default function InterviewPage() {
  const params = useParams()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const role = getAuthRole()
    if (role === "CANDIDATE") {
      setAuthorized(true)
    }
  }, [])

  if (!authorized) {
    return <div className="text-center py-8">Unauthorized</div>
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">AI Interview</h1>
        <p className="text-muted-foreground">Answer questions thoughtfully. Each question has a timer.</p>
      </header>

      <InterviewRunner interviewId={Number.parseInt(params.id as string)} />
    </div>
  )
}
