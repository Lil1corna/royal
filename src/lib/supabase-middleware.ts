import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Edge-safe Supabase client for Next.js middleware.
 * Uses `request.cookies` — not the `cookies()` API from `next/headers`.
 */
export function createMiddlewareSupabase(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value)
            })
          } catch {
            /* ignore malformed cookie writes */
          }
          response = NextResponse.next({ request })
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          } catch {
            /* ignore Set-Cookie failures */
          }
        },
      },
    }
  )

  return { supabase, response }
}

