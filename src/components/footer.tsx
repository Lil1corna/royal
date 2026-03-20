'use client'
import { motion } from 'framer-motion'
import { useLang, translations } from '@/context/lang'
import Link from 'next/link'

export default function Footer() {
  const { lang } = useLang()
  const tr = translations

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.25 }}
      className="border-t bg-gray-50 mt-auto"
    >
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">Royal<span className="text-amber-500">Az</span></h3>
            <p className="text-sm text-gray-600">Ortopedik dosekler və yastıqlar</p>
          </div>
          <div>
            <h3 className="font-bold mb-3">{tr.catalog[lang]}</h3>
            <Link href="/" className="block text-sm text-gray-600 hover:text-black">
              {tr.backToCatalog[lang]}
            </Link>
          </div>
          <div>
            <h3 className="font-bold mb-3">{tr.cart[lang]}</h3>
            <Link href="/cart" className="block text-sm text-gray-600 hover:text-black">
              {tr.cart[lang]}
            </Link>
          </div>
          <div>
            <h3 className="font-bold mb-3">{tr.account[lang]}</h3>
            <Link href="/account" className="block text-sm text-gray-600 hover:text-black">
              {tr.account[lang]}
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
          © {new Date().getFullYear()} RoyalAz. Bütün hüquqlar qorunur.
        </div>
      </div>
    </motion.footer>
  )
}
