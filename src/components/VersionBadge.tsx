'use client'

import { useEffect, useState } from 'react'

/* Cartelito de entorno — para saber siempre en qué versión estás parado.
   - Producción (rama main en Vercel)  → "PRODUCCIÓN · FINAL" (verde)
   - Desarrollo / preview (rama develop u otras / local) → "DESARROLLO · PRUEBAS" (naranja)
   Vercel expone estas variables automáticamente en proyectos Next.js.
   Se puede colapsar a un puntito (se recuerda en el navegador). */
export function VersionBadge() {
  const [open, setOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try { setOpen(localStorage.getItem('mb-envbadge') !== 'min') } catch { /* noop */ }
  }, [])

  if (!mounted) return null

  const env = process.env.NEXT_PUBLIC_VERCEL_ENV
  const ref = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF
  const isProd = env === 'production' || (!env && ref === 'main')

  const label = isProd ? 'PRODUCCIÓN · FINAL' : 'DESARROLLO · PRUEBAS'
  const color = isProd ? '#16a34a' : '#f15a24'
  const bg = isProd ? 'rgba(22,163,74,.12)' : 'rgba(241,90,36,.14)'

  const toggle = () => {
    const next = !open
    setOpen(next)
    try { localStorage.setItem('mb-envbadge', next ? 'full' : 'min') } catch { /* noop */ }
  }

  const base: React.CSSProperties = {
    position: 'fixed', left: 14, bottom: 14, zIndex: 9999,
    display: 'inline-flex', alignItems: 'center', gap: 8,
    fontFamily: 'ui-sans-serif,system-ui,sans-serif', cursor: 'pointer', userSelect: 'none',
    border: `1px solid ${color}`, background: bg, color,
    backdropFilter: 'blur(8px)', boxShadow: '0 6px 20px rgba(0,0,0,.25)',
    transition: 'all .18s ease',
  }

  if (!open) {
    return (
      <button onClick={toggle} title={label} aria-label={label}
        style={{ ...base, width: 16, height: 16, padding: 0, borderRadius: '50%' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, margin: '0 auto' }} />
      </button>
    )
  }

  return (
    <button onClick={toggle} title="Ocultar" aria-label={label}
      style={{ ...base, padding: '7px 13px', borderRadius: 999, fontSize: 11.5, fontWeight: 800, letterSpacing: '.08em' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 0 3px ${bg}`, flex: 'none' }} />
      {label}
      {ref && <span style={{ opacity: .7, fontWeight: 600, letterSpacing: 0 }}>· {ref}</span>}
    </button>
  )
}
