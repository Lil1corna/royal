'use client'
import { ThemeProvider } from 'next-themes'
import { CartProvider } from '@/context/cart'
import { FlyToCartProvider } from '@/context/fly-to-cart'
import { LangProvider } from '@/context/lang'
import { WishlistProvider } from '@/context/wishlist'
import { ToastProvider } from '@/context/toast'
import PagePreloader from '@/components/page-preloader'
import SupabaseRealtimeBridge from '@/components/supabase-realtime-bridge'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <LangProvider>
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
