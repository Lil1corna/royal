'use client'
import { useState } from 'react'
import { useCart } from '@/context/cart'
import { useRouter } from 'next/navigation'

type Size = {
  id: string
  size: string
  price: number
  in_stock: boolean
}

export default function SizeSelector({ sizes, basePrice, discountPct, productId, productName, productImage }: {
  sizes: Size[]
  basePrice: number
  discountPct: number
  productId: string
  productName: string
  productImage: string | null
}) {
  const { add } = useCart()
  const router = useRouter()
  const [selected, setSelected] = useState<Size | null>(
    sizes.length > 0 ? sizes[0] : null
  )
  const [added, setAdded] = useState(false)

  const original = selected ? selected.price : basePrice
  const current = discountPct > 0
    ? parseFloat((original * (1 - discountPct / 100)).toFixed(0))
    : original

  const handleAdd = () => {
    add({
      id: productId,
      name: productName,
      price: current,
      size: selected?.size || null,
      image: productImage,
      quantity: 1,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl font-bold">{current} AZN</span>
        {discountPct > 0 && (
          <>
            <span className="text-gray-400 text-lg" style={{textDecoration:'line-through'}}>
              {original} AZN
            </span>
            <span className="bg-green-500 text-white text-sm px-2 py-1 rounded-full">
              -{discountPct}%
            </span>
          </>
        )}
      </div>

      {sizes.length > 0 && (
        <div className="mb-6">
          <p className="font-medium mb-3">Olcu secin:</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button key={s.id} disabled={!s.in_stock} onClick={() => setSelected(s)}
                className={`border-2 rounded-lg px-4 py-2 text-sm transition-all ${
                  !s.in_stock ? 'opacity-40 cursor-not-allowed border-gray-200'
                  : selected?.id === s.id ? 'border-black bg-black text-white'
                  : 'border-gray-200 hover:border-black'
                }`}>
                <div className="font-medium">{s.size}</div>
                <div className={selected?.id === s.id ? 'text-gray-300' : 'text-gray-500'}>
                  {s.price} AZN
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button onClick={handleAdd}
          className={`w-full py-3 rounded-xl text-lg transition-all ${
            added ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-gray-800'
          }`}>
          {added ? 'Sebete elave edildi!' : 'Sebete ele'}
        </button>
        <button onClick={() => { handleAdd(); router.push('/cart') }}
          className="w-full py-3 rounded-xl text-lg border-2 border-black hover:bg-gray-50">
          Birbaşa sifaris et
        </button>
      </div>
    </div>
  )
}
