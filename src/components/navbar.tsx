'use client'
import { useState } from 'react'
import { useLang, translations } from '@/context/lang'
import { useCart } from '@/context/cart'
import { useRouter } from 'next/navigation'

type Lang = 'az' | 'ru' | 'en'

function NavLinks({ userEmail, onClose }: { userEmail?: string | null; onClose?: () => void }) {
  const { lang, setLang } = useLang()
  const { count } = useCart()
  const router = useRouter()
  const tr = translations

  const handleCart = () => {
    onClose?.()
    router.push('/cart')
  }

  return (
    <>
      <div className="flex border rounded-lg overflow-hidden text-xs font-medium">
        {(['az', 'ru', 'en'] as Lang[]).map(l => (
          <button key={l} onClick={() => setLang(l)}
            className={`px-3 py-1.5 transition-colors ${
              lang === l ? 'bg-black text-white' : 'hover:bg-gray-100'
            }`}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <button onClick={handleCart}
        className="relative w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100">
        🛒
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
            {count}
          </span>
        )}
      </button>
      {userEmail ? (
        <div className="flex items-center gap-2">
          <a href="/account" onClick={onClose}
            className="border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-100">
            {userEmail.split('@')[0]}
          </a>
          <form action="/auth/signout" method="post">
            <button className="border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-100">
              {tr.signout[lang]}
            </button>
          </form>
        </div>
      ) : (
        <a href="/auth/signin" onClick={onClose}
          className="bg-black text-white px-4 py-1.5 rounded-lg text-sm hover:opacity-80">
          {tr.signin[lang]}
        </a>
      )}
    </>
  )
}

export default function Navbar({ userEmail }: { userEmail?: string | null }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b bg-white">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="text-2xl font-bold tracking-tight">
          Royal<span className="text-amber-500">Az</span>
        </a>

        <div className="hidden md:flex items-center gap-2">
          <NavLinks userEmail={userEmail} />
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100"
          aria-label="Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="md:hidden fixed top-0 right-0 w-64 h-full bg-white border-l shadow-lg z-50 p-6 flex flex-col gap-4">
            <button
              onClick={() => setMobileOpen(false)}
              className="self-end w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex flex-col gap-4">
              <NavLinks userEmail={userEmail} onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
