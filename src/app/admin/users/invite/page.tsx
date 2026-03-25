'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ToastMessage, { type ToastState } from '@/components/toast-message'
import { createClient } from '@/lib/supabase'
import { useLang } from '@/context/lang'
import { ROLES, getRoleKeyFromRoleDbKey, permissionLabels, type RoleKey } from '@/config/roles'

export default function InviteUser() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [roleDbKey, setRoleDbKey] = useState(ROLES.ADMIN.key)
  const [done, setDone] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [openRolePicker, setOpenRolePicker] = useState(false)
  const { lang } = useLang()
  const [canInvite, setCanInvite] = useState(false)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 2500)
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canInvite) {
      showToast('error', 'Forbidden')
      return
    }
    setLoading(true)
    const res = await fetch('/api/admin/users/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role: roleDbKey }),
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

  const roleKeys = Object.keys(ROLES) as RoleKey[]
  const selectedRoleKey = getRoleKeyFromRoleDbKey(roleDbKey)
  const selectedRole = ROLES[selectedRoleKey]

  useEffect(() => {
    const loadPerms = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return setCanInvite(false)
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        const roleKey = getRoleKeyFromRoleDbKey(profile?.role)
        setCanInvite(ROLES[roleKey].permissions.includes('assign_roles'))
      } catch {
        setCanInvite(false)
      }
    }
    loadPerms()
  }, [supabase])

  if (done) {
    return (
      <main className="p-8 max-w-md mx-auto text-center">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold mb-2 text-white">Davet gonderildi!</h2>
        <p className="text-neutral-300 mb-6">{email} — {selectedRole.label[lang]}</p>
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

          <div className="relative">
            <button
              type="button"
              className="ds-input w-full min-h-[44px] flex items-center justify-between gap-3"
              onClick={() => setOpenRolePicker((v) => !v)}
              aria-expanded={openRolePicker}
            >
              <div className="flex flex-col items-start min-w-0">
                <div className="font-bold text-white/90 truncate">
                  {selectedRole.label[lang]}
                </div>
                <div className="text-xs text-neutral-400 truncate">
                  {selectedRole.description[lang]}
                </div>
              </div>
              <div className="text-xs text-neutral-400">{openRolePicker ? '▲' : '▼'}</div>
            </button>

            {openRolePicker && (
              <div className="absolute left-0 right-0 mt-2 z-[200] ds-card-glass rounded-xl p-2 max-h-[18rem] overflow-auto">
                {roleKeys.map((rk) => {
                  const role = ROLES[rk]
                  const active = role.key === roleDbKey

                  const badgeClass =
                    rk === 'SUPER_ADMIN'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : rk === 'ADMIN'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : rk === 'MODERATOR'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : rk === 'EDITOR'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : rk === 'SUPPORT'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : rk === 'VIEWER'
                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                : 'bg-neutral-500/20 text-neutral-300 border border-neutral-500/30'

                  return (
                    <button
                      key={rk}
                      type="button"
                      className={`w-full text-left px-3 py-2 rounded-lg min-h-[44px] flex items-start gap-3 ${
                        active ? 'bg-white/10' : 'hover:bg-white/5'
                      }`}
                      onClick={() => {
                        setRoleDbKey(role.key)
                        setOpenRolePicker(false)
                      }}
                    >
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${badgeClass}`}>
                        {rk === 'SUPER_ADMIN' ? 'SA' : rk === 'ADMIN' ? 'A' : rk === 'MODERATOR' ? 'M' : rk === 'EDITOR' ? 'E' : rk === 'SUPPORT' ? 'S' : rk === 'VIEWER' ? 'V' : 'U'}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-white/90">{role.label[lang]}</div>
                        <div className="text-xs text-neutral-400 line-clamp-2">{role.description[lang]}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mt-3">
            <p className="text-sm text-neutral-200 mb-2">{selectedRole.description[lang]}</p>
            <ul className="flex flex-col gap-1">
              {selectedRole.permissions.length === 0 ? (
                <li className="text-xs text-neutral-400">—</li>
              ) : (
                selectedRole.permissions.map((p) => (
                  <li key={p} className="text-xs text-neutral-300">
                    ✓ {permissionLabels[p][lang]}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
        <button type="submit" disabled={loading || !canInvite}
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
