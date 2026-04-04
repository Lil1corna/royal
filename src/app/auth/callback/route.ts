import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { normalizeDbRoleToRoleKey, ROLES } from '@/config/roles'
import { sanitizeNext } from '@/lib/sanitize-next'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const safePath = sanitizeNext(requestUrl.searchParams.get('next'))

  if (!code) {
    console.error('[Auth Callback] No code provided')
    const errUrl = new URL('/auth/error', requestUrl.origin)
    errUrl.searchParams.set('message', 'No code')
    return NextResponse.redirect(errUrl.toString())
  }

  const redirectTo = new URL(safePath, requestUrl.origin).toString()
  const response = NextResponse.redirect(redirectTo)
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  
  if (error) {
    console.error('[Auth Callback] Session exchange failed:', error)
    const errUrl = new URL('/auth/error', requestUrl.origin)
    errUrl.searchParams.set('message', error.message)
    return NextResponse.redirect(errUrl.toString())
  }

  // Assign pending staff role after first successful sign-in
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.email && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
      const email = user.email.toLowerCase()

      const { data: pending } = await admin
        .from('pending_staff_invites')
        .select('id, role, status')
        .eq('email', email)
        .eq('status', 'pending')
        .single()

      if (pending) {
        const roleKey = normalizeDbRoleToRoleKey(pending.role)
        await admin.from('users').upsert(
          {
            id: user.id,
            email,
            name:
              (user.user_metadata?.name as string | undefined) ||
              (user.user_metadata?.full_name as string | undefined) ||
              email,
            role: ROLES[roleKey].key,
          },
          { onConflict: 'id' }
        )

        await admin
          .from('pending_staff_invites')
          .update({ status: 'accepted', accepted_at: new Date().toISOString() })
          .eq('id', pending.id)
      }
    }
  } catch (roleErr) {
    console.error('Role assignment after callback failed:', roleErr)
  }

  return response
}
