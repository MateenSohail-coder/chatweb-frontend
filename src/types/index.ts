export interface User {
  _id: string
  username: string
  email: string
  avatar?: string
  status?: string
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  text: string
  replyToId: string | null
  replyTo?: { id: string; text: string; senderName: string } | null
  timestamp: number
  reactions?: Record<string, string[]>
  isSystem?: boolean
}

export interface PresenceData {
  userId: string
  status: 'online' | 'offline' | 'away'
  username: string
}

export interface TypingData {
  userId: string
  isTyping: boolean
}

export interface ReactionData {
  messageId: string
  emoji: string
  userId: string
  recipientId?: string
}

export interface UserProfile {
  _id: string
  username: string
  email: string
  avatar?: string
  status?: string
  createdAt?: string
}
