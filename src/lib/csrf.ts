import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from './csrf-constants'

export function csrfForbiddenResponse(): NextResponse {
  return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
}

const CSRF_TOKEN_LENGTH = 32

function generateToken(): string {
  const bytes = new Uint8Array(CSRF_TOKEN_LENGTH)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function ensureCsrfToken(): Promise<string> {
  const cookieStore = await cookies()
  const existing = cookieStore.get(CSRF_COOKIE_NAME)?.value
  if (existing) return existing
  const token = generateToken()
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  })
  return token
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
