import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getBaseUrl } from '@/lib/url'
import { sanitizeNext } from '@/lib/sanitize-next'
import { normalizeDbRoleToRoleKey, ROLES } from '@/config/roles'
import { INVITE_ALLOWED_ROLE_INPUTS } from '@/lib/constants/roles'

export { INVITE_ALLOWED_ROLE_INPUTS } from '@/lib/constants/roles'

const ALLOWED_ROLES = new Set(INVITE_ALLOWED_ROLE_INPUTS)

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; role?: string }
    const email = (body.email || '').trim().toLowerCase()
    const role = (body.role || '').trim()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !ALLOWED_ROLES.has(role)) {
      return NextResponse.json({ error: 'Invalid email or role' }, { status: 400 })
    }

    const roleKey = normalizeDbRoleToRoleKey(role)
    const normalizedRoleDbKey = ROLES[roleKey].key

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const editorRoleKey = normalizeDbRoleToRoleKey(profile?.role)
    if (editorRoleKey !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing SUPABASE_SERVICE_ROLE_KEY' },
        { status: 500 }
      )
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // If the user already exists in our app (users table), update role immediately.
    const { data: existingUserRows, error: existingUsersError } = await admin
      .from('users')
      .select('id')
      .eq('email', email)

    if (existingUsersError) {
      return NextResponse.json({ error: existingUsersError.message }, { status: 400 })
    }

    const existingUserId = existingUserRows?.[0]?.id
    if (existingUserId) {
      const { error: updateError } = await admin
        .from('users')
        .update({ role: normalizedRoleDbKey })
        .eq('id', existingUserId)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 })
      }

      // Mark any pending invite as accepted so auth callback won't override it.
      const { error: pendingError } = await admin
        .from('pending_staff_invites')
        .upsert(
          {
            email,
            role: normalizedRoleDbKey,
            invited_by: user.id,
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

    // Otherwise: send an invite email; role will be applied after first auth callback.
    const baseUrl = getBaseUrl(request)
    const nextPath = sanitizeNext('/account')
    const callbackUrl = new URL('/auth/callback', baseUrl)
    callbackUrl.searchParams.set('next', nextPath)
    const redirectTo = callbackUrl.toString()

    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { invited_role: normalizedRoleDbKey },
    })

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 400 })
    }

    const { error: pendingError } = await admin
      .from('pending_staff_invites')
      .upsert(
        {
          email,
          role: normalizedRoleDbKey,
          invited_by: user.id,
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
