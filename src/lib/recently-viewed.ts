const KEY = 'royalaz_recent_products'

export function pushRecentProductId(id: string) {
  if (typeof window === 'undefined') return
  let list: string[] = []
  try {
    list = JSON.parse(localStorage.getItem(KEY) || '[]')
    if (!Array.isArray(list)) list = []
  } catch {
    list = []
  }
  list = [id, ...list.filter((x) => x !== id)].slice(0, 12)
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function getRecentProductIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(list) ? list.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}
