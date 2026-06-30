'use client'

import { useEffect, useState, useMemo } from 'react'
import { Search } from 'lucide-react'

interface Socio {
  id: string
  razonSocial: string
  etiqueta: string
  categoria: string
  direccion: string
  infoGeneral: string
  fotoPortada: string
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
  bodega: '#8B5CF6',
  restaurante: '#F59E0B',
  hotel: '#3B82F6',
  alojamiento: '#10B981',
  servicio: '#6366F1',
  otro: '#6B7280',
}

export default function TourMenuPage() {
  const [socios, setSocios] = useState<Socio[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [tab, setTab] = useState<'lugares' | 'informacion'>('lugares')

  useEffect(() => {
    document.body.style.background = 'transparent'
    document.documentElement.style.background = 'transparent'
  }, [])

  useEffect(() => {
    fetch('/api/socios-public')
      .then(r => r.json())
      .then(data => {
        setSocios(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtrados = useMemo(() => {
    return socios.filter(s => {
      const coincideCategoria = filtro === 'todos' || s.categoria === filtro
      const coincideBusqueda =
        busqueda === '' ||
        s.razonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.etiqueta.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.direccion?.toLowerCase().includes(busqueda.toLowerCase())
      return coincideCategoria && coincideBusqueda
    })
  }, [socios, filtro, busqueda])

  const categoriasConSocios = CATEGORIAS.filter(
    c => c.key === 'todos' || socios.some(s => s.categoria === c.key)
  )

  const handleVerSocio = (socio: Socio) => {
    if (!socio.urlInternaTour) return
    window.top!.location.href = socio.urlInternaTour
  }

  return (
    <div
      className="min-h-screen w-full flex items-start justify-end p-4"
      style={{ background: 'transparent' }}
    >
      <div
        className="w-[340px] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.35)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          maxHeight: '85vh',
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-white font-bold text-lg leading-tight drop-shadow">
            Descubrí la zona
          </h2>
          <p className="text-white/70 text-xs mt-0.5">
            Bodegas, restaurantes, hoteles y servicios
          </p>

          {/* Tabs */}
          <div className="flex gap-1 mt-3 border-b border-white/20">
            <button
              onClick={() => setTab('lugares')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition rounded-t-lg ${
                tab === 'lugares'
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <span>📍</span> Lugares
            </button>
            <button
              onClick={() => setTab('informacion')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition rounded-t-lg ${
                tab === 'informacion'
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <span>ℹ️</span> Información
            </button>
          </div>
        </div>

        {tab === 'lugares' ? (
          <>
            {/* Buscador */}
            <div className="px-4 py-2">
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                <Search size={14} className="text-white/60" />
                <input
                  type="text"
                  placeholder="Buscar un lugar..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  className="bg-transparent text-white placeholder-white/40 text-sm flex-1 outline-none"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
              {categoriasConSocios.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setFiltro(cat.key)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition"
                  style={{
                    background:
                      filtro === cat.key
                        ? 'rgba(255,255,255,0.9)'
                        : 'rgba(255,255,255,0.15)',
                    color: filtro === cat.key ? '#1a1a1a' : 'rgba(255,255,255,0.85)',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Lista */}
            <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                </div>
              ) : filtrados.length === 0 ? (
                <p className="text-white/50 text-sm text-center py-8">
                  No hay lugares en esta categoría
                </p>
              ) : (
                filtrados.map(socio => (
                  <div
                    key={socio.id}
                    className="rounded-xl p-3 flex items-center justify-between gap-3 transition"
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: CAT_COLORS[socio.categoria] || '#9CA3AF' }}
                      />
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold leading-tight truncate">
                          {socio.razonSocial}
                        </p>
                        <p className="text-white/55 text-xs truncate mt-0.5">
                          {socio.infoGeneral
                            ? socio.infoGeneral.substring(0, 45) + (socio.infoGeneral.length > 45 ? '…' : '')
                            : socio.direccion}
                        </p>
                      </div>
                    </div>
                    {socio.urlInternaTour && (
                      <button
                        onClick={() => handleVerSocio(socio)}
                        className="text-white/80 hover:text-white text-xs font-medium whitespace-nowrap transition flex-shrink-0"
                      >
                        Ver →
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* Tab Información */
          <div className="px-5 py-4 overflow-y-auto flex-1">
            <InfoBureau />
          </div>
        )}
      </div>
    </div>
  )
}

function InfoBureau() {
  return (
    <div className="space-y-4 text-white">
      <div>
        <h3 className="font-bold text-base mb-1">Mendoza Bureau</h3>
        <p className="text-white/70 text-xs leading-relaxed">
          Somos una asociación que agrupa a los principales socios corporativos de Mendoza,
          ofreciendo experiencias únicas en bodegas, gastronomía, hotelería y servicios.
        </p>
      </div>
      <div className="space-y-2">
        <InfoRow icon="📍" text="Mendoza, Argentina" />
        <InfoRow icon="🌐" text="mendozabureau.com" />
        <InfoRow icon="📧" text="info@mendozabureau.com" />
        <InfoRow icon="📱" text="WhatsApp Bureau" />
      </div>
    </div>
  )
}

function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-sm">{icon}</span>
      <span className="text-white/75 text-xs">{text}</span>
    </div>
  )
}
