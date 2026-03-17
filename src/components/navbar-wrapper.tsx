import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Navbar from './navbar'

export default async function NavbarWrapper() {
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
  return <Navbar userEmail={user?.email} />
}
