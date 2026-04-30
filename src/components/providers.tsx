'use client'
import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { CartProvider } from '@/context/cart'
import { FlyToCartProvider } from '@/context/fly-to-cart'
import { LangProvider } from '@/context/lang'
import { WishlistProvider } from '@/context/wishlist'
import { ToastProvider } from '@/context/toast'
import PagePreloader from '@/components/page-preloader'
import SupabaseRealtimeBridge from '@/components/supabase-realtime-bridge'

export function Providers({
  children,
  initialLang,
}: {
  children: React.ReactNode
  /** Always set from root layout (cookie or default) so LangProvider matches SSR. */
  initialLang: 'az' | 'ru' | 'en'
}) {
  useEffect(() => {
    void fetch('/api/csrf', { credentials: 'same-origin' })
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <LangProvider initialLang={initialLang}>
        <PagePreloader />
        <SupabaseRealtimeBridge />
        <CartProvider>
          <FlyToCartProvider>
            <WishlistProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </WishlistProvider>
          </FlyToCartProvider>
        </CartProvider>
      </LangProvider>
    </ThemeProvider>
  )
}
