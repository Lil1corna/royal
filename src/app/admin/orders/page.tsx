import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
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

  return (
    <main className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto pb-24 md:pb-8">
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <a href="/admin" className="text-neutral-400 hover:text-amber-400 transition-colors">
          Geri
        </a>
        <h1 className="text-3xl font-bold text-white">Sifarişlər</h1>
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

      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-8 md:p-10 text-center max-w-2xl mx-auto">
        <div className="text-4xl mb-4" aria-hidden>
          📋
        </div>
        <h2 className="text-xl md:text-2xl font-semibold text-amber-100 mb-3">
          Tezliklə əlavə olunacaq
        </h2>
        <p className="text-neutral-300 text-sm md:text-base leading-relaxed mb-2">
          Sifarişlərin idarə olunması hazırda əlçatan deyil. Online ödəniş və sifariş axını
          tam işlək olduqda bu bölmədə sifariş siyahısı və statuslar görünəcək.
        </p>
        <p className="text-neutral-500 text-xs md:text-sm">
          RU: Раздел заказов пока недоступен — скоро добавим.
          <br />
          EN: Order management is not available yet — coming soon.
        </p>
      </div>
    </main>
  )
}
