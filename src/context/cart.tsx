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
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem(CART_STORAGE_KEY)
    return safeParseCart(saved)
  })

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

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
    <CartCtx.Provider value={{ items, add, decrease, remove, clear, replaceItems, total, count }}>
      {children}
    </CartCtx.Provider>
  )
}

export const useCart = () => useContext(CartCtx)
