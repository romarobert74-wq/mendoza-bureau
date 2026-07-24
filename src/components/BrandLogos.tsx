'use client'

import { useEffect, useState } from 'react'
import { getConfigSistema } from '@/lib/firestore'

/* Logos de Mendoza Bureau + El Faro 360, tomados de la configuración del panel.
   - logos: cuáles mostrar y en qué orden.
   - color=true muestra el logo con sus colores originales (versión a color).
   - de lo contrario se busca la versión "blanca" subida al panel; si no existe,
     se usa la versión a color volviéndola blanca con un filtro.
   - label: texto antes de los logos (ej: "Power by"). */
export function BrandLogos({
  variant = 'header', logos = ['bureau', 'faro'], size, label, color = false,
}: {
  variant?: 'header' | 'footer'
  logos?: ('bureau' | 'faro')[]
  size?: number
  label?: string
  color?: boolean
}) {
  const [cfg, setCfg] = useState<{ bureau: string; faro: string; bureauBlanco: string; faroBlanco: string } | null>(null)

  useEffect(() => {
    getConfigSistema().then(c => setCfg({
      bureau: c?.logoUrl ?? '', faro: c?.logoElFaroUrl ?? '',
      bureauBlanco: c?.logoBureauBlanco ?? '', faroBlanco: c?.logoElFaroBlanco ?? '',
    })).catch(() => {})
  }, [])

  if (!cfg) return null

  // Para cada logo devuelve { src, filtrar } según si queremos color o blanco
  const resolver = (l: 'bureau' | 'faro'): { src: string; filtrar: boolean } | null => {
    const base = l === 'bureau' ? cfg.bureau : cfg.faro
    const blanco = l === 'bureau' ? cfg.bureauBlanco : cfg.faroBlanco
    if (color) return base ? { src: base, filtrar: false } : null
    // queremos blanco: preferimos la versión blanca subida (sin filtro)
    if (blanco) return { src: blanco, filtrar: false }
    if (base) return { src: base, filtrar: true }
    return null
  }

  const items = logos.map(l => ({ l, r: resolver(l) })).filter(x => x.r) as { l: 'bureau' | 'faro'; r: { src: string; filtrar: boolean } }[]
  if (items.length === 0) return null

  const h = size ?? (variant === 'header' ? 38 : 22)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 16, flexWrap: 'wrap', opacity: variant === 'footer' && !color ? 0.7 : 1,
    }}>
      {label && (
        <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', fontWeight: 600 }}>
          {label}
        </span>
      )}
      {items.map(({ l, r }, i) => (
        <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 16 }}>
          {i > 0 && <span style={{ width: 1, height: h * 0.7, background: 'rgba(255,255,255,0.22)' }} />}
          <img src={r.src} alt={l === 'bureau' ? 'Mendoza Bureau' : 'El Faro 360'}
            style={{ height: l === 'faro' ? h * 0.9 : h, objectFit: 'contain', filter: r.filtrar ? 'brightness(0) invert(1)' : 'none' }} />
        </span>
      ))}
    </div>
  )
}
