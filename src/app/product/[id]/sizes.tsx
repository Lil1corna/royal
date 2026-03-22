'use client'
import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { useCart } from '@/context/cart'
import { useFlyToCart } from '@/context/fly-to-cart'
import { useWishlist } from '@/context/wishlist'
import { useRouter } from 'next/navigation'
import { useLang, translations } from '@/context/lang'

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
        <span className="text-3xl font-bold">{current} AZN</span>
        {discountPct > 0 && (
          <>
            <span className="text-gray-400 text-lg" style={{textDecoration:'line-through'}}>
              {original} AZN
            </span>
            <span className="bg-green-500 text-white text-sm px-2 py-1 rounded-full">
              -{discountPct}%
            </span>
          </>
        )}
      </div>

      {sizes.length > 0 && (
        <div className="mb-6">
          <p className="font-medium mb-3">{tr.selectSizeLabel[lang]}</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button key={s.id} disabled={!s.in_stock} onClick={() => setSelected(s)}
                className={`border-2 rounded-lg px-4 py-2 text-sm transition-all ${
                  !s.in_stock ? 'opacity-40 cursor-not-allowed border-gray-200'
                  : selected?.id === s.id ? 'border-black bg-black text-white'
                  : 'border-gray-200 hover:border-black'
                }`}>
                <div className="font-medium">{s.size}</div>
                <div className={selected?.id === s.id ? 'text-gray-300' : 'text-gray-500'}>
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
              ? 'border-amber-500 bg-amber-50 text-amber-900'
              : 'border-neutral-200 hover:border-amber-300 text-neutral-700'
          }`}
        >
          {inWishlist ? tr.removeFromWishlist[lang] : tr.addToWishlist[lang]}
        </motion.button>
        <motion.button
          ref={addBtnRef}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleAdd(addBtnRef.current)}
          className={`w-full py-3 rounded-xl text-lg transition-all ${
            added ? 'bg-green-500 text-white' : 'btn-primary'
          }`}
        >
          {added ? tr.addToCartSuccess[lang] : tr.addToCart[lang]}
        </motion.button>
        <motion.button
          ref={orderBtnRef}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            handleAdd(orderBtnRef.current)
            window.setTimeout(() => router.push('/cart'), 420)
          }}
          className="w-full py-3 rounded-xl text-lg btn-secondary border-2 border-black"
        >
          {tr.orderNow[lang]}
        </motion.button>
      </motion.div>
    </div>
  )
}
