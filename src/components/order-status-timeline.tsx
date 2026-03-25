'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ACTIVE_FLOW, type OrderStatus } from '@/lib/order-status'
import { useLang, translations } from '@/context/lang'
import { useIsMobile } from '@/hooks/useIsMobile'

const STEP_ICONS = ['📥', '✓', '🚚', '✨'] as const

function stepIndex(status: OrderStatus): number {
  if (status === 'cancelled') return -1
  const i = ACTIVE_FLOW.indexOf(status)
  return i >= 0 ? i : 0
}

export default function OrderStatusTimeline({ status }: { status: string }) {
  const { lang } = useLang()
  const tr = translations
  const isMobile = useIsMobile()
  const s = (status || 'new') as OrderStatus
  const cancelled = s === 'cancelled'
  const currentIdx = cancelled ? -1 : stepIndex(s)

  const labels: Record<OrderStatus, string> = {
    new: tr.new[lang],
    confirmed: tr.confirmed[lang],
    in_delivery: tr.inDelivery[lang],
    delivered: tr.delivered[lang],
    cancelled: tr.cancelled[lang],
  }

  return (
    <div className="mt-4 rounded-2xl border border-amber-100/80 bg-gradient-to-br from-amber-50/40 via-white to-neutral-50/80 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {tr.orderProgress[lang]}
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={status}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={isMobile ? { duration: 0.15, ease: 'easeOut' } : undefined}
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              cancelled
                ? 'bg-red-100 text-red-700'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {labels[s] || status}
          </motion.span>
        </AnimatePresence>
      </div>

      {cancelled ? (
        <p className="text-sm text-red-600 flex items-center gap-2">
          <span className="text-lg">⛔</span>
          {tr.orderCancelledHint[lang]}
        </p>
      ) : (
        <div className="relative flex justify-between gap-1">
          {ACTIVE_FLOW.map((step, idx) => {
            const done = idx < currentIdx
            const active = idx === currentIdx
            return (
              <div key={step} className="flex-1 flex flex-col items-center min-w-0">
                <div className="relative w-full flex items-center justify-center mb-2">
                  {idx > 0 && (
                    <div
                      className={`absolute right-1/2 top-1/2 h-0.5 w-full -translate-y-1/2 -z-0 ${
                        done || active ? 'bg-amber-400' : 'bg-neutral-200'
                      }`}
                      style={{ width: 'calc(100% - 1.5rem)', left: 'calc(-50% + 0.75rem)' }}
                    />
                  )}
                  <motion.div
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg border-2 ${
                      done
                        ? 'border-amber-500 bg-amber-500 text-white shadow-md'
                        : active
                          ? 'border-amber-500 bg-white text-amber-600 shadow-lg ring-4 ring-amber-200/60'
                          : 'border-neutral-200 bg-white text-neutral-300'
                    }`}
                    animate={
                      active
                        ? isMobile
                          ? { scale: 1 }
                          : {
                              scale: [1, 1.06, 1],
                              boxShadow: [
                                '0 0 0 0 rgba(245,158,11,0.35)',
                                '0 0 0 10px rgba(245,158,11,0)',
                                '0 0 0 0 rgba(245,158,11,0)',
                              ],
                            }
                        : {}
                    }
                    transition={
                      active
                        ? isMobile
                          ? { duration: 0.15, ease: 'easeOut' }
                          : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                        : {}
                    }
                  >
                    {done ? '✓' : STEP_ICONS[idx]}
                  </motion.div>
                </div>
                <span
                  className={`text-[10px] sm:text-xs text-center font-medium leading-tight px-0.5 ${
                    active ? 'text-neutral-900' : done ? 'text-amber-800' : 'text-neutral-400'
                  }`}
                >
                  {labels[step]}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
