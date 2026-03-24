'use client'
import { useState } from 'react'
import Link from 'next/link'
import ToastMessage, { type ToastState } from '@/components/toast-message'

export default function InviteUser() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('manager')
  const [done, setDone] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 2500)
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/users/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    })
    const data = (await res.json()) as { ok?: boolean; error?: string }

    if (!res.ok || !data.ok) {
      showToast('error', 'Xeta: ' + (data.error || 'Invite gonderilmedi'))
    } else {
      showToast('success', 'Davet mektubu gonderildi')
      setDone(true)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <main className="p-8 max-w-md mx-auto text-center">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold mb-2 text-white">Davet gonderildi!</h2>
        <p className="text-neutral-300 mb-6">{email} — {role}</p>
        <p className="text-sm text-neutral-400 mb-6">
          Shexse email gelecek. Ilk girisden sonra rol avtomatik teyin olunacaq.
        </p>
        <Link href="/admin/users" className="ds-btn-primary inline-block px-6 py-2">
          Geri qayit
        </Link>
      </main>
    )
  }

  return (
    <main className="p-8 max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/users" className="text-neutral-400 hover:text-amber-400 transition-colors">Geri</Link>
        <h1 className="text-3xl font-bold text-white">Yeni Admin</h1>
      </div>
      <ToastMessage toast={toast} className="mb-4" />
      <form onSubmit={handleInvite} className="ds-card-glass rounded-2xl p-6 flex flex-col gap-4">
        <div>
          <label className="ds-label">Gmail</label>
          <input
            type="email"
            className="ds-input"
            placeholder="ornek@gmail.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="ds-label">Rol</label>
          <select className="ds-input" value={role}
            onChange={e => setRole(e.target.value)}>
            <option value="manager">Manager</option>
            <option value="content_manager">Content Manager</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        <button type="submit" disabled={loading}
          className="ds-btn-primary">
          {loading ? 'Elave edilir...' : 'Elave et'}
        </button>
      </form>
      <p className="text-sm text-neutral-400 mt-4 text-center">
        Supabase Auth invite email gonderir. Ilk girisde rol avtomatik verilir.
      </p>
    </main>
  )
}
