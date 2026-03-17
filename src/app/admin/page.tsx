import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

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

  if (!profile || !['super_admin', 'manager', 'content_manager'].includes(profile.role)) {
    redirect('/')
  }

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
          <a href="/admin/orders"
            className="relative bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600">
            Sifarisler
            {newOrders && newOrders.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {newOrders.length}
              </span>
            )}
          </a>
          <a href="/admin/users"
            className="bg-gray-200 text-black px-6 py-2 rounded-lg hover:bg-gray-300">
            Staff
          </a>
          <a href="/admin/products/new"
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
            Yeni mehsul
          </a>
        </div>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-3 border">Mehsul</th>
            <th className="text-left p-3 border">Kateqoriya</th>
            <th className="text-left p-3 border">Qiymet</th>
            <th className="text-left p-3 border">Endirim</th>
            <th className="text-left p-3 border">Stok</th>
            <th className="text-left p-3 border">Emeliyyat</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="p-3 border font-medium">{p.name_ru}</td>
              <td className="p-3 border text-gray-500">{p.category}</td>
              <td className="p-3 border">{p.price} AZN</td>
              <td className="p-3 border">{p.discount_pct > 0 ? p.discount_pct + '%' : '-'}</td>
              <td className="p-3 border">
                <span className={p.in_stock ? 'text-green-600' : 'text-red-600'}>
                  {p.in_stock ? 'Var' : 'Yoxdur'}
                </span>
              </td>
              <td className="p-3 border">
                <a href={'/admin/products/' + p.id} className="text-blue-600 hover:underline">
                  Edit
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
