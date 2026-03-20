'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useCart } from '@/context/cart'
import { useLang, translations } from '@/context/lang'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import ToastMessage, { type ToastState } from '@/components/toast-message'

const AddressMap = dynamic(() => import('@/components/address-map'), { ssr: false })

function normalizeAzPhone(raw: string): string | null {
  const value = raw.trim()
  if (!value) return null

  if (value.startsWith('+')) {
    const compact = '+' + value.slice(1).replace(/\D/g, '')
    if (/^\+994\d{9}$/.test(compact)) return compact
    return null
  }

  const digits = value.replace(/\D/g, '')
  if (/^994\d{9}$/.test(digits)) return `+${digits}`
  if (/^0\d{9}$/.test(digits)) return `+994${digits.slice(1)}`
  if (/^\d{9}$/.test(digits)) return `+994${digits}`
  return null
}

export default function CartPage() {
  const { items, remove, clear, total, count } = useCart()
  const { lang } = useLang()
  const tr = translations
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 2600)
  }

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return
    if (!address) { showToast('error', tr.selectAddress[lang]); return }
    const phoneNormalized = normalizeAzPhone(phone)
    if (!phoneNormalized) {
      showToast('error', tr.invalidPhone[lang])
      return
    }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { data: order, error } = await supabase
      .from('orders')
      .insert([{
        user_id: user?.id || null,
        total_price: total,
        status: 'new',
        address,
        notes: `Tel: ${phoneNormalized}${notes ? ' | ' + notes : ''}${lat ? ` | Koordinat: ${lat},${lng}` : ''}`,
      }])
      .select()
      .single()

    if (error) {
      showToast('error', tr.error[lang] + ': ' + error.message)
      setLoading(false)
      return
    }

    await supabase.from('order_items').insert(
      items.map(i => ({
        order_id: order.id,
        product_id: i.id,
        quantity: i.quantity,
        price_at_purchase: i.price,
      }))
    )

    showToast('success', tr.orderSuccess[lang])
    clear()
    router.push('/order-success')
    setLoading(false)
  }

  if (count === 0) {
    return (
      <main className="p-8 max-w-2xl mx-auto text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold mb-2">{tr.cartEmpty[lang]}</h1>
        <a href="/" className="text-blue-600 hover:underline">{tr.backToCatalog[lang]}</a>
      </main>
    )
  }

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <a href="/" className="text-gray-500 hover:text-black">{tr.back[lang]}</a>
        <h1 className="text-3xl font-bold">{tr.cart[lang]}</h1>
      </div>
      <ToastMessage toast={toast} className="mb-5" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="flex flex-col gap-3 mb-6">
            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, delay: i * 0.03 }}
                className="flex gap-4 border rounded-xl p-4 card-soft"
              >
                {item.image && (
                  <img src={item.image} className="w-20 h-20 object-cover rounded-lg" />
                )}
                <div className="flex-1">
                  <div className="font-semibold">{item.name}</div>
                  {item.size && <div className="text-sm text-gray-500">{item.size}</div>}
                  <div className="font-bold mt-1">{item.price * item.quantity} AZN</div>
                  <div className="text-sm text-gray-400">{item.quantity} {tr.pieces[lang]}</div>
                </div>
                <button onClick={() => remove(item.id, item.size)}
                  className="text-red-400 hover:text-red-600">X</button>
              </motion.div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between items-center">
            <span className="font-medium">{tr.total[lang]}:</span>
            <span className="text-2xl font-bold">{total} AZN</span>
          </div>
        </div>

        <form onSubmit={handleOrder} className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">{tr.orderForm[lang]}</h2>
          <div>
            <label className="block text-sm font-medium mb-1">{tr.phone[lang]}</label>
            <input
              type="tel"
              className="w-full border rounded-lg p-2"
              placeholder="+994 XX XXX XX XX"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {tr.deliveryAddress[lang]}
              {address && <span className="text-green-600 ml-2 text-xs">✓ {tr.addressSelected[lang]}</span>}
            </label>
            <AddressMap onSelect={(addr, la, ln) => {
              setAddress(addr)
              setLat(la)
              setLng(ln)
            }} />
            {address && (
              <div className="mt-2 p-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                {address}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{tr.notes[lang]}</label>
            <textarea className="w-full border rounded-lg p-2 h-20 resize-none"
              placeholder={tr.extraInfo[lang] + '...'}
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <motion.button
            whileTap={{ scale: 0.985 }}
            type="submit" disabled={loading || !address}
            className="btn-primary py-3 rounded-xl text-lg"
          >
            {loading ? tr.submitting[lang] : `${tr.submitOrder[lang]} — ${total} AZN`}
          </motion.button>
        </form>
      </div>
    </main>
  )
}
