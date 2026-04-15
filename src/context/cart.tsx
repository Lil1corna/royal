'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import {
  safeParseCart,
  CART_STORAGE_KEY,
  type CartItem,
} from '@/lib/cart-storage'

export type { CartItem }

type CartContext = {
  items: CartItem[]
  add: (item: CartItem) => void
  decrease: (id: string, size: string | null) => void
  remove: (id: string, size: string | null) => void
  clear: () => void
  replaceItems: (nextItems: CartItem[]) => void
  total: number
  count: number
  /** false until client has read localStorage — avoids hydration badge mismatch. */
  isHydrated: boolean
}

const CartCtx = createContext<CartContext>({
  items: [],
  add: () => {},
  decrease: () => {},
  remove: () => {},
  clear: () => {},
  replaceItems: () => {},
  total: 0,
  count: 0,
  isHydrated: false,
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY)
    // One-time hydration from localStorage after mount (matches server empty state).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-mount sync
    setItems(safeParseCart(saved))
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items, isHydrated])

  const add = (item: CartItem) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id && i.size === item.size)
      if (exists) {
        return prev.map((i) =>
          i.id === item.id && i.size === item.size
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const remove = (id: string, size: string | null) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.size === size)))
  }

  const decrease = (id: string, size: string | null) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.id === id && i.size === size
            ? { ...i, quantity: Math.max(0, i.quantity - 1) }
            : i
        )
        .filter((i) => i.quantity > 0)
    )
  }

  const clear = () => setItems([])
  const replaceItems = (nextItems: CartItem[]) => setItems(nextItems)

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartCtx.Provider
      value={{ items, add, decrease, remove, clear, replaceItems, total, count, isHydrated }}
    >
      {children}
    </CartCtx.Provider>
  )
}

export const useCart = () => useContext(CartCtx)
