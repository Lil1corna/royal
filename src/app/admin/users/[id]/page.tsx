'use client'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { fetchWithCsrf } from '@/lib/fetch-with-csrf'
import { getSupabaseClient } from '@/lib/supabase'
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
  const supabase = useMemo(() => getSupabaseClient(), [])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<UserRow | null>(null)
  const [roleDbKey, setRoleDbKey] = useState('user')
  const [openRolePicker, setOpenRolePicker] = useState(false)
  const [editorRoleKey, setEditorRoleKey] = useState<RoleKey | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const { lang } = useLang()

  const roleButtonRef = useRef<HTMLButtonElement>(null)
  const roleDropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null)

  const updateDropdownPosition = () => {
    const btn = roleButtonRef.current
    if (!btn) return

    const rect = btn.getBoundingClientRect()
    const gap = 8
    const maxHeight = 288 // 18rem @ 16px root

    let top = rect.bottom + gap
    if (top + maxHeight > window.innerHeight - gap) {
      top = Math.max(gap, rect.top - gap - maxHeight)
    }

    setDropdownPos({
      top,
      left: rect.left,
      width: rect.width,
    })
  }

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

  useLayoutEffect(() => {
    if (!openRolePicker) return
    updateDropdownPosition()

    const onResizeOrScroll = () => updateDropdownPosition()
    window.addEventListener('resize', onResizeOrScroll)
    window.addEventListener('scroll', onResizeOrScroll, true)
    return () => {
      window.removeEventListener('resize', onResizeOrScroll)
      window.removeEventListener('scroll', onResizeOrScroll, true)
    }
  }, [openRolePicker])

  useEffect(() => {
    if (!openRolePicker) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node | null
      if (!t) return
      if (roleButtonRef.current?.contains(t)) return
      if (roleDropdownRef.current?.contains(t)) return
      setOpenRolePicker(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [openRolePicker])

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
    const userId = String(params.id)
    const res = await fetchWithCsrf(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: roleDbKey }),
    })
    const data = (await res.json()) as { ok?: boolean; error?: string }
    if (!res.ok || !data.ok) {
      showToast('error', 'Xeta: ' + (data.error || 'Role update failed'))
    } else {
      showToast('success', 'Rol yenilendi')
      router.push('/admin/users')
    }
    setLoading(false)
  }

  if (!user) return <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">Yuklenilir...</div>

  return (
    <main className="p-4 md:p-6 lg:p-8 max-w-md mx-auto pb-24 md:pb-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/users" className="text-neutral-400 hover:text-amber-400 transition-colors">Geri</Link>
        <h1 className="text-3xl font-bold text-white">Rol Deyis</h1>
      </div>
      <ToastMessage toast={toast} className="mb-4" />
      <div className="ds-card-glass rounded-2xl p-4 sm:p-6 flex flex-col gap-4">
        <div>
          <div className="text-sm text-neutral-400">Email</div>
          <div className="font-medium text-white">{user.email}</div>
        </div>
        <div>
          <label className="ds-label">Rol</label>

          <div className="relative">
            <button
              type="button"
              className="ds-input w-full min-h-[44px] flex items-center justify-between gap-3 bg-[#050d1a] backdrop-blur-0"
              onClick={() => setOpenRolePicker((v) => !v)}
              aria-expanded={openRolePicker}
              disabled={!canAssign}
              ref={roleButtonRef}
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
              <div
                ref={roleDropdownRef}
                className="z-[200] bg-[#050d1a] backdrop-blur-0 border border-white/10 rounded-xl p-2 max-h-[18rem] overflow-auto shadow-[0_25px_80px_rgba(0,0,0,0.65)]"
                style={
                  dropdownPos
                    ? {
                        position: 'fixed',
                        top: dropdownPos.top,
                        left: dropdownPos.left,
                        width: dropdownPos.width,
                      }
                    : undefined
                }
              >
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
                      className={`w-full text-left px-3 py-2 rounded-lg min-h-[44px] flex items-start gap-3 bg-[#0a1f3d] border border-white/10 ${
                        active ? 'bg-[#0d3b6e]' : 'hover:bg-[#0d3b6e]'
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
