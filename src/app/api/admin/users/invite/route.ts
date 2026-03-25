import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getBaseUrl } from '@/lib/url'
import { normalizeDbRoleToRoleKey, ROLES } from '@/config/roles'

const ALLOWED_ROLES = new Set([
  // New role keys
  ROLES.SUPER_ADMIN.key,
  ROLES.ADMIN.key,
  ROLES.MODERATOR.key,
  ROLES.EDITOR.key,
  ROLES.SUPPORT.key,
  ROLES.VIEWER.key,
  ROLES.USER.key,

  // Legacy role keys (backward compatibility)
  'manager',
  'content_manager',
  'customer',
])

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; role?: string }
    const email = (body.email || '').trim().toLowerCase()
    const role = (body.role || '').trim()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !ALLOWED_ROLES.has(role)) {
      return NextResponse.json({ error: 'Invalid email or role' }, { status: 400 })
    }

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

    const baseUrl = getBaseUrl(request)
    const redirectTo = `${baseUrl}/auth/callback?next=/account`

    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { invited_role: role },
    })

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 400 })
    }

    const { error: pendingError } = await admin
      .from('pending_staff_invites')
      .upsert(
        {
          email,
          role,
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

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unexpected error' },
      { status: 500 }
    )
  }
}
