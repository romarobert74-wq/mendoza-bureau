'use client'

import { useEffect, useState } from 'react'
import { getConfigSistema } from '@/lib/firestore'

/* Logos de Mendoza Bureau + El Faro 360, tomados de la configuración del panel.
   - logos: cuáles mostrar y en qué orden.
   - color=true muestra el logo con sus colores originales (sin volverlo blanco).
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
  const [bureau, setBureau] = useState('')
  const [faro, setFaro] = useState('')

  useEffect(() => {
    getConfigSistema().then(c => {
      if (c?.logoUrl) setBureau(c.logoUrl)
      if (c?.logoElFaroUrl) setFaro(c.logoElFaroUrl)
    }).catch(() => {})
  }, [])

  const src: Record<string, string> = { bureau, faro }
  const visibles = logos.filter(l => src[l])
  if (visibles.length === 0) return null

  const h = size ?? (variant === 'header' ? 38 : 22)
  const filter = color ? 'none' : 'brightness(0) invert(1)'

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
      {visibles.map((l, i) => (
        <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 16 }}>
          {i > 0 && <span style={{ width: 1, height: h * 0.7, background: 'rgba(255,255,255,0.22)' }} />}
          <img src={src[l]} alt={l === 'bureau' ? 'Mendoza Bureau' : 'El Faro 360'}
            style={{ height: l === 'faro' ? h * 0.9 : h, objectFit: 'contain', filter }} />
        </span>
      ))}
    </div>
  )
}
