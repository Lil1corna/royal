import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ROLES, normalizeDbRoleToRoleKey } from '@/config/roles'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const roleKey = normalizeDbRoleToRoleKey(profile?.role)
  const perms = ROLES[roleKey].permissions

  const canSeeProductsAdmin =
    perms.includes('manage_products') || perms.includes('view_analytics')

  if (!profile || !canSeeProductsAdmin) {
    redirect('/')
  }

  const canSeeOrdersAdmin = perms.includes('manage_orders') || perms.includes('view_analytics')
  const canSeeUsersAdmin = perms.includes('manage_users') || perms.includes('view_analytics')
  const canCreateProducts = perms.includes('manage_products')

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: newOrders } = await supabase
    .from('orders')
    .select('id')
    .eq('status', 'new')

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <div className="flex gap-3">
          {canSeeOrdersAdmin ? (
            <Link href="/admin/orders"
              className="relative btn-admin btn-icon-arrow px-6 py-2">
              Sifarisler <span className="arrow">→</span>
              {newOrders && newOrders.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {newOrders.length}
                </span>
              )}
            </Link>
          ) : (
            <span className="text-neutral-500/60 text-sm">—</span>
          )}
          {canSeeUsersAdmin ? (
            <Link href="/admin/users"
              className="btn-secondary btn-icon-arrow px-6 py-2">
              Staff <span className="arrow">→</span>
            </Link>
          ) : (
            <span className="text-neutral-500/60 text-sm">—</span>
          )}
          {canCreateProducts ? (
            <Link href="/admin/products/new"
              className="btn-primary btn-icon-arrow px-6 py-2">
              Yeni mehsul <span className="arrow">→</span>
            </Link>
          ) : (
            <span className="text-neutral-500/60 text-sm">—</span>
          )}
        </div>
      </div>
      <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-xl border border-white/10 bg-transparent">
        <thead>
          <tr className="bg-[rgba(201,168,76,0.06)]">
            <th className="text-left p-3 border-b border-white/10 text-[10px] font-bold tracking-[0.15em] uppercase text-[rgba(201,168,76,0.7)]">Mehsul</th>
            <th className="text-left p-3 border-b border-white/10 text-[10px] font-bold tracking-[0.15em] uppercase text-[rgba(201,168,76,0.7)]">Kateqoriya</th>
            <th className="text-left p-3 border-b border-white/10 text-[10px] font-bold tracking-[0.15em] uppercase text-[rgba(201,168,76,0.7)]">Qiymet</th>
            <th className="text-left p-3 border-b border-white/10 text-[10px] font-bold tracking-[0.15em] uppercase text-[rgba(201,168,76,0.7)]">Endirim</th>
            <th className="text-left p-3 border-b border-white/10 text-[10px] font-bold tracking-[0.15em] uppercase text-[rgba(201,168,76,0.7)]">Stok</th>
            <th className="text-left p-3 border-b border-white/10 text-[10px] font-bold tracking-[0.15em] uppercase text-[rgba(201,168,76,0.7)]">Emeliyyat</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((p) => (
            <tr key={p.id} className="hover:bg-white/5">
              <td className="p-3 border-b border-white/10 font-medium text-[rgba(255,255,255,0.85)]">{p.name_ru}</td>
              <td className="p-3 border-b border-white/10 text-white/60">{p.category}</td>
              <td className="p-3 border-b border-white/10">{p.price} AZN</td>
              <td className="p-3 border-b border-white/10">{p.discount_pct > 0 ? p.discount_pct + '%' : '-'}</td>
              <td className="p-3 border-b border-white/10">
                <span className={p.in_stock ? 'text-emerald-300' : 'text-[#ff6b6b]'}>
                  {p.in_stock ? 'Var' : 'Yoxdur'}
                </span>
              </td>
              <td className="p-3 border-b border-white/10">
                {perms.includes('manage_products') ? (
                  <Link
                    href={'/admin/products/' + p.id}
                    className="text-[rgba(201,168,76,0.8)] text-[12px] font-semibold tracking-[0.06em] uppercase hover:text-[#e8c97a] hover:underline"
                  >
                    Edit
                  </Link>
                ) : (
                  <span className="text-neutral-500/60 text-[12px]">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
