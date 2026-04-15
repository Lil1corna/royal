import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockGetUser = vi.hoisted(() => vi.fn())
const mockUsersSingle = vi.hoisted(() => vi.fn())

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    getAll: () => [],
    get: vi.fn(),
    set: vi.fn(),
    setAll: vi.fn(),
  })),
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => {
      if (table === 'users') {
        return {
          select: () => ({
            eq: () => ({
              single: mockUsersSingle,
            }),
          }),
        }
      }
      return {}
    },
  })),
}))

const mockCreateClient = vi.hoisted(() =>
  vi.fn((url: string, key: string, options?: object) => {
    void url
    void key
    void options
    return { from: vi.fn() }
  }),
)

vi.mock('@supabase/supabase-js', () => ({
  createClient(url: string, key: string, options?: object) {
    return mockCreateClient(url, key, options)
  },
}))

import { ensureAuthorized } from './ensure-authorized'

describe('ensureAuthorized', () => {
  const envSnapshot = { ...process.env }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-test'
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-uuid-1' } },
      error: null,
    })
    mockUsersSingle.mockResolvedValue({
      data: { role: 'super_admin' },
      error: null,
    })
  })

  afterEach(() => {
    process.env = { ...envSnapshot }
  })

  it('returns 401 when there is no user', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null })
    const r = await ensureAuthorized('manage_products')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.status).toBe(401)
  })

  it('returns 403 when role lacks permission', async () => {
    mockUsersSingle.mockResolvedValueOnce({
      data: { role: 'customer' },
      error: null,
    })
    const r = await ensureAuthorized('manage_products')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.status).toBe(403)
  })

  it('returns 500 when SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    const r = await ensureAuthorized('manage_products')
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.status).toBe(500)
      expect(r.error).toMatch(/SERVICE_ROLE/)
    }
  })

  it('returns ok with admin client when authorized', async () => {
    const r = await ensureAuthorized('manage_products')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.userId).toBe('user-uuid-1')
      expect(r.roleKey).toBe('SUPER_ADMIN')
      expect(r.admin).toBeDefined()
    }
    expect(mockCreateClient).toHaveBeenCalled()
  })
})
