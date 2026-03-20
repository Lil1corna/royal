'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { deliveryModeLabel, type DeliveryMode } from '@/lib/delivery'

type OrderItem = {
  id: string
  quantity: number
  price_at_purchase: number
  products?: { name_ru?: string } | null
}

export type AdminOrder = {
  id: string
  status: string
  created_at: string
  total_price: number
  address: string
  notes: string | null
  subtotal?: number | null
  shipping_fee?: number | null
  delivery_mode?: string | null
  order_items?: OrderItem[] | null
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    new: { label: 'Yeni', className: 'bg-orange-100 text-orange-700' },
    confirmed: { label: 'Tesdiq edildi', className: 'bg-blue-100 text-blue-700' },
    in_delivery: { label: 'Yolda', className: 'bg-purple-100 text-purple-700' },
    delivered: { label: 'Catdirildi', className: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Legv edildi', className: 'bg-red-100 text-red-700' },
  }
  const s = map[status] || { label: status, className: 'bg-gray-100 text-gray-700' }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  )
}

function NotesWithMap({ notes }: { notes: string | null }) {
  if (!notes) return <div className="text-sm">-</div>
  const match = notes.match(/Koordinat: ([\d.]+),([\d.]+)/)
  if (!match) return <div className="text-sm">{notes}</div>
  const lat = match[1]
  const lng = match[2]
  const clean = notes.replace(/ \| Koordinat: [\d.,]+/, '')
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`
  return (
    <div className="text-sm flex flex-col gap-1">
      <span>{clean}</span>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 hover:underline text-xs w-fit bg-blue-50 px-2 py-1 rounded-lg"
      >
        Google Maps-de ac
      </a>
    </div>
  )
}

function OrderActions({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const next: Record<string, { status: string; label: string }> = {
    new: { status: 'confirmed', label: 'Tesdiq et' },
    confirmed: { status: 'in_delivery', label: 'Yola ver' },
    in_delivery: { status: 'delivered', label: 'Catdirildi' },
  }
  const n = next[currentStatus]
  return (
    <div className="flex gap-2 flex-wrap">
      {n && (
        <form action="/admin/orders/update" method="post">
          <input type="hidden" name="id" value={orderId} />
          <input type="hidden" name="status" value={n.status} />
          <button type="submit" className="btn-admin btn-icon-arrow px-4 py-2">
            {n.label} <span className="arrow">→</span>
          </button>
        </form>
      )}
      {currentStatus !== 'cancelled' && currentStatus !== 'delivered' && (
        <form action="/admin/orders/update" method="post">
          <input type="hidden" name="id" value={orderId} />
          <input type="hidden" name="status" value="cancelled" />
          <button
            type="submit"
            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-200"
          >
            Legv et
          </button>
        </form>
      )}
    </div>
  )
}

const FILTER_ALL = 'all'

export default function AdminOrdersClient({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders)
  const [filter, setFilter] = useState<string>(FILTER_ALL)
  const [search, setSearch] = useState('')
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null
    try {
      channel = supabase
        .channel('admin-orders-all')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          async (payload) => {
            try {
              if (payload.eventType === 'UPDATE' && payload.new) {
                const row = payload.new as AdminOrder
                setOrders((prev) =>
                  prev.map((o) =>
                    o.id === row.id ? { ...o, ...row, order_items: o.order_items } : o
                  )
                )
              }
              if (payload.eventType === 'INSERT' && payload.new) {
                const row = payload.new as AdminOrder
                const { data: full } = await supabase
                  .from('orders')
                  .select('*, order_items(*, products(name_ru))')
                  .eq('id', row.id)
                  .single()
                if (full) {
                  setOrders((prev) => {
                    if (prev.some((o) => o.id === full.id)) return prev
                    return [full as AdminOrder, ...prev]
                  })
                }
              }
            } catch {
              // ignore
            }
          }
        )
        .subscribe((status, err) => {
          if (err) console.warn('[Realtime] admin orders:', err.message)
        })
    } catch (e) {
      console.warn('[Realtime] admin subscribe failed:', e)
    }
    return () => {
      if (channel) void supabase.removeChannel(channel)
    }
  }, [supabase])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      if (filter !== FILTER_ALL && o.status !== filter) return false
      if (!q) return true
      return o.id.toLowerCase().includes(q) || o.address?.toLowerCase().includes(q)
    })
  }, [orders, filter, search])

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { new: 0 }
    for (const o of orders) {
      c[o.status] = (c[o.status] || 0) + 1
    }
    return c
  }, [orders])

  const filterPills: { key: string; label: string }[] = [
    { key: FILTER_ALL, label: `Hamısı (${orders.length})` },
    { key: 'new', label: `Yeni (${statusCounts.new || 0})` },
    { key: 'confirmed', label: 'Tesdiq' },
    { key: 'in_delivery', label: 'Yolda' },
    { key: 'delivered', label: 'Catdirildi' },
    { key: 'cancelled', label: 'Legv' },
  ]

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="search"
          placeholder="ID və ya ünvan axtar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded-xl px-4 py-2.5 text-sm"
        />
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {filterPills.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setFilter(p.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === p.key
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mb-4">
        <span className="font-semibold">●</span> Canlı yeniləmə aktivdir — status dəyişəndə siyahı avtomatik
        yenilənir (Supabase Realtime).
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map((order) => (
          <div
            key={order.id}
            className={`card-soft p-6 ${order.status === 'new' ? 'ring-1 ring-amber-200 bg-amber-50/40' : ''}`}
          >
            <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className="font-mono text-sm text-gray-400">#{order.id.slice(0, 8)}</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{order.total_price} AZN</div>
                {order.delivery_mode && (
                  <div className="text-xs text-amber-800">
                    {deliveryModeLabel(order.delivery_mode as DeliveryMode, 'az')}
                    {order.shipping_fee != null && order.shipping_fee > 0
                      ? ` · +${order.shipping_fee} AZN`
                      : order.shipping_fee === 0 && order.delivery_mode === 'courier'
                        ? ' · pulsuz catdırılma'
                        : ''}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">Unvan</div>
                <div className="text-sm">{order.address}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Elaqe / Qeyd</div>
                <NotesWithMap notes={order.notes} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {order.order_items?.map((item) => (
                <div key={item.id} className="bg-gray-100 rounded-lg px-3 py-1 text-sm">
                  {item.products?.name_ru} x{item.quantity} — {item.price_at_purchase} AZN
                </div>
              ))}
            </div>

            <OrderActions orderId={order.id} currentStatus={order.status} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-12">Bu filtr üzrə sifariş yoxdur.</p>
      )}
    </>
  )
}
