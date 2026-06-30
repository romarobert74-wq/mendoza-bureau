'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { collection, getDocs, orderBy, query, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Search, ExternalLink, FileText, ChevronDown, Mail, Phone, Globe, MapPin, Menu, X } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface DirectivaMember { nombre: string; cargo: string; foto: string }

interface Config {
  heroTitulo: string
  heroSubtitulo: string
  heroImagen: string
  sobreNosotros: string
  mision: string
  contactoWhatsapp: string
  contactoEmail: string
  directiva: DirectivaMember[]
}

interface Socio {
  id: string; razonSocial: string; etiqueta: string; categoria: string
  infoGeneral: string; fotoPortada: string; direccion: string
  urlInternaTour: string; activo: boolean
  contacto?: { web?: string; whatsapp?: string }
}

interface PrensaItem {
  id: string; titulo: string; resumen: string; contenido: string
  imagen: string; fecha: string; activo: boolean
}

interface GraficoDato { label: string; valor: number }
interface Grafico { tipo: 'barra' | 'linea'; titulo: string; datos: GraficoDato[]; unidad: string }

interface ObsItem {
  id: string; titulo: string; descripcion: string; fuente: string
  fecha: string; pdfBase64: string; grafico?: Grafico; activo: boolean
}

// ── Brand colors ───────────────────────────────────────────────────────────────

const BRAND = '#E85D04'
const BRAND2 = '#C0391B'
const CAT_LABELS: Record<string, string> = {
  bodega: 'Bodegas', restaurante: 'Restaurantes', hotel: 'Hoteles',
  alojamiento: 'Alojamiento', servicio: 'Servicios', otro: 'Otros',
}
const CAT_COLORS: Record<string, string> = {
  bodega: '#A855F7', restaurante: '#F59E0B', hotel: '#3B82F6',
  alojamiento: '#10B981', servicio: '#6366F1', otro: '#6B7280',
}

const CONFIG_DEFAULT: Config = {
  heroTitulo: 'Bienvenidos a Mendoza Bureau',
  heroSubtitulo: 'Convention & Visitors Bureau — El destino corporativo líder de Argentina',
  heroImagen: '',
  sobreNosotros: 'Somos una asociación que agrupa a los principales actores del turismo corporativo y de reuniones de Mendoza, trabajando en sinergia para posicionar a la provincia como destino de primer nivel.',
  mision: '¿Por qué elegir Mendoza como destino corporativo? Mendoza combina infraestructura de clase mundial con la majestuosidad de los Andes, una gastronomía única y bodegas de renombre internacional. Ideal para eventos, incentivos y reuniones de negocios.',
  contactoWhatsapp: '',
  contactoEmail: 'info@mendozabureau.com',
  directiva: [],
}

// ── Chart SVG ─────────────────────────────────────────────────────────────────

function BarChart({ grafico }: { grafico: Grafico }) {
  const { datos, titulo, unidad } = grafico
  if (!datos?.length) return null
  const max = Math.max(...datos.map(d => d.valor))
  const H = 140
  const barW = Math.max(16, Math.min(48, 320 / datos.length - 8))

  return (
    <div>
      {titulo && <p className="text-xs font-semibold text-gray-600 mb-2">{titulo}</p>}
      <div className="overflow-x-auto">
        <svg width={Math.max(300, datos.length * (barW + 8) + 20)} height={H + 40} className="block">
          <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND} />
              <stop offset="100%" stopColor={BRAND2} />
            </linearGradient>
          </defs>
          {datos.map((d, i) => {
            const bh = max > 0 ? (d.valor / max) * H : 0
            const x = 10 + i * (barW + 8)
            const y = H - bh
            return (
              <g key={i}>
                <rect x={x} y={y} width={barW} height={bh} rx={4} fill="url(#bg)" />
                <text x={x + barW / 2} y={H + 14} textAnchor="middle" fontSize={9} fill="#6B7280">{d.label}</text>
                <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={9} fill={BRAND} fontWeight="600">
                  {d.valor >= 1000 ? `${(d.valor / 1000).toFixed(0)}k` : d.valor}
                </text>
              </g>
            )
          })}
          <line x1={8} y1={0} x2={8} y2={H} stroke="#E5E7EB" strokeWidth={1} />
          <line x1={8} y1={H} x2={datos.length * (barW + 8) + 10} y2={H} stroke="#E5E7EB" strokeWidth={1} />
        </svg>
      </div>
      {unidad && <p className="text-[10px] text-gray-400 mt-1">Unidad: {unidad}</p>}
    </div>
  )
}

