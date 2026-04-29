'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchWithCsrf } from '@/lib/fetch-with-csrf'
import { useLang } from '@/context/lang'
import { ADMIN_NEXT_STATUS, type OrderStatus } from '@/lib/order-status'
import type { PermissionKey } from '@/config/roles'

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export function AdminOrderActions({
  orderId,
  currentStatus,
  paymentMethod,
  paymentStatus,
  kbOrderId,
  perms,
}: {
  orderId: string
  currentStatus: string
  paymentMethod: string
  paymentStatus: PaymentStatus | string | null
  kbOrderId: string | null
  perms: PermissionKey[]
}) {
  const router = useRouter()
  const { lang } = useLang()
  const [busy, setBusy] = useState(false)

  const canManage = perms.includes('manage_orders')
  const status = currentStatus as OrderStatus
  const next = ADMIN_NEXT_STATUS[status]

  const canAdvance =
    paymentMethod === 'cash' || String(paymentStatus ?? '') === 'paid'

  const nextLabel =
    next === 'confirmed'
      ? lang === 'az'
        ? '→ Təsdiq'
        : lang === 'ru'
          ? '→ Подтвердить'
          : '→ Confirm'
      : next === 'in_delivery'
        ? lang === 'az'
          ? '→ Yola ver'
          : lang === 'ru'
            ? '→ В путь'
            : '→ In delivery'
        : next === 'delivered'
          ? lang === 'az'
            ? '→ Çatdırıldı'
            : lang === 'ru'
              ? '→ Доставлено'
              : '→ Delivered'
          : null

  const patchStatus = async (newStatus: OrderStatus) => {
    setBusy(true)
    try {
      const res = await fetchWithCsrf(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        router.push('/admin/orders?toast=success')
        router.refresh()
      } else {
        router.push('/admin/orders?toast=error')
      }
    } catch {
      router.push('/admin/orders?toast=error')
    } finally {
      setBusy(false)
    }
  }

  const verifyPayment = async () => {
    if (!kbOrderId) return
    setBusy(true)
    try {
      const res = await fetchWithCsrf('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kbOrderId }),
      })
      if (res.ok) router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {canManage && next && nextLabel && (
        <>
          {canAdvance ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void patchStatus(next)}
              className="min-h-[44px] rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 text-xs font-semibold uppercase tracking-wide text-amber-200/90 hover:bg-amber-500/20 disabled:opacity-50"
            >
              {nextLabel}
            </button>
          ) : paymentMethod === 'online' ? (
            <span className="text-xs text-white/30 italic">
              {lang === 'az' ? 'Ödənilməyib' : lang === 'ru' ? 'Не оплачен' : 'Unpaid'}
            </span>
          ) : null}
        </>
      )}
      {paymentMethod === 'online' &&
        paymentStatus === 'pending' &&
        kbOrderId &&
        canManage && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void verifyPayment()}
            className="min-h-[44px] rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white/80 hover:bg-white/10 disabled:opacity-50"
          >
            Yoxla
          </button>
        )}
    </div>
  )
}
