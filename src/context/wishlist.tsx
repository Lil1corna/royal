'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE = 'royalaz_wishlist'

type WishlistContextValue = {
  ids: string[]
  has: (productId: string) => boolean
  toggle: (productId: string) => void
  count: number
}

const WishlistCtx = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE)
      const parsed = raw ? JSON.parse(raw) : []
      setIds(Array.isArray(parsed) ? parsed.filter((x: unknown) => typeof x === 'string') : [])
    } catch {
      setIds([])
    }
  }, [])

  const toggle = useCallback(
    (productId: string) => {
      setIds((prev) => {
        const next = prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
        localStorage.setItem(STORAGE, JSON.stringify(next))
        return next
      })
    },
    []
  )

  const has = useCallback((productId: string) => ids.includes(productId), [ids])

  const value = useMemo(
    () => ({ ids, has, toggle, count: ids.length }),
    [ids, has, toggle]
  )

  return <WishlistCtx.Provider value={value}>{children}</WishlistCtx.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistCtx)
  if (!ctx) {
    throw new Error('useWishlist must be used within WishlistProvider')
  }
  return ctx
}
