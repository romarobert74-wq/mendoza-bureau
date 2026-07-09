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
      const meses = periodo === 'mensual' ? 1 : 3
      const hasta = new Date()
      const desde = new Date(); desde.setMonth(desde.getMonth() - meses)
      // Período anterior equivalente (para comparar conversión)
      const desdePrev = new Date(desde); desdePrev.setMonth(desdePrev.getMonth() - meses)
      const [actual, anterior] = await Promise.all([
        getAnalyticsSocioPeriodo(id, desde, hasta),
        getAnalyticsSocioPeriodo(id, desdePrev, desde),
      ])
      abrirReporteImprimible(socio, periodo, desde, hasta, actual, anterior)
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
  prev: AnalyticsSocio,
) {
  const fmt = (d: Date) => d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const seg = Math.round(s.tiempoMs / 1000)
  const tiempoTxt = seg < 60 ? `${seg}s` : seg < 3600 ? `${Math.floor(seg / 60)}m ${seg % 60}s` : `${Math.floor(seg / 3600)}h ${Math.floor((seg % 3600) / 60)}m`
  const promSeg = s.visitas > 0 ? Math.round(s.tiempoMs / s.visitas / 1000) : 0

  // Conversión de leads = interacciones de contacto / visitas al tour
  const leads = s.contacto + s.web + s.redes
  const leadsPrev = prev.contacto + prev.web + prev.redes
  const conv = s.tour > 0 ? (leads / s.tour) * 100 : 0
  const convPrev = prev.tour > 0 ? (leadsPrev / prev.tour) * 100 : 0

  const delta = (act: number, ant: number) => {
    if (ant === 0) return act > 0 ? { txt: 'nuevo', up: true } : { txt: '—', up: null as boolean | null }
    const pct = Math.round(((act - ant) / ant) * 100)
    return { txt: `${pct > 0 ? '+' : ''}${pct}%`, up: pct >= 0 }
  }

  const kpis = [
    { label: 'Visitas al tour', val: s.tour, ant: prev.tour, color: '#3b82f6' },
    { label: 'Leads (contactos)', val: leads, ant: leadsPrev, color: '#22c55e' },
    { label: 'Conversión', val: `${conv.toFixed(1)}%`, ant: convPrev, raw: conv, color: '#f15a24', esConv: true },
    { label: 'Tiempo promedio', val: `${promSeg}s`, ant: 0, color: '#a855f7', noDelta: true },
  ]

  // Barras comparativas actual vs anterior
  const barras = [
    { label: 'Visitas', a: s.tour, b: prev.tour },
    { label: 'Contacto', a: s.contacto, b: prev.contacto },
    { label: 'Web', a: s.web, b: prev.web },
    { label: 'Redes', a: s.redes, b: prev.redes },
  ]
  const maxBar = Math.max(1, ...barras.flatMap(x => [x.a, x.b]))
  const barW = 150

  const kpiHtml = kpis.map(k => {
    const d = k.noDelta ? null : delta(k.esConv ? (k.raw as number) : (k.val as number), k.ant)
    const deltaHtml = d && d.up !== null
      ? `<span class="delta ${d.up ? 'up' : 'down'}">${d.up ? '▲' : '▼'} ${d.txt}</span>`
      : (d ? `<span class="delta flat">${d.txt}</span>` : '')
    return `<div class="kpi" style="border-top:3px solid ${k.color}">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-val">${k.val}</div>
      <div class="kpi-sub">vs período anterior ${deltaHtml}</div>
    </div>`
  }).join('')

  const barrasHtml = barras.map(x => {
    const wa = Math.round((x.a / maxBar) * barW)
    const wb = Math.round((x.b / maxBar) * barW)
    return `<div class="bar-row">
      <div class="bar-label">${x.label}</div>
      <div class="bar-track">
        <div class="bar bar-a" style="width:${wa}px"></div>
        <span class="bar-num">${x.a}</span>
      </div>
      <div class="bar-track">
        <div class="bar bar-b" style="width:${wb}px"></div>
        <span class="bar-num muted">${x.b}</span>
      </div>
    </div>`
  }).join('')

  // Anillo de conversión (SVG)
  const r = 52, circ = 2 * Math.PI * r
  const convClamp = Math.min(conv, 100)
  const dash = (convClamp / 100) * circ

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>Reporte ${periodo} — ${socio.razonSocial}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, -apple-system, sans-serif; color: #1c1917; padding: 44px; max-width: 820px; margin: 0 auto; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #f15a24; padding-bottom: 18px; }
  .eyebrow { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #f15a24; }
  h1 { font-size: 26px; margin: 6px 0 2px; }
  .sub { color: #78716c; font-size: 13px; }
  .periodo { text-align: right; font-size: 12px; color: #78716c; }
  .periodo b { display: block; font-size: 14px; color: #1c1917; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 26px 0; }
  .kpi { background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 14px; }
  .kpi-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #78716c; font-weight: 700; }
  .kpi-val { font-size: 26px; font-weight: 800; margin: 4px 0; font-variant-numeric: tabular-nums; }
  .kpi-sub { font-size: 10px; color: #a8a29e; }
  .delta { font-weight: 800; }
  .delta.up { color: #16a34a; } .delta.down { color: #dc2626; } .delta.flat { color: #a8a29e; }
  h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #44403c; margin: 26px 0 14px; }
  .panel { display: flex; gap: 28px; align-items: center; }
  .bars { flex: 1; }
  .bar-row { display: grid; grid-template-columns: 70px 1fr 1fr; align-items: center; gap: 10px; margin-bottom: 10px; }
  .bar-label { font-size: 12px; font-weight: 600; color: #44403c; }
  .bar-track { display: flex; align-items: center; gap: 8px; }
  .bar { height: 16px; border-radius: 4px; }
  .bar-a { background: #f15a24; } .bar-b { background: #d6d3d1; }
  .bar-num { font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .bar-num.muted { color: #a8a29e; }
  .legend { display: flex; gap: 16px; font-size: 11px; color: #78716c; margin-top: 6px; }
  .legend span { display: inline-flex; align-items: center; gap: 5px; }
  .dot { width: 9px; height: 9px; border-radius: 2px; display: inline-block; }
  .ring-wrap { text-align: center; }
  .ring-cap { font-size: 11px; color: #78716c; margin-top: 4px; max-width: 130px; }
  .detalle { width: 100%; border-collapse: collapse; margin-top: 8px; }
  .detalle td { padding: 10px 14px; border-bottom: 1px solid #e7e5e4; font-size: 13px; }
  .detalle td:last-child { text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; }
  .foot { margin-top: 36px; padding-top: 14px; border-top: 2px solid #1c1917; font-size: 11px; color: #a8a29e; display: flex; justify-content: space-between; }
  @media print { body { padding: 20px; } .noprint { display: none; } }
  .btn { display: inline-block; margin-top: 26px; background: #f15a24; color: #fff; border: none; border-radius: 8px; padding: 10px 22px; font-size: 14px; font-weight: 600; cursor: pointer; }
</style></head><body>
  <div class="head">
    <div>
      <div class="eyebrow">Reporte de conversión</div>
      <h1>${socio.razonSocial}</h1>
      <div class="sub">${CATEGORIAS[socio.categoria]} · Mendoza Bureau · El Faro 360</div>
    </div>
    <div class="periodo">Período ${periodo}<b>${fmt(desde)} — ${fmt(hasta)}</b></div>
  </div>

  <div class="kpis">${kpiHtml}</div>

  <h2>Actual vs período anterior</h2>
  <div class="panel">
    <div class="bars">
      ${barrasHtml}
      <div class="legend">
        <span><i class="dot" style="background:#f15a24"></i> Período actual</span>
        <span><i class="dot" style="background:#d6d3d1"></i> Período anterior</span>
      </div>
    </div>
    <div class="ring-wrap">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r="${r}" fill="none" stroke="#e7e5e4" stroke-width="13"/>
        <circle cx="65" cy="65" r="${r}" fill="none" stroke="#f15a24" stroke-width="13" stroke-linecap="round"
          stroke-dasharray="${dash} ${circ}" transform="rotate(-90 65 65)"/>
        <text x="65" y="62" text-anchor="middle" font-size="26" font-weight="800" fill="#1c1917">${conv.toFixed(0)}%</text>
        <text x="65" y="80" text-anchor="middle" font-size="10" fill="#78716c">conversión</text>
      </svg>
      <div class="ring-cap">Leads generados sobre visitas al tour</div>
    </div>
  </div>

  <h2>Detalle del período</h2>
  <table class="detalle"><tbody>
    <tr><td>Visitas al tour virtual</td><td>${s.tour}</td></tr>
    <tr><td>Sesiones con tiempo medido</td><td>${s.visitas}</td></tr>
    <tr><td>Tiempo total de permanencia</td><td>${tiempoTxt}</td></tr>
    <tr><td>Permanencia promedio por sesión</td><td>${promSeg}s</td></tr>
    <tr><td>Clicks a contacto (WhatsApp / email)</td><td>${s.contacto}</td></tr>
    <tr><td>Clicks al sitio web</td><td>${s.web}</td></tr>
    <tr><td>Clicks a redes sociales</td><td>${s.redes}</td></tr>
    <tr><td><b>Total de leads</b></td><td><b>${leads}</b></td></tr>
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
