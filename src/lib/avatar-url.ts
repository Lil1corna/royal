/**
 * Next.js <Image> only allows hosts in next.config remotePatterns.
 * We allow optimization for Supabase project public storage URLs; other HTTPS URLs use <img>.
 */
export function avatarUrlUsesNextImageOptimization(avatarUrl: string): boolean {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, '')
  const trimmed = avatarUrl.trim()
  if (!base || !trimmed) return false
  try {
    const projectHost = new URL(base).hostname
    const u = new URL(trimmed)
    return (
      u.protocol === 'https:' &&
      u.hostname === projectHost &&
      u.pathname.startsWith('/storage/v1/object/public/')
    )
  } catch {
    return false
  }
}
