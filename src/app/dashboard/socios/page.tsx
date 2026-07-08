'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSocios, eliminarSocio, getAnalyticsResumen } from '@/lib/firestore'
import type { AnalyticsResumen, AnalyticsSocio } from '@/lib/firestore'
import { useAuth } from '@/context/AuthContext'
import { CATEGORIAS, CATEGORIA_COLOR } from '@/types'
import type { Socio, CategoriaSocio } from '@/types'
import toast from 'react-hot-toast'
import {
  Plus, Pencil, Trash2, CheckCircle, XCircle, ExternalLink, Zap, Loader2, MessageCircle,
  Clock, Copy, Check, Eye, MousePointerClick, Globe as GlobeIcon, Timer, ArrowUp, ArrowDown, ArrowUpDown,
} from 'lucide-react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

type Columna = 'nombre' | 'categoria' | 'direccion' | 'estado'
type Direccion = 'asc' | 'desc'

function estadoOrden(s: Socio): number {
  if (s.activo) return 2
  if (s.razonSocial) return 1
  return 0
}

function fmtTiempo(ms: number): string {
  if (!ms) return '0s'
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m`
}

export default function SociosPage() {
  const { usuario } = useAuth()
  const [socios, setSocios] = useState<Socio[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsResumen | null>(null)
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [catFiltro, setCatFiltro] = useState<CategoriaSocio | 'todas'>('todas')
  const [orden, setOrden] = useState<{ col: Columna; dir: Direccion }>({ col: 'nombre', dir: 'asc' })

  const ordenarPor = (col: Columna) => {
    setOrden(o => o.col === col ? { col, dir: o.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })
  }

  const cargar = async () => {
    setLoading(true)
    const [data, a] = await Promise.all([getSocios(), getAnalyticsResumen()])
    setSocios(data)
    setAnalytics(a)
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const handleEliminar = async (socio: Socio) => {
    if (!confirm(`¿Eliminar a ${socio.razonSocial}? Esta acción no se puede deshacer.`)) return
    try {
      await eliminarSocio(socio.id)
      toast.success('Socio eliminado')
      cargar()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  // Totales de interacción para la categoría seleccionada (o todas)
  const totalesCategoria = (() => {
    const acc: AnalyticsSocio = { tour: 0, contacto: 0, web: 0, redes: 0, visitas: 0, tiempoMs: 0 }
    if (!analytics) return acc
    for (const soc of socios) {
      if (catFiltro !== 'todas' && soc.categoria !== catFiltro) continue
      const a = analytics.porSocio[soc.id]
      if (!a) continue
      acc.tour += a.tour; acc.contacto += a.contacto; acc.web += a.web
      acc.redes += a.redes; acc.visitas += a.visitas; acc.tiempoMs += a.tiempoMs
    }
    return acc
  })()

  // Categorías que tienen al menos un socio (para los chips de filtro)
  const categoriasPresentes = (Object.keys(CATEGORIAS) as CategoriaSocio[])
    .filter(cat => socios.some(s => s.categoria === cat))

  const filtrados = socios
    .filter(s =>
      (catFiltro === 'todas' || s.categoria === catFiltro) &&
      (s.razonSocial.toLowerCase().includes(filtro.toLowerCase()) ||
       s.etiqueta.toLowerCase().includes(filtro.toLowerCase()))
    )
    .sort((a, b) => {
      const dir = orden.dir === 'asc' ? 1 : -1
      switch (orden.col) {
        case 'nombre':
          return a.razonSocial.localeCompare(b.razonSocial) * dir
        case 'categoria':
          return CATEGORIAS[a.categoria].localeCompare(CATEGORIAS[b.categoria]) * dir
        case 'direccion':
          return (a.direccion || '').localeCompare(b.direccion || '') * dir
        case 'estado':
          return (estadoOrden(a) - estadoOrden(b)) * dir
        default:
          return 0
      }
    })

  const puedeEditar = usuario?.rol === 'el_faro' || usuario?.rol === 'bureau'
  const puedeEliminar = usuario?.rol === 'el_faro'
  const [alimentando, setAlimentando] = useState(false)
  const [linkCopiado, setLinkCopiado] = useState(false)

  const FORM_URL = 'https://mendoza-bureau.vercel.app/form/socio'

  const copiarLink = () => {
    navigator.clipboard.writeText(FORM_URL)
    setLinkCopiado(true)
    toast.success('Link copiado al portapapeles')
    setTimeout(() => setLinkCopiado(false), 2500)
  }

  const compartirWhatsApp = () => {
    const txt = `Hola! Te invitamos a completar los datos de tu negocio para el tour virtual de Mendoza Bureau. Solo te lleva unos minutos: ${FORM_URL}`
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank')
  }

  const alimentarBestia = async () => {
    if (socios.length === 0) { toast.error('No hay socios cargados'); return }
    setAlimentando(true)
    try {
      const lineas = [
        '=== SOCIOS MENDOZA BUREAU ===',
        `Actualizado: ${new Date().toLocaleDateString('es-AR')}`,
        '',
        ...socios.filter(s => s.activo).map(s => [
          `## ${s.razonSocial}`,
          `Categoría: ${CATEGORIAS[s.categoria] ?? s.categoria}`,
          s.etiqueta ? `Descripción: ${s.etiqueta}` : '',
          s.infoGeneral ? `Info: ${s.infoGeneral}` : '',
          s.direccion ? `Dirección: ${s.direccion}` : '',
          s.urlInternaTour ? `Tour virtual: ${s.urlInternaTour}` : '',
          s.contacto?.whatsapp ? `WhatsApp: ${s.contacto.whatsapp}` : '',
          s.contacto?.web ? `Web: ${s.contacto.web}` : '',
          s.contacto?.email ? `Email: ${s.contacto.email}` : '',
          '',
        ].filter(Boolean).join('\n')),
      ].join('\n')

      const base64 = btoa(unescape(encodeURIComponent(lineas)))
      const snap = await import('firebase/firestore').then(m =>
        m.getDoc(doc(db, 'configuracion', 'chatbot'))
      )
      const current = snap.exists() ? snap.data() : {}
      const docs = ((current.documentos ?? []) as {nombre:string;contenido:string}[])
        .filter((d: {nombre:string}) => d.nombre !== '__socios_auto__')
      await setDoc(doc(db, 'configuracion', 'chatbot'), {
        ...current,
        documentos: [...docs, { nombre: '__socios_auto__', contenido: base64 }],
        updatedAt: new Date().toISOString(),
      })
      toast.success(`¡La bestia fue alimentada con ${socios.filter(s=>s.activo).length} socios! 🤖`)
    } catch (err) {
      console.error(err)
      toast.error('Error al alimentar la bestia')
    } finally {
      setAlimentando(false)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-title mb-1">Gestión</p>
          <h2 className="text-2xl font-bold text-[var(--text)]">Socios</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{socios.length} socios registrados</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {usuario?.rol === 'el_faro' && (
            <>
              <button onClick={compartirWhatsApp} className="btn-outline">
                <MessageCircle size={15} />
                WhatsApp
              </button>
              <button onClick={copiarLink} className="btn-outline">
                {linkCopiado ? <Check size={15} /> : <Copy size={15} />}
                {linkCopiado ? 'Copiado!' : 'Copiar link'}
              </button>
              <button
                onClick={alimentarBestia}
                disabled={alimentando}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[var(--text)] transition disabled:opacity-60"
                style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd' }}
              >
                {alimentando ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
                Alimentar la bestia
              </button>
            </>
          )}
          {puedeEditar && (
            <Link href="/dashboard/socios/nuevo" className="btn-primary">
              <Plus size={15} />
              Nuevo socio
            </Link>
          )}
        </div>
      </div>

      {/* Indicadores de interacción — filtrables por categoría */}
      {analytics && (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={() => setCatFiltro('todas')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              style={catFiltro === 'todas'
                ? { background: 'rgba(241,90,36,0.16)', color: 'var(--orange-2)', border: '1px solid rgba(241,90,36,0.4)' }
                : { background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border-2)' }}>
              Todas
            </button>
            {categoriasPresentes.map(cat => {
              const activo = catFiltro === cat
              const color = CATEGORIA_COLOR[cat]
              return (
                <button key={cat} onClick={() => setCatFiltro(cat)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                  style={activo
                    ? { background: `${color}22`, color, border: `1px solid ${color}66` }
                    : { background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border-2)' }}>
                  {CATEGORIAS[cat]}
                </button>
              )
            })}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <IndicadorCard label="Visitas a tours" value={totalesCategoria.tour} sub={catFiltro === 'todas' ? 'todas las categorías' : CATEGORIAS[catFiltro]} icon={Eye} accent="#3b82f6" />
            <IndicadorCard label="Clicks de contacto" value={totalesCategoria.contacto} sub="WhatsApp / email" icon={MousePointerClick} accent="#25d366" />
            <IndicadorCard label="Clicks a web" value={totalesCategoria.web} sub="sitio del socio" icon={GlobeIcon} accent="#38bdf8" />
            <IndicadorCard label="Tiempo en tour" value={fmtTiempo(totalesCategoria.tiempoMs)} sub={`${totalesCategoria.visitas} sesiones`} icon={Timer} accent="#a855f7" isText />
          </div>
        </>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Buscar por nombre o etiqueta..."
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
        className="input max-w-md mb-6"
      />

      {loading ? (
        <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Cargando...
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>
          <table className="w-full text-sm">
            <thead style={{ borderBottom: '1px solid var(--border)' }}>
              <tr>
                <ThOrdenable label="Socio" col="nombre" orden={orden} onClick={ordenarPor} />
                <ThOrdenable label="Categoría" col="categoria" orden={orden} onClick={ordenarPor} />
                <ThOrdenable label="Dirección" col="direccion" orden={orden} onClick={ordenarPor} className="hidden md:table-cell" />
                <ThOrdenable label="Estado" col="estado" orden={orden} onClick={ordenarPor} />
                {puedeEditar && (
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sm" style={{ color: 'var(--icon)' }}>
                    No hay socios registrados
                  </td>
                </tr>
              ) : (
                filtrados.map((socio, idx) => (
                  <tr key={socio.id}
                    style={{ borderTop: idx > 0 ? '1px solid var(--border)' : 'none' }}
                    className="group transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-[var(--text)]">{socio.razonSocial}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{socio.etiqueta}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <CategoriaBadge categoria={socio.categoria} />
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-sm" style={{ color: 'var(--text-muted)' }}>{socio.direccion}</td>
                    <td className="px-4 py-3.5">
                      {socio.activo ? (
                        <span className="badge badge-green flex items-center gap-1 w-fit">
                          <CheckCircle size={11} /> Activo
                        </span>
                      ) : socio.razonSocial ? (
                        <span className="badge badge-amber flex items-center gap-1 w-fit">
                          <Clock size={11} /> Pendiente
                        </span>
                      ) : (
                        <span className="badge flex items-center gap-1 w-fit" style={{ background: 'rgba(100,116,139,0.1)', color: 'var(--text-muted)', border: '1px solid rgba(100,116,139,0.2)' }}>
                          <XCircle size={11} /> Inactivo
                        </span>
                      )}
                    </td>
                    {puedeEditar && (
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {socio.urlInternaTour && (
                            <a href={socio.urlInternaTour} target="_blank" rel="noopener noreferrer"
                              className="transition hover:text-blue-400" style={{ color: 'var(--icon)' }} title="Ver tour">
                              <ExternalLink size={15} />
                            </a>
                          )}
                          <Link href={`/dashboard/socios/${socio.id}/ver`}
                            className="transition hover:text-[var(--orange-2)]" style={{ color: 'var(--icon)' }} title="Ver ficha e indicadores">
                            <Eye size={15} />
                          </Link>
                          <Link href={`/dashboard/socios/${socio.id}`}
                            className="transition hover:text-blue-400" style={{ color: 'var(--icon)' }} title="Editar">
                            <Pencil size={15} />
                          </Link>
                          {puedeEliminar && (
                            <button onClick={() => handleEliminar(socio)}
                              className="transition hover:text-red-400" style={{ color: 'var(--icon)' }}>
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function CategoriaBadge({ categoria }: { categoria: CategoriaSocio }) {
  const color = CATEGORIA_COLOR[categoria]
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold w-fit"
      style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}>
      {CATEGORIAS[categoria]}
    </span>
  )
}

function ThOrdenable({ label, col, orden, onClick, className = '' }: {
  label: string; col: Columna; orden: { col: Columna; dir: Direccion }; onClick: (c: Columna) => void; className?: string
}) {
  const activo = orden.col === col
  const Icon = activo ? (orden.dir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
  return (
    <th className={`text-left px-4 py-3 text-xs font-bold uppercase tracking-wide select-none ${className}`}
      style={{ color: activo ? 'var(--orange-2)' : 'var(--text-muted)' }}>
      <button onClick={() => onClick(col)}
        className="flex items-center gap-1 transition hover:opacity-80"
        style={{ color: 'inherit', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>
        {label}
        <Icon size={12} style={{ opacity: activo ? 1 : 0.4 }} />
      </button>
    </th>
  )
}

function IndicadorCard({ label, value, sub, icon: Icon, accent, isText }: {
  label: string; value: number | string; sub?: string; icon: React.ElementType; accent: string; isText?: boolean
}) {
  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}1e`, border: `1px solid ${accent}40` }}>
          <Icon size={17} style={{ color: accent }} />
        </div>
      </div>
      <div className="text-2xl font-bold" style={{ color: 'var(--text)', fontVariantNumeric: isText ? 'normal' : 'tabular-nums' }}>
        {value}
      </div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
      {sub && <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-faint)' }}>{sub}</div>}
    </div>
  )
}
