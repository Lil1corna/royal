import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { ROLES, normalizeDbRoleToRoleKey, type PermissionKey } from '@/config/roles'
import { ensureAuthorized } from '@/lib/ensure-authorized'
import { isOrderStatus, type OrderStatus } from '@/lib/order-status'
import { AdminOrderActions } from './admin-order-actions'

type OrderRow = {
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

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}.${mm}.${yyyy}`
}

function PaymentBadge({ method, status }: { method: string; status: string }) {
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

function DeliveryBadge({ status }: { status: string }) {
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

export default async function OrdersPage(props: { searchParams: Promise<{ toast?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createServerSupabase()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()

  const roleKey = normalizeDbRoleToRoleKey(profile?.role)
  const perms = ROLES[roleKey].permissions

  const canAccessOrdersAdmin = perms.includes('manage_orders') || perms.includes('view_analytics')
  if (!profile || !canAccessOrdersAdmin) redirect('/admin')

  const auth = await ensureAuthorized('manage_orders')
  const authFallback = auth.ok ? auth : await ensureAuthorized('view_analytics')
  if (!authFallback.ok) redirect('/admin')

  const { data: orders, error: ordersError } = await authFallback.admin
    .from('orders')
    .select('id, created_at, total_price, status, payment_method, payment_status, kb_order_id, address, notes, user_id')
    .order('created_at', { ascending: false })
    .limit(200)

  if (ordersError) {
    console.error('[admin/orders] fetch orders:', ordersError)
  }

  const list = (orders ?? []) as OrderRow[]
  const userIds = [...new Set(list.map((o) => o.user_id).filter((id): id is string => Boolean(id)))]

  const emailByUserId = new Map<string, string>()
  if (userIds.length > 0) {
    const { data: userRows } = await authFallback.admin.from('users').select('id, email').in('id', userIds)
    for (const row of userRows ?? []) {
      if (row && typeof row === 'object' && 'id' in row && 'email' in row) {
        const r = row as { id: string; email: string | null }
        if (r.email) emailByUserId.set(r.id, r.email)
      }
    }
  }

  const permsForClient = perms as PermissionKey[]

  return (
    <main className="mx-auto max-w-6xl p-4 pb-24 md:p-6 md:pb-8 lg:p-8">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <a href="/admin" className="text-neutral-400 transition-colors hover:text-amber-400">
          Geri
        </a>
        <h1 className="text-3xl font-bold text-white">Sifarişlər</h1>
      </div>
      {searchParams.toast === 'success' && (
        <div className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          Status ugurla yenilendi.
        </div>
      )}
      {searchParams.toast === 'error' && (
        <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          Status yenilenmedi. Yeniden cehd edin.
        </div>
      )}
      {searchParams.toast === 'forbidden' && (
        <div className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          Huquq yoxdur və ya sorgu limiti.
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[720px] border-separate border-spacing-0 bg-transparent">
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
                Tarix
              </th>
              <th className="border-b border-white/10 p-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-[rgba(201,168,76,0.7)]">
                Əməliyyat
              </th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={6} className="border-b border-white/10 p-6 text-center text-sm text-white/50">
                  Sifariş yoxdur.
                </td>
              </tr>
            ) : (
              list.map((o) => {
                const email = o.user_id ? emailByUserId.get(o.user_id) : undefined
                return (
                  <tr key={o.id} className="hover:bg-white/5">
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
                    <td className="border-b border-white/10 p-3 text-sm text-[rgba(255,255,255,0.85)]">
                      {formatDate(o.created_at)}
                    </td>
                    <td className="border-b border-white/10 p-3">
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
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
