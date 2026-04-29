'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { fetchWithCsrf } from '@/lib/fetch-with-csrf'
import { useLang } from '@/context/lang'
import { useLowPowerMotion } from '@/hooks/use-low-power-motion'
import { CONTACTS } from '@/config/contacts'

function PaymentFailedInner() {
  const params = useSearchParams()
  const { lang } = useLang()
  const lowPower = useLowPowerMotion()
  const kbOrderId = params.get('ORDERID')

  const [loading, setLoading] = useState(true)
  const [verifyErr, setVerifyErr] = useState<string | null>(null)
  const [orderIdAfterVerify, setOrderIdAfterVerify] = useState<string | null>(null)
  const [retryLoading, setRetryLoading] = useState(false)
  const [retryError, setRetryError] = useState<string | null>(null)

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
        const data = (await res.json()) as {
          error?: string
          orderId?: string
          payment_status?: string
        }
        if (res.ok && data.orderId) {
          setOrderIdAfterVerify(data.orderId)
        } else {
          setVerifyErr(data.error ?? 'Verify failed')
        }
      })
      .catch(() => setVerifyErr('Network error'))
      .finally(() => setLoading(false))
  }, [kbOrderId])

  const handleRetryPay = async () => {
    if (!orderIdAfterVerify) return
    setRetryLoading(true)
    setRetryError(null)
    try {
      const payRes = await fetchWithCsrf('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderIdAfterVerify }),
      })
      if (!payRes.ok) {
        const err = (await payRes.json().catch(() => ({}))) as { error?: string }
        throw new Error(err.error || 'Payment failed')
      }
      const { paymentUrl } = (await payRes.json()) as { paymentUrl: string }
      window.location.href = paymentUrl
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setRetryError(msg)
    } finally {
      setRetryLoading(false)
    }
  }

  const cardMotion = lowPower
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
      }

  const btnPrimary =
    'ds-btn-primary inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold sm:w-auto'
  const btnOutline =
    'ds-btn-secondary inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold sm:w-auto'

  const pathStart = lowPower ? { pathLength: 1 } : { pathLength: 0 }
  const pathEnd = { pathLength: 1 }

  const retryLabel =
    lang === 'az' ? 'Yenidən ödə' : lang === 'ru' ? 'Оплатить снова' : 'Pay again'

  return (
    <main className="mt-20 max-w-xl mx-auto p-4 md:p-6 lg:p-8">
      <motion.div {...cardMotion} className="ds-card-glass rounded-2xl p-6 md:p-8 text-center">
        {loading ? (
          <div className="py-8">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-red-400/30 border-t-red-400" />
            <p className="text-sm text-white/60">
              {lang === 'az' ? 'Ödəniş yoxlanılır...' : lang === 'ru' ? 'Проверяем оплату...' : 'Verifying payment...'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-center">
              <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden>
                <motion.circle
                  cx="36"
                  cy="36"
                  r="32"
                  fill="none"
                  stroke="#f87171"
                  strokeWidth="2.5"
                  pathLength={1}
                  initial={pathStart}
                  animate={pathEnd}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                />
                <motion.path
                  d="M26 26 L46 46 M46 26 L26 46"
                  fill="none"
                  stroke="#f87171"
                  strokeWidth="3"
                  strokeLinecap="round"
                  pathLength={1}
                  initial={pathStart}
                  animate={pathEnd}
                  transition={{ duration: 0.35, delay: 0.35, ease: 'easeOut' }}
                />
              </svg>
            </div>
            <h1 className="mb-3 text-2xl font-bold text-white md:text-3xl">
              {lang === 'az' ? 'Ödəniş uğursuz oldu' : lang === 'ru' ? 'Оплата не прошла' : 'Payment failed'}
            </h1>
            {verifyErr && <p className="mb-3 text-sm text-red-300/90">{verifyErr}</p>}
            <p className="mb-8 text-sm leading-relaxed text-white/60">
              {lang === 'az'
                ? 'Mümkün səbəblər: kartda vəsait yetərsizdir, bank tərəfindən rədd edildi və ya ödəniş müddəti bitdi.'
                : lang === 'ru'
                  ? 'Возможные причины: недостаточно средств, отклонено банком или время сессии истекло.'
                  : 'Possible reasons: insufficient funds, declined by bank, or session expired.'}
            </p>
            {orderIdAfterVerify && (
              <div className="mb-4 flex flex-col items-center gap-2">
                <button
                  type="button"
                  disabled={retryLoading}
                  onClick={() => void handleRetryPay()}
                  className={`${btnPrimary} mb-1`}
                >
                  {retryLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {lang === 'az' ? 'Yüklənir...' : lang === 'ru' ? 'Загрузка...' : 'Loading...'}
                    </>
                  ) : (
                    retryLabel
                  )}
                </button>
                {retryError && (
                  <p className="text-center text-xs text-red-400">
                    {lang === 'az' ? `Xəta: ${retryError}` : lang === 'ru' ? `Ошибка: ${retryError}` : `Error: ${retryError}`}
                  </p>
                )}
              </div>
            )}
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/cart" className={btnPrimary}>
                {lang === 'az' ? 'Yenidən cəhd et' : lang === 'ru' ? 'Попробовать снова' : 'Try again'}
              </Link>
              <a href={CONTACTS.whatsapp} target="_blank" rel="noreferrer" className={btnOutline}>
                {lang === 'az'
                  ? 'WhatsApp ilə sifariş'
                  : lang === 'ru'
                    ? 'Заказать через WhatsApp'
                    : 'Order via WhatsApp'}
              </a>
            </div>
          </>
        )}
      </motion.div>
    </main>
  )
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <main className="mt-20 max-w-xl mx-auto p-4 md:p-6 lg:p-8">
          <div className="ds-card-glass rounded-2xl p-6 md:p-8 text-center py-12 text-white/60 text-sm">…</div>
        </main>
      }
    >
      <PaymentFailedInner />
    </Suspense>
  )
}
