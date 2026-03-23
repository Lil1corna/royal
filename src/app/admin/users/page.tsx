import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function UsersPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/admin')

  const { data: staff } = await supabase
    .from('users')
    .select('*')
    .in('role', ['super_admin', 'manager', 'content_manager'])
    .order('created_at', { ascending: false })

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <a href="/admin" className="text-neutral-400 hover:text-amber-400 transition-colors">Geri</a>
          <h1 className="text-3xl font-bold text-white">Staff</h1>
        </div>
        <a href="/admin/users/invite"
          className="btn-primary btn-icon-arrow px-6 py-2">
          Yeni admin <span className="arrow">→</span>
        </a>
      </div>
      <div className="ds-card-glass rounded-2xl overflow-hidden">
        <table className="w-full">
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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    u.role === 'super_admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                    u.role === 'manager' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-neutral-400 text-sm">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <a href={'/admin/users/' + u.id} className="text-amber-400 hover:text-amber-300 transition-colors">
                    Edit
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
