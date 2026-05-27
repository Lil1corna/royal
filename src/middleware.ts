import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareSupabase } from '@/lib/supabase-middleware'

const ADMIN_DB_ROLES = new Set([
  'super_admin', 'admin', 'moderator', 'editor', 'content_manager', 'support', 'viewer',
])

function partialUserId(userId: string): string {
  return userId.slice(0, 8)
}

function logMiddleware(payload: Record<string, unknown>) {
  console.log(JSON.stringify({ tag: '[MIDDLEWARE]', ...payload }))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Игнорируем роуты авторизации, чтобы избежать петель и лишних запросов
  if (pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  try {
    const { supabase, response } = createMiddlewareSupabase(request)
    let user = null

    try {
      // 2. Таймаут для getUser — самая частая причина 504 на Vercel
      const getUserPromise = supabase.auth.getUser()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 5000)
      )

      const { data, error } = await Promise.race([getUserPromise, timeoutPromise]) as any
      
      if (error) {
        logMiddleware({ level: 'warn', event: 'auth_get_user_error', message: error.message, path: pathname })
      }
      user = data?.user ?? null
    } catch (err) {
      logMiddleware({ 
        level: 'error', 
        event: 'auth_get_user_timeout_or_throw', 
        path: pathname, 
        error: err instanceof Error ? err.message : 'unknown' 
      })
      // При таймауте просто пропускаем, чтобы сайт не лежал
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
        console.warn('[SECURITY] admin_access_denied', JSON.stringify({ reason: 'unauthenticated', pathname }))
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
        console.warn('[SECURITY] admin_access_denied', JSON.stringify({ 
          reason: 'non_staff_role', 
          userIdPrefix: partialUserId(user.id), 
          role: dbRole 
        }))
        const homeUrl = request.nextUrl.clone()
        homeUrl.pathname = '/'
        return NextResponse.redirect(homeUrl)
      }
      return response
    }

    return response
  } catch (err) {
    logMiddleware({ level: 'error', event: 'middleware_fatal', path: pathname, error: err instanceof Error ? err.message : 'unknown' })
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Все файлы с расширениями (static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
