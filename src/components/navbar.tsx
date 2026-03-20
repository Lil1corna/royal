'use client'
import { useLang, translations } from '@/context/lang'
import { useCart } from '@/context/cart'
import { useRouter } from 'next/navigation'

type Lang = 'az' | 'ru' | 'en'

export default function Navbar({ userEmail }: { userEmail?: string | null }) {
  const { lang, setLang } = useLang()
  const { count } = useCart()
  const router = useRouter()
  const tr = translations

  return (
    <nav className="sticky top-0 z-50 border-b bg-white">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="text-2xl font-bold tracking-tight">
          Royal<span className="text-amber-500">Az</span>
        </a>
        <div className="flex items-center gap-2">
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
          <button onClick={() => router.push('/cart')}
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
              <a href="/account"
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
            <a href="/auth/signin"
              className="bg-black text-white px-4 py-1.5 rounded-lg text-sm hover:opacity-80">
              {tr.signin[lang]}
            </a>
          )}
        </div>
      </div>
    </nav>
  )
}
