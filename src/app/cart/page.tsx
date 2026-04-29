'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useCart } from '@/context/cart'
import { useLang, translations } from '@/context/lang'
import { useIsMobile } from '@/hooks/useIsMobile'
import { fetchWithCsrf } from '@/lib/fetch-with-csrf'
import { CONTACTS } from '@/config/contacts'

export default function CartPage() {
  const { items, add, decrease, remove, count, total } = useCart()
  const { lang } = useLang()
  const tr = translations
  const isMobile = useIsMobile()
  const subtotal = total
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const handleOnlinePayment = async () => {
    setPaymentLoading(true)
    setPaymentError(null)
    try {
      const createRes = await fetchWithCsrf('/api/order/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            size: item.size ?? null,
          })),
          total,
          paymentMethod: 'online',
          lang,
        }),
      })
      if (!createRes.ok) {
        const err = (await createRes.json().catch(() => ({}))) as { error?: string }
        throw new Error(err.error || 'Order creation failed')
      }
      const { orderId } = (await createRes.json()) as { orderId: string }

      const payRes = await fetchWithCsrf('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      if (!payRes.ok) {
        const err = (await payRes.json().catch(() => ({}))) as { error?: string }
        throw new Error(err.error || 'Payment failed')
      }
      const { paymentUrl } = (await payRes.json()) as { paymentUrl: string }

      window.location.href = paymentUrl
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setPaymentError(
        lang === 'az' ? `Xəta: ${msg}` : lang === 'ru' ? `Ошибка: ${msg}` : `Error: ${msg}`
      )
    } finally {
      setPaymentLoading(false)
    }
  }

  if (count === 0) {
    return (
      <main className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto text-center overflow-x-hidden">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} className="mb-4 text-6xl">
          🛒
        </motion.div>
        <h1 className="text-xl sm:text-2xl font-bold mb-2">{tr.cartEmpty[lang]}</h1>
        <p className="mb-5 text-white/60">{tr.cartAddItems[lang]}</p>
        <Link href="/" className="text-[#e8c97a] hover:underline">{tr.backToCatalog[lang]}</Link>
      </main>
    )
  }

  return (
    <main className="p-5 sm:p-6 md:p-8 max-w-5xl mx-auto overflow-x-hidden pb-24 md:pb-10">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Link href="/" className="text-white/60 hover:text-white min-h-[44px] inline-flex items-center">{tr.back[lang]}</Link>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{tr.cart[lang]}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.3fr_0.9fr] gap-8 md:gap-12 items-start">
        <div>
          <div className="flex flex-col gap-3.5 mb-6">
            {items.map((item, i) => (
              <motion.div
                key={`${item.id}-${item.size ?? 'default'}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  isMobile
                    ? { duration: 0.15, ease: 'easeOut', delay: 0 }
                    : { duration: 0.16, delay: i * 0.03 }
                }
                className="flex gap-3 sm:gap-4 border rounded-xl p-3.5 sm:p-4 card-soft items-center"
              >
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-lg shrink-0"
                    sizes="80px"
                    priority={i === 0}
                    loading={i === 0 ? undefined : 'lazy'}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{item.name}</div>
                  {item.size && <div className="text-sm text-white/60">{item.size}</div>}
                  <div className="font-bold mt-1">{item.price * item.quantity} AZN</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => decrease(item.id, item.size)}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white active:scale-95 transition-transform"
                    >
                      -
                    </button>
                    <div className="flex h-11 min-w-[44px] items-center justify-center rounded-lg border border-white/15 px-3 text-sm font-semibold">
                      {item.quantity}
                    </div>
                    <button
                      type="button"
                      onClick={() => add(item)}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white active:scale-95 transition-transform"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => remove(item.id, item.size)}
                  className="text-[rgba(255,100,100,0.85)] hover:text-[#ff6b6b] min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 active:scale-95 transition-transform"
                  aria-label={lang === 'ru' ? 'Удалить' : lang === 'en' ? 'Remove' : 'Sil'}
                >
                  X
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-6 md:sticky md:top-24">
          <div className="border rounded-xl p-4 card-soft">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-white/60">{tr.subtotal[lang]}</span>
              <span className="font-semibold text-lg">{subtotal} AZN</span>
            </div>
            <p className="text-xs text-white/50">
              {lang === 'ru'
                ? 'Итог в корзине; оформление — через WhatsApp или звонок.'
                : lang === 'en'
                  ? 'Cart total; checkout is via WhatsApp or phone.'
                  : 'Səbət cəmi; sifariş WhatsApp və ya zəng ilə.'}
            </p>
          </div>

          <div className="rounded-xl border border-[#c9a84c]/25 bg-[rgba(201,168,76,0.04)] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#e8c97a]">
              {lang === 'az' ? '💳 Onlayn ödə' : lang === 'ru' ? '💳 Оплата онлайн' : '💳 Pay Online'}
            </p>
            <button
              type="button"
              onClick={() => void handleOnlinePayment()}
              disabled={paymentLoading || count === 0}
              className="ds-btn-primary mb-2 flex w-full min-h-[44px] items-center justify-center gap-2"
            >
              {paymentLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {lang === 'az' ? 'Yüklənir...' : lang === 'ru' ? 'Загрузка...' : 'Loading...'}
                </>
              ) : lang === 'az' ? (
                'Onlayn ödə'
              ) : lang === 'ru' ? (
                'Оплатить онлайн'
              ) : (
                'Pay online'
              )}
            </button>
            <p className="flex items-center justify-center gap-1 text-center text-xs text-white/35">
              🔒{' '}
              {lang === 'az'
                ? 'Kapital Bank tərəfindən qorunur'
                : lang === 'ru'
                  ? 'Защищено Kapital Bank'
                  : 'Secured by Kapital Bank'}
            </p>
            {paymentError && <p className="mt-2 text-center text-xs text-red-400">{paymentError}</p>}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/50">
              {lang === 'az' ? '📞 Nağd / WhatsApp' : lang === 'ru' ? '📞 Наличными / WhatsApp' : '📞 Cash / WhatsApp'}
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={CONTACTS.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#25D366]/30 bg-[#25D366]/15 px-4 py-3 font-medium text-[#25D366] transition-colors hover:bg-[#25D366]/25"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
              <a
                href={CONTACTS.phoneHref}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-3 font-medium text-white/80 transition-colors hover:bg-white/10"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.81 19.79 19.79 0 01.18 2.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.28-1.52a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                {CONTACTS.phone}
              </a>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