function LineChart({ grafico }: { grafico: Grafico }) {
  const { datos, titulo, unidad } = grafico
  if (!datos?.length) return null
  const max = Math.max(...datos.map(d => d.valor))
  const min = Math.min(...datos.map(d => d.valor))
  const H = 120
  const W = 300
  const pad = 10

  const pts = datos.map((d, i) => {
    const x = pad + (i / (datos.length - 1 || 1)) * (W - pad * 2)
    const y = H - pad - ((d.valor - min) / ((max - min) || 1)) * (H - pad * 2)
    return { x, y, ...d }
  })

  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const area = `${path} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`

  return (
    <div>
      {titulo && <p className="text-xs font-semibold text-gray-600 mb-2">{titulo}</p>}
      <svg width="100%" viewBox={`0 0 ${W} ${H + 20}`}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND} stopOpacity={0.25} />
            <stop offset="100%" stopColor={BRAND} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#areaGrad)" />
        <path d={path} fill="none" stroke={BRAND} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill="white" stroke={BRAND} strokeWidth={2} />
            <text x={p.x} y={H + 16} textAnchor="middle" fontSize={9} fill="#6B7280">{p.label}</text>
          </g>
        ))}
      </svg>
      {unidad && <p className="text-[10px] text-gray-400 mt-1">Unidad: {unidad}</p>}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function WebBureauPage() {
  const [config, setConfig] = useState<Config>(CONFIG_DEFAULT)
  const [socios, setSocios] = useState<Socio[]>([])
  const [prensa, setPrensas] = useState<PrensaItem[]>([])
  const [obs, setObs] = useState<ObsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroSocio, setFiltroSocio] = useState('todos')
  const [busquedaSocio, setBusquedaSocio] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [presnaExpandida, setPrensaExpandida] = useState<string | null>(null)

  const secRefs = {
    inicio: useRef<HTMLDivElement>(null),
    socios: useRef<HTMLDivElement>(null),
    sobre: useRef<HTMLDivElement>(null),
    prensa: useRef<HTMLDivElement>(null),
    obs: useRef<HTMLDivElement>(null),
    contacto: useRef<HTMLDivElement>(null),
  }

  useEffect(() => {
    const load = async () => {
      try {
        const [cfgSnap, sociosSnap, prensaSnap, obsSnap] = await Promise.all([
          getDoc(doc(db, 'web_bureau', 'config')),
          getDocs(query(collection(db, 'socios'), orderBy('razonSocial', 'asc'))),
          getDocs(query(collection(db, 'web_bureau_prensa'), orderBy('fecha', 'desc'))),
          getDocs(query(collection(db, 'web_bureau_observatorio'), orderBy('fecha', 'desc'))),
        ])
        if (cfgSnap.exists()) setConfig({ ...CONFIG_DEFAULT, ...cfgSnap.data() } as Config)
        setSocios(sociosSnap.docs.map(d => ({ id: d.id, ...d.data() } as Socio)).filter(s => s.activo !== false))
        setPrensas(prensaSnap.docs.map(d => ({ id: d.id, ...d.data() } as PrensaItem)).filter(p => p.activo !== false))
        setObs(obsSnap.docs.map(d => ({ id: d.id, ...d.data() } as ObsItem)).filter(o => o.activo !== false))
      } catch (e) { console.error(e) } finally { setLoading(false) }
    }
    load()
  }, [])

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMenuOpen(false)
  }

  const categoriasPresentes = useMemo(() => {
    const cats = Array.from(new Set(socios.map(s => s.categoria))).filter(c => CAT_LABELS[c])
    return [{ key: 'todos', label: 'Todos' }, ...cats.map(c => ({ key: c, label: CAT_LABELS[c] }))]
  }, [socios])

  const sociosFiltrados = useMemo(() => socios.filter(s => {
    const catOk = filtroSocio === 'todos' || s.categoria === filtroSocio
    const q = busquedaSocio.toLowerCase()
    const busOk = !q || s.razonSocial?.toLowerCase().includes(q) || s.etiqueta?.toLowerCase().includes(q)
    return catOk && busOk
  }), [socios, filtroSocio, busquedaSocio])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${BRAND} transparent ${BRAND} ${BRAND}` }} />
        <p className="text-gray-400 text-sm">Cargando Mendoza Bureau...</p>
      </div>
    </div>
  )

  const navItems = [
    { label: 'Inicio', ref: secRefs.inicio },
    { label: 'Sobre Nosotros', ref: secRefs.sobre },
    { label: 'Socios', ref: secRefs.socios },
    { label: 'Prensa', ref: secRefs.prensa },
    { label: 'Observatorio', ref: secRefs.obs },
    { label: 'Contacto', ref: secRefs.contacto },
  ]

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 shadow-md" style={{ background: BRAND }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-white text-lg">M</div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Mendoza Bureau</p>
              <p className="text-white/70 text-[10px] leading-tight hidden sm:block">Convention & Visitors Bureau</p>
            </div>
          </div>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(n => (
              <button key={n.label} onClick={() => scrollTo(n.ref)}
                className="px-3 py-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/15 text-sm font-medium transition">
                {n.label}
              </button>
            ))}
          </div>
          {/* Mobile menu toggle */}
          <button onClick={() => setMenuOpen(v => !v)} className="md:hidden text-white p-1.5">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-white/10 backdrop-blur-sm border-t border-white/20">
            {navItems.map(n => (
              <button key={n.label} onClick={() => scrollTo(n.ref)}
                className="block w-full text-left px-6 py-3 text-white text-sm font-medium hover:bg-white/10 transition">
                {n.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <div ref={secRefs.inicio} className="relative flex items-center justify-center min-h-screen pt-16"
        style={{
          background: config.heroImagen
            ? `linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.65)), url(${config.heroImagen}) center/cover no-repeat`
            : `linear-gradient(135deg, ${BRAND} 0%, ${BRAND2} 50%, #1a1a2e 100%)`,
        }}>
        <div className="text-center px-6 max-w-3xl mx-auto">
          <div className="inline-block bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 text-white/90 text-xs font-semibold tracking-widest uppercase mb-6">
            Convention & Visitors Bureau
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-5 drop-shadow-lg">
            {config.heroTitulo}
          </h1>
          <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-10 max-w-2xl mx-auto">
            {config.heroSubtitulo}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => scrollTo(secRefs.socios)}
              className="px-8 py-3.5 rounded-xl font-bold text-base transition hover:scale-105 shadow-lg"
              style={{ background: 'white', color: BRAND }}>
              Ver socios
            </button>
            <button onClick={() => scrollTo(secRefs.contacto)}
              className="px-8 py-3.5 rounded-xl font-bold text-base transition hover:scale-105 border-2 border-white/50 text-white hover:bg-white/10">
              Contactarnos
            </button>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={28} className="text-white/50" />
        </div>
      </div>

      {/* ── Sobre Nosotros ── */}
      <div ref={secRefs.sobre} className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: BRAND }}>Quiénes somos</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2">Mendoza Bureau</h2>
            <div className="w-16 h-1 rounded-full mx-auto mt-4" style={{ background: BRAND }} />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
            <div>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">{config.sobreNosotros}</p>
              <div className="rounded-2xl p-6 text-white" style={{ background: `linear-gradient(135deg,${BRAND},${BRAND2})` }}>
                <p className="font-bold text-lg mb-2">¿Por qué Mendoza?</p>
                <p className="text-white/85 leading-relaxed">{config.mision}</p>
              </div>
            </div>
            <div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { n: socios.filter(s => s.categoria === 'bodega').length, label: 'Bodegas' },
                  { n: socios.filter(s => s.categoria === 'restaurante').length, label: 'Restaurantes' },
                  { n: socios.filter(s => s.categoria === 'hotel' || s.categoria === 'alojamiento').length, label: 'Alojamientos' },
                  { n: socios.length, label: 'Socios totales' },
                  { n: prensa.length, label: 'Notas de prensa' },
                  { n: obs.length, label: 'Reportes' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
                    <p className="text-3xl font-black" style={{ color: BRAND }}>{stat.n}</p>
                    <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comisión Directiva */}
          {config.directiva?.length > 0 && (
            <>
              <h3 className="text-2xl font-black text-gray-900 text-center mb-8">Comisión Directiva</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {config.directiva.map((m, i) => (
                  <div key={i} className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-200 mb-3 border-4 border-white shadow-md">
                      {m.foto
                        ? <img src={m.foto} alt={m.nombre} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-gray-400">{m.nombre[0]}</div>
                      }
                    </div>
                    <p className="font-bold text-sm text-gray-900 leading-tight">{m.nombre}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.cargo}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Socios ── */}
      <div ref={secRefs.socios} className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: BRAND }}>Nuestros socios</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2">Encontrá tu experiencia ideal</h2>
            <div className="w-16 h-1 rounded-full mx-auto mt-4" style={{ background: BRAND }} />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Buscar socio..." value={busquedaSocio}
                onChange={e => setBusquedaSocio(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': BRAND } as React.CSSProperties} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categoriasPresentes.map(cat => (
                <button key={cat.key} onClick={() => setFiltroSocio(cat.key)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={filtroSocio === cat.key
                    ? { background: BRAND, color: 'white' }
                    : { background: '#F3F4F6', color: '#374151' }}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {sociosFiltrados.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No hay socios en esta categoría</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sociosFiltrados.map(s => (
                <div key={s.id} className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
                  {s.fotoPortada ? (
                    <div className="h-44 overflow-hidden">
                      <img src={s.fotoPortada} alt={s.razonSocial} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-44 flex items-center justify-center" style={{ background: `${CAT_COLORS[s.categoria] ?? '#9CA3AF'}20` }}>
                      <span className="text-4xl font-black" style={{ color: CAT_COLORS[s.categoria] ?? '#9CA3AF' }}>{s.razonSocial[0]}</span>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                          style={{ background: `${CAT_COLORS[s.categoria]}20`, color: CAT_COLORS[s.categoria] ?? '#6B7280' }}>
                          {CAT_LABELS[s.categoria] ?? s.categoria}
                        </span>
                        <h3 className="font-bold text-gray-900 text-base mt-1.5 leading-tight">{s.razonSocial}</h3>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                      {s.etiqueta || s.infoGeneral || s.direccion}
                    </p>
                    {s.urlInternaTour && (
                      <a href={s.urlInternaTour} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold transition hover:underline" style={{ color: BRAND }}>
                        <ExternalLink size={14} /> Ver tour virtual
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Prensa ── */}
      <div ref={secRefs.prensa} className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: BRAND }}>Sala de prensa</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2">Noticias y novedades</h2>
            <div className="w-16 h-1 rounded-full mx-auto mt-4" style={{ background: BRAND }} />
          </div>

          {prensa.length === 0 ? (
            <p className="text-center text-gray-400 py-12">Próximamente: notas y noticias de Mendoza Bureau</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {prensa.map(p => (
                <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5">
                  {p.imagen && (
                    <div className="h-48 overflow-hidden">
                      <img src={p.imagen} alt={p.titulo} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-xs text-gray-400 mb-2">{p.fecha}</p>
                    <h3 className="font-bold text-gray-900 text-base leading-tight mb-2">{p.titulo}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{p.resumen}</p>
                    {p.contenido && (
                      <button onClick={() => setPrensaExpandida(presnaExpandida === p.id ? null : p.id)}
                        className="mt-3 text-sm font-semibold transition hover:underline" style={{ color: BRAND }}>
                        {presnaExpandida === p.id ? 'Leer menos ↑' : 'Leer más →'}
                      </button>
                    )}
                    {presnaExpandida === p.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {p.contenido}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Observatorio ── */}
      <div ref={secRefs.obs} className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: BRAND }}>Datos & estadísticas</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2">Observatorio de Turismo</h2>
            <div className="w-16 h-1 rounded-full mx-auto mt-4" style={{ background: BRAND }} />
          </div>

          {obs.length === 0 ? (
            <p className="text-center text-gray-400 py-12">Próximamente: reportes y estadísticas del observatorio</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {obs.map(o => (
                <div key={o.id} className="rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">{o.fuente} · {o.fecha}</p>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{o.titulo}</h3>
                    </div>
                    {o.pdfBase64 && (
                      <button
                        onClick={() => {
                          const byteStr = atob(o.pdfBase64)
                          const arr = new Uint8Array(byteStr.length).map((_, i) => byteStr.charCodeAt(i))
                          const blob = new Blob([arr], { type: 'application/pdf' })
                          window.open(URL.createObjectURL(blob), '_blank')
                        }}
                        className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition hover:opacity-80"
                        style={{ background: `${BRAND}15`, color: BRAND }}>
                        <FileText size={13} /> Ver PDF
                      </button>
                    )}
                  </div>
                  {o.descripcion && <p className="text-gray-500 text-sm leading-relaxed mb-5">{o.descripcion}</p>}
                  {o.grafico && (
                    o.grafico.tipo === 'barra'
                      ? <BarChart grafico={o.grafico} />
                      : <LineChart grafico={o.grafico} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Contacto ── */}
      <div ref={secRefs.contacto} className="py-20 text-white" style={{ background: `linear-gradient(135deg,${BRAND},${BRAND2})` }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">¿Querés trabajar con nosotros?</h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
            Contactanos para conocer los beneficios de ser socio de Mendoza Bureau y posicionarte en el mercado del turismo corporativo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {config.contactoWhatsapp && (
              <a href={`https://wa.me/${config.contactoWhatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 px-7 py-3.5 rounded-xl font-bold text-base transition">
                <Phone size={18} /> WhatsApp
              </a>
            )}
            {config.contactoEmail && (
              <a href={`mailto:${config.contactoEmail}`}
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 hover:bg-white/90 px-7 py-3.5 rounded-xl font-bold text-base transition"
                style={{ color: BRAND }}>
                <Mail size={18} /> {config.contactoEmail}
              </a>
            )}
          </div>
          <div className="mt-10 flex items-center justify-center gap-2 text-white/50 text-sm">
            <MapPin size={14} /> Mendoza, Argentina
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="py-6 bg-gray-900 text-center">
        <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Mendoza Bureau — Convention & Visitors Bureau</p>
      </footer>
    </div>
  )
}
