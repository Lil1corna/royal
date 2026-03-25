'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import ToastMessage, { type ToastState } from '@/components/toast-message'
import { useLang } from '@/context/lang'
import { ROLES, getRoleKeyFromRoleDbKey, permissionLabels, type RoleKey } from '@/config/roles'

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
  const [roleDbKey, setRoleDbKey] = useState('user')
  const [openRolePicker, setOpenRolePicker] = useState(false)
  const [editorRoleKey, setEditorRoleKey] = useState<RoleKey | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const { lang } = useLang()

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
        setRoleDbKey(data.role)
      }
    }
    load()
  }, [params.id, supabase])

  useEffect(() => {
    const loadEditorRole = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        if (!authUser) return setEditorRoleKey(null)
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', authUser.id)
          .single()
        const roleKey = getRoleKeyFromRoleDbKey(profile?.role || null)
        setEditorRoleKey(roleKey)
      } catch {
        setEditorRoleKey(null)
      }
    }
    loadEditorRole()
  }, [supabase])

  const roleKeys = Object.keys(ROLES) as RoleKey[]
  const targetRoleKey = getRoleKeyFromRoleDbKey(roleDbKey)
  const canAssign =
    editorRoleKey === 'SUPER_ADMIN' ||
    (editorRoleKey === 'ADMIN' && !['SUPER_ADMIN', 'ADMIN'].includes(targetRoleKey))

  const handleSave = async () => {
    if (!canAssign) {
      showToast('error', 'Forbidden')
      return
    }
    setLoading(true)
    const { error } = await supabase
      .from('users')
      .update({ role: roleDbKey })
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

          <div className="relative">
            <button
              type="button"
              className="ds-input w-full min-h-[44px] flex items-center justify-between gap-3 bg-[#050d1a]/95 backdrop-blur-0"
              onClick={() => setOpenRolePicker((v) => !v)}
              aria-expanded={openRolePicker}
              disabled={!canAssign}
            >
              <div className="flex flex-col items-start min-w-0">
                <div className="font-bold text-white/90 truncate">
                  {ROLES[targetRoleKey].label[lang]}
                </div>
                <div className="text-xs text-neutral-400 truncate">
                  {ROLES[targetRoleKey].description[lang]}
                </div>
              </div>
              <div className="text-xs text-neutral-400">{openRolePicker ? '▲' : '▼'}</div>
            </button>

            {openRolePicker && canAssign && (
              <div className="absolute left-0 right-0 mt-2 z-[200] bg-[#050d1a]/92 backdrop-blur-0 border border-white/10 rounded-xl p-2 max-h-[18rem] overflow-auto">
                {roleKeys.map((rk) => {
                  const role = ROLES[rk]
                  const active = rk === targetRoleKey
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

                  const disabledForAdmin =
                    editorRoleKey === 'ADMIN' && ['SUPER_ADMIN', 'ADMIN'].includes(rk)

                  return (
                    <button
                      key={rk}
                      type="button"
                      className={`w-full text-left px-3 py-2 rounded-lg min-h-[44px] flex items-start gap-3 bg-white/5 ${
                        active ? 'bg-white/12' : 'hover:bg-white/10'
                      } ${disabledForAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => {
                        if (disabledForAdmin) return
                        setRoleDbKey(role.key)
                        setOpenRolePicker(false)
                      }}
                    >
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${badgeClass}`}>
                        {rk === 'SUPER_ADMIN'
                          ? 'SA'
                          : rk === 'ADMIN'
                            ? 'A'
                            : rk === 'MODERATOR'
                              ? 'M'
                              : rk === 'EDITOR'
                                ? 'E'
                                : rk === 'SUPPORT'
                                  ? 'S'
                                  : rk === 'VIEWER'
                                    ? 'V'
                                    : 'U'}
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
            <p className="text-sm text-neutral-200 mb-2">{ROLES[targetRoleKey].description[lang]}</p>
            <ul className="flex flex-col gap-1">
              {ROLES[targetRoleKey].permissions.length === 0 ? (
                <li className="text-xs text-neutral-400">—</li>
              ) : (
                ROLES[targetRoleKey].permissions.map((p) => (
                  <li key={p} className="text-xs text-neutral-300">
                    ✓ {permissionLabels[p][lang]}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
        <button onClick={handleSave} disabled={loading || !canAssign}
          className="ds-btn-primary">
          {loading ? 'Saxlanilir...' : 'Saxla'}
        </button>
      </div>
    </main>
  )
}
