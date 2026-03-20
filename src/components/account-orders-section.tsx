'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
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
    const channel = supabase
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
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  if (!orders.length) {
    return (
      <div className="text-center py-16 border rounded-xl">
        <div className="text-5xl mb-4">📦</div>
        <p className="text-gray-500 mb-4">{tr.noOrdersYet[lang]}</p>
        <a href="/" className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
          {tr.startShopping[lang]}
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <div key={order.id} className="border rounded-xl p-6 card-soft">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <span className="font-mono text-sm text-gray-400">
                  #{order.id.slice(0, 8)}
                </span>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                  {tr.liveStatus[lang]}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{order.total_price} AZN</div>
              {order.shipping_fee != null && order.shipping_fee > 0 && (
                <div className="text-xs text-gray-500">
                  +{order.shipping_fee} {tr.shippingLine[lang]}
                </div>
              )}
              {order.delivery_mode && (
                <div className="text-xs text-amber-700 mt-0.5">
                  {deliveryModeLabel(order.delivery_mode as DeliveryMode, lang)}
                </div>
              )}
            </div>
          </div>

          <OrderStatusTimeline status={order.status} />

          <div className="flex flex-wrap gap-3 mb-3 mt-4">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                {item.products?.image_urls?.[0] && (
                  <img
                    src={item.products.image_urls[0]}
                    alt=""
                    className="w-10 h-10 object-cover rounded-lg"
                  />
                )}
                <div>
                  <div className="text-sm font-medium">{item.products?.name_ru}</div>
                  <div className="text-xs text-gray-500">
                    x{item.quantity} — {item.price_at_purchase} AZN
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-500 border-t pt-3">{order.address}</div>
        </div>
      ))}
    </div>
  )
}
