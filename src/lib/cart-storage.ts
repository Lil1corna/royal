export const CART_STORAGE_KEY = 'royalaz_cart'

export type CartItem = {
  id: string
  name: string
  price: number
  size: string | null
  image: string | null
  quantity: number
}

export function safeParseCart(raw: string | null): CartItem[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as CartItem[]
  } catch {
    console.warn('Cart data corrupted, resetting cart')
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CART_STORAGE_KEY)
    }
    return []
  }
}
