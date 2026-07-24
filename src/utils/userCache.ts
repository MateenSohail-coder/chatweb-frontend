import { fetchProfile } from '../services/api'

const cache = new Map<string, string>()
const pending = new Map<string, Promise<string | null>>()
const listeners = new Set<() => void>()

export function getUsername(userId: string): string | undefined {
  return cache.get(userId)
}

export function setUsername(userId: string, username: string): void {
  cache.set(userId, username)
  notify()
}

export function ensureUsername(userId: string): Promise<string | null> {
  const cached = cache.get(userId)
  if (cached) return Promise.resolve(cached)

  const existing = pending.get(userId)
  if (existing) return existing

  const promise = fetchProfile(userId)
    .then((p) => {
      cache.set(userId, p.username)
      notify()
      pending.delete(userId)
      return p.username
    })
    .catch(() => {
      pending.delete(userId)
      return null
    })

  pending.set(userId, promise)
  return promise
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function notify() {
  for (const fn of listeners) {
    fn()
  }
}
