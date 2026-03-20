'use client'
import Image from 'next/image'
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
        <Image
          src={images[active]}
          alt="Product image"
          width={800}
          height={800}
          className="w-full h-full object-cover"
          unoptimized
          priority={active === 0}
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div key={i} onClick={() => setActive(i)}
              className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${active === i ? 'border-black' : 'border-transparent'}`}>
              <Image
                src={img}
                alt={`Thumbnail ${i + 1}`}
                width={180}
                height={180}
                className="w-full h-full object-cover"
                unoptimized
              />
          </div>
          ))}
        </div>
      )}
    </div>
  )
}
