'use client'
import { createContext, useContext, useState, useEffect } from 'react'

type CartItem = {
  id: string
  name: string
  price: number
  size: string | null
  image: string | null
  quantity: number
}

type CartContext = {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (id: string, size: string | null) => void
  clear: () => void
  total: number
  count: number
}

const CartCtx = createContext<CartContext>({
  items: [], add: () => {}, remove: () => {}, clear: () => {}, total: 0, count: 0
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('royalaz_cart')
    if (saved) setItems(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('royalaz_cart', JSON.stringify(items))
  }, [items])

  const add = (item: CartItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id && i.size === item.size)
      if (exists) {
        return prev.map(i =>
          i.id === item.id && i.size === item.size
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const remove = (id: string, size: string | null) => {
    setItems(prev => prev.filter(i => !(i.id === id && i.size === size)))
  }

  const clear = () => setItems([])

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartCtx.Provider value={{ items, add, remove, clear, total, count }}>
      {children}
    </CartCtx.Provider>
  )
}

export const useCart = () => useContext(CartCtx)
