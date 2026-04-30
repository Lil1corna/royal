import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'
import AccountSettings from './account-settings'
import AccountOrdersSection from '@/components/account-orders-section'
import { ROLES, normalizeDbRoleToRoleKey } from '@/config/roles'
import { avatarUrlUsesNextImageOptimization } from '@/lib/avatar-url'

export default async function AccountPage() {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name_ru, image_urls))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const roleKey = normalizeDbRoleToRoleKey(profile?.role)
  const perms = ROLES[roleKey].permissions
  const isStaff =
    perms.includes('manage_products') ||
    perms.includes('manage_orders') ||
    perms.includes('manage_users') ||
    perms.includes('view_analytics')
  function metaNumber(v: unknown): number | null {
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v)
    return null
  }

  const meta = (user.user_metadata || {}) as {
    phone?: string
    shipping_address?: string
    shipping_address_extra?: string
    avatar_url?: string
    shipping_lat?: unknown
    shipping_lng?: unknown
  }
  const initialShippingLat = metaNumber(meta.shipping_lat)
  const initialShippingLng = metaNumber(meta.shipping_lng)
  const avatarUrl = meta.avatar_url || ''
  const displayName = profile?.name || user.email

  return (
    <main className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto overflow-x-hidden">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Link href="/" className="text-white/60 hover:text-white min-h-[44px] inline-flex items-center">
          Geri
        </Link>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Kabinet</h1>
      </div>

      <div className="card-soft p-6 mb-8 flex items-center gap-4 border border-white/10">
        {avatarUrl ? (
          avatarUrlUsesNextImageOptimization(avatarUrl) ? (
            <Image
              src={avatarUrl}
              alt="avatar"
              width={56}
              height={56}
              sizes="56px"
              priority
              className="w-14 h-14 rounded-full object-cover border border-white/10"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- external hosts not in remotePatterns
            <img
              src={avatarUrl}
              alt="avatar"
              width={56}
              height={56}
              className="w-14 h-14 rounded-full object-cover border border-white/10"
              referrerPolicy="no-referrer"
            />
          )
        ) : (
          <div className="w-14 h-14 bg-[#050d1a] text-white rounded-full flex items-center justify-center text-xl font-bold border border-white/10">
            {user.email?.[0].toUpperCase()}
          </div>
        )}
        <div>
          <div className="font-semibold text-lg text-white">{displayName}</div>
          <div className="text-white/60 text-sm">{user.email}</div>
          <div className="text-xs text-white/60 mt-1">{profile?.role || 'customer'}</div>
        </div>
        {isStaff && (
          <Link
            href="/admin"
            className="ml-auto btn-secondary text-sm"
          >
            Admin Panel
          </Link>
        )}
      </div>

      <AccountSettings
        userId={user.id}
        currentEmail={user.email || ''}
        initialName={profile?.name || ''}
        initialPhone={meta.phone || ''}
        initialAddress={meta.shipping_address || ''}
        initialAddressExtra={meta.shipping_address_extra || ''}
        initialAvatarUrl={meta.avatar_url || ''}
        initialShippingLat={initialShippingLat}
        initialShippingLng={initialShippingLng}
      />

      <h2 className="text-xl font-bold mb-4">Sifarislerim</h2>

      <AccountOrdersSection userId={user.id} initialOrders={orders || []} />
    </main>
  )
}
