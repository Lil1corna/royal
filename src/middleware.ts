import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareSupabase } from '@/lib/supabase-middleware'

/**
 * Hardcoded for Edge Runtime — cannot import from `src/config/roles.ts`.
 * Keep in sync with `DB_ROLE_ALIASES` / `ROLE_PERMISSIONS` in `src/config/roles.ts`.
 * Admin = any role except end-user (`user`, `customer`).
 */
const ADMIN_DB_ROLES = new Set([
  'super_admin',
  'admin',
  'manager',
  'moderator',
  'editor',
  'content_manager',
  'support',
  'viewer',
])

function partialUserId(userId: string): string {
  return userId.slice(0, 8)
}

function logMiddleware(payload: Record<string, unknown>) {
  console.log(JSON.stringify({ tag: '[MIDDLEWARE]', ...payload }))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  try {
    const { supabase, response } = createMiddlewareSupabase(request)

    let user: Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] = null
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        logMiddleware({
          level: 'warn',
          event: 'auth_get_user_error',
          message: error.message,
          path: pathname,
        })
      }
      user = data.user ?? null
    } catch (err) {
      logMiddleware({
        level: 'error',
        event: 'auth_get_user_throw',
        path: pathname,
        error: err instanceof Error ? err.message : 'unknown',
      })
      return response
    }

    if (pathname.startsWith('/account')) {
      if (!user) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/auth/signin'
        redirectUrl.searchParams.set('next', pathname)
        return NextResponse.redirect(redirectUrl)
      }
      return response
    }

    if (pathname.startsWith('/admin')) {
      if (!user) {
        console.warn(
          '[SECURITY] admin_unauthenticated',
          JSON.stringify({
            pathname,
            timestamp: new Date().toISOString(),
          })
        )
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/auth/signin'
        redirectUrl.searchParams.set('next', pathname)
        return NextResponse.redirect(redirectUrl)
      }

      const meta = user.user_metadata as Record<string, unknown> | undefined
      const app = user.app_metadata as Record<string, unknown> | undefined
      const raw = meta?.role ?? app?.role
      const dbRole = typeof raw === 'string' ? raw.trim().toLowerCase() : ''

      if (!ADMIN_DB_ROLES.has(dbRole)) {
        console.warn(
          '[SECURITY] admin_route_denied_non_staff',
          JSON.stringify({
            pathname,
            timestamp: new Date().toISOString(),
            userIdPrefix: partialUserId(user.id),
            role: dbRole || null,
          })
        )
        const homeUrl = request.nextUrl.clone()
        homeUrl.pathname = '/'
        homeUrl.search = ''
        return NextResponse.redirect(homeUrl)
      }

      return response
    }

    return response
  } catch (err) {
    logMiddleware({
      level: 'error',
      event: 'middleware_fatal',
      path: pathname,
      error: err instanceof Error ? err.message : 'unknown',
    })
    return NextResponse.next()
  }
}

/**
 * Run on all pages except API routes, Next internals, favicon, and common static asset extensions
 * so Supabase session cookies refresh on normal navigations. `/admin` and `/account` additionally
 * enforce redirects inside `middleware`.
 */
export const config = {
  matcher: [
    '/',
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}

/*
 * IMPORTANT — JWT role lag:
 * This middleware reads role from the JWT (`user_metadata` / `app_metadata`).
 * When an admin changes a user's role in the database, the JWT `user_metadata` does not
 * auto-update. The user must sign in again for the new role to apply in middleware.
 * Middleware is a UX guard only; `ensureAuthorized()` in API routes is the true security
 * boundary and reads from the database.
 */
