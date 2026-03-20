'use client'
import { CartProvider } from '@/context/cart'
import { LangProvider } from '@/context/lang'
import { WishlistProvider } from '@/context/wishlist'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </LangProvider>
  )
}
