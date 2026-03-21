/** Собрать полную строку адреса из user_metadata Supabase */
export function buildProfileAddressLine(meta: Record<string, unknown> | null | undefined): string {
  if (!meta) return ''
  const main = typeof meta.shipping_address === 'string' ? meta.shipping_address.trim() : ''
  const extra =
    typeof meta.shipping_address_extra === 'string'
      ? meta.shipping_address_extra.trim()
      : ''
  return [main, extra].filter(Boolean).join(', ')
}

export function metaCoord(v: unknown): number | null {
  if (v == null) return null
  if (typeof v === 'number' && Number.isFinite(v)) return v
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}
