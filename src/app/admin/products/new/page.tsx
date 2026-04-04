'use client'
import { useEffect, useMemo, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLang } from '@/context/lang'
import { ROLES, normalizeDbRoleToRoleKey } from '@/config/roles'
type ProductSizeDraft = {
  size: string
  price: string
  in_stock: boolean
}

// Отключаем static generation для admin страниц
export const dynamic = 'force-dynamic'

export default function NewProduct() {
  const router = useRouter()
  const supabase = useMemo(() => getSupabaseClient(), [])
  const { lang } = useLang()
  const [loading, setLoading] = useState(false)
  const [canCreate, setCanCreate] = useState(false)
  const [form, setForm] = useState({
    name_az: '', name_ru: '', name_en: '',
    category: 'ortopedik',
    description: '',
    price: '',
    discount_pct: '0',
    in_stock: true,
  })
  const [sizes, setSizes] = useState<ProductSizeDraft[]>([{ size: '80x200', price: '', in_stock: true }])
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    const loadPerms = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return setCanCreate(false)
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        const roleKey = normalizeDbRoleToRoleKey(profile?.role)
        setCanCreate(ROLES[roleKey].permissions.includes('manage_products'))
      } catch {
        setCanCreate(false)
      }
    }
    loadPerms()
  }, [supabase])

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const removeImage = (i: number) => {
    setImages(images.filter((_, idx) => idx !== i))
    setPreviews(previews.filter((_, idx) => idx !== i))
  }

  const moveImage = (i: number, dir: 'left' | 'right') => {
    const newImages = [...images]
    const newPreviews = [...previews]
    const j = dir === 'left' ? i - 1 : i + 1
    if (j < 0 || j >= images.length) return
    ;[newImages[i], newImages[j]] = [newImages[j], newImages[i]]
    ;[newPreviews[i], newPreviews[j]] = [newPreviews[j], newPreviews[i]]
    setImages(newImages)
    setPreviews(newPreviews)
  }

  const addSize = () => setSizes([...sizes, { size: '', price: '', in_stock: true }])
  const removeSize = (i: number) => setSizes(sizes.filter((_, idx) => idx !== i))
  const updateSize = (i: number, field: keyof ProductSizeDraft, value: string | boolean) => {
    setSizes(sizes.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canCreate) {
      alert('Forbidden')
      return
    }
    setLoading(true)

    const imageUrls: string[] = []
    for (const file of images) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage
        .from('products')
        .upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('products').getPublicUrl(path)
        imageUrls.push(data.publicUrl)
      }
    }

    const validSizes = sizes
      .filter((s) => s.size && s.price)
      .map((s) => ({
        size: s.size,
        price: parseFloat(s.price),
        in_stock: s.in_stock,
      }))

    const payload = {
      ...form,
      price: parseFloat(form.price),
      discount_pct: parseFloat(form.discount_pct),
      image_urls: imageUrls,
      sizes: validSizes,
    }

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = (await res.json()) as { ok?: boolean; error?: string }
    if (!res.ok || !data.ok) {
      alert('Xeta: ' + (data.error || 'Create failed'))
      setLoading(false)
      return
    }

    router.push('/admin')
    setLoading(false)
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-neutral-400 hover:text-amber-400 transition-colors">Geri</Link>
        <h1 className="text-3xl font-bold text-white">Yeni Mehsul</h1>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 ds-card-glass p-6 rounded-2xl">

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="ds-label">Ad (AZ)</label>
            <input className="ds-input" value={form.name_az}
              onChange={e => setForm({...form, name_az: e.target.value})} required />
          </div>
          <div>
            <label className="ds-label">Ad (RU)</label>
            <input className="ds-input" value={form.name_ru}
              onChange={e => setForm({...form, name_ru: e.target.value})} required />
          </div>
          <div>
            <label className="ds-label">Ad (EN)</label>
            <input className="ds-input" value={form.name_en}
              onChange={e => setForm({...form, name_en: e.target.value})} required />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 mb-2">
            <label className="ds-label">
              {lang === 'az'
                ? 'Məhsul haqqında ətraflı məlumat'
                : lang === 'ru'
                  ? 'Подробное описание товара'
                  : 'Detailed product description'}
            </label>
            <div className="text-xs text-neutral-400 font-medium">
              {form.description.length}/2000
            </div>
          </div>
          <textarea
            rows={6}
            maxLength={2000}
            placeholder="..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="ds-input min-h-[44px] resize-y"
          />
        </div>

        <div>
          <label className="ds-label">Kateqoriya</label>
          <select className="ds-input" value={form.category}
            onChange={e => setForm({...form, category: e.target.value})}>
            <option value="ortopedik">Ortopedik</option>
            <option value="berk">Berk</option>
            <option value="yumshaq">Yumshaq</option>
            <option value="topper">Topper</option>
            <option value="ushaq">Ushaq</option>
            <option value="yastig">Yastig</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="ds-label">Esas qiymet (AZN)</label>
            <input type="number" className="ds-input" value={form.price}
              onChange={e => setForm({...form, price: e.target.value})} required />
          </div>
          <div>
            <label className="ds-label">Endirim (%)</label>
            <input type="number" className="ds-input" value={form.discount_pct}
              onChange={e => setForm({...form, discount_pct: e.target.value})} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="in_stock" checked={form.in_stock}
            onChange={e => setForm({...form, in_stock: e.target.checked})} />
          <label htmlFor="in_stock" className="text-sm text-neutral-200">Stokda var</label>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="ds-label">Olcüler</label>
            <button type="button" onClick={addSize}
              className="text-sm bg-white/10 text-amber-300 px-3 py-1 rounded-lg hover:bg-white/20 transition-colors border border-white/20">
              + Olcu elave et
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {sizes.map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input className="ds-input w-32" placeholder="80x200"
                  value={s.size} onChange={e => updateSize(i, 'size', e.target.value)} />
                <input type="number" className="ds-input flex-1"
                  placeholder="Qiymet AZN" value={s.price}
                  onChange={e => updateSize(i, 'price', e.target.value)} />
                <label className="flex items-center gap-1 text-sm text-neutral-200">
                  <input type="checkbox" checked={s.in_stock}
                    onChange={e => updateSize(i, 'in_stock', e.target.checked)} />
                  Var
                </label>
                <button type="button" onClick={() => removeSize(i)}
                  className="text-red-400 hover:text-red-300 px-2">X</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="ds-label mb-3">Sekiller</label>
          <input type="file" accept="image/*" multiple onChange={handleImages}
            className="ds-input mb-3" />
          {previews.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative group">
                      <Image
                        src={src}
                        alt={`Product preview ${i + 1}`}
                        width={200}
                        height={200}
                        className="w-full aspect-square object-cover rounded-lg"
                        sizes="(max-width: 640px) 25vw, 200px"
                        loading="lazy"
                      />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-100 md:opacity-0 md:group-hover:opacity-100 rounded-lg flex items-center justify-center gap-1 transition-opacity">
                    <button type="button" onClick={() => moveImage(i, 'left')}
                      className="bg-white text-black w-11 h-11 min-h-[44px] min-w-[44px] rounded-full text-sm">
                      {'<'}
                    </button>
                    <button type="button" onClick={() => removeImage(i)}
                      className="bg-red-500 text-white w-11 h-11 min-h-[44px] min-w-[44px] rounded-full text-sm">
                      X
                    </button>
                    <button type="button" onClick={() => moveImage(i, 'right')}
                      className="bg-white text-black w-11 h-11 min-h-[44px] min-w-[44px] rounded-full text-sm">
                      {'>'}
                    </button>
                  </div>
                  {i === 0 && (
                    <div className="absolute top-1 left-1 bg-black text-white text-xs px-1 rounded">
                      Ana foto
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading || !canCreate}
          className="ds-btn-primary">
          {loading ? 'Saxlanilir...' : 'Saxla'}
        </button>
      </form>
    </main>
  )
}
