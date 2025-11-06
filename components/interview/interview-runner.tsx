"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { apiFetch } from "@/lib/api"

interface Question {
  id: number
  question_text: string
  category: string
  difficulty: string
  time_limit_seconds: number
  score: number
  feedback: string
}

interface InterviewRunnerProps {
  interviewId: number
}

export default function InterviewRunner({ interviewId }: InterviewRunnerProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(true)
  const [isAnswering, setIsAnswering] = useState(false)
  const [feedback, setFeedback] = useState<any>(null)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [interviewId])

  useEffect(() => {
    if (!questions.length || isAnswering || completed) return

    const currentQuestion = questions[currentIndex]
    if (!timeLeft && currentQuestion) {
      setTimeLeft(currentQuestion.time_limit_seconds)
      return
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up, auto-submit
          handleSubmitAnswer()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft, questions, currentIndex, isAnswering, completed])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<Question[]>(`/api/interviews/${interviewId}/questions`)
      setQuestions(data)
      if (data.length > 0) {
        setTimeLeft(data[0].time_limit_seconds)
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !questions[currentIndex]) return

    try {
      setIsAnswering(true)
      const questionId = questions[currentIndex].id

      const result = await apiFetch(`/api/interview-questions/${questionId}/answer`, {
        method: "POST",
        body: { answer },
      })

      setFeedback(result)
      setAnswer("")
    } catch (error) {
      console.error("Failed to submit answer:", error)
    } finally {
      setIsAnswering(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setTimeLeft(questions[currentIndex + 1].time_limit_seconds)
      setFeedback(null)
    } else {
      finishInterview()
    }
  }

  const finishInterview = async () => {
    try {
      await apiFetch(`/api/interviews/${interviewId}/complete`, { method: "POST" })
      setCompleted(true)
    } catch (error) {
      console.error("Failed to complete interview:", error)
    }
  }

  if (loading) return <div className="text-center py-8">Loading questions...</div>

  if (completed) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Interview Completed!</h2>
        <p className="text-muted-foreground mb-6">Thank you for completing the interview.</p>
        <Button asChild>
          <a href="/candidate">Back to Dashboard</a>
        </Button>
      </Card>
    )
  }

  if (!questions.length) return <div className="text-center py-8">No questions generated</div>

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className={`font-semibold ${timeLeft < 30 ? "text-destructive" : ""}`}>
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-6">
        <div className="mb-4">
          <div className="flex gap-2 mb-3">
            <span className="px-2 py-1 bg-secondary text-xs rounded-full">{currentQuestion.category}</span>
            <span className="px-2 py-1 bg-secondary text-xs rounded-full">{currentQuestion.difficulty}</span>
          </div>
          <h2 className="text-xl font-semibold">{currentQuestion.question_text}</h2>
        </div>

        {/* Answer Input */}
        {!feedback ? (
          <div className="space-y-4">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={6}
              className="w-full p-3 border border-input rounded-lg bg-background"
              disabled={isAnswering}
            />
            <Button onClick={handleSubmitAnswer} disabled={!answer.trim() || isAnswering} className="w-full">
              {isAnswering ? "Evaluating..." : "Submit Answer"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Score: {Math.round(feedback.score)}/100</h3>
              </div>
              <p className="text-sm mb-3">{feedback.feedback}</p>

              {feedback.strengths?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">Strengths:</p>
                  <ul className="text-xs space-y-1">
                    {feedback.strengths.map((s: string, i: number) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.areas_for_improvement?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-1">Areas to Improve:</p>
                  <ul className="text-xs space-y-1">
                    {feedback.areas_for_improvement.map((a: string, i: number) => (
                      <li key={i}>• {a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Button onClick={handleNext} className="w-full">
              {currentIndex < questions.length - 1 ? "Next Question" : "Finish Interview"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
