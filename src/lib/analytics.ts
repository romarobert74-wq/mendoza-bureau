'use client'

import { useEffect, useRef } from 'react'

type TipoEvento = 'tour' | 'contacto' | 'web' | 'redes' | 'webframe_tiempo'

/**
 * Envía un evento de analytics de forma no bloqueante.
 * Usa sendBeacon (sobrevive a la navegación/cierre) y cae a fetch keepalive.
 */
export function trackEvento(socioId: string, tipo: TipoEvento, ms?: number) {
  if (!socioId) return
  const payload = JSON.stringify({ socioId, tipo, ...(ms ? { ms } : {}) })
  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon('/api/track', blob)
      return
    }
  } catch {
    /* fallthrough */
  }
  try {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    })
  } catch {
    /* silencioso: nunca romper la experiencia del tour por analytics */
  }
}

/**
 * Registra una visita al webframe del socio y mide el tiempo de permanencia.
 * - En el montaje: cuenta un evento 'tour' (entró a ver al socio).
 * - Al desmontar / ocultar / cerrar: envía el tiempo acumulado como 'webframe_tiempo'.
 */
export function useWebframeTracking(socioId: string | undefined | null) {
  const inicioRef = useRef<number>(Date.now())
  const enviadoRef = useRef(false)

  useEffect(() => {
    if (!socioId) return
    inicioRef.current = Date.now()
    enviadoRef.current = false
    trackEvento(socioId, 'tour')

    const flush = () => {
      if (enviadoRef.current) return
      const ms = Date.now() - inicioRef.current
      // ignorar rebotes < 1s
      if (ms >= 1000) {
        enviadoRef.current = true
        trackEvento(socioId, 'webframe_tiempo', ms)
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush()
    }

    window.addEventListener('pagehide', flush)
    window.addEventListener('beforeunload', flush)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      flush()
      window.removeEventListener('pagehide', flush)
      window.removeEventListener('beforeunload', flush)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [socioId])
}
