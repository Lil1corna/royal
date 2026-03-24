'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import OrderStatusTimeline from '@/components/order-status-timeline'
import { deliveryModeLabel, type DeliveryMode } from '@/lib/delivery'
import { useLang, translations } from '@/context/lang'

export type AccountOrderItem = {
  id: string
  quantity: number
  price_at_purchase: number
  products?: { name_ru?: string; image_urls?: string[] | null } | null
}

export type AccountOrder = {
  id: string
  status: string
  created_at: string
  total_price: number
  address: string
  notes?: string | null
  subtotal?: number | null
  shipping_fee?: number | null
  delivery_mode?: string | null
  order_items?: AccountOrderItem[] | null
}

export default function AccountOrdersSection({
  userId,
  initialOrders,
}: {
  userId: string
  initialOrders: AccountOrder[]
}) {
  const { lang } = useLang()
  const tr = translations
  const [orders, setOrders] = useState<AccountOrder[]>(initialOrders)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null
    try {
      channel = supabase
        .channel(`orders-user-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${userId}`,
          },
          async (payload) => {
            try {
              if (payload.eventType === 'UPDATE' && payload.new) {
                const row = payload.new as AccountOrder
                setOrders((prev) =>
                  prev.map((o) =>
                    o.id === row.id ? { ...o, ...row, order_items: o.order_items } : o
                  )
                )
              }
              if (payload.eventType === 'INSERT' && payload.new) {
                const row = payload.new as AccountOrder
                const { data: full } = await supabase
                  .from('orders')
                  .select('*, order_items(*, products(name_ru, image_urls))')
                  .eq('id', row.id)
                  .single()
                if (full) {
                  setOrders((prev) => {
                    if (prev.some((o) => o.id === full.id)) return prev
                    return [full as AccountOrder, ...prev]
                  })
                }
              }
            } catch {
              // ignore realtime callback errors
            }
          }
        )
        .subscribe((status, err) => {
          if (err) console.warn('[Realtime] orders subscription:', err.message)
        })
    } catch (e) {
      console.warn('[Realtime] failed to subscribe:', e)
    }
    return () => {
      if (channel) void supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  if (!orders.length) {
    return (
      <div className="text-center py-16 ds-card-glass rounded-2xl">
        <div className="text-5xl mb-4">📦</div>
        <p className="text-neutral-300 mb-4">{tr.noOrdersYet[lang]}</p>
        <Link href="/" className="ds-btn-primary inline-block px-6 py-2">
          {tr.startShopping[lang]}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <div key={order.id || 'unknown'} className="ds-card-glass rounded-2xl p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <span className="font-mono text-sm text-neutral-400">
                  #{order.id?.slice(0, 8) ?? '…'}
                </span>
                <span className="text-xs text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium border border-emerald-500/30">
                  {tr.liveStatus[lang]}
                </span>
              </div>
              <div className="text-sm text-neutral-400">
                {new Date(order.created_at).toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-white">{order.total_price} AZN</div>
              {order.shipping_fee != null && order.shipping_fee > 0 && (
                <div className="text-xs text-neutral-400">
                  +{order.shipping_fee} {tr.shippingLine[lang]}
                </div>
              )}
              {order.delivery_mode && (
                <div className="text-xs text-amber-300 mt-0.5">
                  {deliveryModeLabel(order.delivery_mode as DeliveryMode, lang)}
                </div>
              )}
            </div>
          </div>

          <OrderStatusTimeline status={order.status || 'new'} />

          <div className="flex flex-wrap gap-3 mb-3 mt-4">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex items-center gap-2 bg-white/10 rounded-lg p-2 border border-white/20">
                {item.products?.image_urls?.[0] && (
                  <Image
                    src={item.products.image_urls[0]}
                    alt={item.products?.name_ru || 'Product image'}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-cover rounded-lg"
                  />
                )}
                <div>
                  <div className="text-sm font-medium text-neutral-200">{item.products?.name_ru}</div>
                  <div className="text-xs text-neutral-400">
                    x{item.quantity} — {item.price_at_purchase} AZN
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-sm text-neutral-400 border-t border-white/10 pt-3">{order.address}</div>
        </div>
      ))}
    </div>
  )
}
