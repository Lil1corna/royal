'use client'
import { useCart } from '@/context/cart'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartButton() {
  const { count } = useCart()
  const router = useRouter()

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={() => router.push('/cart')}
      type="button"
      className="relative flex items-center gap-2 ds-btn-secondary !px-4 !py-2"
    >
      🛒
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 1.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            className="absolute -top-2 -right-2 bg-[rgba(201,168,76,0.18)] border border-[rgba(201,168,76,0.35)] text-[#e8c97a] text-[10px] w-5 h-5 rounded-full flex items-center justify-center"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
      <span className="text-sm text-white">Sebet</span>
    </motion.button>
  )
}
