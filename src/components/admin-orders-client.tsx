'use client'

import { useEffect, useMemo, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
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
  payment_method?: 'cash' | 'online' | null
  payment_status?: 'pending' | 'paid' | 'failed' | null
  order_items?: OrderItem[] | null
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    new: { label: 'Yeni', className: 'bg-orange-500/20 text-orange-300 border border-orange-500/30' },
    confirmed: { label: 'Tesdiq edildi', className: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
    in_delivery: { label: 'Yolda', className: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
    delivered: { label: 'Catdirildi', className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
    cancelled: { label: 'Legv edildi', className: 'bg-red-500/20 text-red-300 border border-red-500/30' },
  }
  const s = map[status] || { label: status, className: 'bg-neutral-500/20 text-neutral-300 border border-neutral-500/30' }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  )
}

function PaymentStatusBadge({ status }: { status: string | null | undefined }) {
  const normalized = status || 'pending'
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-neutral-500/20 text-neutral-300 border border-neutral-500/30' },
    paid: { label: 'Paid', className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
    failed: { label: 'Failed', className: 'bg-red-500/20 text-red-300 border border-red-500/30' },
  }
  const s = map[normalized] || map.pending
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.className}`}>{s.label}</span>
}

function NotesWithMap({ notes }: { notes: string | null }) {
  if (!notes) return <div className="text-sm text-neutral-200">-</div>
  const match = notes.match(/Koordinat: ([\d.]+),([\d.]+)/)
  if (!match) return <div className="text-sm text-neutral-200">{notes}</div>
  const lat = match[1]
  const lng = match[2]
  const clean = notes.replace(/ \| Koordinat: [\d.,]+/, '')
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`
  return (
    <div className="text-sm flex flex-col gap-1">
      <span className="text-neutral-200">{clean}</span>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noreferrer"
        className="text-amber-400 hover:text-amber-300 text-xs w-fit bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/30 transition-colors"
      >
        Google Maps-de ac
      </a>
    </div>
  )
}

function OrderActions({
  orderId,
  currentStatus,
  canUpdateOrderStatus,
  onStatusChanged,
}: {
  orderId: string
  currentStatus: string
  canUpdateOrderStatus: boolean
  onStatusChanged: (orderId: string, newStatus: string) => void
}) {
  const [updating, setUpdating] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!canUpdateOrderStatus) {
    return <div className="text-sm text-neutral-400">—</div>
  }
  const next: Record<string, { status: string; label: string }> = {
    new: { status: 'confirmed', label: 'Tesdiq et' },
    confirmed: { status: 'in_delivery', label: 'Yola ver' },
    in_delivery: { status: 'delivered', label: 'Catdirildi' },
  }
  const n = next[currentStatus]

  const handleUpdate = async (targetStatus: string) => {
    setUpdating(targetStatus)
    setErrorMsg(null)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      })
      const data = (await res.json()) as { success?: boolean; error?: string }
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || `Error ${res.status}`)
        return
      }
      onStatusChanged(orderId, targetStatus)
    } catch {
      setErrorMsg('Network error')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="flex gap-2 flex-wrap items-center">
      {n && (
        <button
          type="button"
          onClick={() => handleUpdate(n.status)}
          disabled={updating !== null}
          className="btn-admin btn-icon-arrow px-4 py-2 disabled:opacity-50"
        >
          {updating === n.status ? '...' : n.label} <span className="arrow">→</span>
        </button>
      )}
      {currentStatus !== 'cancelled' && currentStatus !== 'delivered' && (
        <button
          type="button"
          onClick={() => handleUpdate('cancelled')}
          disabled={updating !== null}
          className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg text-sm hover:bg-red-500/30 border border-red-500/30 transition-colors disabled:opacity-50"
        >
          {updating === 'cancelled' ? '...' : 'Legv et'}
        </button>
      )}
      {errorMsg && <span className="text-xs text-red-400">{errorMsg}</span>}
    </div>
  )
}

const FILTER_ALL = 'all'

export default function AdminOrdersClient({
  initialOrders,
  canUpdateOrderStatus,
}: {
  initialOrders: AdminOrder[]
  canUpdateOrderStatus: boolean
}) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders)
  const [filter, setFilter] = useState<string>(FILTER_ALL)
  const [search, setSearch] = useState('')
  const supabase = useMemo(() => getSupabaseClient(), [])

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
          className="flex-1 ds-input"
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
                ? 'bg-amber-500 text-black'
                : 'bg-white/10 text-neutral-300 hover:bg-white/20 border border-white/20'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2 mb-4">
        <span className="font-semibold">●</span> Canlı yeniləmə aktivdir — status dəyişəndə siyahı avtomatik
        yenilənir (Supabase Realtime).
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map((order) => (
          <div
            key={order.id}
            className={`ds-card-glass p-6 rounded-2xl ${order.status === 'new' ? 'ring-1 ring-amber-500/50' : ''}`}
          >
            <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className="font-mono text-sm text-neutral-400">#{order.id.slice(0, 8)}</span>
                  <StatusBadge status={order.status} />
                  <PaymentStatusBadge status={order.payment_status} />
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-neutral-200 border border-white/20">
                    {order.payment_method === 'online' ? 'Online' : 'Cash'}
                  </span>
                </div>
                <div className="text-sm text-neutral-400">
                  {new Date(order.created_at).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{order.total_price} AZN</div>
                {order.delivery_mode && (
                  <div className="text-xs text-amber-300">
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
                <div className="text-xs text-neutral-500 mb-1">Unvan</div>
                <div className="text-sm text-neutral-200">{order.address}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">Elaqe / Qeyd</div>
                <NotesWithMap notes={order.notes} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {order.order_items?.map((item) => (
                <div key={item.id} className="bg-white/10 rounded-lg px-3 py-1 text-sm text-neutral-200 border border-white/20">
                  {item.products?.name_ru} x{item.quantity} — {item.price_at_purchase} AZN
                </div>
              ))}
            </div>

            <OrderActions
              orderId={order.id}
              currentStatus={order.status}
              canUpdateOrderStatus={canUpdateOrderStatus}
              onStatusChanged={(oid, newStatus) => {
                setOrders((prev) =>
                  prev.map((o) => o.id === oid ? { ...o, status: newStatus } : o)
                )
              }}
            />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-neutral-400 py-12">Bu filtr üzrə sifariş yoxdur.</p>
      )}
    </>
  )
}
