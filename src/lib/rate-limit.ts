import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { type NextRequest } from 'next/server'

/**
 * Per-route tiers (sliding window). Unknown prefixes use `default`.
 * `prefix` is the second argument to `rateLimitFromRequest`.
 */
const TIERS = {
  'payment-create': { requests: 5, window: '1 m' },
  'payment-verify': { requests: 10, window: '1 m' },
  'payment-verify-internal': { requests: 30, window: '1 m' },
  'payment-callback': { requests: 20, window: '1 m' },
  'order-create': { requests: 10, window: '1 m' },
  auth: { requests: 10, window: '1 m' },
  csrf: { requests: 30, window: '1 m' },
  admin: { requests: 60, window: '1 m' },
  'admin-invite': { requests: 60, window: '1 m' },
  'admin-order-update': { requests: 60, window: '1 m' },
  'admin-products-patch': { requests: 60, window: '1 m' },
  'admin-products-delete': { requests: 60, window: '1 m' },
  'admin-role-patch': { requests: 60, window: '1 m' },
  'admin-products-post': { requests: 60, window: '1 m' },
  'user-delivery-profile': { requests: 60, window: '1 m' },
  geocode: { requests: 30, window: '1 m' },
  default: { requests: 25, window: '1 m' },
} as const

type TierDef = (typeof TIERS)[keyof typeof TIERS]

function tierForPrefix(prefix: string): TierDef {
  if (Object.prototype.hasOwnProperty.call(TIERS, prefix)) {
    return TIERS[prefix as keyof typeof TIERS]
  }
  return TIERS.default
}

let _redis: Redis | null = null
let _redisChecked = false
let _warnedMissingRedisProduction = false

function isProductionLike(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production'
  )
}

/** Fail-closed (when Redis missing or limiter errors) only for fraud-sensitive routes. */
function isCriticalPrefix(prefix: string): boolean {
  return prefix === 'payment-create' || prefix === 'order-create'
}

/** True when Upstash env vars are present (does not guarantee Redis connectivity). */
export function isUpstashRedisConfigured(): boolean {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  return Boolean(url && token)
}

function logRateLimit(payload: Record<string, unknown>) {
  console.log(JSON.stringify({ tag: '[RATE_LIMIT]', ...payload }))
}

function getRedis(): Redis | null {
  if (_redisChecked) return _redis
  _redisChecked = true
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!url || !token) {
    if (isProductionLike() && !_warnedMissingRedisProduction) {
      _warnedMissingRedisProduction = true
      console.warn(
        '[RATE_LIMIT] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — rate limiting disabled except fail-closed blocks on payment-create and order-create when unreachable.'
      )
      logRateLimit({
        event: 'redis_unconfigured',
        message:
          'Missing Upstash env; non-payment-create/order-create tiers allow traffic (fail-open).',
      })
    }
    return null
  }
  try {
    _redis = new Redis({ url, token })
  } catch (err) {
    logRateLimit({
      event: 'redis_client_error',
      message: err instanceof Error ? err.message : 'unknown',
    })
    _redis = null
  }
  return _redis
}

const _limiters = new Map<string, Ratelimit>()

function getLimiter(prefix: string): Ratelimit | null {
  const redis = getRedis()
  if (!redis) return null
  const cached = _limiters.get(prefix)
  if (cached) return cached
  const tier = tierForPrefix(prefix)
  try {
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(tier.requests, tier.window),
      prefix: `royalaz:rl:${prefix}`,
      analytics: false,
    })
    _limiters.set(prefix, limiter)
    return limiter
  } catch (err) {
    logRateLimit({
      event: 'limiter_init_error',
      prefix,
      message: err instanceof Error ? err.message : 'unknown',
    })
    return null
  }
}

function getIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous'
  )
}

async function evaluateLimit(
  prefix: string,
  identifier: string
): Promise<boolean> {
  const critical = isCriticalPrefix(prefix)
  const limiter = getLimiter(prefix)

  if (!limiter) {
    if (isProductionLike() && critical) {
      logRateLimit({
        event: 'blocked_no_redis',
        prefix,
        identifier,
      })
      return false
    }
    return true
  }

  try {
    const { success, pending } = await limiter.limit(identifier)
    await pending.catch(() => undefined)
    if (!success) {
      logRateLimit({
        event: 'violation',
        prefix,
        identifier,
      })
    }
    return success
  } catch (err) {
    logRateLimit({
      event: 'limit_error',
      prefix,
      identifier,
      message: err instanceof Error ? err.message : 'unknown',
    })
    if (critical) return false
    return true
  }
}

/**
 * Rate limit by IP + route tier. `true` = allow, `false` = 429.
 */
export async function rateLimitFromRequest(
  request: NextRequest,
  prefix: string
): Promise<boolean> {
  const ip = getIp(request)
  return evaluateLimit(prefix, `${prefix}:${ip}`)
}

export function rateLimitAllow(key: string): boolean
export function rateLimitAllow(key: string, async: true): Promise<boolean>
export function rateLimitAllow(
  key: string,
  isAsync?: true
): boolean | Promise<boolean> {
  if (!isAsync) return true
  return evaluateLimit(key, key)
}

