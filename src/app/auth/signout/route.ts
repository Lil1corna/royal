import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/csrf'
import { getBaseUrl } from '@/lib/url'

export async function POST(request: NextRequest) {
  if (!(await verifyCsrf(request))) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
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

  await supabase.auth.signOut()

  const siteUrl = getBaseUrl()
  return NextResponse.redirect(siteUrl)
}
