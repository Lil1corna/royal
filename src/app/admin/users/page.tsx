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
          <a href="/admin" className="text-gray-500 hover:text-black">Geri</a>
          <h1 className="text-3xl font-bold">Staff</h1>
        </div>
        <a href="/admin/users/invite"
          className="btn-primary btn-icon-arrow px-6 py-2">
          Yeni admin <span className="arrow">→</span>
        </a>
      </div>
      <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <thead>
          <tr className="bg-neutral-50">
            <th className="text-left p-3 border-b border-neutral-200">Email</th>
            <th className="text-left p-3 border-b border-neutral-200">Ad</th>
            <th className="text-left p-3 border-b border-neutral-200">Rol</th>
            <th className="text-left p-3 border-b border-neutral-200">Tarix</th>
            <th className="text-left p-3 border-b border-neutral-200">Deyis</th>
          </tr>
        </thead>
        <tbody>
          {staff?.map((u) => (
            <tr key={u.id} className="hover:bg-neutral-50">
              <td className="p-3 border-b border-neutral-100">{u.email}</td>
              <td className="p-3 border-b border-neutral-100">{u.name || '-'}</td>
              <td className="p-3 border-b border-neutral-100">
                <span className={`px-2 py-1 rounded-full text-sm ${
                  u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                  u.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {u.role}
                </span>
              </td>
              <td className="p-3 border-b border-neutral-100 text-gray-500 text-sm">
                {new Date(u.created_at).toLocaleDateString()}
              </td>
              <td className="p-3 border-b border-neutral-100">
                <a href={'/admin/users/' + u.id} className="text-blue-600 hover:underline">
                  Edit
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
