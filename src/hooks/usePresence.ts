import { useState, useEffect } from 'react'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'

export function usePresence() {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set())
  const { socket, isConnected } = useSocket()
  const { user } = useAuth()

  useEffect(() => {
    if (!socket || !user || !isConnected) return

    setOnlineUserIds(new Set([user._id]))

    const handlePresence = (data: { userId: string; status: 'online' | 'offline' }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev)
        if (data.status === 'online') next.add(data.userId)
        else next.delete(data.userId)
        return next
      })
    }

    const handleOnlineList = (data: { users: string[] }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev)
        for (const uid of data.users) next.add(uid)
        return next
      })
    }

    socket.on('presence_update', handlePresence)
    socket.on('online_users_list', handleOnlineList)

    return () => {
      socket.off('presence_update', handlePresence)
      socket.off('online_users_list', handleOnlineList)
    }
  }, [socket, user, isConnected])

  return { onlineUserIds }
}
