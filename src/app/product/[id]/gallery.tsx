'use client'
import Image from 'next/image'
import { useSpring, useTransform, motion, useMotionValue } from 'framer-motion'
import { useCallback, useRef, useState, type MouseEvent, type TouchEvent } from 'react'
import { useLowPowerMotion } from '@/hooks/use-low-power-motion'
import { useIsMobile } from '@/hooks/useIsMobile'

export default function ProductGallery({
  images,
  productName,
}: {
  images: string[]
  productName: string
}) {
  const [active, setActive] = useState(0)
  const mainRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const isMobile = useIsMobile()
  const lowPower = useLowPowerMotion() || isMobile

  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)

  const rawRotateX = useTransform(my, [0, 1], [9, -9])
  const rawRotateY = useTransform(mx, [0, 1], [-9, 9])
  const rotateX = useSpring(rawRotateX, { stiffness: 280, damping: 26, mass: 0.4 })
  const rotateY = useSpring(rawRotateY, { stiffness: 280, damping: 26, mass: 0.4 })

  const onMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (lowPower || !mainRef.current) return
      const r = mainRef.current.getBoundingClientRect()
      mx.set((e.clientX - r.left) / r.width)
      my.set((e.clientY - r.top) / r.height)
    },
    [mx, my, lowPower]
  )

  const onLeave = useCallback(() => {
    mx.set(0.5)
    my.set(0.5)
  }, [mx, my])

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0]
    touchStartX.current = t.clientX
    touchStartY.current = t.clientY
  }

  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const startX = touchStartX.current
    const startY = touchStartY.current
    touchStartX.current = null
    touchStartY.current = null

    if (startX == null || startY == null) return
    const t = e.changedTouches[0]
    const dx = t.clientX - startX
    const dy = t.clientY - startY

    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    const threshold = 40

    // Detect horizontal swipe with enough distance and not too much vertical movement.
    if (absDx < threshold || absDx < absDy) return

    setActive((prev) => {
      if (dx < 0) return Math.min(prev + 1, images.length - 1)
      return Math.max(prev - 1, 0)
    })
  }

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/30 text-8xl">
        🛏
      </div>
    )
  }

  return (
    <div>
      <div
        ref={mainRef}
        className="aspect-square rounded-2xl mb-3 bg-white/5 border border-white/10 overflow-hidden touch-pan-y"
        style={{ perspective: lowPower ? undefined : 1100 }}
        onMouseMove={lowPower ? undefined : onMove}
        onMouseLeave={lowPower ? undefined : onLeave}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <motion.div
          className="h-full w-full will-change-transform"
          style={{
            rotateX: lowPower ? 0 : rotateX,
            rotateY: lowPower ? 0 : rotateY,
            transformStyle: lowPower ? undefined : 'preserve-3d',
          }}
        >
          <div
            className="relative h-full w-full"
            style={lowPower ? undefined : { transform: 'translateZ(24px)' }}
          >
            <Image
              src={images[active]}
              alt={`${productName} — image ${active + 1}`}
              width={800}
              height={800}
              className="w-full h-full object-cover rounded-2xl shadow-lg"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
              unoptimized
              priority={active === 0}
              loading={active === 0 ? undefined : 'lazy'}
            />
          </div>
        </motion.div>
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`aspect-square min-h-[44px] rounded-xl overflow-hidden cursor-pointer border transition-all duration-200 active:scale-[0.98] ${
                active === i
                  ? 'border-[#c9a84c] ring-2 ring-[rgba(201,168,76,0.25)] scale-[1.02]'
                  : 'border-transparent bg-white/5 hover:border-white/20 opacity-90 hover:opacity-100'
              }`}
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${i + 1}`}
                width={180}
                height={180}
                className="w-full h-full object-cover"
                sizes="(max-width: 640px) 25vw, 180px"
                unoptimized
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
