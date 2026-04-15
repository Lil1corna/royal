/** Cookie name aligned with middleware / server layout for SSR locale hint. */
export const NEXT_LOCALE_COOKIE = 'NEXT_LOCALE'

export type AppLocale = 'az' | 'ru' | 'en'

export function isAppLocale(v: string | null | undefined): v is AppLocale {
  return v === 'az' || v === 'ru' || v === 'en'
}

/** Set locale cookie from the browser (called when user switches language). */
export function setLocaleCookieClient(lang: AppLocale): void {
  if (typeof document === 'undefined') return
  const maxAge = 365 * 24 * 3600
  const secure = window.location.protocol === 'https:'
  document.cookie = `${NEXT_LOCALE_COOKIE}=${encodeURIComponent(lang)}; path=/; max-age=${maxAge}; SameSite=Lax${secure ? '; Secure' : ''}`
}
