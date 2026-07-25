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
  Clock, Copy, Check, Eye, MousePointerClick, Globe as GlobeIcon, Timer, ArrowUp, ArrowDown, ArrowUpDown, Link2, Download,
} from 'lucide-react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

type Columna = 'nombre' | 'categoria' | 'departamento' | 'direccion' | 'estado'
type Direccion = 'asc' | 'desc'
type EstadoFiltro = 'todos' | 'activo' | 'inactivo'

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
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>('todos')
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

  // Métricas de comportamiento derivadas (respetan el filtro de categoría)
  const pct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 100) : 0)
  const t = totalesCategoria
  const conversion = pct(t.contacto, t.tour)     // % que tocan contacto
  const ctrWeb = pct(t.web, t.tour)              // % que tocan la web
  const tiempoPromMs = t.visitas > 0 ? t.tiempoMs / t.visitas : 0

  // Top socios por visitas (dentro de la categoría filtrada)
  const topSocios = socios
    .filter(s => catFiltro === 'todas' || s.categoria === catFiltro)
    .map(s => ({ s, a: analytics?.porSocio[s.id] }))
    .filter((x): x is { s: Socio; a: AnalyticsSocio } => !!x.a && x.a.tour > 0)
    .sort((a, b) => b.a.tour - a.a.tour)
    .slice(0, 5)

  // Categorías que tienen al menos un socio (para los chips de filtro)
  const categoriasPresentes = (Object.keys(CATEGORIAS) as CategoriaSocio[])
    .filter(cat => socios.some(s => s.categoria === cat))

  const filtrados = socios
    .filter(s => {
      const q = filtro.toLowerCase()
      const coincideTexto =
        s.razonSocial.toLowerCase().includes(q) ||
        s.etiqueta.toLowerCase().includes(q) ||
        (s.direccion || '').toLowerCase().includes(q) ||
        (s.departamento || '').toLowerCase().includes(q)
      const coincideEstado =
        estadoFiltro === 'todos' ||
        (estadoFiltro === 'activo' && s.activo) ||
        (estadoFiltro === 'inactivo' && !s.activo)
      return (catFiltro === 'todas' || s.categoria === catFiltro) && coincideTexto && coincideEstado
    })
    .sort((a, b) => {
      const dir = orden.dir === 'asc' ? 1 : -1
      switch (orden.col) {
        case 'nombre':
          return a.razonSocial.localeCompare(b.razonSocial) * dir
        case 'categoria':
          return CATEGORIAS[a.categoria].localeCompare(CATEGORIAS[b.categoria]) * dir
        case 'departamento':
          return (a.departamento || '').localeCompare(b.departamento || '') * dir
        case 'direccion':
          return (a.direccion || '').localeCompare(b.direccion || '') * dir
        case 'estado':
          return (estadoOrden(a) - estadoOrden(b)) * dir
        default:
          return 0
      }
    })

  // ── Exportar a Excel la lista filtrada ──
  const exportarExcel = async () => {
    if (filtrados.length === 0) { toast.error('No hay socios para exportar'); return }
    const XLSX = await import('xlsx')
    const filas = filtrados.map(s => ({
      Nombre: s.razonSocial,
      Etiqueta: s.etiqueta,
      Categoría: CATEGORIAS[s.categoria] ?? s.categoria,
      Departamento: s.departamento || '',
      Dirección: s.direccion || '',
      Estado: s.activo ? 'Activo' : 'Inactivo / a revisar',
      WhatsApp: s.contacto?.whatsapp || '',
      Email: s.contacto?.email || '',
      Web: s.contacto?.web || '',
      'Tour 3DVista': s.urlInternaTour || '',
    }))
    const ws = XLSX.utils.json_to_sheet(filas)
    ws['!cols'] = [{ wch: 26 }, { wch: 20 }, { wch: 14 }, { wch: 16 }, { wch: 34 }, { wch: 18 }, { wch: 16 }, { wch: 24 }, { wch: 24 }, { wch: 40 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Socios')
    XLSX.writeFile(wb, `socios-mendoza-bureau-${new Date().toISOString().slice(0, 10)}.xlsx`)
    toast.success(`${filas.length} socios exportados`)
  }

  const puedeEditar = usuario?.rol === 'el_faro' || usuario?.rol === 'bureau'
  const puedeEliminar = usuario?.rol === 'el_faro'
  const [alimentando, setAlimentando] = useState(false)
  const [linkCopiado, setLinkCopiado] = useState(false)

  const FORM_URL = 'https://mendoza-bureau.vercel.app/form/socio'
  const [copiado3dvista, setCopiado3dvista] = useState<string | null>(null)

  // Link de la ficha del socio para pegar en el WebFrame de 3DVista
  const copiarLink3DVista = (socioId: string) => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://mendoza-bureau.vercel.app'
    navigator.clipboard.writeText(`${base}/tour/socio/ficha?id=${socioId}`)
    setCopiado3dvista(socioId)
    toast.success('Link de 3DVista copiado')
    setTimeout(() => setCopiado3dvista(null), 2000)
  }

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
          {puedeEditar && (
            <button onClick={exportarExcel} className="btn-outline" title="Exportar la lista filtrada a Excel">
              <Download size={15} />
              Exportar Excel
            </button>
          )}
          {puedeEditar && (
            <Link href="/dashboard/socios/nuevo" className="btn-primary">
              <Plus size={15} />
              Nuevo socio
            </Link>
          )}
        </div>
      </div>

      {/* Filtro por estado */}
      <div className="flex flex-wrap gap-2 mb-4">
        {([
          ['todos', 'Todos', socios.length],
          ['activo', 'Activos', socios.filter(s => s.activo).length],
          ['inactivo', 'Pendientes / a revisar', socios.filter(s => !s.activo).length],
        ] as [EstadoFiltro, string, number][]).map(([key, label, n]) => {
          const on = estadoFiltro === key
          return (
            <button key={key} onClick={() => setEstadoFiltro(key)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
              style={on
                ? { background: 'rgba(241,90,36,0.16)', color: 'var(--orange-2)', border: '1px solid rgba(241,90,36,0.4)' }
                : { background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border-2)' }}>
              {label}
              <span className="text-[10px] font-bold rounded-full px-1.5" style={{ background: on ? 'rgba(241,90,36,0.2)' : 'var(--border-2)' }}>{n}</span>
            </button>
          )
        })}
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

          {/* ── Comportamiento ── */}
          <p className="section-title mb-2">Comportamiento</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <IndicadorCard label="Conversión a contacto" value={`${conversion}%`} sub={`${t.contacto} de ${t.tour} visitas`} icon={MousePointerClick} accent="#25d366" isText />
            <IndicadorCard label="Tiempo prom. / sesión" value={fmtTiempo(tiempoPromMs)} sub={`${t.visitas} sesiones`} icon={Timer} accent="#a855f7" isText />
            <IndicadorCard label="CTR a la web" value={`${ctrWeb}%`} sub={`${t.web} de ${t.tour} visitas`} icon={GlobeIcon} accent="#38bdf8" isText />
            <IndicadorCard label="Clicks a redes" value={t.redes} sub="Instagram / redes" icon={Zap} accent="#ec4899" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Top socios por visitas */}
            <div className="kpi-card">
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Top socios por visitas</p>
              {topSocios.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Todavía no hay visitas registradas.</p>
              ) : (
                <div className="space-y-2">
                  {topSocios.map(({ s, a }, i) => {
                    const conv = pct(a.contacto, a.tour)
                    const max = topSocios[0].a.tour || 1
                    return (
                      <div key={s.id} className="flex items-center gap-3">
                        <span className="text-xs font-bold w-4 text-center" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm truncate" style={{ color: 'var(--text)' }}>{s.razonSocial}</span>
                            <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{a.tour} vis · {conv}% conv</span>
                          </div>
                          <div className="h-1.5 rounded-full mt-1" style={{ background: 'var(--border-2)' }}>
                            <div className="h-full rounded-full" style={{ width: `${Math.max(6, (a.tour / max) * 100)}%`, background: CATEGORIA_COLOR[s.categoria] ?? '#f15a24' }} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Tendencia de visitas (30 días, global) */}
            <div className="kpi-card">
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Visitas por día</p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-faint)' }}>Últimos 30 días · todas las categorías</p>
              {analytics && (() => {
                const serie = analytics.serieVisitas
                const max = Math.max(1, ...serie.map(d => d.visitas))
                return (
                  <div className="flex items-end gap-[3px]" style={{ height: 90 }}>
                    {serie.map(d => (
                      <div key={d.fecha} className="flex-1 rounded-t transition-all"
                        title={`${d.fecha}: ${d.visitas} visitas`}
                        style={{
                          height: `${Math.max(3, (d.visitas / max) * 100)}%`,
                          background: d.visitas > 0 ? 'var(--orange-2)' : 'var(--border-2)',
                          opacity: d.visitas > 0 ? 1 : 0.5,
                        }} />
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>
        </>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Buscar por nombre, etiqueta, dirección o departamento..."
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
                <ThOrdenable label="Departamento" col="departamento" orden={orden} onClick={ordenarPor} className="hidden lg:table-cell" />
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
                  <td colSpan={6} className="text-center py-12 text-sm" style={{ color: 'var(--icon)' }}>
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
                    <td className="px-4 py-3.5 hidden lg:table-cell text-sm" style={{ color: 'var(--text-muted)' }}>{socio.departamento || '—'}</td>
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
                          <button onClick={() => copiarLink3DVista(socio.id)}
                            className="transition hover:text-[var(--orange-2)]" style={{ color: copiado3dvista === socio.id ? '#22c55e' : 'var(--icon)' }}
                            title="Copiar link de 3DVista (ficha para el WebFrame)">
                            {copiado3dvista === socio.id ? <Check size={15} /> : <Link2 size={15} />}
                          </button>
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
