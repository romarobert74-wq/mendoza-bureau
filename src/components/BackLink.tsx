'use client'

/* Botón "Volver": si hay historial navega a la página anterior; si el socio
   entró directo por link, cae al destino `href` (por defecto la plataforma). */
export function BackLink({ href = '/plataforma', label = 'Volver' }: { href?: string; label?: string }) {
  return (
    <a href={href}
      onClick={(e) => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          e.preventDefault()
          window.history.back()
        }
      }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
        color: '#a99e97', textDecoration: 'none', padding: '8px 14px', borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)',
      }}>
      <span style={{ fontSize: 16, lineHeight: 1 }}>←</span> {label}
    </a>
  )
}
