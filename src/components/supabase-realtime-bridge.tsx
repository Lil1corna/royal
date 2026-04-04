'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'

const REALTIME_TABLES = [
  'products',
  'product_sizes',
  'orders',
  'order_items',
  'users',
  'pending_staff_invites',
] as const

export default function SupabaseRealtimeBridge() {
  const supabase = useMemo(() => getSupabaseClient(), [])
  const router = useRouter()
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const isLocalhost =
      typeof window !== 'undefined' &&
      ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
    const canUseWebSocket =
      typeof window !== 'undefined' &&
      window.isSecureContext &&
      (window.location.protocol === 'https:' || isLocalhost)

    if (!canUseWebSocket) return

    const scheduleRefresh = () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = setTimeout(() => {
        router.refresh()
      }, 180)
    }

    let channel: ReturnType<typeof supabase.channel> | null = null

    try {
      channel = REALTIME_TABLES.reduce(
        (acc, table) =>
          acc.on(
            'postgres_changes',
            { event: '*', schema: 'public', table },
            () => {
              scheduleRefresh()
            }
          ),
        supabase.channel('global-db-refresh')
      )

      channel.subscribe((status, err) => {
        if (err) {
          console.warn('[Realtime] global subscription error:', err.message)
          return
        }
        if (status === 'CHANNEL_ERROR') {
          console.warn('[Realtime] global channel status:', status)
        }
      })
    } catch (error) {
      console.warn('[Realtime] global subscribe skipped:', error)
    }

    const { data: authSubscription } = supabase.auth.onAuthStateChange(() => {
      scheduleRefresh()
    })

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
      if (channel) void supabase.removeChannel(channel)
      authSubscription.subscription.unsubscribe()
    }
  }, [router, supabase])

  return null
}
