'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getFotosSocio, getSocio, FotoSocio } from '@/lib/firestore'
import type { Socio } from '@/types'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

function SocioFotosViewer() {
  const params = useSearchParams()
  const id = params.get('id') ?? ''
  const [socio, setSocio] = useState<Socio | null>(null)
  const [fotos, setFotos] = useState<FotoSocio[]>([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [touchX, setTouchX] = useState<number | null>(null)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    Promise.all([getSocio(id), getFotosSocio(id)]).then(([s, f]) => {
      setSocio(s); setFotos(f); setLoading(false)
    })
  }, [id])

  const prev = () => setCurrent(c => (c - 1 + fotos.length) % fotos.length)
  const next = () => setCurrent(c => (c + 1) % fotos.length)
  const onTouchStart = (e: React.TouchEvent) => setTouchX(e.touches[0].clientX)
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX === null) return
    const diff = touchX - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
    setTouchX(null)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'rgba(10,15,30,0.92)' }}>
      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  )

  if (fotos.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3"
      style={{ background: 'rgba(10,15,30,0.93)', fontFamily: 'system-ui, sans-serif' }}>
      <p className="text-white/40 text-lg">📷</p>
      <p className="text-white/50 text-sm">{socio?.razonSocial ?? 'Socio'}</p>
      <p className="text-white/30 text-xs">No hay fotos cargadas aún.</p>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0f1e', fontFamily: 'system-ui, sans-serif' }}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div>
          <h2 className="text-white font-bold text-base leading-tight">{socio?.razonSocial}</h2>
          <p className="text-white/40 text-xs">{current + 1} / {fotos.length}</p>
        </div>
      </div>

      <div className="relative flex-1 mx-4 rounded-2xl overflow-hidden cursor-pointer"
        style={{ minHeight: '55vh', background: '#111827' }} onClick={() => setFullscreen(true)}>
        <img src={fotos[current].url} alt={fotos[current].nombre}
          className="w-full h-full object-cover transition-opacity duration-300" style={{ minHeight: '55vh' }} />
        {fotos.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition active:scale-90"
              style={{ background: 'rgba(0,0,0,0.55)' }}>
              <ChevronLeft size={22} color="white" />
            </button>
            <button onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition active:scale-90"
              style={{ background: 'rgba(0,0,0,0.55)' }}>
              <ChevronRight size={22} color="white" />
            </button>
          </>
        )}
      </div>

      {fotos.length > 1 && (
        <div className="flex gap-2 px-4 py-4 overflow-x-auto">
          {fotos.map((f, i) => (
            <button key={f.id} onClick={() => setCurrent(i)}
              className="shrink-0 w-14 h-14 rounded-xl overflow-hidden transition-all"
              style={{ border: i === current ? '2px solid #60a5fa' : '2px solid transparent', opacity: i === current ? 1 : 0.5 }}>
              <img src={f.url} alt={f.nombre} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <p className="text-white/20 text-xs text-center pb-4">Mendoza Bureau · Convention & Visitors</p>

      {fullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.95)' }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <button onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center z-10"
            style={{ background: 'rgba(255,255,255,0.15)' }}>
            <X size={18} color="white" />
          </button>
          <img src={fotos[current].url} alt={fotos[current].nombre} className="max-w-full max-h-full object-contain" />
          {fotos.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <ChevronLeft size={22} color="white" />
              </button>
              <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <ChevronRight size={22} color="white" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function SocioFotosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'rgba(10,15,30,0.92)' }}>
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <SocioFotosViewer />
    </Suspense>
  )
}
