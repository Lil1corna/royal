'use client'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useLang, translations } from '@/context/lang'
import ToastMessage, { type ToastState } from '@/components/toast-message'

const AddressMap = dynamic(() => import('@/components/address-map'), { ssr: false })

function formatAzPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^994/, '')
  const d = digits.slice(0, 9)
  const p1 = d.slice(0, 2)
  const p2 = d.slice(2, 5)
  const p3 = d.slice(5, 7)
  const p4 = d.slice(7, 9)
  let result = '+994'
  if (p1) result += ` ${p1}`
  if (p2) result += ` ${p2}`
  if (p3) result += ` ${p3}`
  if (p4) result += ` ${p4}`
  return result
}

function normalizeAzPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (/^994\d{9}$/.test(digits)) return `+${digits}`
  if (/^0\d{9}$/.test(digits)) return `+994${digits.slice(1)}`
  if (/^\d{9}$/.test(digits)) return `+994${digits}`
  return null
}

export default function AccountSettings({
  userId,
  currentEmail,
  initialName,
  initialPhone,
  initialAddress,
  initialAddressExtra,
  initialShippingLat,
  initialShippingLng,
  initialAvatarUrl,
}: {
  userId: string
  currentEmail: string
  initialName: string
  initialPhone: string
  initialAddress: string
  initialAddressExtra: string
  initialShippingLat: number | null
  initialShippingLng: number | null
  initialAvatarUrl: string
}) {
  const { lang } = useLang()
  const tr = translations
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(formatAzPhone(initialPhone || ''))
  const [address, setAddress] = useState(initialAddress)
  const [shippingLat, setShippingLat] = useState<number | null>(initialShippingLat)
  const [shippingLng, setShippingLng] = useState<number | null>(initialShippingLng)
  const [addressExtra, setAddressExtra] = useState(initialAddressExtra)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [avatarChecking, setAvatarChecking] = useState(false)
  const [avatarReachable, setAvatarReachable] = useState<boolean | null>(null)

  const previewAvatar = avatarUrl.trim()
  const avatarValid = /^https?:\/\/.+/i.test(previewAvatar)

  useEffect(() => {
    if (!previewAvatar || !avatarValid) return
    const startCheck = window.setTimeout(() => setAvatarChecking(true), 0)
    const img = new window.Image()
    const done = (ok: boolean) => {
      setAvatarReachable(ok)
      setAvatarChecking(false)
    }
    img.onload = () => done(true)
    img.onerror = () => done(false)
    img.referrerPolicy = 'no-referrer'
    img.src = previewAvatar
    return () => clearTimeout(startCheck)
  }, [previewAvatar, avatarValid])

  const showToast = (type: 'success' | 'error', message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ type, message })
    toastTimerRef.current = setTimeout(() => setToast(null), 2800)
  }

  const fullAddressLine = [address.trim(), addressExtra.trim()].filter(Boolean).join(', ')

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const phoneNormalized = normalizeAzPhone(phone)
    if (!phoneNormalized) {
      showToast('error', tr.invalidPhone[lang])
      return
    }
    if (!address.trim()) {
      showToast(
        'error',
        lang === 'ru'
          ? 'Выберите адрес на карте (клик или поиск)'
          : lang === 'en'
            ? 'Pick your address on the map'
            : 'Xəritədə ünvan seçin'
      )
      return
    }
    if (previewAvatar && !avatarValid) {
      showToast('error', tr.invalidAvatarUrl[lang])
      return
    }

    setSaving(true)
    setSaved(false)

    const { error } = await supabase
      .from('users')
      .update({ name: name.trim() || null })
      .eq('id', userId)

    const metaRes = await supabase.auth.updateUser({
      data: {
        phone: phoneNormalized,
        shipping_address: address.trim(),
        shipping_address_extra: addressExtra.trim() || null,
        shipping_lat: shippingLat,
        shipping_lng: shippingLng,
        avatar_url: avatarUrl.trim() || null,
      },
    })

    setSaving(false)
    if (!error && !metaRes.error) {
      setSaved(true)
      showToast('success', tr.saved[lang])
      router.refresh()
      setTimeout(() => setSaved(false), 2000)
    } else {
      showToast('error', error?.message || metaRes.error?.message || tr.error[lang])
    }
  }

  return (
    <div className="card-soft p-5 mb-8">
      <ToastMessage toast={toast} className="mb-4" />
      <h2 className="text-lg font-semibold mb-4">{tr.accountSettings[lang]}</h2>
      <p className="text-sm text-white/60 mb-4">
        {lang === 'ru'
          ? `Email: ${currentEmail} (смена email отключена)`
          : lang === 'en'
            ? `Email: ${currentEmail} (email change is disabled)`
            : `Email: ${currentEmail} (email dəyişmə söndürülüb)`}
      </p>
      <form onSubmit={save}>
        <label className="ds-label">{tr.displayName[lang]}</label>
        <input
          className="ds-input mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
        />

        <label className="ds-label">{tr.accountPhone[lang]}</label>
        <input
          className="ds-input mb-4"
          value={phone}
          onChange={(e) => setPhone(formatAzPhone(e.target.value))}
          placeholder={tr.phoneFormatHint[lang]}
          maxLength={20}
        />

        <label className="ds-label">{tr.shippingAddress[lang]}</label>
        <p className="text-xs text-white/60 mb-3">{tr.addressProfileHint[lang]}</p>

        <AddressMap
          initialLat={initialShippingLat}
          initialLng={initialShippingLng}
          initialAddress={initialAddress}
          onSelect={(addr, la, ln) => {
            setAddress(addr)
            setShippingLat(la)
            setShippingLng(ln)
          }}
        />

        <label className="ds-label mt-4">{tr.addressDetailHint[lang]}</label>
        <input
          className="ds-input mb-4"
          value={addressExtra}
          onChange={(e) => setAddressExtra(e.target.value)}
          maxLength={80}
          placeholder={tr.addressDetailHint[lang]}
        />

        {fullAddressLine && (
          <div className="mb-4 p-3 bg-white/5 rounded-lg text-sm text-white/70 border border-white/10">
            <span className="text-xs text-white/60 block mb-1">
              {lang === 'ru' ? 'Сохранится:' : lang === 'en' ? 'Will save:' : 'Yadda saxlanacaq:'}
            </span>
            {fullAddressLine}
            {shippingLat != null && shippingLng != null && (
              <span className="block text-xs text-emerald-300 mt-1">
                GPS: {shippingLat.toFixed(5)}, {shippingLng.toFixed(5)}
              </span>
            )}
          </div>
        )}

        <label className="ds-label">{tr.avatarUrl[lang]}</label>
        <p className="text-xs text-white/60 mb-2">
          {lang === 'ru'
            ? 'Прямая ссылка на картинку (https). Если превью не грузится из‑за защиты сайта — сохранение всё равно возможно.'
            : lang === 'en'
              ? 'Direct image URL (https). Save still works if preview fails due to the host blocking hotlinking.'
              : 'Birbaşa şəkil linki (https). Bəzi saytlar önizləməni bloklaya bilər — saxlama işləyir.'}
        </p>
        <input
          className="ds-input mb-4"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://..."
        />
        <div className="mb-4">
          {avatarValid ? (
            <Image
              src={previewAvatar}
              alt="avatar preview"
              width={64}
              height={64}
              sizes="64px"
              priority
              className="w-16 h-16 rounded-full object-cover border"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 text-xs">
              preview
            </div>
          )}
          {previewAvatar && avatarValid && (
            <div className="text-xs mt-2 text-white/60">
              {avatarChecking
                ? lang === 'ru'
                  ? 'Проверка…'
                  : lang === 'en'
                    ? 'Checking…'
                    : 'Yoxlanır…'
                : (!previewAvatar || !avatarValid)
                  ? ''
                  : avatarReachable === false
                  ? tr.avatarNotReachable[lang]
                  : ''}
            </div>
          )}
          <button
            type="button"
            className="btn-secondary mt-2"
            onClick={() => setAvatarUrl('')}
          >
            {tr.removeAvatar[lang]}
          </button>
        </div>

        <button className="btn-primary" disabled={saving}>
          {saving ? tr.saving[lang] : tr.saveChanges[lang]}
        </button>
        {saved && <span className="ml-3 text-sm text-emerald-300">{tr.saved[lang]}</span>}
      </form>
    </div>
  )
}
