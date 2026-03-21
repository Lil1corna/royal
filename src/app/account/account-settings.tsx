'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useLang, translations } from '@/context/lang'
import ToastMessage, { type ToastState } from '@/components/toast-message'

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
  initialAvatarUrl,
}: {
  userId: string
  currentEmail: string
  initialName: string
  initialPhone: string
  initialAddress: string
  initialAvatarUrl: string
}) {
  const { lang } = useLang()
  const tr = translations
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(formatAzPhone(initialPhone || ''))
  const [address, setAddress] = useState(initialAddress)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [avatarChecking, setAvatarChecking] = useState(false)
  const [avatarReachable, setAvatarReachable] = useState<boolean | null>(null)

  const previewAvatar = avatarUrl.trim()
  const avatarValid = /^https?:\/\/.+/i.test(previewAvatar)

  useEffect(() => {
    if (!previewAvatar || !avatarValid) {
      setAvatarReachable(null)
      return
    }
    setAvatarChecking(true)
    const img = new Image()
    const done = (ok: boolean) => {
      setAvatarReachable(ok)
      setAvatarChecking(false)
    }
    img.onload = () => done(true)
    img.onerror = () => done(false)
    img.referrerPolicy = 'no-referrer'
    img.src = previewAvatar
  }, [previewAvatar, avatarValid])

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 2800)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const phoneNormalized = normalizeAzPhone(phone)
    if (!phoneNormalized) {
      showToast('error', tr.invalidPhone[lang])
      return
    }
    if (previewAvatar && !avatarValid) {
      showToast('error', tr.invalidAvatarUrl[lang])
      return
    }
    // Не блокируем сохранение, если превью не загрузилось (CORS, hotlink) — ссылка всё равно может работать в профиле

    setSaving(true)
    setSaved(false)

    const { error } = await supabase
      .from('users')
      .update({ name: name.trim() || null })
      .eq('id', userId)

    const metaRes = await supabase.auth.updateUser({
      data: {
        phone: phoneNormalized,
        shipping_address: address.trim() || null,
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
      <p className="text-sm text-gray-500 mb-4">
        {lang === 'ru'
          ? `Email: ${currentEmail} (смена email отключена)`
          : lang === 'en'
            ? `Email: ${currentEmail} (email change is disabled)`
            : `Email: ${currentEmail} (email dəyişmə söndürülüb)`}
      </p>
      <form onSubmit={save}>
        <label className="block text-sm font-medium mb-2">{tr.displayName[lang]}</label>
        <input
          className="w-full border rounded-lg p-2 mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
        />

        <label className="block text-sm font-medium mb-2">{tr.accountPhone[lang]}</label>
        <input
          className="w-full border rounded-lg p-2 mb-4"
          value={phone}
          onChange={(e) => setPhone(formatAzPhone(e.target.value))}
          placeholder={tr.phoneFormatHint[lang]}
          maxLength={20}
        />

        <label className="block text-sm font-medium mb-2">{tr.shippingAddress[lang]}</label>
        <input
          className="w-full border rounded-lg p-2 mb-4"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          maxLength={180}
        />

        <label className="block text-sm font-medium mb-2">{tr.avatarUrl[lang]}</label>
        <p className="text-xs text-gray-500 mb-2">
          {lang === 'ru'
            ? 'Прямая ссылка на картинку (https). Если превью не грузится из‑за защиты сайта — сохранение всё равно возможно.'
            : lang === 'en'
              ? 'Direct image URL (https). Save still works if preview fails due to the host blocking hotlinking.'
              : 'Birbaşa şəkil linki (https). Bəzi saytlar önizləməni bloklaya bilər — saxlama işləyir.'}
        </p>
        <input
          className="w-full border rounded-lg p-2 mb-4"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://..."
        />
        <div className="mb-4">
          {avatarValid ? (
            <img
              src={previewAvatar}
              alt="avatar preview"
              className="w-16 h-16 rounded-full object-cover border"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-100 border flex items-center justify-center text-gray-400 text-xs">
              preview
            </div>
          )}
          {previewAvatar && avatarValid && (
            <div className="text-xs mt-2 text-gray-500">
              {avatarChecking
                ? lang === 'ru'
                  ? 'Проверка…'
                  : lang === 'en'
                    ? 'Checking…'
                    : 'Yoxlanır…'
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
        {saved && <span className="ml-3 text-sm text-green-600">{tr.saved[lang]}</span>}
      </form>
    </div>
  )
}
