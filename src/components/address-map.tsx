'use client'
import { useEffect, useRef, useState } from 'react'

type Props = {
  onSelect: (address: string, lat: number, lng: number) => void
}

export default function AddressMap({ onSelect }: Props) {
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const mapDivRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    import('leaflet').then(L => {
      if (mapRef.current) return
      const map = L.map(mapDivRef.current!, { center: [40.4093, 49.8671], zoom: 12 })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'OpenStreetMap',
      }).addTo(map)
      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41],
      })
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng
        if (markerRef.current) markerRef.current.remove()
        markerRef.current = L.marker([lat, lng], { icon }).addTo(map)
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=az`
        )
        const data = await res.json()
        const addr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        setSelected(addr)
        setSearch(addr)
        onSelect(addr, lat, lng)
        setSuggestions([])
      })
      mapRef.current = { map, L, icon }
    })
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
    const { map, L, icon } = mapRef.current
    map.setView([lat, lng], 16)
    if (markerRef.current) markerRef.current.remove()
    markerRef.current = L.marker([lat, lng], { icon }).addTo(map)
    setSelected(item.display_name)
    setSearch(item.display_name)
    onSelect(item.display_name, lat, lng)
    setSuggestions([])
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input className="flex-1 border rounded-lg p-2 text-sm"
          placeholder="Kuce, ev nomresi axtar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <button type="button" onClick={handleSearch}
          className="bg-black text-white px-4 rounded-lg text-sm whitespace-nowrap">
          {loading ? '...' : 'Axtar'}
        </button>
      </div>
      {suggestions.length > 0 && (
        <div className="border rounded-lg max-h-40 overflow-y-auto">
          {suggestions.map((s, i) => (
            <div key={i} onClick={() => selectSuggestion(s)}
              className="p-2 text-sm hover:bg-gray-50 cursor-pointer border-b last:border-0">
              {s.display_name}
            </div>
          ))}
        </div>
      )}
      <div ref={mapDivRef} style={{ height: '360px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }} />
      {selected ? (
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <span>✓</span>
          <span>{selected}</span>
        </div>
      ) : (
        <p className="text-xs text-gray-400">Xeritada klikleyin ve ya adres axtar</p>
      )}
    </div>
  )
}
