import { createServerClient } from '@supabase/ssr'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { normalizeDbRoleToRoleKey, type RoleKey, type PermissionKey } from '@/config/roles'

const ROLE_PERMISSIONS: Record<RoleKey, PermissionKey[]> = {
  SUPER_ADMIN: ['manage_admins', 'manage_products', 'manage_orders', 'manage_users', 'manage_settings', 'view_analytics', 'assign_roles', 'delete_anything'],
  ADMIN: ['manage_products', 'manage_orders', 'manage_users', 'view_analytics', 'assign_roles', 'delete_anything'],
  MODERATOR: ['manage_products', 'manage_orders'],
  EDITOR: ['manage_products'],
  SUPPORT: ['manage_orders', 'manage_users'],
  VIEWER: ['view_analytics'],
  USER: [],
}

export function hasPermission(roleKey: RoleKey, permission: PermissionKey): boolean {
  return ROLE_PERMISSIONS[roleKey]?.includes(permission) ?? false
}

type AuthorizedResult =
  | { ok: true; admin: SupabaseClient; userId: string; roleKey: RoleKey }
  | { ok: false; status: number; error?: string }

export async function ensureAuthorized(permission: PermissionKey): Promise<AuthorizedResult> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, status: 401 }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const roleKey = normalizeDbRoleToRoleKey(profile?.role)
  if (!hasPermission(roleKey, permission)) {
    return { ok: false, status: 403 }
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { ok: false, status: 500, error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  return { ok: true, admin, userId: user.id, roleKey }
}
