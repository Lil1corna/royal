import { redirect } from 'next/navigation'
export default function Page() { redirect('/') }

/* HIDDEN UNTIL BANK IS CONNECTED
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export default async function PaymentSuccessPage(props: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const searchParams = await props.searchParams
  const orderId = searchParams.orderId ?? ''
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  let order: { payment_status: string; payment_method: string; total_price: number } | null = null
  if (orderId && supabaseUrl && serviceRoleKey) {
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data } = await admin
      .from('orders')
      .select('payment_status, payment_method, total_price')
      .eq('id', orderId)
      .single()
    order = data
  }

  return (
    <main className="mt-20 max-w-xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="ds-card-glass rounded-2xl p-6 md:p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-3xl font-bold mb-3 text-white">Оплата прошла успешно</h1>
        <p className="text-neutral-300 mb-2">Номер заказа: {orderId ? `#${orderId.slice(0, 8)}` : 'не указан'}</p>
        <p className="text-neutral-400 mb-6">
          Статус оплаты: <span className="text-emerald-300 font-semibold">{order?.payment_status || 'pending'}</span>
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="btn-primary px-6 py-3">
            На главную
          </Link>
        </div>
      </div>
    </main>
  )
}
HIDDEN UNTIL BANK IS CONNECTED */
