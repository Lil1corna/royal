'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLang, translations } from '@/context/lang'
import { useIsMobile } from '@/hooks/useIsMobile'

export default function OrderSuccess() {
  const { lang } = useLang()
  const tr = translations
  const isMobile = useIsMobile()

  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={isMobile ? { duration: 0.15, ease: 'easeOut' } : { duration: 0.22 }}
      className="p-8 max-w-md mx-auto text-center mt-20"
    >
      <motion.div
        initial={{ scale: 0.92 }}
        animate={{ scale: 1 }}
        transition={
          isMobile ? { duration: 0.15, ease: 'easeOut' } : { type: 'spring', stiffness: 220, damping: 14 }
        }
        className="text-6xl mb-4"
      >
        ✅
      </motion.div>
      <h1 className="text-3xl font-bold mb-3 text-white">{tr.orderSuccess[lang]}</h1>
      <p className="text-neutral-300 mb-8">{tr.orderSuccessMessage[lang]}</p>
      <Link href="/" className="btn-primary px-8 py-3">
        {tr.backToCatalogBtn[lang]}
      </Link>
    </motion.main>
  )
}
