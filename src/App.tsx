import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { Sidebar } from './components/Sidebar'
import { ChatWindow } from './components/ChatWindow'
import { setUsername } from './utils/userCache'
import { startCleanupScheduler } from './utils/chatStorage'

function LoginPage() {
  const { login, signup, isLoading } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [username, setUsername_] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await signup(username, email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    }
  }

  return (
    <div className="min-h-screen bg-[#313338] flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-[#2b2d31] rounded-lg p-6 w-full max-w-sm shadow-lg"
      >
        <h1 className="text-2xl font-semibold text-[#f2f3f5] text-center mb-6">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>

        {mode === 'signup' && (
          <div className="mb-4">
            <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername_(e.target.value)}
              className="w-full h-10 px-3 bg-[#1e1f22] text-[#dbdee1] text-base rounded-[3px] outline-none placeholder-[#87898c]"
              placeholder="Enter username"
              required={mode === 'signup'}
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3 bg-[#1e1f22] text-[#dbdee1] text-base rounded-[3px] outline-none placeholder-[#87898c]"
            placeholder="Enter email"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 px-3 bg-[#1e1f22] text-[#dbdee1] text-base rounded-[3px] outline-none placeholder-[#87898c]"
            placeholder="Enter password"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-[#f23f43] mb-4">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-9 bg-[#5865F2] text-white text-sm font-medium rounded-[3px] hover:bg-[#4752C4] active:bg-[#3C45A5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
        </button>

        <p className="text-sm text-[#949ba4] text-center mt-4">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setError('')
            }}
            className="text-[#00a8fc] hover:underline bg-transparent border-none p-0 cursor-pointer text-sm"
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </form>
    </div>
  )
}

function ChatApp() {
  const { user } = useAuth()

  useEffect(() => {
    const stop = startCleanupScheduler()
    return stop
  }, [])

  useEffect(() => {
    if (user) {
      setUsername(user._id, user.username)
    }
  }, [user])

  return (
    <div className="flex h-screen bg-[#313338]">
      <Sidebar />
      <div className="flex-1">
        <ChatWindow />
      </div>
    </div>
  )
}

function AppContent() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <SocketProvider>
      <ChatApp />
    </SocketProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
