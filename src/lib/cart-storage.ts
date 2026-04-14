import { z } from 'zod'

export const CART_STORAGE_KEY = 'royalaz_cart'

export const cartItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative().finite(),
  size: z.string().nullable(),
  image: z.string().nullable(),
  quantity: z.number().int().positive().finite(),
})

export const cartArraySchema = z.array(cartItemSchema)

export type CartItem = z.infer<typeof cartItemSchema>

export function safeParseCart(raw: string | null): CartItem[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      console.warn('[cart-storage] Cart data is not an array, resetting')
      if (typeof window !== 'undefined') localStorage.removeItem(CART_STORAGE_KEY)
      return []
    }
    const result = cartArraySchema.safeParse(parsed)
    if (!result.success) {
      console.warn('[cart-storage] Cart validation failed, resetting:', result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '))
      if (typeof window !== 'undefined') localStorage.removeItem(CART_STORAGE_KEY)
      return []
    }
    return result.data
  } catch {
    console.warn('[cart-storage] Cart data corrupted, resetting cart')
    if (typeof window !== 'undefined') localStorage.removeItem(CART_STORAGE_KEY)
    return []
  }
}
