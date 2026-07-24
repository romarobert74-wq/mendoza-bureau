'use client'

import { useEffect, useState } from 'react'
import { getConfigSistema } from '@/lib/firestore'

/* Logos de Mendoza Bureau + El Faro 360, tomados de la configuración del panel.
   Se muestran en blanco (filtro) sobre fondos oscuros. */
export function BrandLogos({ variant = 'header' }: { variant?: 'header' | 'footer' }) {
  const [bureau, setBureau] = useState('')
  const [faro, setFaro] = useState('')

  useEffect(() => {
    getConfigSistema().then(c => {
      if (c?.logoUrl) setBureau(c.logoUrl)
      if (c?.logoElFaroUrl) setFaro(c.logoElFaroUrl)
    }).catch(() => {})
  }, [])

  if (!bureau && !faro) return null
  const h = variant === 'header' ? 38 : 22
  const filter = 'brightness(0) invert(1)'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: variant === 'header' ? 20 : 14, flexWrap: 'wrap',
      opacity: variant === 'footer' ? 0.7 : 1,
    }}>
      {bureau && <img src={bureau} alt="Mendoza Bureau" style={{ height: h, objectFit: 'contain', filter }} />}
      {bureau && faro && <span style={{ width: 1, height: h * 0.7, background: 'rgba(255,255,255,0.22)' }} />}
      {faro && <img src={faro} alt="El Faro 360" style={{ height: h * 0.82, objectFit: 'contain', filter }} />}
    </div>
  )
}
