'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useLang } from '@/context/lang'
import { ROLES, normalizeDbRoleToRoleKey } from '@/config/roles'

export default function EditProduct() {
  const router = useRouter()
  const params = useParams()
  const supabase = useMemo(() => getSupabaseClient(), [])
  const productId = params.id as string
  const { lang } = useLang()
  const [loading, setLoading] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [form, setForm] = useState({
    name_az: '', name_ru: '', name_en: '',
    category: 'ortopedik',
    description: '',
    price: '',
    discount_pct: '0',
    in_stock: true,
  })
  /** Уже сохранённые URL из Storage или внешние */
  const [existingUrls, setExistingUrls] = useState<string[]>([])
  /** Новые файлы для загрузки */
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()
    if (data) {
      setForm({
        name_az: data.name_az,
        name_ru: data.name_ru,
        name_en: data.name_en,
        category: data.category,
        description: data.description || '',
        price: data.price.toString(),
        discount_pct: data.discount_pct.toString(),
        in_stock: data.in_stock,
      })
      const urls = Array.isArray(data.image_urls) ? data.image_urls.filter(Boolean) : []
      setExistingUrls(urls)
    }
  }, [supabase, productId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const loadPerms = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          setCanEdit(false)
          setCanDelete(false)
          return
        }
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        const roleKey = normalizeDbRoleToRoleKey(profile?.role)
        const perms = ROLES[roleKey].permissions
        setCanEdit(perms.includes('manage_products'))
        setCanDelete(perms.includes('delete_anything'))
      } catch {
        setCanEdit(false)
        setCanDelete(false)
      }
    }
    loadPerms()
  }, [supabase])

  const removeExisting = (index: number) => {
    setExistingUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const moveExisting = (i: number, dir: 'left' | 'right') => {
    const j = dir === 'left' ? i - 1 : i + 1
    if (j < 0 || j >= existingUrls.length) return
    const next = [...existingUrls]
    ;[next[i], next[j]] = [next[j], next[i]]
    setExistingUrls(next)
  }

  const handleNewFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setNewFiles((prev) => [...prev, ...files])
    setNewPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))])
    e.target.value = ''
  }

  const removeNew = (index: number) => {
    URL.revokeObjectURL(newPreviews[index])
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
    setNewPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const moveNew = (i: number, dir: 'left' | 'right') => {
    const j = dir === 'left' ? i - 1 : i + 1
    if (j < 0 || j >= newFiles.length) return
    const nf = [...newFiles]
    const np = [...newPreviews]
    ;[nf[i], nf[j]] = [nf[j], nf[i]]
    ;[np[i], np[j]] = [np[j], np[i]]
    setNewFiles(nf)
    setNewPreviews(np)
  }

  const uploadNewFiles = async (): Promise<string[]> => {
    const uploaded: string[] = []
    for (const file of newFiles) {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('products').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('products').getPublicUrl(path)
        uploaded.push(data.publicUrl)
      }
    }
    return uploaded
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit) {
      alert('Forbidden')
      return
    }
    setLoading(true)
    try {
      const uploadedUrls = await uploadNewFiles()
      const image_urls = [...existingUrls, ...uploadedUrls]

      const payload = {
        ...form,
        price: parseFloat(form.price),
        discount_pct: parseFloat(form.discount_pct),
        image_urls,
      }

      const isMissingDescriptionColumn = (message: string) => {
        const m = message.toLowerCase()
        return m.includes('description') && (m.includes('does not exist') || m.includes('unknown column') || m.includes('column'))
      }

      let { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', productId)

      // If DB column `description` is not migrated yet, retry without it.
      if (error && isMissingDescriptionColumn(error.message)) {
        const { description: droppedDesc, ...payloadWithoutDesc } = payload
        void droppedDesc
        ;({ error } = await supabase
          .from('products')
          .update(payloadWithoutDesc)
          .eq('id', productId))
      }

      newPreviews.forEach((url) => URL.revokeObjectURL(url))

      if (error) {
        alert('Xeta: ' + error.message)
      } else {
        router.push('/admin')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!canDelete) {
      alert('Forbidden')
      return
    }
    if (!confirm('Silmek isteyirsiniz?')) return
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
    if (error) {
      alert('Xeta: ' + error.message)
    } else {
      router.push('/admin')
    }
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-neutral-400 hover:text-amber-400 transition-colors">Geri</Link>
        <h1 className="text-3xl font-bold text-white">Mehsulu Redakte Et</h1>
      </div>
      <form
        onSubmit={handleSave}
        className="flex flex-col gap-4 ds-card-glass p-6 rounded-2xl"
      >
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
            <label className="ds-label">Qiymet (AZN)</label>
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

        <div className="ds-card-glass p-4 rounded-xl">
          <label className="ds-label mb-2">Sekiller</label>
          <p className="text-xs text-neutral-400 mb-3">
            Movcud sekilleri silə və ya sırasını dəyişə bilərsiniz. Yeni şəkil əlavə etmək üçün fayl seçin.
          </p>

          {existingUrls.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-neutral-300 mb-2">Movcud ({existingUrls.length})</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {existingUrls.map((src, i) => (
                  <div key={`${src}-${i}`} className="relative group border border-white/20 rounded-lg overflow-hidden bg-black/40">
                    <Image
                      src={src}
                      alt={`Existing product image ${i + 1}`}
                      width={200}
                      height={200}
                      className="w-full aspect-square object-cover"
                      sizes="(max-width: 640px) 25vw, 200px"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-100 md:opacity-0 md:group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                      <button type="button" onClick={() => moveExisting(i, 'left')}
                        className="bg-white/90 text-black w-11 h-11 min-h-[44px] min-w-[44px] rounded-full text-sm hover:bg-white" disabled={i === 0}>{'<'}</button>
                      <button type="button" onClick={() => removeExisting(i)}
                        className="bg-red-500 text-white w-11 h-11 min-h-[44px] min-w-[44px] rounded-full text-sm hover:bg-red-600">X</button>
                      <button type="button" onClick={() => moveExisting(i, 'right')}
                        className="bg-white/90 text-black w-11 h-11 min-h-[44px] min-w-[44px] rounded-full text-sm hover:bg-white" disabled={i === existingUrls.length - 1}>{'>'}</button>
                    </div>
                    {i === 0 && (
                      <span className="absolute top-1 left-1 bg-amber-500 text-black text-[10px] px-1 rounded font-semibold">Ana</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleNewFiles}
            className="ds-input mb-3"
          />

          {newPreviews.length > 0 && (
            <div>
              <p className="text-sm text-neutral-300 mb-2">Yeni (Saxla düyməsindən sonra yüklənəcək)</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {newPreviews.map((src, i) => (
                  <div key={src} className="relative group border border-white/20 rounded-lg overflow-hidden bg-black/40">
                    <Image
                      src={src}
                      alt={`New product image ${i + 1}`}
                      width={200}
                      height={200}
                      className="w-full aspect-square object-cover"
                      sizes="(max-width: 640px) 25vw, 200px"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-100 md:opacity-0 md:group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                      <button type="button" onClick={() => moveNew(i, 'left')}
                        className="bg-white/90 text-black w-11 h-11 min-h-[44px] min-w-[44px] rounded-full text-sm hover:bg-white" disabled={i === 0}>{'<'}</button>
                      <button type="button" onClick={() => removeNew(i)}
                        className="bg-red-500 text-white w-11 h-11 min-h-[44px] min-w-[44px] rounded-full text-sm hover:bg-red-600">X</button>
                      <button type="button" onClick={() => moveNew(i, 'right')}
                        className="bg-white/90 text-black w-11 h-11 min-h-[44px] min-w-[44px] rounded-full text-sm hover:bg-white" disabled={i === newPreviews.length - 1}>{'>'}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-4">
          <button type="submit" disabled={loading || !canEdit}
            className="flex-1 ds-btn-primary">
            {loading ? 'Saxlanilir...' : 'Saxla'}
          </button>
          {canDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-600/20 text-red-300 px-6 py-3 rounded-lg hover:bg-red-600/30 border border-red-500/30 transition-colors"
            >
              Sil
            </button>
          ) : null}
        </div>
      </form>
    </main>
  )
}
