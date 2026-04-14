import { NextRequest } from 'next/server'

const WINDOW_MS = 60_000
const MAX_REQUESTS = 25

const buckets = new Map<string, number[]>()

function inMemoryRateLimit(key: string): boolean {
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

type UpstashConfig = {
  url: string
  token: string
}

let upstashConfig: UpstashConfig | null = null

function getUpstashConfig(): UpstashConfig | null {
  if (upstashConfig !== null) return upstashConfig
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (url && token) {
    upstashConfig = { url, token }
    return upstashConfig
  }
  return null
}

async function upstashRateLimit(key: string): Promise<boolean> {
  const config = getUpstashConfig()
  if (!config) return inMemoryRateLimit(key)

  const redisKey = `ratelimit:${key}`
  const now = Date.now()
  const windowStart = now - WINDOW_MS

  const commands = [
    ['ZREMRANGEBYSCORE', redisKey, '-inf', String(windowStart)],
    ['ZADD', redisKey, String(now), `${now}:${Math.random().toString(36).slice(2)}`],
    ['ZCARD', redisKey],
    ['PEXPIRE', redisKey, String(WINDOW_MS)],
  ]

  try {
    const res = await fetch(config.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commands),
      cache: 'no-store',
    })
    if (!res.ok) return inMemoryRateLimit(key)
    const data = (await res.json()) as { result?: unknown[] }
    const count = Array.isArray(data.result) ? Number(data.result[2]) : 0
    return count <= MAX_REQUESTS
  } catch {
    return inMemoryRateLimit(key)
  }
}

export function rateLimitAllow(key: string): boolean
export function rateLimitAllow(key: string, async: true): Promise<boolean>
export function rateLimitAllow(key: string, async?: true): boolean | Promise<boolean> {
  if (async) return upstashRateLimit(key)
  if (getUpstashConfig()) {
    console.warn('[rate-limit] Upstash configured but sync call — falling back to in-memory. Use rateLimitAllow(key, true) for async.')
  }
  return inMemoryRateLimit(key)
}

export function rateLimitFromRequest(request: NextRequest, prefix: string): Promise<boolean> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
  return upstashRateLimit(`${prefix}:${ip}`)
}
