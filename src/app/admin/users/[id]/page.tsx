'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import ToastMessage, { type ToastState } from '@/components/toast-message'

type UserRow = {
  id: string
  email: string
  role: string
}

export default function EditUser() {
  const router = useRouter()
  const params = useParams()
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<UserRow | null>(null)
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
  }, [params.id, supabase])

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
        <Link href="/admin/users" className="text-neutral-400 hover:text-amber-400 transition-colors">Geri</Link>
        <h1 className="text-3xl font-bold text-white">Rol Deyis</h1>
      </div>
      <ToastMessage toast={toast} className="mb-4" />
      <div className="ds-card-glass rounded-2xl p-6 flex flex-col gap-4">
        <div>
          <div className="text-sm text-neutral-400">Email</div>
          <div className="font-medium text-white">{user.email}</div>
        </div>
        <div>
          <label className="ds-label">Rol</label>
          <select className="ds-input" value={role}
            onChange={e => setRole(e.target.value)}>
            <option value="customer">Customer</option>
            <option value="content_manager">Content Manager</option>
            <option value="manager">Manager</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        <button onClick={handleSave} disabled={loading}
          className="ds-btn-primary">
          {loading ? 'Saxlanilir...' : 'Saxla'}
        </button>
      </div>
    </main>
  )
}
