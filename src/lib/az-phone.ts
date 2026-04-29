/** Format AZ mobile for display (+994 XX XXX XX XX). */
export function formatAzPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^994/, '')
  const d = digits.slice(0, 9)
  const p1 = d.slice(0, 2)
  const p2 = d.slice(2, 5)
  const p3 = d.slice(5, 7)
  const p4 = d.slice(7, 9)
  let result = '+994'
  if (p1) result += ` ${p1}`
  if (p2) result += ` ${p2}`
  if (p3) result += ` ${p3}`
  if (p4) result += ` ${p4}`
  return result
}

/** Normalize to +994XXXXXXXXX or null. */
export function normalizeAzPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (/^994\d{9}$/.test(digits)) return `+${digits}`
  if (/^0\d{9}$/.test(digits)) return `+994${digits.slice(1)}`
  if (/^\d{9}$/.test(digits)) return `+994${digits}`
  return null
}
