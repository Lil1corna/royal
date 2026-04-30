import { isOrderStatus, type OrderStatus } from '@/lib/order-status'

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export function PaymentBadge({ method, status }: { method: string; status: string }) {
  const s = status as PaymentStatus
  if (method === 'cash') {
    return (
      <span className="ds-badge ds-badge-gray">
        💵 Nağd
      </span>
    )
  }
  if (method === 'online' && s === 'pending') {
    return (
      <span className="ds-badge ds-badge-gold">
        💳 Gözləyir
      </span>
    )
  }
  if (method === 'online' && s === 'paid') {
    return (
      <span className="ds-badge ds-badge-green">
        💳 Ödənilib
      </span>
    )
  }
  if (method === 'online' && s === 'failed') {
    return (
      <span className="ds-badge ds-badge-red">
        💳 Uğursuz
      </span>
    )
  }
  if (method === 'online' && s === 'cancelled') {
    return (
      <span className="ds-badge ds-badge-gray">
        💳 Ləğv
      </span>
    )
  }
  return (
    <span className="ds-badge ds-badge-gray">
      💳 {status}
    </span>
  )
}

export function DeliveryBadge({ status }: { status: string }) {
  if (!isOrderStatus(status)) {
    return <span className="text-xs text-white/50">{status}</span>
  }
  const map: Record<OrderStatus, { label: string; badgeClass: string }> = {
    new: { label: 'Yeni', badgeClass: 'ds-badge ds-badge-blue' },
    confirmed: { label: 'Təsdiq', badgeClass: 'ds-badge ds-badge-gold' },
    in_delivery: { label: 'Yolda', badgeClass: 'ds-badge ds-badge-purple' },
    delivered: { label: 'Çatdırıldı', badgeClass: 'ds-badge ds-badge-green' },
    cancelled: { label: 'Ləğv', badgeClass: 'ds-badge ds-badge-gray' },
  }
  const b = map[status]
  return <span className={b.badgeClass}>{b.label}</span>
}

