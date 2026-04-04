'use client'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/cart'
import { useLang, translations } from '@/context/lang'
import { getSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import ToastMessage, { type ToastState } from '@/components/toast-message'
import {
  calcShippingFee,
  deliveryModeLabel,
  FREE_SHIPPING_THRESHOLD,
  type DeliveryMode,
} from '@/lib/delivery'
import { buildProfileAddressLine, metaCoord } from '@/lib/profile-address'
import { useIsMobile } from '@/hooks/useIsMobile'
import { Button } from '@/components/ui/button'
import { useAsyncAction } from '@/hooks/useAsyncAction'

const AddressMap = dynamic(() => import('@/components/address-map'), { ssr: false })

function normalizeAzPhone(raw: string): string | null {
  const value = raw.trim()
  if (!value) return null

  if (value.startsWith('+')) {
    const compact = '+' + value.slice(1).replace(/\D/g, '')
    if (/^\+994\d{9}$/.test(compact)) return compact
    return null
  }

  const digits = value.replace(/\D/g, '')
  if (/^994\d{9}$/.test(digits)) return `+${digits}`
  if (/^0\d{9}$/.test(digits)) return `+994${digits.slice(1)}`
  if (/^\d{9}$/.test(digits)) return `+994${digits}`
  return null
}

export default function CartPage() {
  const { items, add, decrease, remove, clear, replaceItems, total, count } = useCart()
  const { lang } = useLang()
  const tr = translations
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('courier')
  const [toast, setToast] = useState<ToastState | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** Сохранённый в профиле адрес (если есть) */
  const [profileSaved, setProfileSaved] = useState<{
    line: string
    lat: number | null
    lng: number | null
  } | null>(null)
  /** saved = из профиля, map = выбрать на карте заново */
  const [addressMode, setAddressMode] = useState<'saved' | 'map'>('map')
  const [mapResetKey, setMapResetKey] = useState(0)
  const router = useRouter()
  const supabase = useMemo(() => getSupabaseClient(), [])
  const isMobile = useIsMobile()

  useEffect(() => {
    void supabase.auth.getUser().then(({ data: { user } }) => {
      const m = user?.user_metadata as Record<string, unknown> | undefined
      if (!m) return
      const line = buildProfileAddressLine(m)
      if (!line) return
      const la = metaCoord(m.shipping_lat)
      const ln = metaCoord(m.shipping_lng)
      setProfileSaved({ line, lat: la, lng: ln })
      setAddressMode('saved')
      setAddress(line)
      setLat(la)
      setLng(ln)
    })
  }, [supabase])

  const subtotal = total
  const shippingFee = useMemo(
    () => calcShippingFee(subtotal, deliveryMode),
    [subtotal, deliveryMode]
  )
  const grandTotal = subtotal + shippingFee

  const showToast = (type: 'success' | 'error', message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ type, message })
    toastTimerRef.current = setTimeout(() => setToast(null), 2600)
  }

  const refreshCartProducts = async () => {
    if (items.length === 0) return
    const ids = Array.from(new Set(items.map((i) => i.id)))
    const { data, error } = await supabase
      .from('products')
      .select('id, name_az, name_ru, name_en, price, discount_pct, in_stock, image_urls')
      .in('id', ids)

    if (error || !data) return

    const byId = new Map(data.map((p) => [p.id, p]))
    const refreshed = items
      .map((item) => {
        const product = byId.get(item.id)
        if (!product || !product.in_stock) return null
        const discountedPrice =
          product.discount_pct > 0
            ? Math.round(product.price * (1 - product.discount_pct / 100))
            : product.price
        return {
          ...item,
          price: discountedPrice,
          image: product.image_urls?.[0] || item.image,
          name:
            lang === 'ru'
              ? product.name_ru
              : lang === 'en'
                ? product.name_en
                : product.name_az,
        }
      })
      .filter((i): i is NonNullable<typeof i> => i !== null)

    replaceItems(refreshed)
  }

  const { execute: executeOrder, loading } = useAsyncAction(async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const orderAddress =
      deliveryMode === 'pickup'
        ? lang === 'ru'
          ? 'Самовывоз'
          : lang === 'en'
            ? 'Store pickup'
            : 'Özün götür'
        : address.trim()

    const coordPart =
      deliveryMode === 'courier' && lat != null && lng != null
        ? ` | Koordinat: ${lat},${lng}`
        : ''

    const notesBase = `Tel: ${normalizeAzPhone(phone) || ''}${notes ? ' | ' + notes : ''}${coordPart}`
    const deliveryMeta =
      lang === 'ru'
        ? ` | Доставка: ${deliveryMode === 'pickup' ? 'самовывоз' : 'курьер'}, доставка ${shippingFee} AZN, товары ${subtotal} AZN`
        : lang === 'en'
          ? ` | Delivery: ${deliveryMode}, shipping ${shippingFee} AZN, items ${subtotal} AZN`
          : ` | Catdirilma: ${deliveryMode}, catdirilma ${shippingFee} AZN, mehsul ${subtotal} AZN`

    const notesFull = notesBase + deliveryMeta

    const { data: orderId, error: rpcError } = await supabase.rpc('create_order_with_items', {
      p_user_id: user?.id ?? null,
      p_items: items.map((i) => ({
        product_id: i.id,
        quantity: i.quantity,
        price_at_purchase: i.price,
      })),
      p_total: grandTotal,
      p_meta: {
        subtotal,
        shipping_fee: shippingFee,
        delivery_mode: deliveryMode,
        address: orderAddress,
        notes: notesFull,
      },
    })

    if (rpcError || orderId == null) {
      const rawMessage = (rpcError?.message || '').toLowerCase()
      const isPriceChanged =
        rawMessage.includes('price mismatch') || rawMessage.includes('invalid product_id')

      if (isPriceChanged) {
        await refreshCartProducts()
        showToast(
          'error',
          lang === 'ru'
            ? 'Цены обновились, проверьте корзину'
            : lang === 'en'
              ? 'Prices were updated, please review your cart'
              : 'Qiymətlər yeniləndi, səbəti yoxlayın'
        )
      } else {
        showToast(
          'error',
          tr.error[lang] + ': ' + (rpcError?.message || 'create_order_with_items')
        )
      }
      return
    }

    showToast('success', tr.orderSuccess[lang])
    clear()
    router.push('/order-success')
  })

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return
    if (deliveryMode === 'courier' && !address.trim()) {
      showToast('error', tr.selectAddress[lang])
      return
    }
    const phoneNormalized = normalizeAzPhone(phone)
    if (!phoneNormalized) {
      showToast('error', tr.invalidPhone[lang])
      return
    }
    await executeOrder()
  }

  if (count === 0) {
    return (
      <main className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto text-center overflow-x-hidden">
        <motion.div
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
          className="mb-4 text-6xl"
        >
          🛒
        </motion.div>
        <h1 className="text-xl sm:text-2xl font-bold mb-2">{tr.cartEmpty[lang]}</h1>
        <p className="mb-5 text-white/60">Добавьте товары которые вам понравились</p>
        <Link href="/" className="text-[#e8c97a] hover:underline">{tr.backToCatalog[lang]}</Link>
      </main>
    )
  }

  return (
    <main className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto overflow-x-hidden pb-28 md:pb-8">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Link href="/" className="text-white/60 hover:text-white min-h-[44px] inline-flex items-center">{tr.back[lang]}</Link>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{tr.cart[lang]}</h1>
      </div>
      <ToastMessage toast={toast} className="mb-5" />
      <div className="grid grid-cols-1 md:grid-cols-[1.3fr_0.9fr] gap-8 md:gap-12">
        <div>
          <div className="flex flex-col gap-3 mb-6">
            {items.map((item, i) => (
              <motion.div
                key={`${item.id}-${item.size ?? 'default'}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  isMobile
                    ? { duration: 0.15, ease: 'easeOut', delay: 0 }
                    : { duration: 0.16, delay: i * 0.03 }
                }
                className="flex gap-4 border rounded-xl p-4 card-soft items-center"
              >
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-lg shrink-0"
                    sizes="80px"
                    priority={i === 0}
                    loading={i === 0 ? undefined : 'lazy'}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{item.name}</div>
                  {item.size && <div className="text-sm text-white/60">{item.size}</div>}
                  <div className="font-bold mt-1">{item.price * item.quantity} AZN</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => decrease(item.id, item.size)}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white"
                    >
                      -
                    </button>
                    <div className="flex h-11 min-w-[44px] items-center justify-center rounded-lg border border-white/15 px-3 text-sm font-semibold">
                      {item.quantity}
                    </div>
                    <button
                      type="button"
                      onClick={() => add(item)}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => remove(item.id, item.size)}
                  className="text-[rgba(255,100,100,0.85)] hover:text-[#ff6b6b] min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                  aria-label={lang === 'ru' ? 'Удалить' : lang === 'en' ? 'Remove' : 'Sil'}
                >
                  X
                </button>
              </motion.div>
            ))}
          </div>
          <div className="border-t pt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">{tr.subtotal[lang]}</span>
              <span className="font-medium">{subtotal} AZN</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">{tr.shippingFee[lang]}</span>
              <span className="font-medium">
                {shippingFee === 0 ? (
                  <span className="text-emerald-300">{lang === 'ru' ? 'Бесплатно' : lang === 'en' ? 'Free' : 'Pulsuz'}</span>
                ) : (
                  `${shippingFee} AZN`
                )}
              </span>
            </div>
            <p className="text-xs text-white/60">
              {lang === 'ru'
                ? `Бесплатная доставка от ${FREE_SHIPPING_THRESHOLD} AZN (курьер)`
                : lang === 'en'
                  ? `Free courier shipping from ${FREE_SHIPPING_THRESHOLD} AZN`
                  : `Kuryer catdırılması ${FREE_SHIPPING_THRESHOLD} AZN-dan pulsuz`}
            </p>
            <div className="flex justify-between items-center pt-2 border-t border-dashed">
              <span className="font-semibold">{tr.total[lang]}</span>
              <span className="text-2xl font-bold">{grandTotal} AZN</span>
            </div>
          </div>
        </div>

        <form id="cart-order-form" onSubmit={handleOrder} className="flex flex-col gap-4 md:sticky md:top-24 h-fit">
          <h2 className="text-xl font-bold">{tr.orderForm[lang]}</h2>
          <div>
            <span className="ds-label">{tr.deliveryMethod[lang]}</span>
            <div className="flex flex-col gap-2">
              {(['courier', 'pickup'] as DeliveryMode[]).map((mode) => (
                <label
                  key={mode}
                  className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition-colors text-white/80 ${
                    deliveryMode === mode
                      ? 'border-[#c9a84c]/50 bg-[rgba(201,168,76,0.08)] ring-1 ring-[#c9a84c]/30'
                      : 'border-white/10 bg-white/5 hover:border-[#c9a84c]/25'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    className="accent-[#c9a84c]"
                    checked={deliveryMode === mode}
                    onChange={() => setDeliveryMode(mode)}
                  />
                  <div>
                    <div className="font-medium">{deliveryModeLabel(mode, lang)}</div>
                    {mode === 'pickup' && (
                      <div className="text-xs text-white/60">
                        {lang === 'ru' ? 'Без стоимости доставки' : lang === 'en' ? 'No shipping fee' : 'Catdırılma haqqı yoxdur'}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="ds-label" htmlFor="cart-phone">{tr.phone[lang]}</label>
            <input
              id="cart-phone"
              type="tel"
              className="ds-input"
              placeholder="+994 XX XXX XX XX"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>
          {deliveryMode === 'courier' && (
            <div>
              <label className="ds-label">
                {tr.deliveryAddress[lang]}
                {address.trim() && (
                  <span className="text-emerald-300 ml-2 text-xs">
                    ✓ {tr.addressSelected[lang]}
                  </span>
                )}
              </label>

              {profileSaved && (
                <div className="flex flex-col gap-2 mb-4">
                  <label
                    className={`flex items-start gap-3 border rounded-xl p-3 cursor-pointer transition-colors ${
                      addressMode === 'saved'
                        ? 'border-[#c9a84c]/50 bg-[rgba(201,168,76,0.08)] ring-1 ring-[#c9a84c]/30'
                        : 'border-white/10 bg-white/5 hover:border-[#c9a84c]/25'
                    }`}
                  >
                    <input
                      type="radio"
                      name="addrMode"
                      className="mt-1 accent-[#c9a84c]"
                      checked={addressMode === 'saved'}
                      onChange={() => {
                        setAddressMode('saved')
                        setAddress(profileSaved.line)
                        setLat(profileSaved.lat)
                        setLng(profileSaved.lng)
                      }}
                    />
                    <div>
                      <div className="font-medium">{tr.addressFromProfile[lang]}</div>
                      <div className="text-sm text-white/70 mt-1">{profileSaved.line}</div>
                      {profileSaved.lat != null && profileSaved.lng != null && (
                        <div className="text-xs text-emerald-300 mt-1">
                          GPS ·{' '}
                          <a
                            className="underline hover:text-emerald-100"
                            href={`https://www.google.com/maps?q=${profileSaved.lat},${profileSaved.lng}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Google Maps
                          </a>
                        </div>
                      )}
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition-colors ${
                      addressMode === 'map'
                        ? 'border-[#c9a84c]/50 bg-[rgba(201,168,76,0.08)] ring-1 ring-[#c9a84c]/30'
                        : 'border-white/10 bg-white/5 hover:border-[#c9a84c]/25'
                    }`}
                  >
                    <input
                      type="radio"
                      name="addrMode"
                      className="accent-[#c9a84c]"
                      checked={addressMode === 'map'}
                      onChange={() => {
                        setAddressMode('map')
                        setAddress('')
                        setLat(null)
                        setLng(null)
                        setMapResetKey((k) => k + 1)
                      }}
                    />
                    <span className="font-medium">{tr.addressPickOnMap[lang]}</span>
                  </label>
                </div>
              )}

              {(!profileSaved || addressMode === 'map') && (
                <AddressMap
                  key={profileSaved ? mapResetKey : 'guest-map'}
                  onSelect={(addr, la, ln) => {
                    setAddress(addr)
                    setLat(la)
                    setLng(ln)
                  }}
                />
              )}

              {profileSaved && addressMode === 'saved' && (
                <div className="mt-2 p-3 bg-white/5 rounded-lg text-sm text-white/70 border border-white/10">
                  {profileSaved.line}
                </div>
              )}
            </div>
          )}

          {deliveryMode === 'pickup' && (
            <p className="text-sm text-white/70 bg-white/5 border border-white/10 rounded-xl p-3">
              {tr.pickupNoAddressNeeded[lang]}
            </p>
          )}
          <div>
            <label className="ds-label" htmlFor="cart-notes">{tr.notes[lang]}</label>
            <textarea id="cart-notes" className="ds-input h-20 resize-none"
              placeholder={tr.extraInfo[lang] + '...'}
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <Button
            type="submit"
            loading={loading}
            disabled={deliveryMode === 'courier' && !address.trim()}
            className="w-full"
          >
            {`${tr.submitOrder[lang]} — ${grandTotal} AZN`}
          </Button>
        </form>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#050d1a]/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
        <div className="mb-2 flex items-center justify-between text-sm text-white/70">
          <span>{tr.total[lang]}</span>
          <span className="price-text text-base font-bold text-white">{grandTotal} AZN</span>
        </div>
        <Button
          type="submit"
          form="cart-order-form"
          loading={loading}
          disabled={deliveryMode === 'courier' && !address.trim()}
          className="w-full"
          size="lg"
        >
          {`${tr.submitOrder[lang]} — ${grandTotal} AZN`}
        </Button>
      </div>
    </main>
  )
}
