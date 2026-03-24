/**
 * Базовый URL для редиректов (OAuth callback, инвайты).
 *
 * Если передан `request`, сначала берётся **реальный хост этого запроса**
 * (например `https://deft-torte-a2d78c.netlify.app`), а не `NEXT_PUBLIC_SITE_URL`.
 * Так после смены Netlify-URL или Preview не уезжаем на старый домен вроде royalaz.netlify.app.
 *
 * `NEXT_PUBLIC_SITE_URL` используется только когда запроса нет или не удалось извлечь origin.
 */
export function getBaseUrl(request?: Request): string {
  const trim = (u: string) => u.replace(/\/$/, '')

  if (request) {
    try {
      const origin = new URL(request.url).origin
      if (origin.startsWith('http://') || origin.startsWith('https://')) {
        return trim(origin)
      }
    } catch {
      /* ignore */
    }
    const hostRaw = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
    const host = hostRaw.split(',')[0]?.trim()
    if (host) {
      const proto =
        request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
      return trim(`${proto}://${host}`)
    }
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return trim(process.env.NEXT_PUBLIC_SITE_URL)
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  const netlifyPrimary =
    process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.DEPLOY_URL
  if (netlifyPrimary && /^https?:\/\//i.test(netlifyPrimary)) {
    return trim(netlifyPrimary)
  }
  if (process.env.NETLIFY_SITE_NAME) {
    return `https://${process.env.NETLIFY_SITE_NAME}.netlify.app`
  }
  return 'https://example.com'
}
