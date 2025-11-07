const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080"

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  token?: string | null
  body?: any
  headers?: Record<string, string>
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem("auth_token")
}

export function getAuthRole(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem("auth_role")
}

export function setAuth(token: string, role: string, userId: number) {
  if (typeof window === "undefined") return
  window.localStorage.setItem("auth_token", token)
  window.localStorage.setItem("auth_role", role)
  window.localStorage.setItem("auth_user_id", userId.toString())
}

export function getUserId(): number | null {
  if (typeof window === "undefined") return null
  const id = window.localStorage.getItem("auth_user_id")
  return id ? Number.parseInt(id, 10) : null
}

export function clearAuth() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem("auth_token")
  window.localStorage.removeItem("auth_role")
  window.localStorage.removeItem("auth_user_id")
}

export async function apiFetch<T = unknown>(path: string, opts: FetchOptions = {}): Promise<T> {
  const token = opts.token ?? getAuthToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Request failed with ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export async function apiFetchFormData<T = unknown>(
  path: string,
  formData: FormData,
  opts: { method?: "POST" | "PUT"; token?: string | null; headers?: Record<string, string> } = {},
): Promise<T> {
  const token = opts.token ?? getAuthToken()
  const headers: Record<string, string> = {
    ...(opts.headers || {}),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || "POST",
    headers,
    body: formData,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Request failed with ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
