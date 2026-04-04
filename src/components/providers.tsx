'use client'
import { CartProvider } from '@/context/cart'
import { FlyToCartProvider } from '@/context/fly-to-cart'
import { LangProvider } from '@/context/lang'
import { WishlistProvider } from '@/context/wishlist'
import PagePreloader from '@/components/page-preloader'
import SupabaseRealtimeBridge from '@/components/supabase-realtime-bridge'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <PagePreloader />
      <SupabaseRealtimeBridge />
      <CartProvider>
        <FlyToCartProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </FlyToCartProvider>
      </CartProvider>
    </LangProvider>
  )
}
