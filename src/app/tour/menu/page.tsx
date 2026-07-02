'use client'

import { useEffect, useState, useMemo } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Search, Layers } from 'lucide-react'

interface Socio {
  id: string
  razonSocial: string
  etiqueta: string
  categoria: string
  direccion: string
  infoGeneral: string
  fotoPortada: string
  activo: boolean
  contacto: { whatsapp: string; email: string; web: string; redes: string }
  urlInternaTour: string
  urlInternaVuelta: string
}

const CATEGORIAS = [
  { key: 'todos', label: 'Todos' },
  { key: 'bodega', label: 'Bodegas' },
  { key: 'restaurante', label: 'Restaurantes' },
  { key: 'hotel', label: 'Hoteles' },
  { key: 'alojamiento', label: 'Alojamiento' },
  { key: 'servicio', label: 'Servicios' },
  { key: 'otro', label: 'Otros' },
]

const CAT_COLORS: Record<string, string> = {
  bodega: '#A855F7',
  restaurante: '#F59E0B',
  hotel: '#3B82F6',
  alojamiento: '#10B981',
  servicio: '#6366F1',
  otro: '#6B7280',
}

const MIN_OPACITY = 0.55
const MAX_OPACITY = 0.97
const CACHE_KEY = 'tour_socios_cache'
const CACHE_TTL = 5 * 60 * 1000

