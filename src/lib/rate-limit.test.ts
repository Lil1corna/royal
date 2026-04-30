import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

describe('rateLimitAllow', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
    vi.resetModules()
  })

  it('sync call always allows (legacy compat)', async () => {
    const { rateLimitAllow } = await import('./rate-limit')
    expect(rateLimitAllow('any-key')).toBe(true)
  })

  it('async without Redis in non-production allows', async () => {
    const { rateLimitAllow } = await import('./rate-limit')
    await expect(rateLimitAllow('payment-create', true)).resolves.toBe(true)
  })
})

describe('rateLimitFromRequest', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
    vi.resetModules()
  })

  function req(): NextRequest {
    return new NextRequest('https://example.com/api/test', {
      headers: { 'x-forwarded-for': '203.0.113.1' },
    })
  }

  it('allows geocode when Redis is missing in production (fail-open)', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.resetModules()
    const { rateLimitFromRequest } = await import('./rate-limit')
    await expect(rateLimitFromRequest(req(), 'geocode')).resolves.toBe(true)
  })

  it('blocks payment-create when Redis is missing in production (fail-closed)', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.resetModules()
    const { rateLimitFromRequest } = await import('./rate-limit')
    await expect(rateLimitFromRequest(req(), 'payment-create')).resolves.toBe(false)
  })

  it('allows csrf when Redis is missing in production (fail-open)', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.resetModules()
    const { rateLimitFromRequest } = await import('./rate-limit')
    await expect(rateLimitFromRequest(req(), 'csrf')).resolves.toBe(true)
  })

  it('isUpstashRedisConfigured is false without env', async () => {
    vi.resetModules()
    const { isUpstashRedisConfigured } = await import('./rate-limit')
    expect(isUpstashRedisConfigured()).toBe(false)
  })

  it('isUpstashRedisConfigured is true when both env vars set', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'token')
    vi.resetModules()
    const { isUpstashRedisConfigured } = await import('./rate-limit')
    expect(isUpstashRedisConfigured()).toBe(true)
  })

  it('allows payment-create when Redis is missing outside production', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.resetModules()
    const { rateLimitFromRequest } = await import('./rate-limit')
    await expect(rateLimitFromRequest(req(), 'payment-create')).resolves.toBe(true)
  })
})

