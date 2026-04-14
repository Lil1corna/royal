import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ROLES } from '@/config/roles'
import { ensureAuthorized } from '@/lib/ensure-authorized'

const ROLE_VALUES = Array.from(new Set(Object.values(ROLES).map((r) => r.key)))

const roleSchema = z.object({
  role: z.enum(ROLE_VALUES as [string, ...string[]]),
})

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = roleSchema.safeParse(await request.json())
    if (!body.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const auth = await ensureAuthorized('assign_roles')
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.status === 401 ? 'Unauthorized' : auth.error || 'Forbidden' },
        { status: auth.status }
      )
    }

    const { error } = await auth.admin
      .from('users')
      .update({ role: body.data.role })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unexpected error' },
      { status: 500 }
    )
  }
}
