'use client'
import { CartProvider } from '@/context/cart'
import { LangProvider } from '@/context/lang'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </LangProvider>
  )
}
