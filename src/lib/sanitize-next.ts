/**
 * Безопасный путь после OAuth: только same-origin relative path.
 * Блокирует open redirect (абсолютные URL, protocol-relative, javascript:, и т.д.).
 */
const MAX_NEXT_LEN = 2000

export function sanitizeNext(next: string | null): string {
  if (next == null) {
    return '/'
  }
  const trimmed = next.trim()
  if (trimmed === '') {
    return '/'
  }
  if (next !== trimmed) {
    return '/'
  }
  if (trimmed.length > MAX_NEXT_LEN) {
    return '/'
  }
  if (!trimmed.startsWith('/')) {
    return '/'
  }
  if (trimmed.startsWith('//')) {
    return '/'
  }
  if (trimmed.includes('://')) {
    return '/'
  }
  return trimmed
}
