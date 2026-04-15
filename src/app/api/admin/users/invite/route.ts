import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { csrfForbiddenResponse, verifyCsrf } from '@/lib/csrf'
import { getBaseUrl } from '@/lib/url'
import { sanitizeNext } from '@/lib/sanitize-next'
import { normalizeDbRoleToRoleKey, ROLES } from '@/config/roles'
import { INVITE_ALLOWED_ROLE_INPUTS } from '@/lib/constants/roles'
import { ensureAuthorized } from '@/lib/ensure-authorized'
import { rateLimitFromRequest } from '@/lib/rate-limit'

export { INVITE_ALLOWED_ROLE_INPUTS } from '@/lib/constants/roles'

const ALLOWED_ROLES = new Set(INVITE_ALLOWED_ROLE_INPUTS)

const inviteSchema = z.object({
  email: z.string().trim().email(),
  role: z.string().trim(),
})

export async function POST(request: NextRequest) {
  try {
    const allowed = await rateLimitFromRequest(request, 'admin-invite')
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    if (!(await verifyCsrf(request))) {
      return csrfForbiddenResponse()
    }

    const auth = await ensureAuthorized('manage_admins')
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.status === 401 ? 'Unauthorized' : auth.error || 'Forbidden' },
        { status: auth.status }
      )
    }

    const parsed = inviteSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email or role' }, { status: 400 })
    }

    const email = parsed.data.email.toLowerCase()
    const role = parsed.data.role

    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json({ error: 'Invalid email or role' }, { status: 400 })
    }

    const roleKey = normalizeDbRoleToRoleKey(role)
    const normalizedRoleDbKey = ROLES[roleKey].key

    const { data: existingUserRows, error: existingUsersError } = await auth.admin
      .from('users')
      .select('id')
      .eq('email', email)

    if (existingUsersError) {
      return NextResponse.json({ error: existingUsersError.message }, { status: 400 })
    }

    const existingUserId = existingUserRows?.[0]?.id
    if (existingUserId) {
      const { error: updateError } = await auth.admin
        .from('users')
        .update({ role: normalizedRoleDbKey })
        .eq('id', existingUserId)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 })
      }

      const { error: pendingError } = await auth.admin
        .from('pending_staff_invites')
        .upsert(
          {
            email,
            role: normalizedRoleDbKey,
            invited_by: auth.userId,
            status: 'accepted',
            accepted_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
          { onConflict: 'email' }
        )

      if (pendingError) {
        return NextResponse.json({ error: pendingError.message }, { status: 400 })
      }

      return NextResponse.json({ ok: true, updated: true })
    }

    const baseUrl = getBaseUrl(request)
    const nextPath = sanitizeNext('/account')
    const callbackUrl = new URL('/auth/callback', baseUrl)
    callbackUrl.searchParams.set('next', nextPath)
    const redirectTo = callbackUrl.toString()

    const { error: inviteError } = await auth.admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { invited_role: normalizedRoleDbKey },
    })

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 400 })
    }

    const { error: pendingError } = await auth.admin
      .from('pending_staff_invites')
      .upsert(
        {
          email,
          role: normalizedRoleDbKey,
          invited_by: auth.userId,
          status: 'pending',
          accepted_at: null,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )

    if (pendingError) {
      return NextResponse.json({ error: pendingError.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, updated: false })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unexpected error' },
      { status: 500 }
    )
  }
}
