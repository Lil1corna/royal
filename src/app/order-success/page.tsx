'use client'
import { useLang, translations } from '@/context/lang'

export default function OrderSuccess() {
  const { lang } = useLang()
  const tr = translations

  return (
    <main className="p-8 max-w-md mx-auto text-center mt-20">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-3xl font-bold mb-3">{tr.orderSuccess[lang]}</h1>
      <p className="text-gray-500 mb-8">{tr.orderSuccessMessage[lang]}</p>
      <a href="/" className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800">
        {tr.backToCatalogBtn[lang]}
      </a>
    </main>
  )
}
