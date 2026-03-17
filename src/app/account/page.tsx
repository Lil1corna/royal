import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AccountPage() {
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
  if (!user) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name_ru, image_urls))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const statusMap: Record<string, { label: string, cls: string }> = {
    new: { label: 'Yeni', cls: 'bg-orange-100 text-orange-700' },
    confirmed: { label: 'Tesdiq edildi', cls: 'bg-blue-100 text-blue-700' },
    in_delivery: { label: 'Yolda', cls: 'bg-purple-100 text-purple-700' },
    delivered: { label: 'Catdirildi', cls: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Legv edildi', cls: 'bg-red-100 text-red-700' },
  }

  const isStaff = ['super_admin', 'manager', 'content_manager'].includes(profile?.role)

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <a href="/" className="text-gray-500 hover:text-black">Geri</a>
        <h1 className="text-3xl font-bold">Kabinet</h1>
      </div>

      <div className="border rounded-xl p-6 mb-8 flex items-center gap-4">
        <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold">
          {user.email?.[0].toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-lg">{profile?.name || user.email}</div>
          <div className="text-gray-500 text-sm">{user.email}</div>
          <div className="text-xs text-gray-400 mt-1">{profile?.role || 'customer'}</div>
        </div>
        {isStaff && (
          <a href="/admin" className="ml-auto bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800">
            Admin Panel
          </a>
        )}
      </div>

      <h2 className="text-xl font-bold mb-4">Sifarislerim</h2>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-16 border rounded-xl">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-gray-500 mb-4">Hec bir sifarising yoxdur</p>
          <a href="/" className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
            Alisverise basla
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const s = statusMap[order.status] || { label: order.status, cls: 'bg-gray-100 text-gray-700' }
            return (
              <div key={order.id} className="border rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-sm text-gray-400">#{order.id.slice(0,8)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.cls}`}>
                        {s.label}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xl font-bold">{order.total_price} AZN</div>
                </div>
                <div className="flex flex-wrap gap-3 mb-3">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                      {item.products?.image_urls?.[0] && (
                        <img src={item.products.image_urls[0]}
                          className="w-10 h-10 object-cover rounded-lg" />
                      )}
                      <div>
                        <div className="text-sm font-medium">{item.products?.name_ru}</div>
                        <div className="text-xs text-gray-500">
                          x{item.quantity} — {item.price_at_purchase} AZN
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-500 border-t pt-3">{order.address}</div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
