import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { ROLES, normalizeDbRoleToRoleKey, type PermissionKey } from '@/config/roles'
import { ensureAuthorized } from '@/lib/ensure-authorized'
import { AdminOrdersTableBody, type AdminOrderRow } from './admin-orders-table-body'

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

  const list = (orders ?? []) as AdminOrderRow[]
  const userIds = [...new Set(list.map((o) => o.user_id).filter((id): id is string => Boolean(id)))]

  const emailByUserId: Record<string, string> = {}
  if (userIds.length > 0) {
    const { data: userRows } = await authFallback.admin.from('users').select('id, email').in('id', userIds)
    for (const row of userRows ?? []) {
      if (row && typeof row === 'object' && 'id' in row && 'email' in row) {
        const r = row as { id: string; email: string | null }
        if (r.email) emailByUserId[r.id] = r.email
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
        <AdminOrdersTableBody orders={list} emailByUserId={emailByUserId} permsForClient={permsForClient} />
      </div>
    </main>
  )
}
