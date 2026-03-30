'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence, type Variants } from 'framer-motion'
import { useMemo, useRef, useState, useCallback } from 'react'
import { useLang, translations } from '@/context/lang'
import CinematicHero from '@/components/cinematic-hero'
import AboutSection from '@/components/about-section'
import { useLowPowerMotion } from '@/hooks/use-low-power-motion'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useCart } from '@/context/cart'
import { useWishlist } from '@/context/wishlist'
import { Heart, ShoppingCart, Eye, SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react'

const ITEMS_PER_PAGE = 12

type Product = {
  id: string
  name_az: string
  name_ru: string
  name_en: string
  category: string
  price: number
  discount_pct: number
  in_stock: boolean
  image_urls: string[]
}

const CATEGORY_KEYS = ['ortopedik', 'berk', 'yumshaq', 'topper', 'ushaq', 'yastig'] as const

const catalogGridContainerHeavy = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.04,
    },
  },
}

const catalogGridItemHeavy = {
  hidden: { opacity: 0, y: 26, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] as const },
  },
}

/** Тач: короче stagger, без scale — меньше подвисаний */
const catalogGridContainerLight = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.01,
    },
  },
}

const catalogGridItemLight = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

const catalogGridContainerMobile = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] as const, staggerChildren: 0 },
  },
}

const catalogGridItemMobile = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] as const },
  },
}

