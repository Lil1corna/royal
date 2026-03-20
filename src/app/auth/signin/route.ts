import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { getBaseUrl } from '@/lib/url'

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request)
  const redirectTo = `${baseUrl}/auth/callback`

  // Create response first so cookies (e.g. code_verifier) are written to it — fixes Vercel
  const response = NextResponse.redirect(baseUrl)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })

  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(`${baseUrl}/auth/error?message=${encodeURIComponent(error.message)}`)
  }
  if (!data?.url) {
    return NextResponse.redirect(`${baseUrl}/auth/error?message=No+auth+URL`)
  }

  response.headers.set('Location', data.url)
  return response
}
