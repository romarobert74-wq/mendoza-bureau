'use client'

import { useEffect, useState, useMemo } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Search, Layers, ArrowDownUp } from 'lucide-react'

interface Socio {
  id: string
  razonSocial: string
  etiqueta: string
  categoria: string
  direccion: string
  infoGeneral: string
  urlInternaTour: string
  urlInternaVuelta: string
}

// Cuántas tarjetas se pintan de entrada; el resto aparece enseguida (no bloquea)
const PRIMERA_TANDA = 10

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
  const [visibles, setVisibles] = useState(PRIMERA_TANDA)   // render progresivo
  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [tab, setTab] = useState<'lugares' | 'informacion'>('lugares')
  const [orden, setOrden] = useState<'az' | 'za' | 'categoria'>('az')
  const [opacity, setOpacity] = useState(0.85)
  const [logoUrl, setLogoUrl] = useState('')
  // Socio resaltado desde el panorama (hotspot con hover en 3DVista)
  const [resaltado, setResaltado] = useState<string | null>(null)

  useEffect(() => {
    document.body.style.background = 'transparent'
    document.documentElement.style.background = 'transparent'
  }, [])

  useEffect(() => {
    let cancelado = false
    const cargar = async () => {
      // 1) Cache local para pintado instantáneo (aunque después revalidamos)
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { data, ts } = JSON.parse(cached)
          if (Array.isArray(data) && Date.now() - ts < CACHE_TTL) {
            setSocios(data)
            setLoading(false)
          }
        }
      } catch {}

      // 2) Endpoint liviano (solo texto, sin fotos base64) + caché en el edge.
      try {
        const res = await fetch('/api/socios-menu')
        if (!res.ok) throw new Error('bad status')
        const data = (await res.json()) as Socio[]
        if (!Array.isArray(data) || data.length === 0) throw new Error('vacío')
        if (cancelado) return
        setSocios(data)
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })) } catch {}
        if (!cancelado) setLoading(false)
        return
      } catch (err) {
        console.error('Endpoint liviano no disponible, usando Firestore directo:', err)
      }

      // 3) Fallback: carga directa desde Firestore (comportamiento original).
      try {
        const q = query(collection(db, 'socios'), orderBy('razonSocial', 'asc'))
        const snap = await getDocs(q)
        const data = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as Socio & { activo?: boolean }))
          .filter(s => s.activo !== false)
        if (cancelado) return
        setSocios(data)
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })) } catch {}
      } catch (err) {
        console.error('Error cargando socios:', err)
      } finally {
        if (!cancelado) setLoading(false)
      }
    }
    cargar()
    return () => { cancelado = true }
  }, [])

  // Logo del Bureau (configurado en el panel). Falla en silencio si no hay acceso.
  useEffect(() => {
    import('firebase/firestore').then(async ({ doc, getDoc }) => {
      try {
        const snap = await getDoc(doc(db, 'configuracion', 'sistema'))
        if (snap.exists() && snap.data().logoUrl) setLogoUrl(snap.data().logoUrl as string)
      } catch {}
    })
  }, [])

  // Cantidad de socios por categoría (para los contadores en los chips)
  const conteos = useMemo(() => {
    const c: Record<string, number> = { todos: socios.length }
    for (const s of socios) c[s.categoria] = (c[s.categoria] ?? 0) + 1
    return c
  }, [socios])

  const categoriasConSocios = CATEGORIAS.filter(
    c => c.key === 'todos' || socios.some(s => s.categoria === c.key)
  )

  // ── Puente con 3DVista (postMessage) ────────────────────────────────────────
  // Emite hacia el tour (padre) para resaltar/activar el hotspot correspondiente.
  const emitir = (msg: Record<string, unknown>) => {
    const payload = { source: 'bureau-menu', ...msg }
    try { window.parent?.postMessage(payload, '*') } catch {}
    try { if (window.top && window.top !== window.parent) window.top.postMessage(payload, '*') } catch {}
  }

  // Escucha del tour: cuando el hotspot de una categoría recibe hover en 3DVista,
  // resaltamos las tarjetas de esa categoría.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data
      if (!d || d.source !== 'bureau-tour') return
      if (d.type === 'hotspot-hover') setResaltado(d.categoria ?? null)
      if (d.type === 'hotspot-out') setResaltado(null)
      if (d.type === 'hotspot-click' && d.categoria) { setFiltro(d.categoria); setTab('lugares') }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  // Al cambiar de filtro, avisamos al tour cuál categoría quedó activa (punto 4).
  useEffect(() => { emitir({ type: 'filtro', categoria: filtro }) }, [filtro])

  const filtrados = useMemo(() => {
    const lista = socios.filter(s => {
      const coincideCategoria = filtro === 'todos' || s.categoria === filtro
      const q = busqueda.toLowerCase()
      const coincideBusqueda =
        q === '' ||
        s.razonSocial?.toLowerCase().includes(q) ||
        s.etiqueta?.toLowerCase().includes(q) ||
        s.direccion?.toLowerCase().includes(q)
      return coincideCategoria && coincideBusqueda
    })
    const cmp = (a: Socio, b: Socio) =>
      (a.razonSocial || '').localeCompare(b.razonSocial || '', 'es', { sensitivity: 'base' })
    if (orden === 'az') return [...lista].sort(cmp)
    if (orden === 'za') return [...lista].sort((a, b) => cmp(b, a))
    // por categoría, y dentro de cada una alfabético
    return [...lista].sort((a, b) =>
      (a.categoria || '').localeCompare(b.categoria || '') || cmp(a, b))
  }, [socios, filtro, busqueda, orden])

  // Render progresivo: pinta la primera tanda al toque y el resto en el próximo
  // frame, para que el panel aparezca sin esperar a dibujar las 50 tarjetas.
  useEffect(() => { setVisibles(PRIMERA_TANDA) }, [filtro, busqueda, orden])
  useEffect(() => {
    if (filtrados.length > visibles) {
      const t = requestAnimationFrame(() => setVisibles(filtrados.length))
      return () => cancelAnimationFrame(t)
    }
  }, [filtrados.length, visibles])

  const mostrados = filtrados.slice(0, visibles)

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
            <div className="flex items-center gap-2.5">
              {logoUrl && (
                <img src={logoUrl} alt="Logo" className="w-9 h-9 rounded-lg object-contain shrink-0"
                  style={{ background: 'rgba(255,255,255,0.08)' }} />
              )}
              <div>
                <h2 className="text-white font-bold text-base leading-tight">
                  Descubrí la zona
                </h2>
                <p className="text-white/60 text-[11px] mt-0.5">
                  Bodegas, restaurantes, hoteles y servicios
                </p>
              </div>
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

            {/* Filtros con contador por categoría */}
            {categoriasConSocios.length > 1 && (
              <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
                {categoriasConSocios.map(cat => {
                  const active = filtro === cat.key
                  const n = conteos[cat.key] ?? 0
                  const dot = CAT_COLORS[cat.key]
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setFiltro(cat.key)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1.5"
                      style={{
                        background: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.10)',
                        color: active ? '#111' : 'rgba(255,255,255,0.80)',
                        border: active ? '1px solid transparent' : '1px solid rgba(255,255,255,0.22)',
                      }}
                    >
                      {dot && !active && (
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
                      )}
                      {cat.label}
                      <span
                        className="text-[10px] font-bold rounded-full px-1.5 leading-[15px] min-w-[16px] text-center"
                        style={{
                          background: active ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.14)',
                          color: active ? '#111' : 'rgba(255,255,255,0.65)',
                        }}
                      >
                        {n}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Orden + total de resultados */}
            <div className="px-4 pb-3 flex items-center justify-between">
              <span className="text-white/40 text-[10px]">
                {filtrados.length} {filtrados.length === 1 ? 'lugar' : 'lugares'}
              </span>
              <div className="flex items-center gap-1">
                <ArrowDownUp size={11} className="text-white/40" />
                <select
                  value={orden}
                  onChange={e => setOrden(e.target.value as typeof orden)}
                  className="bg-transparent text-white/70 text-[11px] outline-none cursor-pointer"
                  style={{ colorScheme: 'dark' }}
                  title="Ordenar"
                >
                  <option value="az">Nombre A–Z</option>
                  <option value="za">Nombre Z–A</option>
                  <option value="categoria">Por categoría</option>
                </select>
              </div>
            </div>

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
                mostrados.map(socio => {
                  const cat = CAT_COLORS[socio.categoria] ?? '#9CA3AF'
                  const hl = resaltado === socio.categoria     // resaltado desde el hotspot
                  return (
                  <div
                    key={socio.id}
                    onMouseEnter={() => emitir({ type: 'hover', categoria: socio.categoria, id: socio.id })}
                    onMouseLeave={() => emitir({ type: 'hover-out' })}
                    className="rounded-xl p-3 flex items-center justify-between gap-3 transition-all"
                    style={{
                      background: hl ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)',
                      border: `1px solid ${hl ? cat : 'rgba(255,255,255,0.13)'}`,
                      boxShadow: hl ? `0 0 0 1px ${cat}, 0 4px 14px rgba(0,0,0,0.25)` : 'none',
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: cat }}
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
                  )
                })
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