export default function TourMenuPage() {
  const [socios, setSocios] = useState<Socio[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [tab, setTab] = useState<'lugares' | 'informacion'>('lugares')
  const [opacity, setOpacity] = useState(0.85)

  useEffect(() => {
    document.body.style.background = 'transparent'
    document.documentElement.style.background = 'transparent'
  }, [])

  useEffect(() => {
    const cargar = async () => {
      // Intentar cache primero para carga instantánea
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { data, ts } = JSON.parse(cached)
          if (Date.now() - ts < CACHE_TTL) {
            setSocios(data)
            setLoading(false)
            return
          }
        }
      } catch {}

      try {
        const q = query(collection(db, 'socios'), orderBy('razonSocial', 'asc'))
        const snap = await getDocs(q)
        const data = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as Socio))
          .filter(s => s.activo !== false)
        setSocios(data)
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }))
        } catch {}
      } catch (err) {
        console.error('Error cargando socios:', err)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const categoriasConSocios = CATEGORIAS.filter(
    c => c.key === 'todos' || socios.some(s => s.categoria === c.key)
  )

  const filtrados = useMemo(() => {
    return socios.filter(s => {
      const coincideCategoria = filtro === 'todos' || s.categoria === filtro
      const q = busqueda.toLowerCase()
      const coincideBusqueda =
        q === '' ||
        s.razonSocial?.toLowerCase().includes(q) ||
        s.etiqueta?.toLowerCase().includes(q) ||
        s.direccion?.toLowerCase().includes(q)
      return coincideCategoria && coincideBusqueda
    })
  }, [socios, filtro, busqueda])

  const handleVerSocio = (socio: Socio) => {
    if (!socio.urlInternaTour) return
    try { window.top!.location.href = socio.urlInternaTour }
    catch { window.location.href = socio.urlInternaTour }
  }

  const bg = `rgba(15, 15, 25, ${opacity})`
  const borderColor = `rgba(255,255,255,${Math.min(opacity + 0.15, 0.4)})`

  return (
    <div
      className="min-h-screen w-full flex items-start justify-end p-3"
      style={{ background: 'transparent' }}
    >
      <div
        className="w-[320px] rounded-2xl flex flex-col"
        style={{
          background: bg,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: `1px solid ${borderColor}`,
          boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
          maxHeight: '88vh',
          transition: 'background 0.2s',
        }}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-white font-bold text-base leading-tight">
                Descubrí la zona
              </h2>
              <p className="text-white/60 text-[11px] mt-0.5">
                Bodegas, restaurantes, hoteles y servicios
              </p>
            </div>
            {/* Opacity control */}
            <div className="flex items-center gap-1.5 pt-1">
              <Layers size={12} className="text-white/40 flex-shrink-0" />
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(
                  ((opacity - MIN_OPACITY) / (MAX_OPACITY - MIN_OPACITY)) * 100
                )}
                onChange={e => {
                  const pct = Number(e.target.value) / 100
                  setOpacity(MIN_OPACITY + pct * (MAX_OPACITY - MIN_OPACITY))
                }}
                className="w-16 h-1 accent-white cursor-pointer opacity-70 hover:opacity-100 transition"
                title="Opacidad del panel"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mt-3 border-b border-white/15">
            {(['lugares', 'informacion'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-2 text-[11px] font-semibold tracking-wide transition"
                style={{
                  color: tab === t ? 'white' : 'rgba(255,255,255,0.45)',
                  borderBottom: tab === t ? '2px solid rgba(255,255,255,0.9)' : '2px solid transparent',
                }}
              >
                {t === 'lugares' ? '📍 Lugares' : 'ℹ️ Información'}
              </button>
            ))}
          </div>
        </div>

        {tab === 'lugares' ? (
          <>
            {/* Buscador */}
            <div className="px-4 pt-3 pb-2">
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <Search size={13} className="text-white/50 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar un lugar..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  className="bg-transparent text-white placeholder-white/35 text-[13px] flex-1 outline-none"
                />
              </div>
            </div>

            {/* Filtros */}
            {categoriasConSocios.length > 1 && (
              <div className="px-4 pb-3 flex gap-1.5 flex-wrap">
                {categoriasConSocios.map(cat => {
                  const active = filtro === cat.key
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setFiltro(cat.key)}
                      className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all"
                      style={{
                        background: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.10)',
                        color: active ? '#111' : 'rgba(255,255,255,0.80)',
                        border: active ? '1px solid transparent' : '1px solid rgba(255,255,255,0.22)',
                      }}
                    >
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Lista */}
            <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-2">
              {loading ? (
                // Skeleton loader
                <div className="space-y-2 pt-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-3 flex items-center gap-3 animate-pulse"
                      style={{ background: 'rgba(255,255,255,0.07)' }}
                    >
                      <div className="w-2 h-2 rounded-full bg-white/20 flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-white/15 rounded w-3/4" />
                        <div className="h-2 bg-white/10 rounded w-1/2" />
                      </div>
                      <div className="h-6 w-10 bg-white/10 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : filtrados.length === 0 ? (
                <p className="text-white/40 text-xs text-center py-8">
                  {socios.length === 0
                    ? 'No hay socios activos cargados'
                    : 'No hay lugares en esta categoría'}
                </p>
              ) : (
                filtrados.map(socio => (
                  <div
                    key={socio.id}
                    className="rounded-xl p-3 flex items-center justify-between gap-3"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.13)',
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: CAT_COLORS[socio.categoria] ?? '#9CA3AF' }}
                      />
                      <div className="min-w-0">
                        <p className="text-white text-[13px] font-semibold leading-tight truncate">
                          {socio.razonSocial}
                        </p>
                        <p className="text-white/50 text-[11px] truncate mt-0.5">
                          {socio.infoGeneral
                            ? socio.infoGeneral.substring(0, 42) + (socio.infoGeneral.length > 42 ? '…' : '')
                            : socio.direccion}
                        </p>
                      </div>
                    </div>
                    {socio.urlInternaTour ? (
                      <button
                        onClick={() => handleVerSocio(socio)}
                        className="text-white text-[11px] font-bold whitespace-nowrap flex-shrink-0 px-2.5 py-1 rounded-lg transition"
                        style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
                      >
                        Ver →
                      </button>
                    ) : (
                      <span className="text-white/25 text-[10px] flex-shrink-0">Sin tour</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="px-5 py-4 overflow-y-auto flex-1 text-white space-y-4">
            <div>
              <h3 className="font-bold text-sm mb-1.5">Mendoza Bureau</h3>
              <p className="text-white/65 text-[12px] leading-relaxed">
                Somos una asociación que agrupa a los principales socios corporativos
                de Mendoza, ofreciendo experiencias únicas en bodegas, gastronomía,
                hotelería y servicios.
              </p>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-sm">📍</span>
                <span className="text-white/70 text-[12px]">Mendoza, Argentina</span>
              </div>
              <a
                href="https://mendoza-bureau.vercel.app/web_bureau"
                onClick={e => { e.preventDefault(); try { window.top!.location.href = 'https://mendoza-bureau.vercel.app/web_bureau' } catch { window.open('https://mendoza-bureau.vercel.app/web_bureau', '_blank') } }}
                className="flex items-center gap-2.5 group"
              >
                <span className="text-sm">🌐</span>
                <span className="text-[12px] text-blue-300 underline group-hover:text-blue-200">mendozabureau.com</span>
              </a>
              <a
                href="mailto:info@mendozabureau.com"
                className="flex items-center gap-2.5 group"
              >
                <span className="text-sm">📧</span>
                <span className="text-[12px] text-blue-300 underline group-hover:text-blue-200">info@mendozabureau.com</span>
              </a>
              <a
                href="https://wa.me/5492614000000"
                onClick={e => { e.preventDefault(); try { window.top!.location.href = 'https://wa.me/5492614000000' } catch { window.open('https://wa.me/5492614000000', '_blank') } }}
                className="flex items-center gap-2.5 group"
              >
                <span className="text-sm">📱</span>
                <span className="text-[12px] text-green-300 underline group-hover:text-green-200">WhatsApp Bureau</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