function ParallaxProductCardDesktop({
  p,
  lang,
  tr,
  lowPower,
  gridItemVariants,
  priority = false,
  onQuickView,
}: {
  p: Product
  lang: 'az' | 'ru' | 'en'
  tr: typeof translations
  lowPower: boolean
  gridItemVariants: Variants
  priority?: boolean
  onQuickView?: (p: Product) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const imgY = useTransform(scrollYProgress, [0, 1], lowPower ? [0, 0] : [14, -14])
  const textY = useTransform(scrollYProgress, [0, 1], lowPower ? [0, 0] : [-22, 22])

  const { addItem } = useCart()
  const { has: isInWishlist, toggle: toggleWishlist } = useWishlist()

  const name = lang === 'az' ? p.name_az : lang === 'ru' ? p.name_ru : p.name_en
  const cat = tr.categories[p.category]?.[lang] || p.category
  const discountedPrice =
    p.discount_pct > 0 ? (p.price * (1 - p.discount_pct / 100)).toFixed(0) : null
  const finalPrice = discountedPrice ? Number(discountedPrice) : p.price

  const [imgFailed, setImgFailed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const primaryImage = p.image_urls?.[0]?.trim()
  const secondaryImage = p.image_urls?.[1]?.trim()
  const showProductImage = Boolean(primaryImage) && !imgFailed
  const inWishlist = isInWishlist(p.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!p.in_stock) return
    addItem({
      id: p.id,
      name: name,
      price: finalPrice,
      image: primaryImage || '',
      size: '',
      quantity: 1,
    })
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(p.id)
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView?.(p)
  }

  return (
    <motion.div
      ref={ref}
      variants={gridItemVariants}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={
        lowPower
          ? undefined
          : {
              y: -6,
              transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
            }
      }
    >
      <Link
        href={'/product/' + p.id}
        className={[
          'group block ds-card-glass transform-gpu transition-shadow transition-transform duration-300 relative',
          !p.in_stock ? 'opacity-60' : '',
        ].join(' ')}
      >
        <motion.div
          className="relative aspect-[4/3] overflow-hidden bg-[rgba(255,255,255,0.03)]"
          whileHover={lowPower ? undefined : { scale: 1.035 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div className="absolute inset-0" style={{ y: imgY }}>
            {showProductImage ? (
              <>
                <Image
                  src={primaryImage!}
                  alt={name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={`object-cover scale-110 transition-all duration-500 ease-out ${
                    lowPower ? '' : 'group-hover:scale-[1.18]'
                  } ${hovered && secondaryImage ? 'opacity-0' : 'opacity-100'}`}
                  style={{ filter: 'brightness(0.95) contrast(1.05)' }}
                  unoptimized
                  priority={priority}
                  onError={() => setImgFailed(true)}
                />
                {secondaryImage && (
                  <Image
                    src={secondaryImage}
                    alt={name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={`object-cover scale-110 transition-all duration-500 ease-out absolute inset-0 ${
                      hovered ? 'opacity-100 scale-[1.18]' : 'opacity-0'
                    }`}
                    style={{ filter: 'brightness(0.95) contrast(1.05)' }}
                    unoptimized
                  />
                )}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl text-neutral-300">
                <svg className="w-16 h-16 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </motion.div>
          <div
            className="product-image-vignette absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 90% 90% at 50% 50%, transparent 50%, rgba(5,13,26,0.35) 100%)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061226]/80 via-transparent to-transparent pointer-events-none" />
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.22),transparent_55%),radial-gradient(circle_at_70%_10%,rgba(255,255,255,0.14),transparent_45%)]" />
          
          {/* Action buttons on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 z-20"
              >
                <button
                  onClick={handleAddToCart}
                  disabled={!p.in_stock}
                  className="flex items-center justify-center gap-2 flex-1 bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] text-[#050d1a] text-xs font-bold py-2.5 px-3 rounded-lg transition-all hover:shadow-lg hover:shadow-[#c9a84c]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">{tr.addToCart[lang]}</span>
                </button>
                <button
                  onClick={handleWishlist}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                    inWishlist 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-white/10 text-white/80 border border-white/10 hover:bg-white/20'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleQuickView}
                  className="flex items-center justify-center w-10 h-10 bg-white/10 text-white/80 border border-white/10 rounded-lg transition-all hover:bg-white/20"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {!p.in_stock && (
            <div className="absolute top-3 right-3 bg-[rgba(220,53,69,0.1)] border border-[rgba(220,53,69,0.2)] text-[rgba(255,100,100,0.8)] text-[10px] font-semibold px-2 py-1 rounded-full z-10">
              {tr.outOfStock[lang]}
            </div>
          )}
          {p.discount_pct > 0 && p.in_stock && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] text-[#050d1a] text-[10px] font-extrabold px-2 py-1 rounded-full z-10">
              -{p.discount_pct}%
            </div>
          )}
        </motion.div>
        <motion.div
          className="border-t border-[rgba(255,255,255,0.08)] bg-[rgba(5,13,26,0.6)] backdrop-blur-sm p-5"
          style={{ y: textY }}
        >
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[rgba(201,168,76,0.7)] mb-2">
            {cat}
          </p>
          <h2 className="font-serif text-[20px] font-semibold mb-2 text-white group-hover:text-[#e8c97a] transition-colors line-clamp-1">
            {name}
          </h2>
          <div className="flex items-center gap-2">
            {discountedPrice ? (
              <>
                <span className="font-serif text-[26px] font-bold text-[#e8c97a]">
                  {discountedPrice} AZN
                </span>
                <span className="text-white/40 text-sm line-through">{p.price} AZN</span>
              </>
            ) : (
              <span className="font-serif text-[26px] font-bold text-[#e8c97a]">{p.price} AZN</span>
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

function ParallaxProductCardMobile({
  p,
  lang,
  tr,
  lowPower,
  gridItemVariants,
  priority = false,
}: {
  p: Product
  lang: 'az' | 'ru' | 'en'
  tr: typeof translations
  lowPower: boolean
  gridItemVariants: Variants
  priority?: boolean
}) {
const { addItem } = useCart()
  const { has: isInWishlist, toggle: toggleWishlist } = useWishlist()
  
  const name = lang === 'az' ? p.name_az : lang === 'ru' ? p.name_ru : p.name_en
  const cat = tr.categories[p.category]?.[lang] || p.category
  const discountedPrice =
  p.discount_pct > 0 ? (p.price * (1 - p.discount_pct / 100)).toFixed(0) : null
  const finalPrice = discountedPrice ? Number(discountedPrice) : p.price
  
  const [imgFailed, setImgFailed] = useState(false)
  const primaryImage = p.image_urls?.[0]?.trim()
  const showProductImage = Boolean(primaryImage) && !imgFailed
  const inWishlist = isInWishlist(p.id)
  
  const handleAddToCart = (e: React.MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  if (!p.in_stock) return
  addItem({
  id: p.id,
  name: name,
  price: finalPrice,
  image: primaryImage || '',
  size: '',
  quantity: 1,
  })
  }
  
  const handleWishlist = (e: React.MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  toggleWishlist(p.id)
  }

  return (
    <motion.div variants={gridItemVariants}>
      <Link
        href={'/product/' + p.id}
        className={[
          'group block ds-card-glass transform-gpu transition-shadow transition-transform duration-300 relative',
          !p.in_stock ? 'opacity-60' : '',
        ].join(' ')}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[rgba(255,255,255,0.03)]">
          <div className="absolute inset-0">
            {showProductImage ? (
              <Image
                src={primaryImage!}
                alt={name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover scale-110"
                style={{ filter: 'brightness(0.95) contrast(1.05)' }}
                unoptimized
                priority={priority}
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <svg className="w-12 h-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          <div
            className="product-image-vignette absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 90% 90% at 50% 50%, transparent 50%, rgba(5,13,26,0.35) 100%)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061226]/80 via-transparent to-transparent pointer-events-none" />
          
          {/* Wishlist button - always visible on mobile */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 left-3 flex items-center justify-center w-9 h-9 rounded-full transition-all z-20 ${
              inWishlist 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-black/30 text-white/80 border border-white/10 backdrop-blur-sm'
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>

          {!p.in_stock && (
            <div className="absolute top-3 right-3 bg-[rgba(220,53,69,0.1)] border border-[rgba(220,53,69,0.2)] text-[rgba(255,100,100,0.8)] text-[10px] font-semibold px-2 py-1 rounded-full z-10">
              {tr.outOfStock[lang]}
            </div>
          )}
          {p.discount_pct > 0 && p.in_stock && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] text-[#050d1a] text-[10px] font-extrabold px-2 py-1 rounded-full z-10">
              -{p.discount_pct}%
            </div>
          )}
        </div>

        <div className="border-t border-[rgba(255,255,255,0.08)] bg-[rgba(5,13,26,0.6)] backdrop-blur-sm p-4">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[rgba(201,168,76,0.7)] mb-1">
            {cat}
          </p>
          <h2 className="font-serif text-[18px] font-semibold mb-2 text-white line-clamp-1">
            {name}
          </h2>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {discountedPrice ? (
                <>
                  <span className="font-serif text-[20px] font-bold text-[#e8c97a]">
                    {discountedPrice} AZN
                  </span>
                  <span className="text-white/40 text-xs line-through">{p.price}</span>
                </>
              ) : (
                <span className="font-serif text-[20px] font-bold text-[#e8c97a]">{p.price} AZN</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!p.in_stock}
              className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] text-[#050d1a] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

type SortOption = 'default' | 'price_low' | 'price_high' | 'name_az' | 'discount'

function QuickViewModal({ product, lang, tr, onClose }: { 
  product: Product
  lang: 'az' | 'ru' | 'en'
  tr: typeof translations
  onClose: () => void 
}) {
const { addItem } = useCart()
  const { has: isInWishlist, toggle: toggleWishlist } = useWishlist()
  const [selectedImage, setSelectedImage] = useState(0)
  
  const name = lang === 'az' ? product.name_az : lang === 'ru' ? product.name_ru : product.name_en
  const cat = tr.categories[product.category]?.[lang] || product.category
  const discountedPrice = product.discount_pct > 0
  ? (product.price * (1 - product.discount_pct / 100)).toFixed(0)
  : null
  const finalPrice = discountedPrice ? Number(discountedPrice) : product.price
  const primaryImage = product.image_urls?.[0]?.trim()
  const inWishlist = isInWishlist(product.id)
  
  const handleAddToCart = () => {
  if (!product.in_stock) return
  addItem({
  id: product.id,
  name: name,
  price: finalPrice,
  image: primaryImage || '',
  size: '',
  quantity: 1,
  })
  onClose()
  }
  
  const handleWishlist = () => {
  toggleWishlist(product.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-3xl bg-[#0a1628] border border-white/10 rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Images */}
          <div className="relative w-full md:w-1/2 aspect-square bg-[rgba(255,255,255,0.03)]">
            {product.image_urls?.length > 0 ? (
              <>
                <Image
                  src={product.image_urls[selectedImage] || primaryImage!}
                  alt={name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {product.image_urls.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {product.image_urls.slice(0, 4).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          selectedImage === idx 
                            ? 'bg-[#c9a84c] scale-125' 
                            : 'bg-white/40 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <svg className="w-20 h-20 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {product.discount_pct > 0 && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] text-[#050d1a] text-sm font-extrabold px-3 py-1.5 rounded-full">
                -{product.discount_pct}%
              </div>
            )}
          </div>

          {/* Info */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[rgba(201,168,76,0.7)] mb-2">
              {cat}
            </p>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-4">
              {name}
            </h2>
            
            <div className="flex items-center gap-3 mb-6">
              {discountedPrice ? (
                <>
                  <span className="font-serif text-3xl font-bold text-[#e8c97a]">
                    {discountedPrice} AZN
                  </span>
                  <span className="text-white/40 text-lg line-through">{product.price} AZN</span>
                </>
              ) : (
                <span className="font-serif text-3xl font-bold text-[#e8c97a]">{product.price} AZN</span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-6">
              {product.in_stock ? (
                <span className="flex items-center gap-1.5 text-sm text-green-400">
                  <Check className="w-4 h-4" />
                  {tr.inStock[lang]}
                </span>
              ) : (
                <span className="text-sm text-red-400">{tr.outOfStock[lang]}</span>
              )}
            </div>

            <div className="flex-1" />

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] text-[#050d1a] font-bold py-3.5 px-6 rounded-xl transition-all hover:shadow-lg hover:shadow-[#c9a84c]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                {tr.addToCart[lang]}
              </button>
              <button
onClick={handleWishlist}
  className={`flex items-center justify-center w-14 h-14 rounded-xl transition-all ${
  inWishlist
  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
  : 'bg-white/10 text-white/80 border border-white/10 hover:bg-white/20'
  }`}
  >
  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            <Link
              href={'/product/' + product.id}
              className="mt-3 text-center text-sm text-[#c9a84c] hover:text-[#e8c97a] transition-colors"
              onClick={onClose}
            >
              {tr.quickView[lang]}
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function CatalogClient({ products }: { products: Product[] }) {
  const { lang } = useLang()
  const tr = translations
  const isMobile = useIsMobile()
  const lowPower = useLowPowerMotion() || isMobile
  const gridContainerVariants = isMobile
    ? catalogGridContainerMobile
    : lowPower
      ? catalogGridContainerLight
      : catalogGridContainerHeavy
  const gridItemVariants = isMobile
    ? catalogGridItemMobile
    : lowPower
      ? catalogGridItemLight
      : catalogGridItemHeavy
  
  // Basic filters
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  
  // Advanced filters
  const [showFilters, setShowFilters] = useState(false)
  const [minPrice, setMinPrice] = useState<number | ''>('')
  const [maxPrice, setMaxPrice] = useState<number | ''>('')
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [onlyDiscounted, setOnlyDiscounted] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('default')
  
  // Quick view
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)

  // Calculate price range from products
  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000 }
    const prices = products.map(p => p.discount_pct > 0 ? p.price * (1 - p.discount_pct / 100) : p.price)
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    }
  }, [products])

  const hasActiveFilters = minPrice !== '' || maxPrice !== '' || onlyInStock || onlyDiscounted || sortBy !== 'default'

  const clearFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setOnlyInStock(false)
    setOnlyDiscounted(false)
    setSortBy('default')
    setPage(1)
  }

  const searchLower = search.trim().toLowerCase()
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesSearch =
        !searchLower ||
        [p.name_az, p.name_ru, p.name_en].some((n) => n?.toLowerCase().includes(searchLower))
      const matchesCategory = !categoryFilter || p.category === categoryFilter
      
      const effectivePrice = p.discount_pct > 0 ? p.price * (1 - p.discount_pct / 100) : p.price
      const matchesMinPrice = minPrice === '' || effectivePrice >= minPrice
      const matchesMaxPrice = maxPrice === '' || effectivePrice <= maxPrice
      const matchesStock = !onlyInStock || p.in_stock
      const matchesDiscount = !onlyDiscounted || p.discount_pct > 0

      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesStock && matchesDiscount
    })

    // Sort
    if (sortBy !== 'default') {
      result = [...result].sort((a, b) => {
        const priceA = a.discount_pct > 0 ? a.price * (1 - a.discount_pct / 100) : a.price
        const priceB = b.discount_pct > 0 ? b.price * (1 - b.discount_pct / 100) : b.price
        
        switch (sortBy) {
          case 'price_low':
            return priceA - priceB
          case 'price_high':
            return priceB - priceA
          case 'name_az':
            const nameA = lang === 'az' ? a.name_az : lang === 'ru' ? a.name_ru : a.name_en
            const nameB = lang === 'az' ? b.name_az : lang === 'ru' ? b.name_ru : b.name_en
            return nameA.localeCompare(nameB)
          case 'discount':
            return b.discount_pct - a.discount_pct
          default:
            return 0
        }
      })
    }

    return result
  }, [products, searchLower, categoryFilter, minPrice, maxPrice, onlyInStock, onlyDiscounted, sortBy, lang])

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  }, [filteredProducts, page])

  return (
    <main className="w-full">
      {/* Cinematic Hero Section */}
      <CinematicHero />

      {/* About Section */}
      <AboutSection />

      {/* Press/Quality Section - Removed screenshot */}
      <div className="w-full bg-[#061226] py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 lg:px-16 text-center">
          <motion.div
            initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
            viewport={isMobile ? undefined : { once: true, amount: 0.3 }}
            transition={
              isMobile ? { duration: 0.15, ease: 'easeOut' } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-white mb-4 sm:mb-6">
              {lang === 'az' ? 'Keyfiyyət və Rahatlıq' : lang === 'ru' ? 'Качество и Комфорт' : 'Quality & Comfort'}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-2xl mx-auto px-2">
              {lang === 'az' 
                ? 'Hər bir məhsulumuz ən yüksək keyfiyyət standartlarına uyğun hazırlanır.' 
                : lang === 'ru'
                ? 'Каждый наш продукт изготовлен в соответствии с высочайшими стандартами качества.'
                : 'Every product is crafted to the highest quality standards.'}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="w-full bg-[#061226] py-8 sm:py-10">
        <div id="catalog-grid" className="scroll-mt-28 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-white tracking-tight">
            {tr.catalog[lang]}
          </h1>

          {/* Main filter bar */}
          <div className="flex flex-col gap-4 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input
                type="search"
                placeholder={tr.searchPlaceholder[lang]}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="ds-input flex-1 min-h-[44px]"
                aria-label={tr.searchPlaceholder[lang]}
              />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setPage(1)
                }}
                className="ds-input min-w-[140px] min-h-[44px]"
                aria-label={tr.allCategories[lang]}
              >
                <option value="">{tr.allCategories[lang]}</option>
                {CATEGORY_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {tr.categories[key]?.[lang] || key}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-4 min-h-[44px] rounded-xl border transition-all ${
                  showFilters || hasActiveFilters
                    ? 'bg-[#c9a84c]/20 border-[#c9a84c]/40 text-[#e8c97a]'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">{tr.filters[lang]}</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-[#c9a84c]" />
                )}
              </button>
            </div>

            {/* Advanced filters panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                      {/* Price range */}
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                          {tr.priceRange[lang]} (AZN)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder={tr.minPrice[lang]}
                            value={minPrice}
                            onChange={(e) => {
                              setMinPrice(e.target.value ? Number(e.target.value) : '')
                              setPage(1)
                            }}
                            min={0}
                            className="ds-input w-24 min-h-[40px] text-sm"
                          />
                          <span className="text-white/40">-</span>
                          <input
                            type="number"
                            placeholder={tr.maxPrice[lang]}
                            value={maxPrice}
                            onChange={(e) => {
                              setMaxPrice(e.target.value ? Number(e.target.value) : '')
                              setPage(1)
                            }}
                            min={0}
                            className="ds-input w-24 min-h-[40px] text-sm"
                          />
                        </div>
                      </div>

                      {/* Sort */}
                      <div className="flex flex-col gap-2 min-w-[180px]">
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                          {tr.sortBy[lang]}
                        </label>
                        <select
                          value={sortBy}
                          onChange={(e) => {
                            setSortBy(e.target.value as SortOption)
                            setPage(1)
                          }}
                          className="ds-input min-h-[40px] text-sm"
                        >
                          <option value="default">{tr.sortDefault[lang]}</option>
                          <option value="price_low">{tr.sortPriceLow[lang]}</option>
                          <option value="price_high">{tr.sortPriceHigh[lang]}</option>
                          <option value="name_az">{tr.sortNameAZ[lang]}</option>
                          <option value="discount">{tr.sortDiscount[lang]}</option>
                        </select>
                      </div>

                      {/* Toggle filters */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider invisible">
                          Options
                        </label>
                        <div className="flex items-center gap-4 h-[40px]">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={onlyInStock}
                              onChange={(e) => {
                                setOnlyInStock(e.target.checked)
                                setPage(1)
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-5 h-5 rounded border border-white/20 bg-white/5 flex items-center justify-center peer-checked:bg-[#c9a84c]/20 peer-checked:border-[#c9a84c]/40 transition-colors">
                              {onlyInStock && <Check className="w-3.5 h-3.5 text-[#e8c97a]" />}
                            </div>
                            <span className="text-sm text-white/80">{tr.onlyInStock[lang]}</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={onlyDiscounted}
                              onChange={(e) => {
                                setOnlyDiscounted(e.target.checked)
                                setPage(1)
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-5 h-5 rounded border border-white/20 bg-white/5 flex items-center justify-center peer-checked:bg-[#c9a84c]/20 peer-checked:border-[#c9a84c]/40 transition-colors">
                              {onlyDiscounted && <Check className="w-3.5 h-3.5 text-[#e8c97a]" />}
                            </div>
                            <span className="text-sm text-white/80">{tr.onlyDiscounted[lang]}</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Clear filters */}
                    {hasActiveFilters && (
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <span className="text-sm text-white/60">
                          {filteredProducts.length} {tr.productsFound[lang]}
                        </span>
                        <button
                          onClick={clearFilters}
                          className="flex items-center gap-1.5 text-sm text-[#c9a84c] hover:text-[#e8c97a] transition-colors"
                        >
                          <X className="w-4 h-4" />
                          {tr.clearFilters[lang]}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results count */}
            {(search || categoryFilter || hasActiveFilters) && (
              <div className="text-sm text-white/50">
                {filteredProducts.length === 0 
                  ? tr.noProductsFound[lang]
                  : `${filteredProducts.length} ${tr.productsFound[lang]}`
                }
              </div>
            )}
          </div>

          {/* CATALOG PRODUCT LIST — do not remove even if appears empty statically.
              Products are loaded asynchronously from the API at runtime. */}
          <motion.div
            key={`${page}-${categoryFilter}-${searchLower}`}
            className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            variants={gridContainerVariants}
            initial="hidden"
            animate="show"
          >
            {paginatedProducts.map((p, idx) =>
              isMobile ? (
                <ParallaxProductCardMobile
                  key={p.id}
                  p={p}
                  lang={lang}
                  tr={tr}
                  lowPower={lowPower}
                  gridItemVariants={gridItemVariants}
                  priority={idx < 4}
                />
              ) : (
                <ParallaxProductCardDesktop
                  key={p.id}
                  p={p}
                  lang={lang}
                  tr={tr}
                  lowPower={lowPower}
                  gridItemVariants={gridItemVariants}
                  priority={idx < 4}
                  onQuickView={setQuickViewProduct}
                />
              )
            )}
          </motion.div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="w-full bg-[#061226] pb-10">
          <div className="mt-8 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 min-h-[44px] font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50"
              aria-label={tr.prevPage[lang]}
            >
              {tr.prevPage[lang]}
            </button>
            <span className="flex items-center px-4 font-medium text-white/90">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 min-h-[44px] font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50"
              aria-label={tr.nextPage[lang]}
            >
              {tr.nextPage[lang]}
            </button>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <QuickViewModal
            product={quickViewProduct}
            lang={lang}
            tr={tr}
            onClose={() => setQuickViewProduct(null)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
