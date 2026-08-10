'use client'

import { useEffect, useState } from 'react'

/* Cartelito de entorno — para saber siempre en qué versión estás parado.
   - Producción (rama main en Vercel)  → "PRODUCCIÓN · FINAL" (verde)
   - Desarrollo / preview (rama develop u otras / local) → "DESARROLLO · PRUEBAS" (naranja)
   Vercel expone estas variables automáticamente en proyectos Next.js.
   Se puede colapsar a un puntito (se recuerda en el navegador).
   - inline: se muestra dentro del flujo (barra superior) en vez de flotar. */
export function VersionBadge({ inline = false }: { inline?: boolean }) {
  const [open, setOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try { setOpen(localStorage.getItem('mb-envbadge') !== 'min') } catch { /* noop */ }
  }, [])

  if (!mounted) return null

  // Inyectado en build por next.config.js (VERCEL_ENV / VERCEL_GIT_COMMIT_REF).
  const env = process.env.NEXT_PUBLIC_APP_ENV
  const ref = process.env.NEXT_PUBLIC_APP_BRANCH
  // Detección base por variables de build...
  let isProd = env === 'production' || ref === 'main'
  // ...y red de seguridad por dominio: la URL manda (develop = pruebas).
  const host = typeof window !== 'undefined' ? window.location.hostname : ''
  if (/develop|-git-|dev\./.test(host)) isProd = false
  else if (host === 'mendoza-bureau.vercel.app') isProd = true

  const label = isProd ? 'PRODUCCIÓN · FINAL' : 'DESARROLLO · PRUEBAS'
  const color = isProd ? '#16a34a' : '#f15a24'
  const bg = isProd ? 'rgba(22,163,74,.12)' : 'rgba(241,90,36,.14)'

  const toggle = () => {
    const next = !open
    setOpen(next)
    try { localStorage.setItem('mb-envbadge', next ? 'full' : 'min') } catch { /* noop */ }
  }

  const pos: React.CSSProperties = inline
    ? { position: 'relative' }
    : { position: 'fixed', left: 14, bottom: 14, zIndex: 9999 }

  const base: React.CSSProperties = {
    ...pos,
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
