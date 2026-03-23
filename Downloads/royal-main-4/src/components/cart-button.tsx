'use client'
import { useCart } from '@/context/cart'
import { useRouter } from 'next/navigation'

export default function CartButton() {
  const { count } = useCart()
  const router = useRouter()

  return (
    <button onClick={() => router.push('/cart')}
      type="button"
      className="relative flex items-center gap-2 ds-btn-secondary !px-4 !py-2"
    >
      🛒
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-[rgba(201,168,76,0.18)] border border-[rgba(201,168,76,0.35)] text-[#e8c97a] text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
      <span className="text-sm text-white">Sebet</span>
    </button>
  )
}
