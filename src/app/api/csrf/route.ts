import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { CSRF_COOKIE_NAME } from '@/lib/csrf-constants'
import { rateLimitFromRequest } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const allowed = await rateLimitFromRequest(request, 'csrf')
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const cookieStore = await cookies()
  const existing = cookieStore.get(CSRF_COOKIE_NAME)?.value
  const token = existing ?? crypto.randomUUID()

  if (!existing) {
    cookieStore.set(CSRF_COOKIE_NAME, token, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
  }

  return NextResponse.json({ token })
}
