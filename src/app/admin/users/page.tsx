import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { ROLES, normalizeDbRoleToRoleKey } from '@/config/roles'

export default async function UsersPage() {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const editorRoleKey = normalizeDbRoleToRoleKey(profile?.role)
  const perms = ROLES[editorRoleKey].permissions
  const canAccessUsersAdmin = perms.includes('manage_users') || perms.includes('view_analytics')

  if (!profile || !canAccessUsersAdmin) redirect('/admin')

  const { data: staff } = await supabase
    .from('users')
    .select('*')
    .in('role', ['super_admin', 'admin', 'moderator', 'editor', 'support', 'viewer', 'manager', 'content_manager'])
    .order('created_at', { ascending: false })

  return (
    <main className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto pb-24 md:pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-neutral-400 hover:text-amber-400 transition-colors">Geri</Link>
          <h1 className="text-3xl font-bold text-white">Staff</h1>
        </div>
        {perms.includes('assign_roles') ? (
          <Link href="/admin/users/invite" className="btn-primary btn-icon-arrow px-6 py-2">
            Yeni admin <span className="arrow">→</span>
          </Link>
        ) : (
          <span className="text-neutral-500/60 text-sm">—</span>
        )}
      </div>
      <div className="ds-card-glass rounded-2xl overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-sm font-semibold text-neutral-300">Email</th>
              <th className="text-left p-4 text-sm font-semibold text-neutral-300">Ad</th>
              <th className="text-left p-4 text-sm font-semibold text-neutral-300">Rol</th>
              <th className="text-left p-4 text-sm font-semibold text-neutral-300">Tarix</th>
              <th className="text-left p-4 text-sm font-semibold text-neutral-300">Deyis</th>
            </tr>
          </thead>
          <tbody>
            {staff?.map((u) => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 text-neutral-200">{u.email}</td>
                <td className="p-4 text-neutral-200">{u.name || '-'}</td>
                <td className="p-4">
                  {(() => {
                    const targetRoleKey = normalizeDbRoleToRoleKey(u.role)
                    const badgeClass =
                      targetRoleKey === 'SUPER_ADMIN'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : targetRoleKey === 'ADMIN'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : targetRoleKey === 'MODERATOR'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : targetRoleKey === 'EDITOR'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : targetRoleKey === 'SUPPORT'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : targetRoleKey === 'VIEWER'
                                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                  : 'bg-neutral-500/20 text-neutral-300 border border-neutral-500/30'

                    const canEditTarget =
                      perms.includes('assign_roles') &&
                      (editorRoleKey === 'SUPER_ADMIN' ||
                        (editorRoleKey === 'ADMIN' && !['SUPER_ADMIN', 'ADMIN'].includes(targetRoleKey)))

                    return (
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
                          {ROLES[targetRoleKey].label.az}
                        </span>
                        {!canEditTarget && <span className="text-neutral-500/60 text-xs">—</span>}
                      </div>
                    )
                  })()}
                </td>
                <td className="p-4 text-neutral-400 text-sm">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  {perms.includes('assign_roles') ? (
                    <Link
                      href={'/admin/users/' + u.id}
                      className="text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      Edit
                    </Link>
                  ) : (
                    <span className="text-neutral-500/60">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
