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
import { useToast } from '@/context/toast'
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
// type PaymentMethod = 'cash' | 'online'

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
  // const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const { addToast } = useToast()
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

    /* PAYMENT_META_HIDDEN_START
    const paymentMeta =
      lang === 'ru'
        ? ` | Оплата: ${paymentMethod === 'online' ? 'онлайн' : 'наличными'}`
        : lang === 'en'
          ? ` | Payment: ${paymentMethod}`
          : ` | Odenis: ${paymentMethod === 'online' ? 'online' : 'nagdb'}`
    PAYMENT_META_HIDDEN_END */
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
        addToast(
          'error',
          lang === 'ru'
            ? 'Цены обновились, проверьте корзину'
            : lang === 'en'
              ? 'Prices were updated, please review your cart'
              : 'Qiymətlər yeniləndi, səbəti yoxlayın'
        )
      } else {
        addToast(
          'error',
          tr.error[lang] + ': ' + (rpcError?.message || 'create_order_with_items')
        )
      }
      return
    }

    /* ONLINE_PAYMENT_HIDDEN_START
    if (paymentMethod === 'online') {
      const payriffLang = lang === 'ru' ? 'RU' : lang === 'en' ? 'EN' : 'AZ'
      const paymentRes = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount: grandTotal,
          currency: 'AZN',
          lang: payriffLang,
        }),
      })

      const paymentPayload = (await paymentRes.json()) as { paymentUrl?: string; error?: string }
      if (!paymentRes.ok || !paymentPayload.paymentUrl) {
        addToast(
          'error',
          paymentPayload.error ||
            (lang === 'ru'
              ? 'Не удалось создать онлайн-платеж'
              : lang === 'en'
                ? 'Failed to create online payment'
                : 'Online odenis yaradilarken xeta bas verdi')
        )
        return
      }

      window.location.href = paymentPayload.paymentUrl
      return
    }
    ONLINE_PAYMENT_HIDDEN_END */

    addToast('success', tr.orderSuccess[lang])
    clear()
    router.push('/order-success')
  })

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return
    if (deliveryMode === 'courier' && !address.trim()) {
      addToast('error', tr.selectAddress[lang])
      return
    }
    const phoneNormalized = normalizeAzPhone(phone)
    if (!phoneNormalized) {
      addToast('error', tr.invalidPhone[lang])
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
        <p className="mb-5 text-white/60">{tr.cartAddItems[lang]}</p>
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
          {/* PAYMENT_METHOD_HIDDEN_START
          <div>
            <span className="ds-label">
              {lang === 'ru' ? 'Способ оплаты' : lang === 'en' ? 'Payment method' : 'Odenis novu'}
            </span>
            <div className="flex flex-col gap-2">
              <label
                className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition-colors text-white/80 ${
                  paymentMethod === 'cash'
                    ? 'border-[#c9a84c]/50 bg-[rgba(201,168,76,0.08)] ring-1 ring-[#c9a84c]/30'
                    : 'border-white/10 bg-white/5 hover:border-[#c9a84c]/25'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  className="accent-[#c9a84c]"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                />
                <div>
                  <div className="font-medium">
                    {lang === 'ru'
                      ? 'Наличными при доставке'
                      : lang === 'en'
                        ? 'Cash on delivery'
                        : 'Catdirilmada nagd'}
                  </div>
                </div>
              </label>
              <label
                className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition-colors text-white/80 ${
                  paymentMethod === 'online'
                    ? 'border-[#c9a84c]/50 bg-[rgba(201,168,76,0.08)] ring-1 ring-[#c9a84c]/30'
                    : 'border-white/10 bg-white/5 hover:border-[#c9a84c]/25'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  className="accent-[#c9a84c]"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                />
                <div>
                  <div className="font-medium">
                    {lang === 'ru'
                      ? 'Онлайн оплата'
                      : lang === 'en'
                        ? 'Online payment'
                        : 'Online odenis'}
                  </div>
                </div>
              </label>
            </div>
          </div>
          PAYMENT_METHOD_HIDDEN_END */}
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
          {/* PAYMENT_COMING_SOON — убрать когда подключат банк */}
          <div className="mt-2 rounded-xl border border-[#c9a84c]/30 bg-[rgba(201,168,76,0.07)] p-4 text-sm text-white/80">
            <p className="font-semibold text-[#e8c97a] mb-1">
              {lang === 'ru'
                ? '💳 Онлайн оплата скоро появится'
                : lang === 'en'
                  ? '💳 Online payment coming soon'
                  : '💳 Online ödəniş tezliklə əlavə olunacaq'}
            </p>
            <p className="text-white/60 mb-3">
              {lang === 'ru'
                ? 'Онлайн оплата пока не добавлена, но скоро будет. Чтобы узнать подробности и оформить заказ — свяжитесь с нами:'
                : lang === 'en'
                  ? 'Online payment is not yet available but will be added soon. To learn more and place an order — contact us:'
                  : 'Online ödəniş hələ əlavə edilməyib, lakin tezliklə olacaq. Ətraflı məlumat və sifariş üçün bizimlə əlaqə saxlayın:'}
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="https://wa.me/994552000986"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366]/15 border border-[#25D366]/30 px-4 py-2.5 font-medium text-[#25D366] hover:bg-[#25D366]/25 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
              <a
                href="tel:+994552000986"
                className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/15 px-4 py-2.5 font-medium text-white/80 hover:bg-white/10 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.81 19.79 19.79 0 01.18 2.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.28-1.52a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                055 200 09 86
              </a>
            </div>
          </div>
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
