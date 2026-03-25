'use client'
import { useEffect, useRef, useState } from 'react'
import type { Icon, LeafletMouseEvent, Map as LeafletMap, Marker } from 'leaflet'
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

  type SuggestionItem = { lat: string; lon: string; display_name: string }
  const mapRef = useRef<{
    map: LeafletMap
    L: typeof import('leaflet')
    icon: Icon
  } | null>(null)
  const markerRef = useRef<Marker | null>(null)
  const mapDivRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selected, setSelected] = useState('')
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  const placeMarker = (lat: number, lng: number, addr: string, map: LeafletMap, L: typeof import('leaflet'), icon: Icon) => {
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
      map.on('click', async (e: LeafletMouseEvent) => {
        const { lat, lng } = e.latlng
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=az`
          )
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()
          const addr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
          placeMarker(lat, lng, addr, map, L, icon)
        } catch {
          if (cancelled) return
          setFetchError(
            lang === 'ru'
              ? 'Не удалось получить адрес по клику на карте'
              : lang === 'en'
                ? 'Failed to get address from map click'
                : 'Xəritədə klikdən ünvan alınmadı'
          )
        }
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
    setFetchError(null)

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search + ' Baku Azerbaijan')}&format=json&limit=5&accept-language=az`
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as SuggestionItem[]
      setSuggestions(data)
    } catch {
      setFetchError(
        lang === 'ru'
          ? 'Не удалось выполнить поиск адреса'
          : lang === 'en'
            ? 'Failed to search address'
            : 'Ünvan axtarışı alınmadı'
      )
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const selectSuggestion = (item: SuggestionItem) => {
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
          className="flex-1 ds-input"
          placeholder={tr.mapSearch[lang]}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          type="button"
          onClick={handleSearch}
          className="ds-btn-secondary whitespace-nowrap"
        >
          {loading ? '...' : tr.mapSearchBtn[lang]}
        </button>
      </div>
      {fetchError && (
        <p className="text-xs text-red-300/90 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {fetchError}
        </p>
      )}
      {suggestions.length > 0 && (
        <div className="border border-white/10 bg-white/5 rounded-lg max-h-40 overflow-y-auto">
          {suggestions.map((s, i) => (
            <div
              key={i}
              onClick={() => selectSuggestion(s)}
              className="p-2 text-sm text-white/80 hover:bg-white/5 cursor-pointer border-b border-white/10 last:border-0"
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
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      />
      {selected ? (
        <div className="flex items-start gap-2 p-3 bg-[rgba(45,198,83,0.12)] border border-[rgba(45,198,83,0.25)] rounded-lg text-sm text-[rgba(45,198,83,0.95)]">
          <span>✓</span>
          <span>{selected}</span>
        </div>
      ) : (
        <p className="text-xs text-white/60">{tr.mapHint[lang]}</p>
      )}
    </div>
  )
}
