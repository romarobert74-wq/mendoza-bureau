'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getSocios, getUsuarios, getAnalyticsResumen } from '@/lib/firestore'
import type { AnalyticsResumen } from '@/lib/firestore'
import { CATEGORIAS, CATEGORIA_COLOR } from '@/types'
import type { Socio, CategoriaSocio } from '@/types'
import {
  MapPin, Users, CheckCircle, MousePointerClick, Eye, Clock,
  Wine, UtensilsCrossed, BedDouble, Building2, PartyPopper, Wrench, Package,
} from 'lucide-react'

const CAT_ICON: Record<CategoriaSocio, React.ElementType> = {
  bodega: Wine,
  restaurante: UtensilsCrossed,
  hotel: Building2,
  alojamiento: BedDouble,
  salon: PartyPopper,
  servicio: Wrench,
  otro: Package,
}

const CAT_COLOR = CATEGORIA_COLOR

function fmtTiempo(ms: number): string {
  if (!ms) return '0s'
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ${s % 60}s`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m`
}

export default function DashboardPage() {
  const { usuario } = useAuth()
  const [socios, setSocios] = useState<Socio[] | null>(null)
  const [totalUsuarios, setTotalUsuarios] = useState(0)
  const [analytics, setAnalytics] = useState<AnalyticsResumen | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!usuario) return
      const [s, a] = await Promise.all([getSocios(), getAnalyticsResumen()])
      setSocios(s)
      setAnalytics(a)
      if (usuario.rol === 'el_faro' || usuario.rol === 'bureau') {
        const u = await getUsuarios()
        setTotalUsuarios(u.length)
      }
    }
    load()
  }, [usuario])

  const cargando = !socios || !analytics

  // Socios activos por categoría
  const activos = (socios ?? []).filter(s => s.activo)
  const porCategoria = (Object.keys(CATEGORIAS) as CategoriaSocio[])
    .map(cat => ({
      cat,
      total: activos.filter(s => s.categoria === cat).length,
    }))
    .filter(c => c.total > 0)

  // Clicks de tour por categoría (join analytics.porSocio → socio.categoria)
  const clicksPorCategoria: Record<CategoriaSocio, number> = {
    bodega: 0, restaurante: 0, hotel: 0, alojamiento: 0, salon: 0, servicio: 0, otro: 0,
  }
  if (socios && analytics) {
    for (const s of socios) {
      const a = analytics.porSocio[s.id]
      if (a) clicksPorCategoria[s.categoria] += a.tour
    }
  }
  const clicksCats = (Object.keys(CATEGORIAS) as CategoriaSocio[])
    .map(cat => ({ cat, total: clicksPorCategoria[cat] }))
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)

  const t = analytics?.total

  return (
    <div className="p-8">
      <p className="section-title mb-1">Panel</p>
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
        Bienvenido, {usuario?.nombre}
      </h2>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
        Resumen operativo de Mendoza Bureau
      </p>

      {cargando ? (
        <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <div className="w-5 h-5 border-2 rounded-full animate-spin"
            style={{ borderColor: 'var(--orange)', borderTopColor: 'transparent' }} />
          Cargando datos...
        </div>
      ) : (
        <div className="space-y-8">

          {/* KPIs principales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Kpi label="Socios totales" value={socios!.length} icon={MapPin} accent="#f15a24" />
            <Kpi label="Socios activos" value={activos.length} icon={CheckCircle} accent="#22c55e" />
            <Kpi label="Visitas a tours" value={t!.tour} icon={Eye} accent="#3b82f6"
              sub="aperturas de webframe" />
            <Kpi label="Tiempo total" value={fmtTiempo(t!.tiempoMs)} icon={Clock} accent="#a855f7"
              sub={`${t!.visitas} sesiones`} isText />
          </div>

          {/* Interacciones */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Kpi label="Clicks contacto" value={t!.contacto} icon={MousePointerClick} accent="#25d366" />
            <Kpi label="Clicks web" value={t!.web} icon={MousePointerClick} accent="#38bdf8" />
            <Kpi label="Clicks redes" value={t!.redes} icon={MousePointerClick} accent="#ec4899" />
            {(usuario?.rol === 'el_faro' || usuario?.rol === 'bureau') && (
              <Kpi label="Usuarios sistema" value={totalUsuarios} icon={Users} accent="#8a8a91" />
            )}
          </div>

          {/* Socios activos por categoría */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-2)' }}>
              Socios activos por categoría
            </h3>
            {porCategoria.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-faint)' }}>Sin socios activos aún.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {porCategoria.map(({ cat, total }) => {
                  const Icon = CAT_ICON[cat]
                  const color = CAT_COLOR[cat]
                  return (
                    <div key={cat} className="kpi-card flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${color}1e`, border: `1px solid ${color}40` }}>
                        <Icon size={20} style={{ color }} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold leading-none" style={{ color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                          {total}
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{CATEGORIAS[cat]}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Clicks a tours por categoría */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-2)' }}>
              Visitas a tours virtuales por categoría
            </h3>
            {clicksCats.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
                Todavía no hay visitas registradas. Se contabilizan cuando alguien abre el tour de un socio.
              </p>
            ) : (
              <div className="kpi-card">
                <div className="space-y-3">
                  {clicksCats.map(({ cat, total }) => {
                    const max = clicksCats[0].total || 1
                    const pct = (total / max) * 100
                    const color = CAT_COLOR[cat]
                    const Icon = CAT_ICON[cat]
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <div className="flex items-center gap-2 w-36 shrink-0">
                          <Icon size={15} style={{ color }} />
                          <span className="text-sm" style={{ color: 'var(--text-2)' }}>{CATEGORIAS[cat]}</span>
                        </div>
                        <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: color }} />
                        </div>
                        <span className="text-sm font-bold w-10 text-right" style={{ color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                          {total}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

function Kpi({ label, value, icon: Icon, accent, sub, isText }: {
  label: string; value: number | string; icon: React.ElementType; accent: string; sub?: string; isText?: boolean
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
