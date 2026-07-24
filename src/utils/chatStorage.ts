import type { Message } from '../types'

const STORAGE_KEY = 'chat_messages'
const DEFAULT_TTL = 6 * 60 * 60 * 1000
const CLEANUP_INTERVAL = 5 * 60 * 1000

function read(): Record<string, Message[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function write(data: Record<string, Message[]>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getMessages(roomId: string): Message[] {
  const store = read()
  return store[roomId] ?? []
}

export function saveMessage(roomId: string, message: Message): void {
  const store = read()
  if (!store[roomId]) {
    store[roomId] = []
  }
  const existing = store[roomId].findIndex((m) => m.id === message.id)
  if (existing !== -1) {
    store[roomId][existing] = message
  } else {
    store[roomId].push(message)
  }
  write(store)
}

export function saveMessages(roomId: string, messages: Message[]): void {
  const store = read()
  store[roomId] = messages
  write(store)
}

export function clearRoom(roomId: string): void {
  const store = read()
  delete store[roomId]
  write(store)
}

export function clearAll(): void {
  localStorage.removeItem(STORAGE_KEY)
}

function getTTL(): number {
  const stored = localStorage.getItem('chat_ttl')
  return stored ? Number(stored) : DEFAULT_TTL
}

export function setTTL(ms: number): void {
  localStorage.setItem('chat_ttl', String(ms))
}

export function clearExpired(): number {
  const ttl = getTTL()
  const now = Date.now()
  const store = read()
  let removed = 0
  for (const roomId of Object.keys(store)) {
    const before = store[roomId].length
    store[roomId] = store[roomId].filter((m) => now - m.timestamp < ttl)
    removed += before - store[roomId].length
    if (store[roomId].length === 0) {
      delete store[roomId]
    }
  }
  write(store)
  return removed
}

export function startCleanupScheduler(): () => void {
  clearExpired()
  const id = setInterval(clearExpired, CLEANUP_INTERVAL)
  return () => clearInterval(id)
}
