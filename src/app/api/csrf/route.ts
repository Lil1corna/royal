import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { CSRF_COOKIE_NAME } from '@/lib/csrf-constants'

export async function GET() {
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
