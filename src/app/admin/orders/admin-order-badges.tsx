import { isOrderStatus, type OrderStatus } from '@/lib/order-status'

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export function PaymentBadge({ method, status }: { method: string; status: string }) {
  const s = status as PaymentStatus
  if (method === 'cash') {
    return (
      <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-xs font-medium text-white/70">
        💵 Nağd
      </span>
    )
  }
  if (method === 'online' && s === 'pending') {
    return (
      <span className="rounded-full border border-amber-500/35 bg-amber-500/15 px-2 py-1 text-xs font-medium text-amber-200">
        💳 Gözləyir
      </span>
    )
  }
  if (method === 'online' && s === 'paid') {
    return (
      <span className="rounded-full border border-emerald-500/35 bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-200">
        💳 Ödənilib
      </span>
    )
  }
  if (method === 'online' && s === 'failed') {
    return (
      <span className="rounded-full border border-red-500/35 bg-red-500/15 px-2 py-1 text-xs font-medium text-red-200">
        💳 Uğursuz
      </span>
    )
  }
  if (method === 'online' && s === 'cancelled') {
    return (
      <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-xs font-medium text-white/60">
        💳 Ləğv
      </span>
    )
  }
  return (
    <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-xs text-white/60">
      💳 {status}
    </span>
  )
}

export function DeliveryBadge({ status }: { status: string }) {
  if (!isOrderStatus(status)) {
    return <span className="text-xs text-white/50">{status}</span>
  }
  const map: Record<OrderStatus, { label: string; className: string }> = {
    new: { label: 'Yeni', className: 'bg-sky-500/15 text-sky-200 border-sky-500/30' },
    confirmed: { label: 'Təsdiq', className: 'bg-amber-500/15 text-amber-200 border-amber-500/30' },
    in_delivery: { label: 'Yolda', className: 'bg-purple-500/15 text-purple-200 border-purple-500/30' },
    delivered: { label: 'Çatdırıldı', className: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30' },
    cancelled: { label: 'Ləğv', className: 'bg-red-500/15 text-red-200 border-red-500/30' },
  }
  const b = map[status]
  return (
    <span className={`rounded-full border px-2 py-1 text-xs font-medium ${b.className}`}>{b.label}</span>
  )
}
