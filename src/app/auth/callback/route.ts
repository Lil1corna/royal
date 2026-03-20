import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { getBaseUrl } from '@/lib/url'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/'

  const baseUrl = getBaseUrl(request)
  const redirectUrl = `${baseUrl}${next}`

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/auth/error?message=No+code`)
  }

  // Create response first so session cookies are written to it — fixes Vercel
  const response = NextResponse.redirect(redirectUrl)
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

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(`${baseUrl}/auth/error?message=${encodeURIComponent(error.message)}`)
  }

  return response
}
