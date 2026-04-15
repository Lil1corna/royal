export type PermissionKey =
  | 'manage_admins'
  | 'manage_products'
  | 'manage_orders'
  | 'manage_users'
  | 'manage_settings'
  | 'view_analytics'
  | 'assign_roles'
  | 'delete_anything'

export type RoleKey =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MODERATOR'
  | 'EDITOR'
  | 'SUPPORT'
  | 'VIEWER'
  | 'USER'

/** Single source of truth for API authorization (used by `ensureAuthorized`). */
export const ROLE_PERMISSIONS: Record<RoleKey, PermissionKey[]> = {
  SUPER_ADMIN: [
    'manage_admins',
    'manage_products',
    'manage_orders',
    'manage_users',
    'manage_settings',
    'view_analytics',
    'assign_roles',
    'delete_anything',
  ],
  ADMIN: [
    'manage_products',
    'manage_orders',
    'manage_users',
    'view_analytics',
    'assign_roles',
    'delete_anything',
  ],
  MODERATOR: ['manage_products', 'manage_orders'],
  EDITOR: ['manage_products'],
  SUPPORT: ['manage_orders', 'manage_users'],
  VIEWER: ['view_analytics'],
  USER: [],
}

export function hasPermission(roleKey: RoleKey, permission: PermissionKey): boolean {
  return ROLE_PERMISSIONS[roleKey]?.includes(permission) ?? false
}

export const permissionLabels: Record<
  PermissionKey,
  { az: string; ru: string; en: string }
> = {
  manage_admins: {
    az: 'Administratorları idarə et',
    ru: 'Управление администраторами',
    en: 'Manage administrators',
  },
  manage_products: {
    az: 'Məhsulları idarə et',
    ru: 'Управление товарами',
    en: 'Manage products',
  },
  manage_orders: {
    az: 'Sifarişləri idarə et',
    ru: 'Управление заказами',
    en: 'Manage orders',
  },
  manage_users: {
    az: 'İstifadəçiləri idarə et',
    ru: 'Управление пользователями',
    en: 'Manage users',
  },
  manage_settings: {
    az: 'Sayt parametrlərini idarə et',
    ru: 'Управление настройками сайта',
    en: 'Manage site settings',
  },
  view_analytics: {
    az: 'Analitikaya bax',
    ru: 'Просмотр аналитики',
    en: 'View analytics',
  },
  assign_roles: {
    az: 'Rol təyin et',
    ru: 'Назначать роли',
    en: 'Assign roles',
  },
  delete_anything: {
    az: 'İstənilən məlumatı sil',
    ru: 'Удалять любые данные',
    en: 'Delete any data',
  },
}

export const ROLES: Record<
  RoleKey,
  {
    key: string
    label: { az: string; ru: string; en: string }
    description: { az: string; ru: string; en: string }
    permissions: PermissionKey[]
  }
> = {
  SUPER_ADMIN: {
    key: 'super_admin',
    label: {
      az: 'Baş Administrator',
      ru: 'Главный администратор',
      en: 'Super Admin',
    },
    description: {
      az: 'Bütün sistemə tam giriş imkanı',
      ru: 'Полный доступ ко всей системе',
      en: 'Full access to the entire system',
    },
    permissions: [
      'manage_admins',
      'manage_products',
      'manage_orders',
      'manage_users',
      'manage_settings',
      'view_analytics',
      'assign_roles',
      'delete_anything',
    ],
  },
  ADMIN: {
    // Legacy DB role: "manager"
    key: 'admin',
    label: {
      az: 'Administrator',
      ru: 'Администратор',
      en: 'Admin',
    },
    description: {
      az: 'Məhsullar, sifarişlər və adi istifadəçilər üzərində idarəetmə',
      ru: 'Управление товарами, заказами и обычными пользователями',
      en: 'Manage products, orders, and regular users',
    },
    permissions: [
      'manage_products',
      'manage_orders',
      'manage_users',
      'view_analytics',
      'assign_roles',
      'delete_anything',
    ],
  },
  MODERATOR: {
    key: 'moderator',
    label: {
      az: 'Moderator',
      ru: 'Модератор',
      en: 'Moderator',
    },
    description: {
      az: 'Məhsulların əlavə/yenilənməsi və sifariş statuslarının idarəsi',
      ru: 'Добавление/редактирование продуктов и управление статусами заказов',
      en: 'Add/edit products and update order status',
    },
    permissions: ['manage_products', 'manage_orders'],
  },
  EDITOR: {
    // Legacy DB role: "content_manager"
    key: 'editor',
    label: {
      az: 'Redaktor',
      ru: 'Редактор',
      en: 'Editor',
    },
    description: {
      az: 'Məhsul təsvirləri, şəkillər və adlarla bağlı redaktə',
      ru: 'Редактирование описаний, изображений и названий продуктов',
      en: 'Edit product descriptions, images, and names',
    },
    permissions: ['manage_products'],
  },
  SUPPORT: {
    key: 'support',
    label: {
      az: 'Dəstək',
      ru: 'Поддержка',
      en: 'Support',
    },
    description: {
      az: 'Sifarişlərə dəstək və istifadəçi məlumatlarına baxış',
      ru: 'Поддержка заказов и просмотр информации о пользователях',
      en: 'Support orders and view user information',
    },
    permissions: ['manage_orders', 'manage_users'],
  },
  VIEWER: {
    key: 'viewer',
    label: {
      az: 'Müşahidəçi',
      ru: 'Наблюдатель',
      en: 'Viewer',
    },
    description: {
      az: 'Sistemi yalnız baxış rejimində istifadə etmə',
      ru: 'Только просмотр (read-only) всей информации',
      en: 'Read-only access to products, orders, and users',
    },
    // We treat "view_analytics" as the minimal read-only gateway permission.
    permissions: ['view_analytics'],
  },
  USER: {
    key: 'user',
    label: {
      az: 'İstifadəçi',
      ru: 'Пользователь',
      en: 'User',
    },
    description: {
      az: 'Müştəri hesabı',
      ru: 'Пользователь (клиент)',
      en: 'Customer account',
    },
    permissions: [],
  },
}

const DB_ROLE_ALIASES: Record<string, RoleKey> = {
  // Legacy roles currently used in the codebase/DB
  super_admin: 'SUPER_ADMIN',
  manager: 'ADMIN',
  content_manager: 'EDITOR',
  customer: 'USER',

  // New roles (future keys)
  admin: 'ADMIN',
  moderator: 'MODERATOR',
  editor: 'EDITOR',
  support: 'SUPPORT',
  viewer: 'VIEWER',
  user: 'USER',
}

export function normalizeDbRoleToRoleKey(dbRole: string | null | undefined): RoleKey {
  const role = (dbRole || '').trim()
  return DB_ROLE_ALIASES[role] || 'USER'
}

export function getRoleKeyFromRoleDbKey(roleDbKey: string | null | undefined): RoleKey {
  return normalizeDbRoleToRoleKey(roleDbKey)
}

