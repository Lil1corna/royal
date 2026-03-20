/**
 * Get base URL for auth redirects. Works on localhost and Vercel.
 * On Vercel: VERCEL_URL is set (e.g. royalaz.vercel.app)
 * Set NEXT_PUBLIC_SITE_URL in Vercel for production domain.
 */
export function getBaseUrl(request?: Request): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  if (request) {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000'
    const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
    return `${proto}://${host}`
  }
  return 'http://localhost:3000'
}
