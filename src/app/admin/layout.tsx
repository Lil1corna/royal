import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { normalizeDbRoleToRoleKey, ROLES } from '@/config/roles'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const roleKey = normalizeDbRoleToRoleKey(profile?.role)
  const perms = ROLES[roleKey].permissions

  const hasAdminAccess =
    perms.includes('manage_products') ||
    perms.includes('manage_orders') ||
    perms.includes('manage_users') ||
    perms.includes('view_analytics')

  if (!hasAdminAccess) redirect('/')

  return <>{children}</>
}
