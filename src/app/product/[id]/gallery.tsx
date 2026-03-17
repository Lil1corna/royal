'use client'
import { useState } from 'react'

export default function ProductGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-8xl">
        🛏
      </div>
    )
  }

  return (
    <div>
      <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-gray-100">
        <img src={images[active]} className="w-full h-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div key={i} onClick={() => setActive(i)}
              className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${active === i ? 'border-black' : 'border-transparent'}`}>
              <img src={img} className="w-full h-full object-cover" />
          </div>
          ))}
        </div>
      )}
    </div>
  )
}
