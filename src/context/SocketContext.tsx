import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

interface SocketContextValue {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextValue>({ socket: null, isConnected: false })

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token, user, isAuthenticated } = useAuth()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !token) return

    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    s.on('connect', () => {
      setIsConnected(true)
      if (user?._id) {
        s.emit('user_connected', { userId: user._id })
        s.emit('get_online_users')
      }
    })

    s.on('disconnect', () => {
      setIsConnected(false)
    })

    s.on('connect_error', () => {
      setIsConnected(false)
    })

    socketRef.current = s

    return () => {
      s.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [isAuthenticated, token, user])

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket(): SocketContextValue {
  return useContext(SocketContext)
}
