/**
 * Простой in-memory лимит (на serverless каждый инстанс свой — для продакшена лучше Upstash Redis).
 */
const buckets = new Map<string, number[]>()

const WINDOW_MS = 60_000
const MAX_REQUESTS = 25

export function rateLimitAllow(key: string): boolean {
  const now = Date.now()
  const list = buckets.get(key) || []
  const fresh = list.filter((t) => now - t < WINDOW_MS)
  if (fresh.length >= MAX_REQUESTS) {
    buckets.set(key, fresh)
    return false
  }
  fresh.push(now)
  buckets.set(key, fresh)
  return true
}
