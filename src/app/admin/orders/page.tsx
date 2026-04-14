import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import AdminOrdersClient from '@/components/admin-orders-client'
import { ROLES, normalizeDbRoleToRoleKey } from '@/config/roles'

export default async function OrdersPage(props: { searchParams: Promise<{ toast?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const roleKey = normalizeDbRoleToRoleKey(profile?.role)
  const perms = ROLES[roleKey].permissions

  const canAccessOrdersAdmin = perms.includes('manage_orders') || perms.includes('view_analytics')
  if (!profile || !canAccessOrdersAdmin) redirect('/admin')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name_ru))')
    .order('created_at', { ascending: false })

  const newCount = orders?.filter((o) => o.status === 'new').length ?? 0

  return (
    <main className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <a href="/admin" className="text-neutral-400 hover:text-amber-400 transition-colors">
          Geri
        </a>
        <h1 className="text-3xl font-bold text-white">Sifarisler</h1>
        <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm font-medium border border-red-500/30">
          {newCount} yeni
        </span>
      </div>
      {searchParams.toast === 'success' && (
        <div className="mb-5 rounded-lg px-3 py-2 text-sm bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
          Status ugurla yenilendi.
        </div>
      )}
      {searchParams.toast === 'error' && (
        <div className="mb-5 rounded-lg px-3 py-2 text-sm bg-red-500/10 text-red-300 border border-red-500/30">
          Status yenilenmedi. Yeniden cehd edin.
        </div>
      )}
      {searchParams.toast === 'forbidden' && (
        <div className="mb-5 rounded-lg px-3 py-2 text-sm bg-amber-500/10 text-amber-300 border border-amber-500/30">
          Huquq yoxdur və ya sorgu limiti.
        </div>
      )}

      <AdminOrdersClient initialOrders={orders || []} canUpdateOrderStatus={perms.includes('manage_orders')} />
    </main>
  )
}
