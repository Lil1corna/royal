import { NextRequest, NextResponse } from 'next/server'
import { rateLimitFromRequest } from '@/lib/rate-limit'

const NOMINATIM = 'https://nominatim.openstreetmap.org'
const USER_AGENT =
  process.env.NEXT_PUBLIC_SITE_URL != null
    ? `RoyalAz/1.0 (${process.env.NEXT_PUBLIC_SITE_URL})`
    : 'RoyalAz/1.0 (geocode-proxy)'

export async function GET(request: NextRequest) {
  const allowed = await rateLimitFromRequest(request, 'geocode')
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const url = new URL(request.url)
  const mode = url.searchParams.get('mode')
  const acceptLang = url.searchParams.get('lang')?.trim() || 'az'

  try {
    if (mode === 'search') {
      const q = url.searchParams.get('q')?.trim()
      if (!q) {
        return NextResponse.json({ error: 'Missing q' }, { status: 400 })
      }
      const target = `${NOMINATIM}/search?q=${encodeURIComponent(`${q} Baku Azerbaijan`)}&format=json&limit=5&accept-language=${encodeURIComponent(acceptLang)}`
      const res = await fetch(target, {
        headers: {
          Accept: 'application/json',
          'User-Agent': USER_AGENT,
        },
        next: { revalidate: 0 },
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        return NextResponse.json(
          { error: `Upstream ${res.status}` },
          { status: res.status >= 500 ? 502 : 400 }
        )
      }
      return NextResponse.json(Array.isArray(data) ? data : [])
    }

    if (mode === 'reverse') {
      const lat = url.searchParams.get('lat')
      const lon = url.searchParams.get('lon')
      if (lat == null || lon == null || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) {
        return NextResponse.json({ error: 'Invalid lat/lon' }, { status: 400 })
      }
      const target = `${NOMINATIM}/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&format=json&accept-language=${encodeURIComponent(acceptLang)}`
      const res = await fetch(target, {
        headers: {
          Accept: 'application/json',
          'User-Agent': USER_AGENT,
        },
        next: { revalidate: 0 },
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        return NextResponse.json(
          { error: `Upstream ${res.status}` },
          { status: res.status >= 500 ? 502 : 400 }
        )
      }
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 502 })
  }
}
