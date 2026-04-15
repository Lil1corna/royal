import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('rateLimitAllow in-memory', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
  })

  it('allows 25 requests then blocks the 26th on the same key', async () => {
    vi.resetModules()
    const { rateLimitAllow } = await import('./rate-limit')
    const key = `rl-${Date.now()}-${Math.random()}`
    for (let i = 0; i < 25; i++) {
      expect(rateLimitAllow(key)).toBe(true)
    }
    expect(rateLimitAllow(key)).toBe(false)
  })

  it('allows again after the sliding window elapses', async () => {
    vi.useFakeTimers()
    vi.resetModules()
    const { rateLimitAllow } = await import('./rate-limit')
    const key = `rl-win-${Date.now()}`
    for (let i = 0; i < 25; i++) {
      expect(rateLimitAllow(key)).toBe(true)
    }
    expect(rateLimitAllow(key)).toBe(false)
    vi.advanceTimersByTime(61_000)
    expect(rateLimitAllow(key)).toBe(true)
    vi.useRealTimers()
  })
})
