'use client'
import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { useCart } from '@/context/cart'
import { useFlyToCart } from '@/context/fly-to-cart'
import { useWishlist } from '@/context/wishlist'
import { useRouter } from 'next/navigation'
import { useLang, translations } from '@/context/lang'
import Magnetic from '@/components/magnetic'

type Size = {
  id: string
  size: string
  price: number
  in_stock: boolean
}

export default function SizeSelector({ sizes, basePrice, discountPct, productId, productName, productImage }: {
  sizes: Size[]
  basePrice: number
  discountPct: number
  productId: string
  productName: string
  productImage: string | null
}) {
  const { add } = useCart()
  const { triggerFly } = useFlyToCart()
  const { has, toggle } = useWishlist()
  const { lang } = useLang()
  const tr = translations
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
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div>
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

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-3"
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => toggle(productId)}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
            inWishlist
              ? 'border-[#c9a84c]/50 bg-[rgba(201,168,76,0.12)] text-[#e8c97a]'
              : 'border-white/10 bg-white/5 hover:border-[#c9a84c]/40 text-white/80'
          }`}
        >
          {inWishlist ? tr.removeFromWishlist[lang] : tr.addToWishlist[lang]}
        </motion.button>
        <Magnetic className="w-full" strength={0.16}>
          <motion.button
            ref={addBtnRef}
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAdd(addBtnRef.current)}
            className={`w-full rounded-xl py-3 text-lg transition-all ${
              added ? 'bg-green-500 text-white' : 'btn-primary'
            }`}
          >
            {added ? tr.addToCartSuccess[lang] : tr.addToCart[lang]}
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
            className="w-full rounded-xl py-3 text-lg btn-secondary"
          >
            {tr.orderNow[lang]}
          </motion.button>
        </Magnetic>
      </motion.div>
    </div>
  )
}
