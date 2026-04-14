/**
 * Базовый URL для редиректов (OAuth callback, инвайты).
 *
 * Resolves the origin from request URL / headers / env vars, then validates
 * that the result matches NEXT_PUBLIC_SITE_URL (when set) to prevent
 * host-header poisoning / open redirect via spoofed Host/X-Forwarded-Host.
 */
export function getBaseUrl(request?: Request): string {
  const trim = (u: string) => u.replace(/\/$/, '')

  const trustedSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? trim(process.env.NEXT_PUBLIC_SITE_URL)
    : null

  let resolved: string | null = null

  if (request) {
    try {
      const origin = new URL(request.url).origin
      if (origin.startsWith('http://') || origin.startsWith('https://')) {
        resolved = trim(origin)
      }
    } catch {
      /* ignore malformed request.url */
    }

    if (!resolved) {
      const hostRaw = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
      const host = hostRaw.split(',')[0]?.trim()
      if (host) {
        const proto =
          request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
        resolved = trim(`${proto}://${host}`)
      }
    }

    if (resolved && trustedSiteUrl) {
      try {
        const resolvedHost = new URL(resolved).hostname
        const trustedHost = new URL(trustedSiteUrl).hostname
        if (resolvedHost !== trustedHost && !resolvedHost.includes('localhost')) {
          console.warn(`[url] Resolved origin "${resolved}" does not match trusted "${trustedSiteUrl}", falling back`)
          resolved = trustedSiteUrl
        }
      } catch {
        resolved = trustedSiteUrl
      }
    }

    if (resolved) return resolved
  }

  if (trustedSiteUrl) return trustedSiteUrl

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

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }

  console.error('[url] No NEXT_PUBLIC_SITE_URL or platform env set — using fallback')
  return 'https://localhost'
}
