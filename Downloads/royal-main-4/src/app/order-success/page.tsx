'use client'
import { motion } from 'framer-motion'
import { useLang, translations } from '@/context/lang'

export default function OrderSuccess() {
  const { lang } = useLang()
  const tr = translations

  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="p-8 max-w-md mx-auto text-center mt-20"
    >
      <motion.div
        initial={{ scale: 0.92 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 14 }}
        className="text-6xl mb-4"
      >
        ✅
      </motion.div>
      <h1 className="text-3xl font-bold mb-3 text-white">{tr.orderSuccess[lang]}</h1>
      <p className="text-neutral-300 mb-8">{tr.orderSuccessMessage[lang]}</p>
      <a href="/" className="btn-primary px-8 py-3">
        {tr.backToCatalogBtn[lang]}
      </a>
    </motion.main>
  )
}
