'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function EditProduct() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name_az: '', name_ru: '', name_en: '',
    category: 'ortopedik',
    price: '',
    discount_pct: '0',
    in_stock: true,
  })

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single()
      if (data) {
        setForm({
          name_az: data.name_az,
          name_ru: data.name_ru,
          name_en: data.name_en,
          category: data.category,
          price: data.price.toString(),
          discount_pct: data.discount_pct.toString(),
          in_stock: data.in_stock,
        })
      }
    }
    load()
  }, [params.id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from('products')
      .update({
        ...form,
        price: parseFloat(form.price),
        discount_pct: parseFloat(form.discount_pct),
      })
      .eq('id', params.id)
    if (error) {
      alert('Xeta: ' + error.message)
    } else {
      router.push('/admin')
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('Silmek isteyirsiniz?')) return
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', params.id)
    if (error) {
      alert('Xeta: ' + error.message)
    } else {
      router.push('/admin')
    }
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <a href="/admin" className="text-gray-500 hover:text-black">Geri</a>
        <h1 className="text-3xl font-bold">Mehsulu Redakte Et</h1>
      </div>
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ad (AZ)</label>
            <input className="w-full border rounded-lg p-2" value={form.name_az}
              onChange={e => setForm({...form, name_az: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ad (RU)</label>
            <input className="w-full border rounded-lg p-2" value={form.name_ru}
              onChange={e => setForm({...form, name_ru: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ad (EN)</label>
            <input className="w-full border rounded-lg p-2" value={form.name_en}
              onChange={e => setForm({...form, name_en: e.target.value})} required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Kateqoriya</label>
          <select className="w-full border rounded-lg p-2" value={form.category}
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
            <label className="block text-sm font-medium mb-1">Qiymet (AZN)</label>
            <input type="number" className="w-full border rounded-lg p-2" value={form.price}
              onChange={e => setForm({...form, price: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Endirim (%)</label>
            <input type="number" className="w-full border rounded-lg p-2" value={form.discount_pct}
              onChange={e => setForm({...form, discount_pct: e.target.value})} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="in_stock" checked={form.in_stock}
            onChange={e => setForm({...form, in_stock: e.target.checked})} />
          <label htmlFor="in_stock" className="font-medium">Stokda var</label>
        </div>

        <div className="flex gap-4 mt-4">
          <button type="submit" disabled={loading}
            className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50">
            {loading ? 'Saxlanilir...' : 'Saxla'}
          </button>
          <button type="button" onClick={handleDelete}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
            Sil
          </button>
        </div>
      </form>
    </main>
  )
}
