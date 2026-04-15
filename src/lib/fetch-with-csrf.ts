import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '@/lib/csrf-constants'

let cachedToken: string | null = null

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const entry = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`))
  if (!entry) return null
  return decodeURIComponent(entry.slice(name.length + 1))
}

/** Returns a CSRF token, bootstrapping via GET /api/csrf if the cookie is missing. */
export async function ensureClientCsrfToken(): Promise<string> {
  const fromCookie = readCookie(CSRF_COOKIE_NAME)
  if (fromCookie) {
    cachedToken = fromCookie
    return fromCookie
  }
  if (cachedToken) return cachedToken

  const res = await fetch('/api/csrf', { credentials: 'same-origin', cache: 'no-store' })
  if (!res.ok) throw new Error('CSRF bootstrap failed')
  const data = (await res.json()) as { token?: string }
  if (!data.token?.trim()) throw new Error('CSRF token missing')
  cachedToken = data.token
  return data.token
}

/** fetch() with CSRF header for same-origin mutating requests. */
export async function fetchWithCsrf(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const token = await ensureClientCsrfToken()
  const headers = new Headers(init.headers)
  headers.set(CSRF_HEADER_NAME, token)
  return fetch(input, {
    ...init,
    headers,
    credentials: init.credentials ?? 'same-origin',
  })
}
