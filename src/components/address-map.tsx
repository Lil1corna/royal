'use client'
import { useEffect, useRef, useState } from 'react'
import { useLang, translations } from '@/context/lang'

export type AddressMapProps = {
  onSelect: (address: string, lat: number, lng: number) => void
  /** Начальная точка (профиль / сохранённый адрес) */
  initialLat?: number | null
  initialLng?: number | null
  initialAddress?: string
}

export default function AddressMap({
  onSelect,
  initialLat,
  initialLng,
  initialAddress,
}: AddressMapProps) {
  const { lang } = useLang()
  const tr = translations
  const mapRef = useRef<{
    map: any
    L: any
    icon: any
  } | null>(null)
  const markerRef = useRef<any>(null)
  const mapDivRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState('')
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  const placeMarker = (lat: number, lng: number, addr: string, map: any, L: any, icon: any) => {
    if (markerRef.current) markerRef.current.remove()
    markerRef.current = L.marker([lat, lng], { icon }).addTo(map)
    map.setView([lat, lng], 16)
    setSelected(addr)
    setSearch(addr)
    onSelectRef.current(addr, lat, lng)
    setSuggestions([])
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    let cancelled = false
    import('leaflet').then((L) => {
      if (cancelled || mapRef.current || !mapDivRef.current) return
      const centerLat = initialLat != null && Number.isFinite(initialLat) ? initialLat : 40.4093
      const centerLng = initialLng != null && Number.isFinite(initialLng) ? initialLng : 49.8671
      const startZoom = initialLat != null && initialLng != null ? 16 : 12
      const map = L.map(mapDivRef.current!, { center: [centerLat, centerLng], zoom: startZoom })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'OpenStreetMap',
      }).addTo(map)
      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      })
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=az`
        )
        const data = await res.json()
        const addr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        placeMarker(lat, lng, addr, map, L, icon)
      })
      mapRef.current = { map, L, icon }

      if (
        initialLat != null &&
        initialLng != null &&
        Number.isFinite(initialLat) &&
        Number.isFinite(initialLng)
      ) {
        const addr =
          initialAddress?.trim() ||
          `${initialLat.toFixed(5)}, ${initialLng.toFixed(5)}`
        placeMarker(initialLat, initialLng, addr, map, L, icon)
      }
    })
    return () => {
      cancelled = true
      if (mapRef.current?.map) {
        mapRef.current.map.remove()
        mapRef.current = null
      }
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once; initial* captured at first paint
  }, [])

  const handleSearch = async () => {
    if (!search.trim()) return
    setLoading(true)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search + ' Baku Azerbaijan')}&format=json&limit=5&accept-language=az`
    )
    const data = await res.json()
    setSuggestions(data)
    setLoading(false)
  }

  const selectSuggestion = (item: any) => {
    const lat = parseFloat(item.lat)
    const lng = parseFloat(item.lon)
    const r = mapRef.current
    if (!r) return
    const { map, L, icon } = r
    placeMarker(lat, lng, item.display_name, map, L, icon)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg p-2 text-sm"
          placeholder={tr.mapSearch[lang]}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          type="button"
          onClick={handleSearch}
          className="bg-black text-white px-4 rounded-lg text-sm whitespace-nowrap"
        >
          {loading ? '...' : tr.mapSearchBtn[lang]}
        </button>
      </div>
      {suggestions.length > 0 && (
        <div className="border rounded-lg max-h-40 overflow-y-auto">
          {suggestions.map((s, i) => (
            <div
              key={i}
              onClick={() => selectSuggestion(s)}
              className="p-2 text-sm hover:bg-gray-50 cursor-pointer border-b last:border-0"
            >
              {s.display_name}
            </div>
          ))}
        </div>
      )}
      <div
        ref={mapDivRef}
        style={{
          height: '360px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
        }}
      />
      {selected ? (
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <span>✓</span>
          <span>{selected}</span>
        </div>
      ) : (
        <p className="text-xs text-gray-400">{tr.mapHint[lang]}</p>
      )}
    </div>
  )
}
