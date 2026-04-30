import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ROLES } from '@/config/roles'
import { csrfForbiddenResponse, verifyCsrf } from '@/lib/csrf'
import { ensureAuthorized } from '@/lib/ensure-authorized'
import { rateLimitFromRequest } from '@/lib/rate-limit'

const ROLE_VALUES = Array.from(new Set(Object.values(ROLES).map((r) => r.key)))

const roleSchema = z.object({
  role: z.enum(ROLE_VALUES as [string, ...string[]]),
})

const idSchema = z.string().uuid()

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const allowed = await rateLimitFromRequest(request, 'admin-role-patch')
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    if (!(await verifyCsrf(request))) {
      return csrfForbiddenResponse()
    }

    const auth = await ensureAuthorized('assign_roles')
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.status === 401 ? 'Unauthorized' : auth.error || 'Forbidden' },
        { status: auth.status }
      )
    }

    const { id } = await context.params
    const idParsed = idSchema.safeParse(id)
    if (!idParsed.success) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = roleSchema.safeParse(await request.json())
    if (!body.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const targetUserId = idParsed.data
    const newRole = body.data.role

    const { error } = await auth.admin.from('users').update({ role: newRole }).eq('id', targetUserId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Keep JWT user_metadata.role in sync so Edge middleware (no DB) matches public.users.role.
    // Existing staff promoted only in SQL must run a one-time metadata backfill in Supabase Dashboard.
    try {
      const { data: authUser, error: getAuthErr } = await auth.admin.auth.admin.getUserById(targetUserId)
      if (getAuthErr || !authUser?.user) {
        console.error('[admin/users/role] getUserById after DB update:', getAuthErr?.message ?? 'no user')
      } else {
        const prevMeta =
          authUser.user.user_metadata && typeof authUser.user.user_metadata === 'object'
            ? { ...authUser.user.user_metadata }
            : {}
        const { error: updAuthErr } = await auth.admin.auth.admin.updateUserById(targetUserId, {
          user_metadata: { ...prevMeta, role: newRole },
        })
        if (updAuthErr) {
          console.error('[admin/users/role] updateUserById user_metadata.role:', updAuthErr.message)
        }
      }
    } catch (syncErr) {
      console.error('[admin/users/role] JWT metadata sync:', syncErr)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unexpected error' },
      { status: 500 }
    )
  }
}
