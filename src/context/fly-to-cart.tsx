'use client'

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

type FlyState = {
  x1: number
  y1: number
  x2: number
  y2: number
  url: string | null
}

const Ctx = createContext<{ triggerFly: (el: HTMLElement, imageUrl?: string | null) => void }>({
  triggerFly: () => {},
})

export function FlyToCartProvider({ children }: { children: ReactNode }) {
  const [fly, setFly] = useState<FlyState | null>(null)
  const reduceMotion = useReducedMotion()

  const triggerFly = useCallback(
    (fromEl: HTMLElement, imageUrl?: string | null) => {
      if (reduceMotion) return
      const from = fromEl.getBoundingClientRect()
      const target = document.getElementById('nav-cart-fly-target')
      if (!target) return
      const to = target.getBoundingClientRect()
      const w = 44
      const h = 44
      setFly({
        x1: from.left + from.width / 2 - w / 2,
        y1: from.top + from.height / 2 - h / 2,
        x2: to.left + to.width / 2 - w / 2,
        y2: to.top + to.height / 2 - h / 2,
        url: imageUrl || null,
      })
      window.setTimeout(() => setFly(null), 1050)
    },
    [reduceMotion]
  )

  return (
    <Ctx.Provider value={{ triggerFly }}>
      {children}
      <AnimatePresence>
        {fly && (
          <motion.div
            key={`${fly.x1}-${fly.y1}`}
            className="fixed z-[300] pointer-events-none rounded-xl overflow-hidden shadow-xl border-2 border-amber-400/90 bg-white"
            style={{ width: 44, height: 44 }}
            initial={{ x: fly.x1, y: fly.y1, scale: 1, rotate: -6, opacity: 1 }}
            animate={{
              /* дуга + замедление к концу + лёгкий «отскок» к иконке */
              x: [
                fly.x1,
                (fly.x1 + fly.x2) / 2 + 36,
                fly.x2 - 6,
                fly.x2 + 5,
                fly.x2,
              ],
              y: [
                fly.y1,
                Math.min(fly.y1, fly.y2) - 120,
                fly.y2 - 10,
                fly.y2 + 4,
                fly.y2,
              ],
              scale: [1, 1.14, 0.5, 0.38, 0.32],
              rotate: [-6, 10, 2, -3, 0],
              opacity: [1, 1, 0.95, 1, 0.88],
            }}
            exit={{ opacity: 0, scale: 0.2, transition: { duration: 0.12 } }}
            transition={{
              duration: 0.92,
              times: [0, 0.35, 0.72, 0.88, 1],
              ease: [
                [0.22, 1, 0.36, 1],
                [0.45, 0, 0.55, 1],
                [0.34, 1.3, 0.64, 1],
                [0.22, 1, 0.36, 1],
              ],
            }}
          >
            {fly.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fly.url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-lg font-bold">
                +
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  )
}

export function useFlyToCart() {
  return useContext(Ctx)
}
