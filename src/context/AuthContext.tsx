import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { User } from '../types'
import { login as apiLogin, signup as apiSignup } from '../services/api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
  }))

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true }))
    try {
      const res = await apiLogin(email, password) as unknown as { token: string; user: User }
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      setState({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false })
    } catch (e) {
      setState((s) => ({ ...s, isLoading: false }))
      throw e
    }
  }, [])

  const signup = useCallback(async (username: string, email: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true }))
    try {
      const res = await apiSignup(username, email, password) as unknown as { token: string; user: User }
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      setState({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false })
    } catch (e) {
      setState((s) => ({ ...s, isLoading: false }))
      throw e
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
