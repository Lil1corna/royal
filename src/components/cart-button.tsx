'use client'
import { useCart } from '@/context/cart'
import { useRouter } from 'next/navigation'

export default function CartButton() {
  const { count } = useCart()
  const router = useRouter()

  return (
    <button onClick={() => router.push('/cart')}
      className="relative flex items-center gap-2 border rounded-xl px-4 py-2 hover:bg-gray-50">
      🛒
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
      <span className="text-sm">Sebet</span>
    </button>
  )
}
