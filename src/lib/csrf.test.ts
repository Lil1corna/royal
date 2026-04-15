import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from './csrf-constants'

const cookieValue = vi.hoisted(() => ({ current: '' as string }))

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      if (name !== CSRF_COOKIE_NAME) return undefined
      const v = cookieValue.current
      return v ? { value: v } : undefined
    },
    getAll: () => [],
    set: vi.fn(),
    setAll: vi.fn(),
  })),
}))

import { verifyCsrf } from './csrf'

function makeRequest(headers: Record<string, string>) {
  return new Request('http://localhost/', { headers })
}

describe('verifyCsrf', () => {
  beforeEach(() => {
    cookieValue.current = 'a'.repeat(64)
  })

  it('returns true when header matches cookie (constant-time path)', async () => {
    await expect(verifyCsrf(makeRequest({ [CSRF_HEADER_NAME]: cookieValue.current }))).resolves.toBe(
      true
    )
  })

  it('returns false when header missing', async () => {
    await expect(verifyCsrf(makeRequest({}))).resolves.toBe(false)
  })

  it('returns false when cookie missing', async () => {
    cookieValue.current = ''
    await expect(
      verifyCsrf(makeRequest({ [CSRF_HEADER_NAME]: 'deadbeef'.repeat(8) }))
    ).resolves.toBe(false)
  })

  it('returns false when lengths differ', async () => {
    await expect(
      verifyCsrf(makeRequest({ [CSRF_HEADER_NAME]: 'short' }))
    ).resolves.toBe(false)
  })

  it('returns false when same length but different bytes', async () => {
    const a = 'a'.repeat(64)
    const b = 'b'.repeat(64)
    cookieValue.current = a
    await expect(verifyCsrf(makeRequest({ [CSRF_HEADER_NAME]: b }))).resolves.toBe(false)
  })
})
