'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import ToastMessage, { type ToastState } from '@/components/toast-message'

export default function EditUser() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState('customer')
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 2500)
  }

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', params.id)
        .single()
      if (data) {
        setUser(data)
        setRole(data.role)
      }
    }
    load()
  }, [params.id])

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', params.id)
    if (error) {
      showToast('error', 'Xeta: ' + error.message)
    } else {
      showToast('success', 'Rol yenilendi')
      router.push('/admin/users')
    }
    setLoading(false)
  }

  if (!user) return <div className="p-8">Yuklenilir...</div>

  return (
    <main className="p-8 max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <a href="/admin/users" className="text-gray-500 hover:text-black">Geri</a>
        <h1 className="text-3xl font-bold">Rol Deyis</h1>
      </div>
      <ToastMessage toast={toast} className="mb-4" />
      <div className="border rounded-lg p-6 flex flex-col gap-4">
        <div>
          <div className="text-sm text-gray-500">Email</div>
          <div className="font-medium">{user.email}</div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Rol</label>
          <select className="w-full border rounded-lg p-2" value={role}
            onChange={e => setRole(e.target.value)}>
            <option value="customer">Customer</option>
            <option value="content_manager">Content Manager</option>
            <option value="manager">Manager</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        <button onClick={handleSave} disabled={loading}
          className="bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50">
          {loading ? 'Saxlanilir...' : 'Saxla'}
        </button>
      </div>
    </main>
  )
}
