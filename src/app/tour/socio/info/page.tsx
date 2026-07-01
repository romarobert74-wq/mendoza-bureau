'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSocio } from '@/lib/firestore'
import type { Socio } from '@/types'

function SocioInfo() {
  const params = useSearchParams()
  const id = params.get('id') ?? ''
  const [socio, setSocio] = useState<Socio | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    getSocio(id).then(data => { setSocio(data); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'rgba(10,15,30,0.92)' }}>
      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  )

  if (!socio) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'rgba(10,15,30,0.92)' }}>
      <p className="text-white/50 text-sm">Socio no encontrado</p>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'rgba(10,15,30,0.93)', fontFamily: 'system-ui, sans-serif' }}>
      <div className="px-6 pt-8 pb-4 border-b border-white/10">
        {socio.fotoPortada && (
          <div className="w-full h-40 rounded-xl mb-4 bg-center bg-cover" style={{ backgroundImage: `url(${socio.fotoPortada})` }} />
        )}
        <h1 className="text-white text-xl font-bold leading-tight">{socio.razonSocial}</h1>
        {socio.categoria && (
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/60 capitalize">
            {socio.categoria}
          </span>
        )}
        {socio.direccion && <p className="text-white/50 text-sm mt-2">📍 {socio.direccion}</p>}
      </div>
      <div className="flex-1 px-6 py-5 overflow-y-auto">
        {socio.infoGeneral
          ? <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{socio.infoGeneral}</p>
          : <p className="text-white/30 text-sm italic">Sin descripción disponible.</p>
        }
      </div>
      <div className="px-6 pb-6 pt-2 border-t border-white/10">
        <p className="text-white/25 text-xs text-center">Mendoza Bureau · Convention & Visitors</p>
      </div>
    </div>
  )
}

export default function SocioInfoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'rgba(10,15,30,0.92)' }}>
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <SocioInfo />
    </Suspense>
  )
}
