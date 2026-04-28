import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from './csrf-constants'

export function csrfForbiddenResponse(): NextResponse {
  return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
}

export async function verifyCsrf(request: Request): Promise<boolean> {
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value
  if (!cookieToken) return false
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  if (!headerToken) return false
  if (headerToken.length !== cookieToken.length) return false
  let diff = 0
  for (let i = 0; i < headerToken.length; i++) {
    diff |= headerToken.charCodeAt(i) ^ cookieToken.charCodeAt(i)
  }
  return diff === 0
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME }
