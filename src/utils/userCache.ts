import { fetchProfile } from '../services/api'

const cache = new Map<string, string>()
const pending = new Set<string>()
const listeners = new Set<() => void>()

export function getUsername(userId: string): string | undefined {
  return cache.get(userId)
}

export function setUsername(userId: string, username: string): void {
  cache.set(userId, username)
  notify()
}

export function ensureUsername(userId: string): Promise<string | null> {
  if (cache.has(userId)) {
    return Promise.resolve(cache.get(userId)!)
  }
  if (pending.has(userId)) {
    return new Promise((resolve) => {
      const check = () => {
        if (cache.has(userId)) {
          resolve(cache.get(userId)!)
        } else if (!pending.has(userId)) {
          resolve(null)
        } else {
          setTimeout(check, 50)
        }
      }
      check()
    })
  }
  pending.add(userId)
  return fetchProfile(userId)
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
