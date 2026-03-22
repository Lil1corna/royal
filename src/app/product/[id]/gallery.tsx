'use client'
import Image from 'next/image'
import { useReducedMotion, useSpring, useTransform, motion, useMotionValue } from 'framer-motion'
import { useCallback, useRef, useState, type MouseEvent } from 'react'

export default function ProductGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0)
  const mainRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)

  const rawRotateX = useTransform(my, [0, 1], [9, -9])
  const rawRotateY = useTransform(mx, [0, 1], [-9, 9])
  const rotateX = useSpring(rawRotateX, { stiffness: 280, damping: 26, mass: 0.4 })
  const rotateY = useSpring(rawRotateY, { stiffness: 280, damping: 26, mass: 0.4 })

  const onMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (reduce || !mainRef.current) return
      const r = mainRef.current.getBoundingClientRect()
      mx.set((e.clientX - r.left) / r.width)
      my.set((e.clientY - r.top) / r.height)
    },
    [mx, my, reduce]
  )

  const onLeave = useCallback(() => {
    mx.set(0.5)
    my.set(0.5)
  }, [mx, my])

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-8xl">
        🛏
      </div>
    )
  }

  return (
    <div>
      <div
        ref={mainRef}
        className="aspect-square rounded-2xl mb-3 bg-gray-100 overflow-hidden"
        style={{ perspective: 1100 }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <motion.div
          className="w-full h-full will-change-transform"
          style={{
            rotateX: reduce ? 0 : rotateX,
            rotateY: reduce ? 0 : rotateY,
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            className="w-full h-full relative"
            style={{ transform: 'translateZ(24px)' }}
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
              className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                active === i
                  ? 'border-amber-500 ring-2 ring-amber-200 scale-[1.02]'
                  : 'border-transparent hover:border-neutral-300 opacity-90 hover:opacity-100'
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
