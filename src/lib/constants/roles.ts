import { ROLES, type RoleKey } from '@/config/roles'

/**
 * Роли, которые можно передать в теле POST /api/admin/users/invite (как в users.role / алиасы).
 * Синхронизировать с проверкой в src/app/api/admin/users/invite/route.ts.
 */
export const INVITE_ALLOWED_ROLE_INPUTS: readonly string[] = [
  ROLES.SUPER_ADMIN.key,
  ROLES.ADMIN.key,
  ROLES.MODERATOR.key,
  ROLES.EDITOR.key,
  ROLES.SUPPORT.key,
  ROLES.VIEWER.key,
  ROLES.USER.key,
  'manager',
  'content_manager',
  'customer',
]

/**
 * Нормализованные ключи, которые попадают в pending_staff_invites.role и users.role.
 * Должны совпадать с CHECK в supabase/migrations/*_fix_role_check.sql
 */
export const ALLOWED_ROLES_IN_DB: readonly string[] = Array.from(
  new Set((Object.keys(ROLES) as RoleKey[]).map((k) => ROLES[k].key))
).sort()
