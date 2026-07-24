import { useState, useEffect, useCallback, useRef } from 'react'
import type { Message, ReactionData } from '../types'
import { getMessages, saveMessages } from '../utils/chatStorage'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import { usePresence } from './usePresence'
import { getUsername, ensureUsername, subscribe } from '../utils/userCache'

const STORAGE_KEY = 'general'

function resolveName(userId: string, currentUserId: string, currentName: string): string {
  if (userId === currentUserId) return currentName
  return getUsername(userId) || userId.slice(0, 8)
}

export function useMessages() {
  const { socket } = useSocket()
  const { user } = useAuth()
  const { onlineUserIds } = usePresence()
  const storageKeyRef = useRef(STORAGE_KEY)

  const [messages, setMessages] = useState<Message[]>(() => getMessages(STORAGE_KEY))

  useEffect(() => {
    if (!socket) return

    const handleReceive = (data: { id: string; senderId: string; text: string; replyToId: string; timestamp: number }) => {
      if (!user) return
      ensureUsername(data.senderId)
      const msg: Message = {
        id: data.id,
        senderId: data.senderId,
        senderName: resolveName(data.senderId, user._id, user.username),
        text: data.text,
        replyToId: data.replyToId || null,
        timestamp: data.timestamp,
      }
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        const next = [...prev, msg]
        saveMessages(storageKeyRef.current, next)
        return next
      })
    }

    const handleReaction = (data: ReactionData) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== data.messageId) return m
          const reactions = { ...(m.reactions || {}) }
          if (!reactions[data.emoji]) reactions[data.emoji] = []
          if (!reactions[data.emoji].includes(data.userId)) {
            reactions[data.emoji] = [...reactions[data.emoji], data.userId]
          }
          return { ...m, reactions }
        })
      )
    }

    const addOrUpdateMsg = (id: string, text: string, timestamp: number) => {
      setMessages((prev) => {
        const existing = prev.find((m) => m.id === id)
        if (existing) {
          return prev.map((m) => (m.id === id ? { ...m, text } : m))
        }
        const msg: Message = {
          id,
          senderId: 'system',
          senderName: 'System',
          text,
          replyToId: null,
          timestamp,
          isSystem: true,
        }
        const next = [...prev, msg]
        saveMessages(storageKeyRef.current, next)
        return next
      })
    }

    const handleSystem = (data: { text: string; timestamp: number }) => {
      const onlineMatch = data.text.match(/^(.+) is now online$/)
      const offlineMatch = data.text.match(/^(.+) has disconnected$/)
      const id = onlineMatch?.[1] || offlineMatch?.[1]

      if (id && user && id === user._id) return

      const msgId = `sys-${data.timestamp}-${Math.random()}`

      if (id) {
        const cached = getUsername(id)
        if (cached) {
          addOrUpdateMsg(msgId, data.text.replace(id, cached), data.timestamp)
        } else {
          addOrUpdateMsg(msgId, data.text, data.timestamp)
          ensureUsername(id).then((name) => {
            if (name) {
              addOrUpdateMsg(msgId, data.text.replace(id, name), data.timestamp)
            }
          })
        }
      } else {
        addOrUpdateMsg(msgId, data.text, data.timestamp)
      }
    }

    socket.on('receive_message', handleReceive)
    socket.on('reaction_updated', handleReaction)
    socket.on('system_announcement', handleSystem)

    return () => {
      socket.off('receive_message', handleReceive)
      socket.off('reaction_updated', handleReaction)
      socket.off('system_announcement', handleSystem)
    }
  }, [socket, user])

  useEffect(() => {
    if (!user) return
    return subscribe(() => {
      setMessages((prev) => {
        let changed = false
        const next = prev.map((m) => {
          if (m.isSystem || m.senderId === user._id) return m
          const resolved = getUsername(m.senderId)
          if (resolved && m.senderName !== resolved) {
            changed = true
            return { ...m, senderName: resolved }
          }
          return m
        })
        return changed ? next : prev
      })
    })
  }, [user])

  const sendMessage = useCallback((text: string, replyToId?: string | null) => {
    if (!socket || !user || !text.trim()) return
    const id = `${user._id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const msg: Message = {
      id,
      senderId: user._id,
      senderName: user.username,
      text: text.trim(),
      replyToId: replyToId || null,
      timestamp: Date.now(),
    }

    for (const uid of onlineUserIds) {
      if (uid === user._id) continue
      socket.emit('send_message', {
        id: msg.id,
        senderId: msg.senderId,
        recipientId: uid,
        text: msg.text,
        replyToId: msg.replyToId || '',
        timestamp: msg.timestamp,
      })
    }

    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev
      const next = [...prev, msg]
      saveMessages(storageKeyRef.current, next)
      return next
    })
  }, [socket, user, onlineUserIds])

  const addReaction = useCallback((messageId: string, emoji: string) => {
    if (!socket || !user) return

    for (const uid of onlineUserIds) {
      if (uid === user._id) continue
      socket.emit('add_reaction', {
        messageId,
        emoji,
        senderId: user._id,
        recipientId: uid,
      })
    }

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m
        const reactions = { ...(m.reactions || {}) }
        if (!reactions[emoji]) reactions[emoji] = []
        if (!reactions[emoji].includes(user._id)) {
          reactions[emoji] = [...reactions[emoji], user._id]
        }
        return { ...m, reactions }
      })
    )
  }, [socket, user, onlineUserIds])

  return { messages, sendMessage, addReaction }
}
