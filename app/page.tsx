"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getAuthRole, getAuthToken } from "@/lib/api"

export default function HomePage() {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const authRole = getAuthRole()
    const authToken = getAuthToken()

    if (authToken && authRole) {
      // User is already logged in, redirect
      if (authRole === "HR" || authRole === "ADMIN") {
        router.replace("/hr/dashboard")
      } else {
        router.replace("/candidate")
      }
    } else {
      setRole(null)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto max-w-4xl p-6 space-y-12">
        {/* Hero */}
        <section className="text-center space-y-6 py-12">
          <h1 className="text-5xl font-bold text-balance">AI-Powered Interview Platform</h1>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Conduct intelligent interviews powered by AI. Get detailed candidate evaluations, strengths analysis, and
            actionable recommendations.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href="/login">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-2">For Candidates</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ AI-powered interview questions</li>
              <li>✓ Real-time scoring and feedback</li>
              <li>✓ Detailed performance reports</li>
              <li>✓ 2-minute timer per question</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-2">For HR Teams</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Resume-aware questions</li>
              <li>✓ Bulk candidate invitations</li>
              <li>✓ Comprehensive score reports</li>
              <li>✓ Candidate dashboard</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-2">AI Engine</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Claude AI integration</li>
              <li>✓ Smart answer evaluation</li>
              <li>✓ Strength/weakness analysis</li>
              <li>✓ Personalized recommendations</li>
            </ul>
          </Card>
        </section>

        {/* Footer */}
        <section className="text-center py-12 border-t">
          <p className="text-muted-foreground">Ready to revolutionize your hiring process?</p>
          <Button size="lg" className="mt-4" asChild>
            <Link href="/login">Sign In Now</Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
