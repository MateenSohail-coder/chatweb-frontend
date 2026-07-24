import { fetchProfile } from '../services/api'

const cache = new Map<string, string>()
const pending = new Set<string>()

export function getUsername(userId: string): string | undefined {
  return cache.get(userId)
}

export function setUsername(userId: string, username: string): void {
  cache.set(userId, username)
}

export function ensureUsername(userId: string): void {
  if (cache.has(userId) || pending.has(userId)) return
  pending.add(userId)
  fetchProfile(userId)
    .then((p) => {
      cache.set(userId, p.username)
      pending.delete(userId)
    })
    .catch(() => {
      pending.delete(userId)
    })
}
