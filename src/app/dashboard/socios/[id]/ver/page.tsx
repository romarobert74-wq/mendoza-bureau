'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getSocio, getAnalyticsResumen, getAnalyticsSocioPeriodo } from '@/lib/firestore'
import type { AnalyticsSocio } from '@/lib/firestore'
import { getFotosSocio } from '@/lib/firestore'
import { CATEGORIAS } from '@/types'
import type { Socio } from '@/types'
import toast from 'react-hot-toast'
import {
  ChevronLeft, Pencil, ExternalLink, Eye, MousePointerClick, Globe as GlobeIcon,
  Share2, Timer, Image as ImageIcon, MapPin, Mail, Phone, Loader2, FileDown,
} from 'lucide-react'

function fmtTiempo(ms: number): string {
  if (!ms) return '0s'
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ${s % 60}s`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m`
}

const VACIO: AnalyticsSocio = { tour: 0, contacto: 0, web: 0, redes: 0, visitas: 0, tiempoMs: 0 }

export default function VerSocioPage() {
  const { id } = useParams<{ id: string }>()
  const [socio, setSocio] = useState<Socio | null>(null)
  const [stats, setStats] = useState<AnalyticsSocio>(VACIO)
  const [fotos, setFotos] = useState(0)
  const [loading, setLoading] = useState(true)
  const [generando, setGenerando] = useState(false)

  const BASE = 'https://mendoza-bureau.vercel.app'
  const fichaUrl = `${BASE}/tour/socio/ficha?id=${id}`

  const generarReporte = async (periodo: 'mensual' | 'trimestral') => {
    if (!socio) return
    setGenerando(true)
    try {
      const hasta = new Date()
      const desde = new Date()
      desde.setMonth(desde.getMonth() - (periodo === 'mensual' ? 1 : 3))
      const p = await getAnalyticsSocioPeriodo(id, desde, hasta)
      abrirReporteImprimible(socio, periodo, desde, hasta, p)
    } catch {
      toast.error('Error al generar el reporte')
    } finally {
      setGenerando(false)
    }
  }

  useEffect(() => {
    let activo = true
    Promise.allSettled([getSocio(id), getAnalyticsResumen(), getFotosSocio(id)]).then(results => {
      if (!activo) return
      const [rSocio, rAnalytics, rFotos] = results
      if (rSocio.status === 'fulfilled') setSocio(rSocio.value)
      else console.error('Error cargando socio:', rSocio.reason)
      if (rAnalytics.status === 'fulfilled') setStats(rAnalytics.value.porSocio[id] ?? VACIO)
      else console.error('Error cargando analytics:', rAnalytics.reason)
      if (rFotos.status === 'fulfilled') setFotos(rFotos.value.length)
      else console.error('Error cargando fotos:', rFotos.reason)
      setLoading(false)
    })
    return () => { activo = false }
  }, [id])

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
        <Loader2 size={18} className="animate-spin" /> Cargando...
      </div>
    )
  }

  if (!socio) {
    return (
      <div className="p-8">
        <p style={{ color: 'var(--text-muted)' }}>Socio no encontrado</p>
        <Link href="/dashboard/socios" className="text-sm mt-2 inline-block" style={{ color: 'var(--orange-2)' }}>Volver a socios</Link>
      </div>
    )
  }

  const c = socio.contacto

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/dashboard/socios" className="flex items-center gap-1 text-sm transition mb-6" style={{ color: 'var(--text-muted)' }}>
        <ChevronLeft size={15} /> Volver a socios
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="section-title mb-1">Ficha del socio</p>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{socio.razonSocial}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="badge badge-orange">{CATEGORIAS[socio.categoria]}</span>
            {socio.activo
              ? <span className="badge badge-green">Activo</span>
              : <span className="badge badge-amber">Pendiente</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={fichaUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">
            <ExternalLink size={15} /> Ver ficha en vivo
          </a>
          <Link href={`/dashboard/socios/${id}`} className="btn-primary">
            <Pencil size={15} /> Editar
          </Link>
        </div>
      </div>

      {/* Indicadores por socio */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-2)' }}>
          Indicadores de interacción
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Reporte PDF:</span>
          <button onClick={() => generarReporte('mensual')} disabled={generando} className="btn-outline" style={{ padding: '5px 10px', fontSize: '12px' }}>
            {generando ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />} Mensual
          </button>
          <button onClick={() => generarReporte('trimestral')} disabled={generando} className="btn-outline" style={{ padding: '5px 10px', fontSize: '12px' }}>
            <FileDown size={13} /> Trimestral
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Ind label="Visitas al tour" value={stats.tour} sub="aperturas de la ficha" icon={Eye} accent="#3b82f6" />
        <Ind label="Tiempo en tour" value={fmtTiempo(stats.tiempoMs)} sub={`${stats.visitas} sesiones`} icon={Timer} accent="#a855f7" isText />
        <Ind label="Clicks de contacto" value={stats.contacto} sub="WhatsApp / email" icon={MousePointerClick} accent="#25d366" />
        <Ind label="Clicks a web" value={stats.web} sub="sitio del socio" icon={GlobeIcon} accent="#38bdf8" />
        <Ind label="Clicks a redes" value={stats.redes} sub="redes sociales" icon={Share2} accent="#ec4899" />
        <Ind label="Fotos cargadas" value={fotos} sub="galería del socio" icon={ImageIcon} accent="#f15a24" />
      </div>

      {/* Resumen de datos + ficha embebida */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="kpi-card">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Datos del socio</h3>
          <div className="space-y-3 text-sm">
            {socio.infoGeneral && (
              <p style={{ color: 'var(--text-2)' }}>{socio.infoGeneral}</p>
            )}
            <Fila icon={MapPin} label="Dirección" value={socio.direccion} />
            <Fila icon={Phone} label="WhatsApp" value={c?.whatsapp} />
            <Fila icon={Mail} label="Email" value={c?.email} />
            <Fila icon={GlobeIcon} label="Web" value={c?.web} />
            <Fila icon={Share2} label="Redes" value={c?.redes} />
          </div>
        </section>

        <section className="kpi-card overflow-hidden" style={{ padding: 0 }}>
          <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Vista previa de la ficha</h3>
          </div>
          <iframe src={fichaUrl} title="Ficha del socio"
            style={{ width: '100%', height: '520px', border: 'none', background: '#0a0f1e' }} />
        </section>
      </div>
    </div>
  )
}

function Ind({ label, value, sub, icon: Icon, accent, isText }: {
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
      <div className="text-2xl font-bold" style={{ color: 'var(--text)', fontVariantNumeric: isText ? 'normal' : 'tabular-nums' }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
      {sub && <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-faint)' }}>{sub}</div>}
    </div>
  )
}

function Fila({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={14} style={{ color: 'var(--text-faint)' }} className="shrink-0" />
      <span className="shrink-0" style={{ color: 'var(--text-muted)', width: '80px' }}>{label}</span>
      <span className="truncate" style={{ color: 'var(--text-2)' }}>{value}</span>
    </div>
  )
}

// Genera un reporte imprimible (Guardar como PDF desde el navegador)
function abrirReporteImprimible(
  socio: Socio,
  periodo: 'mensual' | 'trimestral',
  desde: Date,
  hasta: Date,
  s: AnalyticsSocio,
) {
  const fmt = (d: Date) => d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const seg = Math.round(s.tiempoMs / 1000)
  const tiempoTxt = seg < 60 ? `${seg} seg` : seg < 3600 ? `${Math.floor(seg / 60)} min ${seg % 60} seg` : `${Math.floor(seg / 3600)} h ${Math.floor((seg % 3600) / 60)} min`
  const prom = s.visitas > 0 ? Math.round(s.tiempoMs / s.visitas / 1000) : 0
  const filas = [
    ['Visitas al tour virtual', String(s.tour)],
    ['Sesiones con tiempo medido', String(s.visitas)],
    ['Tiempo total de permanencia', tiempoTxt],
    ['Permanencia promedio por sesión', `${prom} seg`],
    ['Clicks a contacto (WhatsApp / email)', String(s.contacto)],
    ['Clicks al sitio web', String(s.web)],
    ['Clicks a redes sociales', String(s.redes)],
  ]
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>Reporte ${periodo} — ${socio.razonSocial}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, -apple-system, sans-serif; color: #1c1917; padding: 48px; max-width: 800px; margin: 0 auto; }
  .eyebrow { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #f15a24; }
  h1 { font-size: 26px; margin: 6px 0 2px; }
  .sub { color: #78716c; font-size: 14px; margin-bottom: 4px; }
  .periodo { display: inline-block; background: #fff3ee; color: #d8461a; border: 1px solid #ffd3c0; border-radius: 999px; padding: 4px 14px; font-size: 12px; font-weight: 700; margin-top: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 28px; }
  td { padding: 13px 16px; border-bottom: 1px solid #e7e5e4; font-size: 14px; }
  td:last-child { text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; }
  tr:nth-child(even) { background: #fafaf9; }
  .foot { margin-top: 40px; padding-top: 16px; border-top: 2px solid #1c1917; font-size: 11px; color: #a8a29e; display: flex; justify-content: space-between; }
  @media print { body { padding: 24px; } .noprint { display: none; } }
  .btn { display: inline-block; margin-top: 28px; background: #f15a24; color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; }
</style></head><body>
  <div class="eyebrow">Reporte de estadísticas</div>
  <h1>${socio.razonSocial}</h1>
  <div class="sub">${CATEGORIAS[socio.categoria]} · Mendoza Bureau · El Faro 360</div>
  <div class="periodo">Período ${periodo}: ${fmt(desde)} — ${fmt(hasta)}</div>
  <table><tbody>
    ${filas.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
  </tbody></table>
  <div class="foot">
    <span>Generado el ${fmt(new Date())}</span>
    <span>Mendoza Bureau · Convention &amp; Visitors Bureau</span>
  </div>
  <button class="btn noprint" onclick="window.print()">Imprimir / Guardar como PDF</button>
</body></html>`
  const w = window.open('', '_blank')
  if (!w) { alert('Permití las ventanas emergentes para generar el reporte.'); return }
  w.document.write(html)
  w.document.close()
}
