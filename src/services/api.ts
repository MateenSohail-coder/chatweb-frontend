import type { UserProfile } from '../types'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') + '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })

  const json = await res.json()

  if (!json.success) {
    throw new Error(json.error || 'Request failed')
  }

  return json.data ?? json
}

export function fetchProfile(userId: string): Promise<UserProfile> {
  return request<UserProfile>(`/users/profile/${userId}`)
}

export function login(email: string, password: string) {
  return request<{ token: string; user: UserProfile }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function signup(username: string, email: string, password: string) {
  return request<{ token: string; user: UserProfile }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  })
}