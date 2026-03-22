/**
 * Get base URL for auth redirects (OAuth callback must match Supabase + Google).
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL — задайте вручную в Netlify/Vercel (лучший вариант после смены домена)
 * 2. Vercel preview / production
 * 3. Netlify: URL / DEPLOY_PRIME_URL (часто доступны в рантайме)
 * 4. Заголовки запроса (Host / X-Forwarded-*)
 */
export function getBaseUrl(request?: Request): string {
  const trim = (u: string) => u.replace(/\/$/, '')

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return trim(process.env.NEXT_PUBLIC_SITE_URL)
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  /* Netlify: основной URL сайта (см. Environment variables → Deploy context) */
  const netlifyPrimary =
    process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.DEPLOY_URL
  if (netlifyPrimary && /^https?:\/\//i.test(netlifyPrimary)) {
    return trim(netlifyPrimary)
  }
  if (request) {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000'
    const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
    return `${proto}://${host}`
  }
  return 'http://localhost:3000'
}
