'use client'

import { Fragment, useState } from 'react'
import {
  parseExtraFromNotes,
  parseMapsLinkFromNotes,
  parsePhoneFromNotes,
} from '@/lib/notify-delivery'
import { useLang } from '@/context/lang'
import type { PermissionKey } from '@/config/roles'
import { AdminOrderActions } from './admin-order-actions'
import { DeliveryBadge, PaymentBadge } from './admin-order-badges'

export type AdminOrderRow = {
  id: string
  created_at: string
  total_price: number
  status: string
  payment_method: string
  payment_status: string
  kb_order_id: string | null
  address: string | null
  notes: string | null
  user_id: string | null
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}.${mm}.${yyyy}`
}

/** Notes text excluding lines already represented by Tel / Əlavə / Koordinat (for copy). */
function getNotesBeyondStructured(notes: string | null): string | null {
  if (!notes?.trim()) return null
  const lines = notes
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const filtered = lines.filter(
    (l) => !/^Tel:\s*/i.test(l) && !/^Əlavə:\s*/.test(l) && !/^Koordinat:\s*/.test(l)
  )
  const joined = filtered.join('\n').trim()
  return joined || null
}

export function AdminOrdersTableBody({
  orders,
  emailByUserId,
  permsForClient,
}: {
  orders: AdminOrderRow[]
  emailByUserId: Record<string, string>
  permsForClient: PermissionKey[]
}) {
  const { lang } = useLang()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (order: AdminOrderRow) => {
    const phone = parsePhoneFromNotes(order.notes)
    const extra = parseExtraFromNotes(order.notes)
    const maps = parseMapsLinkFromNotes(order.notes)
    const otherNotes = getNotesBeyondStructured(order.notes)

    let text = ''

    if (lang === 'az') {
      text = [
        `📦 Sifariş: #${order.id.slice(0, 8)}`,
        `💰 Məbləğ: ${order.total_price} AZN`,
        phone ? `📞 Telefon: ${phone}` : '',
        order.address ? `📍 Ünvan: ${order.address}` : '',
        extra ? `ℹ️ Əlavə: ${extra}` : '',
        maps ? `🗺 Xəritə: ${maps}` : '',
        otherNotes ? `📝 Qeyd: ${otherNotes}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    } else if (lang === 'ru') {
      text = [
        `📦 Заказ: #${order.id.slice(0, 8)}`,
        `💰 Сумма: ${order.total_price} AZN`,
        phone ? `📞 Телефон: ${phone}` : '',
        order.address ? `📍 Адрес: ${order.address}` : '',
        extra ? `ℹ️ Доп. инфо: ${extra}` : '',
        maps ? `🗺 Карта: ${maps}` : '',
        otherNotes ? `📝 Заметка: ${otherNotes}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    } else {
      text = [
        `📦 Order: #${order.id.slice(0, 8)}`,
        `💰 Total: ${order.total_price} AZN`,
        phone ? `📞 Phone: ${phone}` : '',
        order.address ? `📍 Address: ${order.address}` : '',
        extra ? `ℹ️ Extra: ${extra}` : '',
        maps ? `🗺 Maps: ${maps}` : '',
        otherNotes ? `📝 Note: ${otherNotes}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    }

    void navigator.clipboard.writeText(text).then(() => {
      setCopiedId(order.id)
      window.setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const deliveryTh =
    lang === 'az' ? 'Çatdırılma' : lang === 'ru' ? 'Доставка' : 'Delivery'

  return (
    <table className="w-full min-w-[900px] border-separate border-spacing-0 bg-transparent">
      <thead>
        <tr className="bg-[rgba(201,168,76,0.06)]">
          <th className="border-b border-white/10 p-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-[rgba(201,168,76,0.7)]">
            #
          </th>
          <th className="border-b border-white/10 p-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-[rgba(201,168,76,0.7)]">
            Müştəri
          </th>
          <th className="border-b border-white/10 p-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-[rgba(201,168,76,0.7)]">
            Məbləğ
          </th>
          <th className="border-b border-white/10 p-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-[rgba(201,168,76,0.7)]">
            Status
          </th>
          <th className="border-b border-white/10 p-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-[rgba(201,168,76,0.7)]">
            {deliveryTh}
          </th>
          <th className="border-b border-white/10 p-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-[rgba(201,168,76,0.7)]">
            Tarix
          </th>
          <th className="border-b border-white/10 p-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-[rgba(201,168,76,0.7)]">
            Əməliyyat
          </th>
        </tr>
      </thead>
      <tbody>
        {orders.length === 0 ? (
          <tr>
            <td colSpan={7} className="border-b border-white/10 p-6 text-center text-sm text-white/50">
              Sifariş yoxdur.
            </td>
          </tr>
        ) : (
          orders.map((o) => {
            const email = o.user_id ? emailByUserId[o.user_id] : undefined
            const phone = parsePhoneFromNotes(o.notes)
            const extra = parseExtraFromNotes(o.notes)
            const maps = parseMapsLinkFromNotes(o.notes)
            const expanded = expandedId === o.id
            return (
              <Fragment key={o.id}>
                <tr
                  className="cursor-pointer hover:bg-white/5"
                  onClick={() => setExpandedId(expanded ? null : o.id)}
                >
                  <td className="border-b border-white/10 p-3 font-medium text-[rgba(255,255,255,0.85)]">
                    #{o.id.slice(0, 8)}
                  </td>
                  <td className="border-b border-white/10 p-3 text-[rgba(255,255,255,0.85)]">
                    {email ?? 'Qonaq'}
                  </td>
                  <td className="border-b border-white/10 p-3 text-[rgba(255,255,255,0.85)]">
                    {Number(o.total_price)} AZN
                  </td>
                  <td className="border-b border-white/10 p-3">
                    <div className="flex flex-col gap-1">
                      <PaymentBadge method={o.payment_method} status={o.payment_status} />
                      <DeliveryBadge status={o.status} />
                    </div>
                  </td>
                  <td className="border-b border-white/10 p-3 align-top">
                    <div className="space-y-0.5 max-w-[220px]">
                      {o.address && (
                        <p className="text-xs text-white/70 truncate" title={o.address}>
                          📍 {o.address}
                        </p>
                      )}
                      {phone && (
                        <a
                          href={`tel:${phone}`}
                          className="text-xs text-[#e8c97a] hover:underline block truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          📞 {phone}
                        </a>
                      )}
                      {extra && (
                        <p className="text-xs text-white/40 truncate" title={extra}>
                          ℹ️ {extra}
                        </p>
                      )}
                      {!o.address && !phone && (
                        <span className="text-xs text-white/20 italic">—</span>
                      )}
                    </div>
                  </td>
                  <td className="border-b border-white/10 p-3 text-sm text-[rgba(255,255,255,0.85)]">
                    {formatDate(o.created_at)}
                  </td>
                  <td
                    className="border-b border-white/10 p-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AdminOrderActions
                      orderId={o.id}
                      currentStatus={o.status}
                      paymentMethod={o.payment_method}
                      paymentStatus={o.payment_status}
                      kbOrderId={o.kb_order_id}
                      perms={permsForClient}
                    />
                  </td>
                </tr>
                {expanded && (
                  <tr className="bg-white/[0.03]">
                    <td colSpan={7} className="border-b border-white/10 p-4 text-left text-sm">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[rgba(201,168,76,0.7)]">
                          {lang === 'az' ? 'Ətraflı' : lang === 'ru' ? 'Подробнее' : 'Details'}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopy(o)
                          }}
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all duration-200 ${
                            copiedId === o.id
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                              : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          {copiedId === o.id
                            ? lang === 'az'
                              ? '✓ Kopyalandı'
                              : lang === 'ru'
                                ? '✓ Скопировано'
                                : '✓ Copied'
                            : lang === 'az'
                              ? '📋 Kopyala'
                              : lang === 'ru'
                                ? '📋 Копировать'
                                : '📋 Copy'}
                        </button>
                      </div>
                      <div className="space-y-2 text-white/80">
                        <p>
                          <span className="text-white/50">
                            {lang === 'az' ? 'Ünvan: ' : lang === 'ru' ? 'Адрес: ' : 'Address: '}
                          </span>
                          {o.address || '—'}
                        </p>
                        {phone && (
                          <p>
                            <span className="text-white/50">
                              {lang === 'az' ? 'Telefon: ' : lang === 'ru' ? 'Телефон: ' : 'Phone: '}
                            </span>
                            <a href={`tel:${phone}`} className="text-[#e8c97a] hover:underline">
                              {phone}
                            </a>
                          </p>
                        )}
                        {extra && (
                          <p>
                            <span className="text-white/50">
                              {lang === 'az' ? 'Əlavə: ' : lang === 'ru' ? 'Доп.: ' : 'Extra: '}
                            </span>
                            {extra}
                          </p>
                        )}
                        {maps && (
                          <p>
                            <a
                              href={maps}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#e8c97a] hover:underline"
                            >
                              Google Maps
                            </a>
                          </p>
                        )}
                        <p className="text-white/50 text-xs whitespace-pre-wrap break-words">
                          {lang === 'az' ? 'Qeydlər: ' : lang === 'ru' ? 'Заметки: ' : 'Notes: '}
                          <span className="text-white/70">{o.notes || '—'}</span>
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })
        )}
      </tbody>
    </table>
  )
}
