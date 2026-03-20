import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminOrdersClient from '@/components/admin-orders-client'

export default async function OrdersPage(props: { searchParams: Promise<{ toast?: string }> }) {
  const searchParams = await props.searchParams
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

  if (!profile || !['super_admin', 'manager'].includes(profile.role)) redirect('/admin')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name_ru))')
    .order('created_at', { ascending: false })

  const newCount = orders?.filter((o) => o.status === 'new').length ?? 0

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <a href="/admin" className="text-gray-500 hover:text-black">
          Geri
        </a>
        <h1 className="text-3xl font-bold">Sifarisler</h1>
        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
          {newCount} yeni
        </span>
      </div>
      {searchParams.toast === 'success' && (
        <div className="mb-5 rounded-lg px-3 py-2 text-sm bg-green-50 text-green-700 border border-green-200">
          Status ugurla yenilendi.
        </div>
      )}
      {searchParams.toast === 'error' && (
        <div className="mb-5 rounded-lg px-3 py-2 text-sm bg-red-50 text-red-700 border border-red-200">
          Status yenilenmedi. Yeniden cehd edin.
        </div>
      )}
      {searchParams.toast === 'forbidden' && (
        <div className="mb-5 rounded-lg px-3 py-2 text-sm bg-amber-50 text-amber-800 border border-amber-200">
          Huquq yoxdur və ya sorgu limiti.
        </div>
      )}

      <AdminOrdersClient initialOrders={orders || []} />
    </main>
  )
}
