import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const CATEGORY_VALUES = ['ortopedik', 'berk', 'yumshaq', 'topper', 'ushaq', 'yastig'] as const

const productSizeSchema = z.object({
  size: z.string().trim().min(1),
  price: z.number().positive(),
  in_stock: z.boolean(),
})

const productCreateSchema = z.object({
  name_az: z.string().trim().min(1),
  name_ru: z.string().trim().min(1),
  name_en: z.string().trim().min(1),
  category: z.enum(CATEGORY_VALUES),
  description: z.string().max(2000).optional().default(''),
  price: z.number().positive(),
  discount_pct: z.number().min(0).max(100),
  in_stock: z.boolean(),
  image_urls: z.array(z.string().url()).optional().default([]),
  sizes: z.array(productSizeSchema).optional().default([]),
})

export async function POST(request: NextRequest) {
  try {
    const payload = productCreateSchema.safeParse(await request.json())
    if (!payload.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

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

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing SUPABASE_SERVICE_ROLE_KEY' },
        { status: 500 }
      )
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { sizes, ...productPayload } = payload.data
    const { data: product, error: insertError } = await admin
      .from('products')
      .insert([productPayload])
      .select()
      .single()

    if (insertError || !product) {
      return NextResponse.json(
        { error: insertError?.message || 'Insert failed' },
        { status: 400 }
      )
    }

    if (sizes.length > 0) {
      const { error: sizeError } = await admin.from('product_sizes').insert(
        sizes.map((s) => ({
          product_id: product.id,
          size: s.size,
          price: s.price,
          in_stock: s.in_stock,
        }))
      )
      if (sizeError) {
        return NextResponse.json({ error: sizeError.message }, { status: 400 })
      }
    }

    return NextResponse.json({ ok: true, product })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unexpected error' },
      { status: 500 }
    )
  }
}
