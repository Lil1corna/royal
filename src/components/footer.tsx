'use client'
import { motion } from 'framer-motion'
import { useLang, translations } from '@/context/lang'
import Link from 'next/link'
import { SITE_CONTACT, whatsappChatUrl } from '@/lib/site-contact'

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
    </svg>
  )
}

function IconTikTok({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64v-3.4a6.34 6.34 0 0 0-1-.05 6.33 6.33 0 1 0 6.33 6.33V7.95a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.38z" />
    </svg>
  )
}

export default function Footer() {
  const { lang } = useLang()
  const tr = translations
  const telHref = `tel:${SITE_CONTACT.phoneE164.replace(/\s/g, '')}`

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.25 }}
      className="mt-auto border-t border-neutral-200 bg-neutral-100 text-neutral-900"
    >
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div>
            <h3 className="mb-3 text-lg font-bold text-neutral-900">
              Royal<span className="text-amber-600">Az</span>
            </h3>
            <p className="text-sm text-neutral-600">
              {lang === 'ru'
                ? 'Ортопедические матрасы и подушки'
                : lang === 'en'
                  ? 'Orthopedic mattresses and pillows'
                  : 'Ortopedik dosekler və yastıqlar'}
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-3">{tr.catalog[lang]}</h3>
            <Link href="/" className="block text-sm text-gray-600 hover:text-black">
              {tr.backToCatalog[lang]}
            </Link>
          </div>
          <div>
            <h3 className="mb-3 font-bold text-neutral-900">{tr.cart[lang]}</h3>
            <Link href="/cart" className="block text-sm text-neutral-700 hover:text-neutral-950">
              {tr.cart[lang]}
            </Link>
          </div>
          <div>
            <h3 className="mb-3 font-bold text-neutral-900">{tr.account[lang]}</h3>
            <Link href="/account" className="block text-sm text-neutral-700 hover:text-neutral-950">
              {tr.account[lang]}
            </Link>
          </div>
          <div>
            <h3 className="mb-3 font-bold text-neutral-900">{tr.contactUs[lang]}</h3>
            <a
              href={telHref}
              className="mb-3 block text-sm font-semibold text-neutral-900 hover:text-amber-700"
            >
              {SITE_CONTACT.phoneDisplay}
            </a>
            <a
              href={whatsappChatUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 mb-4"
            >
              <span aria-hidden>💬</span> WhatsApp
            </a>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {tr.followSocial[lang]}
            </p>
            <div className="flex items-center gap-3">
              <a
                href={SITE_CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <IconInstagram className="w-7 h-7" />
              </a>
              <a
                href={SITE_CONTACT.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-neutral-900 transition-colors"
                aria-label="TikTok"
              >
                <IconTikTok className="w-7 h-7" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-neutral-200 pt-8 text-center text-sm text-neutral-600">
          © {new Date().getFullYear()} RoyalAz.{' '}
          {lang === 'ru'
            ? 'Все права защищены.'
            : lang === 'en'
              ? 'All rights reserved.'
              : 'Bütün hüquqlar qorunur.'}
        </div>
      </div>
    </motion.footer>
  )
}
