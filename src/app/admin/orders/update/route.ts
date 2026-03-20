import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const id = formData.get('id') as string
  const status = formData.get('status') as string

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

  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  const redirectUrl = new URL('/admin/orders', request.url)
  if (error) {
    redirectUrl.searchParams.set('toast', 'error')
  } else {
    redirectUrl.searchParams.set('toast', 'success')
  }
  return NextResponse.redirect(redirectUrl)
}
