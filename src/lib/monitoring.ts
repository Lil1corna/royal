/**
 * Логирование ошибок для продакшена.
 * Для Sentry: установите `@sentry/nextjs`, следуйте их wizard и вызывайте Sentry.captureException в global-error.
 */
export function captureException(error: unknown, context?: Record<string, unknown>) {
  const payload = { error, ...context }
  if (process.env.NODE_ENV === 'development') {
    console.error('[monitoring]', payload)
    return
  }
  console.error('[monitoring]', JSON.stringify({ message: String(error), ...context }))
}
