import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function OrdersPage() {
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

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <a href="/admin" className="text-gray-500 hover:text-black">Geri</a>
        <h1 className="text-3xl font-bold">Sifarisler</h1>
        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
          {orders?.filter(o => o.status === 'new').length} yeni
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {orders?.map((order) => (
          <div key={order.id} className={`border rounded-xl p-6 ${order.status === 'new' ? 'border-orange-300 bg-orange-50' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-sm text-gray-400">#{order.id.slice(0,8)}</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleString()}
                </div>
              </div>
              <div className="text-2xl font-bold">{order.total_price} AZN</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">Unvan</div>
                <div className="text-sm">{order.address}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Elaqe / Qeyd</div>
                <NotesWithMap notes={order.notes} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="bg-gray-100 rounded-lg px-3 py-1 text-sm">
                  {item.products?.name_ru} x{item.quantity} — {item.price_at_purchase} AZN
                </div>
              ))}
            </div>

            <OrderActions orderId={order.id} currentStatus={order.status} />
          </div>
        ))}
      </div>
    </main>
  )
}


function StatusBadge({ status }: { status: string }) {
  const map: any = {
    new: { label: 'Yeni', className: 'bg-orange-100 text-orange-700' },
    confirmed: { label: 'Tesdiq edildi', className: 'bg-blue-100 text-blue-700' },
    in_delivery: { label: 'Yolda', className: 'bg-purple-100 text-purple-700' },
    delivered: { label: 'Catdirildi', className: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Legv edildi', className: 'bg-red-100 text-red-700' },
  }
  const s = map[status] || { label: status, className: 'bg-gray-100 text-gray-700' }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  )
}

function OrderActions({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const next: any = {
    new: { status: 'confirmed', label: 'Tesdiq et' },
    confirmed: { status: 'in_delivery', label: 'Yola ver' },
    in_delivery: { status: 'delivered', label: 'Catdirildi' },
  }
  const n = next[currentStatus]
  return (
    <div className="flex gap-2">
      {n && (
        <form action="/admin/orders/update" method="post">
          <input type="hidden" name="id" value={orderId} />
          <input type="hidden" name="status" value={n.status} />
          <button className="btn-admin btn-icon-arrow px-4 py-2">
            {n.label} <span className="arrow">→</span>
          </button>
        </form>
      )}
      {currentStatus !== 'cancelled' && currentStatus !== 'delivered' && (
        <form action="/admin/orders/update" method="post">
          <input type="hidden" name="id" value={orderId} />
          <input type="hidden" name="status" value="cancelled" />
          <button className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-200">
            Legv et
          </button>
        </form>
      )}
    </div>
  )
}

function NotesWithMap({ notes }: { notes: string | null }) {
  if (!notes) return <div className="text-sm">-</div>
  const match = notes.match(/Koordinat: ([\d.]+),([\d.]+)/)
  if (!match) return <div className="text-sm">{notes}</div>
  const lat = match[1]
  const lng = match[2]
  const clean = notes.replace(/ \| Koordinat: [\d.,]+/, '')
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`
  return (
    <div className="text-sm flex flex-col gap-1">
      <span>{clean}</span>
      <a href={mapsUrl} target="_blank"
        className="text-blue-600 hover:underline text-xs w-fit bg-blue-50 px-2 py-1 rounded-lg">
        Google Maps-de ac
      </a>
    </div>
  )
}
