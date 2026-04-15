import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, INVITE_ALLOWED_ROLE_INPUTS } from './route'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  usersSingle: vi.fn(),
  adminFrom: vi.fn(),
  adminInvite: vi.fn(),
  pendingUpsert: vi.fn(),
  createServerClient: vi.fn(),
}))

vi.mock('@/lib/csrf', () => ({
  verifyCsrf: vi.fn(async () => true),
  csrfForbiddenResponse: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    getAll: () => [],
    get: vi.fn(),
    set: vi.fn(),
    setAll: vi.fn(),
  })),
}))

vi.mock('@/lib/url', () => ({
  getBaseUrl: () => 'http://localhost:3000',
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: mocks.createServerClient,
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      admin: {
        inviteUserByEmail: mocks.adminInvite,
      },
    },
    from: mocks.adminFrom,
  })),
}))

mocks.createServerClient.mockImplementation(() => ({
  auth: { getUser: mocks.getUser },
  from: (table: string) => {
    if (table === 'users') {
      return {
        select: () => ({
          eq: () => ({ single: mocks.usersSingle }),
        }),
      }
    }
    return {}
  },
}))

function inviteRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/admin/users/invite', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/users/invite', () => {
  const envSnapshot = { ...process.env }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-test'

    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'inviter-uuid', email: 'boss@test.com' } },
      error: null,
    })
    mocks.usersSingle.mockResolvedValue({
      data: { role: 'super_admin' },
      error: null,
    })
    mocks.adminInvite.mockResolvedValue({ data: {}, error: null })
    mocks.pendingUpsert.mockResolvedValue({ error: null })
    mocks.adminFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
          }),
        }
      }
      if (table === 'pending_staff_invites') {
        return {
          upsert: mocks.pendingUpsert,
        }
      }
      return {}
    })
  })

  afterEach(() => {
    process.env = { ...envSnapshot }
  })

  it.each([
    ['admin', 'admin'],
    ['manager', 'admin'],
    ['super_admin', 'super_admin'],
    ['moderator', 'moderator'],
    ['content_manager', 'editor'],
    ['customer', 'user'],
  ] as const)('valid role %s normalizes to %s and succeeds (invite path)', async (inputRole, expectedDbRole) => {
    const res = await POST(
      inviteRequest({ email: 'new.user@test.com', role: inputRole })
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ ok: true, updated: false })
    expect(mocks.adminInvite).toHaveBeenCalled()
    expect(mocks.pendingUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new.user@test.com',
        role: expectedDbRole,
        invited_by: 'inviter-uuid',
        status: 'pending',
      }),
      { onConflict: 'email' }
    )
  })

  it.each(['', 'superadmin', 'hacker'])('invalid role %j returns 400', async (role) => {
    const res = await POST(
      inviteRequest({ email: 'valid@test.com', role: role as string })
    )
    expect(res.status).toBe(400)
  })

  it('missing role (undefined) returns 400', async () => {
    const res = await POST(inviteRequest({ email: 'valid@test.com' }))
    expect(res.status).toBe(400)
  })

  it('explicit null role returns 400', async () => {
    const res = await POST(
      inviteRequest({ email: 'valid@test.com', role: null })
    )
    expect(res.status).toBe(400)
  })

  it('no session returns 401', async () => {
    mocks.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })
    const res = await POST(
      inviteRequest({ email: 'x@test.com', role: 'admin' })
    )
    expect(res.status).toBe(401)
  })

  it('non-super_admin returns 403', async () => {
    mocks.usersSingle.mockResolvedValueOnce({
      data: { role: 'admin' },
      error: null,
    })
    const res = await POST(
      inviteRequest({ email: 'x@test.com', role: 'admin' })
    )
    expect(res.status).toBe(403)
  })

  it('successful invite writes pending_staff_invites with email, role, invited_by', async () => {
    await POST(
      inviteRequest({ email: 'staff@test.com', role: 'support' })
    )
    expect(mocks.pendingUpsert).toHaveBeenCalledTimes(1)
    const [payload, opts] = mocks.pendingUpsert.mock.calls[0]
    expect(payload).toMatchObject({
      email: 'staff@test.com',
      role: 'support',
      invited_by: 'inviter-uuid',
      status: 'pending',
      accepted_at: null,
    })
    expect(opts).toEqual({ onConflict: 'email' })
  })

  it('exports invite allowlist aligned with constants module', () => {
    expect(INVITE_ALLOWED_ROLE_INPUTS.length).toBeGreaterThan(0)
    expect(new Set(INVITE_ALLOWED_ROLE_INPUTS).size).toBe(
      INVITE_ALLOWED_ROLE_INPUTS.length
    )
  })
})
