"use client"
import { useState } from "react"
import type React from "react"

import { apiFetch, apiFetchFormData } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"

export function InviteForm() {
  const { role } = useAuth()
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [result, setResult] = useState<{ email: string; tempPassword: string; token: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      let data: { email: string; tempPassword: string; token: string }
      if (resumeFile) {
        // Use multipart when a resume is provided
        const fd = new FormData()
        fd.append("email", email)
        fd.append("fullName", fullName)
        fd.append("resume", resumeFile)
        // Backend should parse resume, create candidate, and send invite email
        data = await apiFetchFormData<{ email: string; tempPassword: string; token: string }>("/api/auth/invite", fd, {
          method: "POST",
        })
      } else {
        // Fallback JSON invite without resume
        data = await apiFetch<{ email: string; tempPassword: string; token: string }>("/api/auth/invite", {
          method: "POST",
          body: { email, fullName },
        })
      }
      setResult(data)
    } catch (err: any) {
      setError(err?.message || "Failed to invite candidate")
    } finally {
      setLoading(false)
    }
  }

  const inviteText = result ? `Candidate temporary password: ${result.tempPassword}` : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Candidate</CardTitle>
        <CardDescription>Send a login to a candidate. Your role: {role}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 max-w-md" encType="multipart/form-data">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="resume">Resume (PDF/DOC/DOCX)</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={loading}>
            {loading ? "Inviting..." : "Send Invite"}
          </Button>
          {inviteText ? (
            <div className="text-sm mt-2">
              <p className="font-medium">Invite created</p>
              <p className="text-muted-foreground">{inviteText}</p>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  )
}
