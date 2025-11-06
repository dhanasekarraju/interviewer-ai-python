"use client"

import { useEffect, useState } from "react"
import { getAuthRole, getAuthToken, getUserId } from "@/lib/api"

export function useAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setToken(getAuthToken())
    setRole(getAuthRole())
    setUserId(getUserId())
    setLoading(false)
  }, [])

  return { token, role, userId, loading }
}
