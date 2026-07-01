'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSocio } from '@/lib/firestore'
import type { Socio } from '@/types'
import { MapPin, ExternalLink } from 'lucide-react'

function SocioUbicacion() {
  const params = useSearchParams()
  const id = params.get('id') ?? ''
  const [socio, setSocio] = useState<Socio | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    getSocio(id).then(data => { setSocio(data); setLoading(false) })
  }, [id])

  const abrirMaps = () => {
    if (!socio?.ubicacionUrl) return
    try { window.top!.location.href = socio.ubicacionUrl }
    catch { window.open(socio.ubicacionUrl, '_blank') }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'rgba(10,15,30,0.92)' }}>
      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6"
      style={{ background: 'rgba(10,15,30,0.93)', fontFamily: 'system-ui, sans-serif' }}>
      <div className="w-24 h-24 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)' }}>
        <MapPin size={40} color="#4ade80" />
      </div>
      <div className="text-center">
        <h2 className="text-white text-xl font-bold">{socio?.razonSocial}</h2>
        {socio?.direccion && <p className="text-white/50 text-sm mt-2">📍 {socio.direccion}</p>}
      </div>
      {socio?.ubicacionUrl ? (
        <button onClick={abrirMaps}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white text-base transition active:scale-95"
          style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>
          <ExternalLink size={18} />
          Ver en Google Maps
        </button>
      ) : (
        <p className="text-white/30 text-sm italic">Ubicación no cargada aún.</p>
      )}
      <p className="text-white/20 text-xs">Mendoza Bureau · Convention & Visitors</p>
    </div>
  )
}

export default function SocioUbicacionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'rgba(10,15,30,0.92)' }}>
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <SocioUbicacion />
    </Suspense>
  )
}
