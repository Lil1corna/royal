'use client'
import Image from 'next/image'
import { useSpring, useTransform, motion, useMotionValue } from 'framer-motion'
import { useCallback, useRef, useState, type MouseEvent } from 'react'
import { useLowPowerMotion } from '@/hooks/use-low-power-motion'

export default function ProductGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0)
  const mainRef = useRef<HTMLDivElement>(null)
  const lowPower = useLowPowerMotion()

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
        className="aspect-square rounded-2xl mb-3 bg-white/5 border border-white/10 overflow-hidden"
        style={{ perspective: lowPower ? undefined : 1100 }}
        onMouseMove={lowPower ? undefined : onMove}
        onMouseLeave={lowPower ? undefined : onLeave}
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
              alt="Product image"
              width={800}
              height={800}
              className="w-full h-full object-cover rounded-2xl shadow-lg"
              unoptimized
              priority={active === 0}
            />
          </div>
        </motion.div>
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`aspect-square rounded-xl overflow-hidden cursor-pointer border transition-all duration-200 ${
                active === i
                  ? 'border-[#c9a84c] ring-2 ring-[rgba(201,168,76,0.25)] scale-[1.02]'
                  : 'border-transparent bg-white/5 hover:border-white/20 opacity-90 hover:opacity-100'
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${i + 1}`}
                width={180}
                height={180}
                className="w-full h-full object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
