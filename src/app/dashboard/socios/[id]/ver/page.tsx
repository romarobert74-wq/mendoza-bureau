'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getSocio, getAnalyticsResumen } from '@/lib/firestore'
import type { AnalyticsSocio } from '@/lib/firestore'
import { getFotosSocio } from '@/lib/firestore'
import { CATEGORIAS } from '@/types'
import type { Socio } from '@/types'
import {
  ChevronLeft, Pencil, ExternalLink, Eye, MousePointerClick, Globe as GlobeIcon,
  Share2, Timer, Image as ImageIcon, MapPin, Mail, Phone, Loader2,
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

  const BASE = 'https://mendoza-bureau.vercel.app'
  const fichaUrl = `${BASE}/tour/socio/ficha?id=${id}`

  useEffect(() => {
    Promise.all([getSocio(id), getAnalyticsResumen(), getFotosSocio(id)]).then(([s, a, f]) => {
      setSocio(s)
      setStats(a.porSocio[id] ?? VACIO)
      setFotos(f.length)
      setLoading(false)
    })
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
      <h3 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-2)' }}>
        Indicadores de interacción
      </h3>
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
