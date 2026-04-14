import { redirect } from 'next/navigation'
export default function Page() { redirect('/') }

/* HIDDEN UNTIL BANK IS CONNECTED
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export default async function PaymentFailedPage(props: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const searchParams = await props.searchParams
  const orderId = searchParams.orderId ?? ''
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  let order: { payment_status: string; payment_method: string } | null = null
  if (orderId && supabaseUrl && serviceRoleKey) {
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data } = await admin
      .from('orders')
      .select('payment_status, payment_method')
      .eq('id', orderId)
      .single()
    order = data
  }

  return (
    <main className="mt-20 max-w-xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="ds-card-glass rounded-2xl p-6 md:p-8 text-center">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-3xl font-bold mb-3 text-white">Оплата не прошла</h1>
        <p className="text-neutral-300 mb-2">Номер заказа: {orderId ? `#${orderId.slice(0, 8)}` : 'не указан'}</p>
        <p className="text-neutral-400 mb-6">
          Текущий статус: <span className="text-red-300 font-semibold">{order?.payment_status || 'failed'}</span>
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/cart" className="btn-primary px-6 py-3">
            Попробовать снова
          </Link>
          <Link href="/cart" className="ds-btn-secondary px-6 py-3">
            Выбрать оплату наличными
          </Link>
        </div>
      </div>
    </main>
  )
}
HIDDEN UNTIL BANK IS CONNECTED */
