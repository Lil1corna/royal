'use client'

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLowPowerMotion } from '@/hooks/use-low-power-motion'

type FlyState = {
  x1: number
  y1: number
  x2: number
  y2: number
  url: string | null
}

const W = 56
const H = 56

const Ctx = createContext<{ triggerFly: (el: HTMLElement, imageUrl?: string | null) => void }>({
  triggerFly: () => {},
})

export function FlyToCartProvider({ children }: { children: ReactNode }) {
  const [fly, setFly] = useState<FlyState | null>(null)
  const reduceMotion = useReducedMotion()
  const lowPower = useLowPowerMotion()

  const triggerFly = useCallback(
    (fromEl: HTMLElement, imageUrl?: string | null) => {
      if (reduceMotion || lowPower) return
      const from = fromEl.getBoundingClientRect()
      const target = document.getElementById('nav-cart-fly-target')
      if (!target) return
      const to = target.getBoundingClientRect()
      setFly({
        x1: from.left + from.width / 2 - W / 2,
        y1: from.top + from.height / 2 - H / 2,
        x2: to.left + to.width / 2 - W / 2,
        y2: to.top + to.height / 2 - H / 2,
        url: imageUrl || null,
      })
      /* длительность анимации + небольшой запас, чтобы не обрезать конец */
      window.setTimeout(() => setFly(null), 2100)
    },
    [reduceMotion, lowPower]
  )

  return (
    <Ctx.Provider value={{ triggerFly }}>
      {children}
      <AnimatePresence>
        {fly && (
          <motion.div
            key={`${fly.x1}-${fly.y1}`}
            className="fixed z-[300] pointer-events-none rounded-2xl overflow-hidden"
            style={{
              width: W,
              height: H,
              boxShadow:
                '0 0 0 3px rgba(17,24,39,0.95), 0 0 0 5px rgba(245,158,11,0.95), 0 18px 48px rgba(0,0,0,0.45), 0 0 32px rgba(245,158,11,0.35)',
            }}
            initial={{
              x: fly.x1,
              y: fly.y1,
              scale: 1,
              rotate: -8,
              opacity: 1,
              filter: 'brightness(1.05)',
            }}
            animate={{
              x: [
                fly.x1,
                (fly.x1 + fly.x2) / 2 + 42,
                fly.x2 - 8,
                fly.x2 + 6,
                fly.x2,
              ],
              y: [
                fly.y1,
                Math.min(fly.y1, fly.y2) - 128,
                fly.y2 - 12,
                fly.y2 + 6,
                fly.y2,
              ],
              scale: [1, 1.18, 0.72, 0.58, 0.5],
              rotate: [-8, 12, 4, -4, 0],
              opacity: [1, 1, 1, 1, 0.15],
              filter: ['brightness(1.08)', 'brightness(1.12)', 'brightness(1)', 'brightness(1)', 'brightness(0.95)'],
            }}
            exit={{ opacity: 0, scale: 0.35, transition: { duration: 0.12 } }}
            transition={{
              /* медленнее и плавнее, чем раньше (~×2) */
              duration: 1.75,
              times: [0, 0.32, 0.68, 0.84, 1],
              ease: [
                [0.25, 0.46, 0.45, 0.94],
                [0.55, 0, 0.45, 1],
                [0.34, 1.25, 0.64, 1],
                [0.22, 1, 0.36, 1],
              ],
            }}
          >
            <div className="h-full w-full bg-neutral-900 p-0.5">
              {fly.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fly.url}
                  alt=""
                  className="h-full w-full rounded-[10px] object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-gradient-to-br from-amber-400 to-amber-600 text-2xl font-bold text-white">
                  +
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  )
}

export function useFlyToCart() {
  return useContext(Ctx)
}
