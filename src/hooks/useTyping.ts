import { useState, useEffect, useCallback, useRef } from 'react'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import { usePresence } from './usePresence'

const TYPING_DEBOUNCE = 500
const TYPING_TIMEOUT = 3000

export function useTyping() {
  const [typingUsers, setTypingUsers] = useState<{ userId: string; username: string }[]>([])
  const { socket } = useSocket()
  const { user } = useAuth()
  const { onlineUserIds } = usePresence()
  const typingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const lastEmit = useRef(0)

  useEffect(() => {
    if (!socket) return

    const handleTyping = (data: { userId: string; isTyping: boolean; username?: string }) => {
      if (data.userId === user?._id) return

      if (data.isTyping) {
        setTypingUsers((prev) => {
          if (prev.some((u) => u.userId === data.userId)) return prev
          return [...prev, { userId: data.userId, username: data.username || 'Someone' }]
        })
        const existing = typingTimers.current.get(data.userId)
        if (existing) clearTimeout(existing)
        const timer = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId))
          typingTimers.current.delete(data.userId)
        }, TYPING_TIMEOUT)
        typingTimers.current.set(data.userId, timer)
      } else {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId))
        const existing = typingTimers.current.get(data.userId)
        if (existing) {
          clearTimeout(existing)
          typingTimers.current.delete(data.userId)
        }
      }
    }

    socket.on('display_typing', handleTyping)

    return () => {
      socket.off('display_typing', handleTyping)
      for (const t of typingTimers.current.values()) clearTimeout(t)
      typingTimers.current.clear()
    }
  }, [socket, user?._id])

  const emitTyping = useCallback((isTyping: boolean) => {
    if (!socket || !user) return
    const now = Date.now()
    if (isTyping && now - lastEmit.current < TYPING_DEBOUNCE) return
    lastEmit.current = now
    for (const uid of onlineUserIds) {
      if (uid === user._id) continue
      socket.emit(isTyping ? 'typing_start' : 'typing_stop', {
        senderId: user._id,
        recipientId: uid,
      })
    }
  }, [socket, user, onlineUserIds])

  return { typingUsers, emitTyping }
}
