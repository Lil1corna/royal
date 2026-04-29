'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { fetchWithCsrf } from '@/lib/fetch-with-csrf'
import { useCart } from '@/context/cart'
import { useLang } from '@/context/lang'
import { useLowPowerMotion } from '@/hooks/use-low-power-motion'
import { CONTACTS } from '@/config/contacts'

type VerifyResult = {
  orderId: string
  payment_status: string
  kb_status: string
  isMock: boolean
  cached?: boolean
}

function PaymentSuccessInner() {
  const params = useSearchParams()
  const { lang } = useLang()
  const { clear } = useCart()
  const lowPower = useLowPowerMotion()
  const kbOrderId = params.get('ORDERID')
  const isMockUrl = params.get('mock') === '1'
  const cartClearedRef = useRef(false)

  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [verifyErr, setVerifyErr] = useState<string | null>(null)

  useEffect(() => {
    if (!kbOrderId) {
      setLoading(false)
      return
    }
    void fetchWithCsrf('/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kbOrderId }),
    })
      .then(async (res) => {
        const data = (await res.json()) as { error?: string } & Partial<VerifyResult>
        if (res.ok && data.orderId && data.payment_status) {
          setResult({
            orderId: data.orderId,
            payment_status: data.payment_status,
            kb_status: data.kb_status ?? '',
            isMock: Boolean(data.isMock),
            cached: Boolean(data.cached),
          })
        } else {
          setVerifyErr(data.error ?? 'Verify failed')
        }
      })
      .catch(() => setVerifyErr('Network error'))
      .finally(() => setLoading(false))
  }, [kbOrderId])

  useEffect(() => {
    if (result?.payment_status === 'paid' && !cartClearedRef.current) {
      cartClearedRef.current = true
      clear()
    }
  }, [result?.payment_status, clear])

  const showDevBanner = isMockUrl && process.env.NODE_ENV !== 'production'

  const cardMotion = lowPower
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
      }

  const btnPrimary =
    'ds-btn-primary inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold'
  const btnOutline =
    'ds-btn-secondary inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold'

  const pathStart = lowPower ? { pathLength: 1 } : { pathLength: 0 }
  const pathDone = { pathLength: 1 }

  return (
    <main className="mt-20 max-w-xl mx-auto p-4 md:p-6 lg:p-8">
      {showDevBanner && (
        <div className="mb-4 rounded-lg border border-amber-400/40 bg-amber-400/20 px-4 py-2 text-center text-sm text-amber-300">
          🧪 TEST MODE — Kapital Bank not connected yet (mock response)
        </div>
      )}
      <motion.div {...cardMotion} className="ds-card-glass rounded-2xl p-6 md:p-8 text-center">
        {loading ? (
          <div className="py-8">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-[#c9a84c]/30 border-t-[#c9a84c]" />
            <p className="text-sm text-white/60">
              {lang === 'az' ? 'Ödəniş yoxlanılır...' : lang === 'ru' ? 'Проверяем оплату...' : 'Verifying payment...'}
            </p>
          </div>
        ) : !kbOrderId ? (
          <>
            <div className="mb-4 text-5xl" aria-hidden>
              ⚠️
            </div>
            <h1 className="mb-3 text-xl font-bold text-white">
              {lang === 'az' ? 'Sifariş ID tapılmadı' : lang === 'ru' ? 'Не найден номер заказа банка' : 'Missing payment reference'}
            </h1>
            <p className="mb-6 text-sm text-white/60">
              {lang === 'az'
                ? 'URL-də ORDERID parametri yoxdur.'
                : lang === 'ru'
                  ? 'В ссылке нет параметра ORDERID.'
                  : 'The redirect URL is missing ORDERID.'}
            </p>
            <Link href={CONTACTS.whatsapp} target="_blank" rel="noreferrer" className={btnOutline}>
              WhatsApp
            </Link>
          </>
        ) : verifyErr ? (
          <>
            <div className="mb-4 text-5xl" aria-hidden>
              ⚠️
            </div>
            <h1 className="mb-3 text-xl font-bold text-white">
              {lang === 'az' ? 'Yoxlama xətası' : lang === 'ru' ? 'Ошибка проверки' : 'Verification error'}
            </h1>
            <p className="mb-6 text-sm text-red-300/90">{verifyErr}</p>
            <a href={CONTACTS.whatsapp} target="_blank" rel="noreferrer" className={btnOutline}>
              WhatsApp
            </a>
          </>
        ) : result?.payment_status === 'paid' ? (
          <>
            <div className="mb-6 flex justify-center">
              <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden>
                <motion.circle
                  cx="36"
                  cy="36"
                  r="32"
                  fill="none"
                  stroke="#c9a84c"
                  strokeWidth="2.5"
                  pathLength={1}
                  initial={pathStart}
                  animate={pathDone}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                <motion.path
                  d="M22 36 L32 46 L50 28"
                  fill="none"
                  stroke="#c9a84c"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  initial={pathStart}
                  animate={pathDone}
                  transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
                />
              </svg>
            </div>
            <h1 className="mb-3 text-2xl font-bold text-white md:text-3xl">
              {lang === 'az' ? 'Ödəniş uğurlu oldu!' : lang === 'ru' ? 'Оплата прошла успешно!' : 'Payment successful!'}
            </h1>
            {result.orderId && (
              <p className="mb-2 text-sm text-white/50">#{result.orderId.slice(0, 8)}</p>
            )}
            <p className="mb-8 text-sm leading-relaxed text-white/60">
              {lang === 'az'
                ? 'Sifarişiniz qəbul edildi. Tezliklə operatorumuz sizinlə əlaqə saxlayacaq.'
                : lang === 'ru'
                  ? 'Ваш заказ принят. Наш оператор скоро свяжется с вами.'
                  : 'Your order has been accepted. Our operator will contact you shortly.'}
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/" className={btnPrimary}>
                {lang === 'az' ? 'Ana səhifə' : lang === 'ru' ? 'На главную' : 'Home'}
              </Link>
              <Link href="/account" className={btnOutline}>
                {lang === 'az' ? 'Sifarişlərim' : lang === 'ru' ? 'Мои заказы' : 'My Orders'}
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 text-5xl" aria-hidden>
              ⚠️
            </div>
            <h1 className="mb-3 text-xl font-bold text-white">
              {lang === 'az' ? 'Status gözlənilməz' : lang === 'ru' ? 'Неожиданный статус' : 'Unexpected status'}
            </h1>
            <p className="mb-6 text-sm text-white/60">
              {lang === 'az'
                ? 'Ödəniş statusunu yoxlamaq üçün bizimlə əlaqə saxlayın.'
                : lang === 'ru'
                  ? 'Свяжитесь с нами для проверки статуса оплаты.'
                  : 'Please contact us to verify your payment status.'}
            </p>
            <a href={CONTACTS.whatsapp} target="_blank" rel="noreferrer" className={btnOutline}>
              WhatsApp
            </a>
          </>
        )}
      </motion.div>
    </main>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="mt-20 max-w-xl mx-auto p-4 md:p-6 lg:p-8">
          <div className="ds-card-glass rounded-2xl p-6 md:p-8 text-center py-12 text-white/60 text-sm">…</div>
        </main>
      }
    >
      <PaymentSuccessInner />
    </Suspense>
  )
}
