'use client'
import { useEffect, useRef, useState } from 'react'
import type { Icon, LeafletMouseEvent, Map as LeafletMap, Marker } from 'leaflet'
import { useLang, translations } from '@/context/lang'

export function buildGoogleMapsUrl(lat: number, lng: number): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`
}

export type AddressMapProps = {
  /** Human-readable address, coordinates, and deep link for opening in Maps apps */
  onSelect: (address: string, lat: number, lng: number, mapsUrl: string) => void
  /** Начальная точка (профиль / сохранённый адрес) */
  initialLat?: number | null
  initialLng?: number | null
  initialAddress?: string
  /**
   * When true, initial pin from `initialLat`/`initialLng` does not call `onSelect`.
   * Use while reopening the map to change an already locked delivery pin (parent would otherwise close the map immediately).
   */
  suppressInitialSelect?: boolean
  /** Optional className for the map tile container */
  mapContainerClassName?: string
}

export default function AddressMap({
  onSelect,
  initialLat,
  initialLng,
  initialAddress,
  suppressInitialSelect = false,
  mapContainerClassName,
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

  /** Move marker + local UI. Only pass `notify: true` on real user actions so parents can close the map without remount re-firing `onSelect`. */
  const putMarker = (
    lat: number,
    lng: number,
    addr: string,
    map: LeafletMap,
    L: typeof import('leaflet'),
    icon: Icon,
    notify: boolean
  ) => {
    if (markerRef.current) markerRef.current.remove()
    markerRef.current = L.marker([lat, lng], { icon }).addTo(map)
    map.setView([lat, lng], 16)
    setSelected(addr)
    setSearch(addr)
    setFetchError(null)
    setSuggestions([])
    if (notify) {
      onSelectRef.current(addr, lat, lng, buildGoogleMapsUrl(lat, lng))
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    let cancelled = false
    let resizeHandler: (() => void) | null = null
    let sizeTimerId: number | null = null
    import('leaflet').then((L) => {
      if (cancelled || mapRef.current || !mapDivRef.current) return
      const centerLat = initialLat != null && Number.isFinite(initialLat) ? initialLat : 40.4093
      const centerLng = initialLng != null && Number.isFinite(initialLng) ? initialLng : 49.8671
      const startZoom = initialLat != null && initialLng != null ? 16 : 12
      const map = L.map(mapDivRef.current!, {
        center: [centerLat, centerLng],
        zoom: startZoom,
        // @ts-expect-error Leaflet supports tap; older @types/leaflet omit it.
        tap: false,
      })
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
        const coordLabel = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        try {
          const res = await fetch(
            `/api/geocode?mode=reverse&lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lng))}&lang=${encodeURIComponent(lang)}`,
            { headers: { Accept: 'application/json' } }
          )
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = (await res.json()) as { display_name?: string; error?: string }
          if (data && typeof data === 'object' && 'error' in data && !('display_name' in data)) {
            throw new Error(data.error || 'geocode error')
          }
          const addr = data.display_name?.trim() || coordLabel
          putMarker(lat, lng, addr, map, L, icon, true)
        } catch {
          if (cancelled) return
          putMarker(lat, lng, coordLabel, map, L, icon, true)
          setFetchError(
            lang === 'ru'
              ? 'Точка выбрана; текст адреса по координатам не загрузился (проверьте сеть).'
              : lang === 'en'
                ? 'Location saved; address text could not be loaded (check your connection).'
                : 'Nöqtə seçildi; ünvan mətni yüklənmədi (şəbəkəni yoxlayın).'
          )
        }
      })
      mapRef.current = { map, L, icon }

      const fixSize = () => {
        try {
          map.invalidateSize({ animate: false })
        } catch {
          /* ignore */
        }
      }
      resizeHandler = fixSize
      requestAnimationFrame(fixSize)
      sizeTimerId = window.setTimeout(fixSize, 200)
      window.addEventListener('resize', fixSize)

      if (
        initialLat != null &&
        initialLng != null &&
        Number.isFinite(initialLat) &&
        Number.isFinite(initialLng)
      ) {
        const addr =
          initialAddress?.trim() ||
          `${initialLat.toFixed(5)}, ${initialLng.toFixed(5)}`
        putMarker(initialLat, initialLng, addr, map, L, icon, !suppressInitialSelect)
      }
    })
    return () => {
      cancelled = true
      if (sizeTimerId != null) window.clearTimeout(sizeTimerId)
      if (resizeHandler != null) window.removeEventListener('resize', resizeHandler)
      if (mapRef.current?.map) {
        mapRef.current.map.remove()
        mapRef.current = null
      }
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Leaflet init once per mount; initial* from first paint
  }, [suppressInitialSelect])

  const handleSearch = async () => {
    if (!search.trim()) return
    setLoading(true)
    setFetchError(null)

    try {
      const res = await fetch(
        `/api/geocode?mode=search&q=${encodeURIComponent(search)}&lang=${encodeURIComponent(lang)}`
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as SuggestionItem[] | { error?: string }
      if (data && typeof data === 'object' && !Array.isArray(data) && 'error' in data) {
        throw new Error((data as { error: string }).error)
      }
      const list = Array.isArray(data) ? data : []
      setSuggestions(list)
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
    putMarker(lat, lng, item.display_name, map, L, icon, true)
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
        className={
          mapContainerClassName ??
          'h-[280px] md:h-[320px] w-full rounded-xl overflow-hidden border border-white/[0.08]'
        }
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
