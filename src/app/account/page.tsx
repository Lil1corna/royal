import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import AccountSettings from './account-settings'
import AccountOrdersSection from '@/components/account-orders-section'

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

  const isStaff = ['super_admin', 'manager', 'content_manager'].includes(profile?.role)
  const meta = (user.user_metadata || {}) as {
    phone?: string
    shipping_address?: string
    avatar_url?: string
  }
  const avatarUrl = meta.avatar_url || ''
  const displayName = profile?.name || user.email

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <a href="/" className="text-gray-500 hover:text-black">
          Geri
        </a>
        <h1 className="text-3xl font-bold">Kabinet</h1>
      </div>

      <div className="border rounded-xl p-6 mb-8 flex items-center gap-4">
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" className="w-14 h-14 rounded-full object-cover border" />
        ) : (
          <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold">
            {user.email?.[0].toUpperCase()}
          </div>
        )}
        <div>
          <div className="font-semibold text-lg">{displayName}</div>
          <div className="text-gray-500 text-sm">{user.email}</div>
          <div className="text-xs text-gray-400 mt-1">{profile?.role || 'customer'}</div>
        </div>
        {isStaff && (
          <a
            href="/admin"
            className="ml-auto bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
          >
            Admin Panel
          </a>
        )}
      </div>

      <AccountSettings
        userId={user.id}
        currentEmail={user.email || ''}
        initialName={profile?.name || ''}
        initialPhone={meta.phone || ''}
        initialAddress={meta.shipping_address || ''}
        initialAvatarUrl={meta.avatar_url || ''}
      />

      <h2 className="text-xl font-bold mb-4">Sifarislerim</h2>

      <AccountOrdersSection userId={user.id} initialOrders={orders || []} />
    </main>
  )
}
