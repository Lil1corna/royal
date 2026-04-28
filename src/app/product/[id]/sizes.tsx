'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { useCart } from '@/context/cart'
import { useFlyToCart } from '@/context/fly-to-cart'
import { useWishlist } from '@/context/wishlist'
import { useToast } from '@/context/toast'
import { useRouter } from 'next/navigation'
import { useLang, translations } from '@/context/lang'
import Magnetic from '@/components/magnetic'
import { useIsMobile } from '@/hooks/useIsMobile'
import { Button } from '@/components/ui/button'

type Size = {
  id: string
  size: string
  price: number
  in_stock: boolean
}

export default function SizeSelector({ sizes, basePrice, discountPct, productId, productName, productImage, description }: {
  sizes: Size[]
  basePrice: number
  discountPct: number
  productId: string
  productName: string
  productImage: string | null
  description?: string | null
}) {
  const { add } = useCart()
  const { triggerFly } = useFlyToCart()
  const { has, toggle } = useWishlist()
  const { addToast } = useToast()
  const { lang } = useLang()
  const tr = translations
  const isMobile = useIsMobile()
  const inWishlist = has(productId)
  const router = useRouter()
  const [selected, setSelected] = useState<Size | null>(
    sizes.length > 0 ? sizes[0] : null
  )
  const [added, setAdded] = useState(false)
  const addBtnRef = useRef<HTMLButtonElement>(null)
  const orderBtnRef = useRef<HTMLButtonElement>(null)

  const original = selected ? selected.price : basePrice
  const current = discountPct > 0
    ? parseFloat((original * (1 - discountPct / 100)).toFixed(0))
    : original
  const desc = (description ?? '').trim()
  const descHeading = lang === 'az' ? 'Məhsul haqqında' : lang === 'ru' ? 'О товаре' : 'About this product'

  const handleAdd = (fromEl?: HTMLElement | null) => {
    add({
      id: productId,
      name: productName,
      price: current,
      size: selected?.size || null,
      image: productImage,
      quantity: 1,
    })
    if (fromEl) triggerFly(fromEl, productImage)
    setAdded(true)
    addToast('success', tr.addToCartSuccess[lang])
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="pb-24 md:pb-0">
      <div className="flex items-center gap-3 mb-6">
        <span className="font-serif text-[26px] font-bold text-[#e8c97a]">{current} AZN</span>
        {discountPct > 0 && (
          <>
            <span className="text-white/40 text-lg" style={{ textDecoration: 'line-through' }}>
              {original} AZN
            </span>
            <span className="bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.25)] text-[#e8c97a] text-sm px-2 py-1 rounded-full">
              -{discountPct}%
            </span>
          </>
        )}
      </div>

      {sizes.length > 0 && (
        <div className="mb-6">
          <p className="ds-label">{tr.selectSizeLabel[lang]}</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button key={s.id} disabled={!s.in_stock} onClick={() => setSelected(s)}
                className={`border-2 rounded-lg px-4 py-2 text-sm transition-all ${
                  !s.in_stock
                    ? 'opacity-40 cursor-not-allowed border-white/10 bg-white/5'
                    : selected?.id === s.id
                      ? 'border-[#c9a84c]/50 bg-[rgba(201,168,76,0.12)] text-[#e8c97a]'
                      : 'border-white/10 bg-white/5 hover:border-[#c9a84c]/40 text-white/80'
                }`}>
                <div className="font-medium">{s.size}</div>
                <div className={selected?.id === s.id ? 'text-[#e8c97a]' : 'text-white/60'}>
                  {s.price} AZN
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {desc && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white/90 mb-2">{descHeading}</h3>
          <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{desc}</p>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={isMobile ? { duration: 0.15, ease: 'easeOut' } : { duration: 0.2 }}
        className="flex flex-col gap-3"
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => toggle(productId)}
          className={`w-full py-3 min-h-[44px] rounded-xl text-sm font-semibold border-2 transition-all ${
            inWishlist
              ? 'border-[#c9a84c]/50 bg-[rgba(201,168,76,0.12)] text-[#e8c97a]'
              : 'border-white/10 bg-white/5 hover:border-[#c9a84c]/40 text-white/80'
          }`}
        >
          {inWishlist ? tr.removeFromWishlist[lang] : tr.addToWishlist[lang]}
        </motion.button>
        <Magnetic className="hidden w-full md:block" strength={0.16}>
          <motion.button
            ref={addBtnRef}
            type="button"
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={() => handleAdd(addBtnRef.current)}
            className={`w-full rounded-xl py-3 min-h-[44px] text-lg transition-all ${
              added ? 'bg-emerald-500 text-white' : 'btn-primary'
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={added ? 'added' : 'idle'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="inline-flex items-center"
              >
                {added ? `✓ ${tr.addToCartSuccess[lang]}` : tr.addToCart[lang]}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </Magnetic>
        <Magnetic className="w-full" strength={0.16}>
          <motion.button
            ref={orderBtnRef}
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              handleAdd(orderBtnRef.current)
              window.setTimeout(() => router.push('/cart'), 1400)
            }}
            className="w-full rounded-xl py-3 min-h-[44px] text-lg btn-secondary"
          >
            {tr.orderNow[lang]}
          </motion.button>
        </Magnetic>
      </motion.div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#050d1a]/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:hidden">
        <Button
          className="w-full"
          size="lg"
          onClick={() => handleAdd(addBtnRef.current)}
        >
          {tr.addToCart[lang]} — {current} AZN
        </Button>
      </div>
    </div>
  )
}
