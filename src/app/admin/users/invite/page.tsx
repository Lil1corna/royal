'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function InviteUser() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('manager')
  const [done, setDone] = useState(false)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const existing = await supabase
      .from('users')
      .select('id, role')
      .eq('email', email)
      .single()

    if (existing.data) {
      const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('email', email)
      if (error) {
        alert('Xeta: ' + error.message)
      } else {
        setDone(true)
      }
    } else {
      const { error } = await supabase
        .from('users')
        .insert([{ email, role, name: email }])
      if (error) {
        alert('Xeta: ' + error.message)
      } else {
        setDone(true)
      }
    }
    setLoading(false)
  }

  if (done) {
    return (
      <main className="p-8 max-w-md mx-auto text-center">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold mb-2">Elave edildi!</h2>
        <p className="text-gray-500 mb-6">{email} — {role}</p>
        <p className="text-sm text-gray-400 mb-6">
          Bu shexs Google ile giris etdikde avtomatik olaraq rolu teyin edilecek.
        </p>
        <a href="/admin/users" className="bg-black text-white px-6 py-2 rounded-lg">
          Geri qayit
        </a>
      </main>
    )
  }

  return (
    <main className="p-8 max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <a href="/admin/users" className="text-gray-500 hover:text-black">Geri</a>
        <h1 className="text-3xl font-bold">Yeni Admin</h1>
      </div>
      <form onSubmit={handleInvite} className="border rounded-lg p-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Gmail</label>
          <input
            type="email"
            className="w-full border rounded-lg p-2"
            placeholder="ornek@gmail.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Rol</label>
          <select className="w-full border rounded-lg p-2" value={role}
            onChange={e => setRole(e.target.value)}>
            <option value="manager">Manager</option>
            <option value="content_manager">Content Manager</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        <button type="submit" disabled={loading}
          className="bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50">
          {loading ? 'Elave edilir...' : 'Elave et'}
        </button>
      </form>
      <p className="text-sm text-gray-400 mt-4 text-center">
        Bu shexs Google ile giris etdikde avtomatik olaraq rolu teyin edilecek.
      </p>
    </main>
  )
}
