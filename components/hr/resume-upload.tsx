"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { apiFetchFormData } from "@/lib/api"

interface ResumeUploadProps {
  onSuccess?: (data: any) => void
}

export default function ResumeUpload({ onSuccess }: ResumeUploadProps) {
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !fullName) {
      setError("Email and full name are required")
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("email", email)
      formData.append("full_name", fullName)
      if (file) {
        formData.append("resume", file)
      }

      const result = await apiFetchFormData("/api/hr/invite", formData, { method: "POST" })

      setSuccess(true)
      setEmail("")
      setFullName("")
      setFile(null)

      if (onSuccess) {
        onSuccess(result)
      }
    } catch (err: any) {
      setError(err.message || "Failed to invite candidate")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Invite Candidate</h2>

      {success && (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <p className="text-green-700 dark:text-green-300">
            Candidate invited successfully! Temporary password sent to {email}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            placeholder="candidate@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Resume (PDF, TXT, or DOCX)</label>
          <input
            type="file"
            onChange={(e) => setFile(e.files?.[0] || null)}
            accept=".pdf,.txt,.docx"
            className="w-full px-3 py-2 border border-input rounded-lg bg-background"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Inviting..." : "Invite Candidate"}
        </Button>
      </form>
    </Card>
  )
}
