"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { apiFetch, setAuth } from "@/lib/api"

interface LoginResponse {
  token: string
  user: {
    id: number
    email: string
    role: string
  }
}

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    try {
      setLoading(true)
      const data = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: { email, password },
      })

      setAuth(data.token, data.user.role, data.user.id)

      // Redirect based on role
      if (data.user.role === "HR" || data.user.role === "ADMIN") {
        router.replace("/hr/dashboard")
      } else {
        router.replace("/candidate")
      }
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md p-6">
      <h1 className="text-2xl font-bold mb-2">AI Interview Platform</h1>
      <p className="text-muted-foreground mb-6">Sign in to continue</p>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive px-3 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground text-center mt-4">Demo credentials: admin@test.com / password</p>
    </Card>
  )
}
