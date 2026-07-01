'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSocio } from '@/lib/firestore'
import type { Socio } from '@/types'
import { MessageCircle, Mail, Globe, Share2 } from 'lucide-react'

export default function SocioContactoPage() {
  const params = useSearchParams()
  const id = params.get('id') ?? ''
  const [socio, setSocio] = useState<Socio | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    getSocio(id).then(data => { setSocio(data); setLoading(false) })
  }, [id])

  const abrir = (url: string) => {
    try { window.top!.location.href = url }
    catch { window.open(url, '_blank') }
  }

  const waUrl = (num: string) => {
    const clean = num.replace(/\D/g, '')
    return `https://wa.me/${clean}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'rgba(10,15,30,0.92)' }}>
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  const c = socio?.contacto
  const hasContact = c && (c.whatsapp || c.email || c.web || c.redes)

  return (
    <div
      className="min-h-screen flex flex-col px-6 py-8"
      style={{ background: 'rgba(10,15,30,0.93)', fontFamily: 'system-ui, sans-serif' }}
    >
      <h2 className="text-white text-xl font-bold mb-1">{socio?.razonSocial ?? 'Contacto'}</h2>
      <p className="text-white/40 text-sm mb-8">Información de contacto</p>

      {hasContact ? (
        <div className="flex flex-col gap-4">
          {c?.whatsapp && (
            <button
              onClick={() => abrir(waUrl(c.whatsapp))}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl text-white text-left transition active:scale-95"
              style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.35)' }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(37,211,102,0.25)' }}>
                <MessageCircle size={20} color="#25d366" />
              </div>
              <div>
                <p className="text-xs text-white/40 mb-0.5">WhatsApp</p>
                <p className="font-semibold text-sm">{c.whatsapp}</p>
              </div>
            </button>
          )}

          {c?.email && (
            <button
              onClick={() => abrir(`mailto:${c.email}`)}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl text-white text-left transition active:scale-95"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)' }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(99,102,241,0.25)' }}>
                <Mail size={20} color="#818cf8" />
              </div>
              <div>
                <p className="text-xs text-white/40 mb-0.5">Email</p>
                <p className="font-semibold text-sm">{c.email}</p>
              </div>
            </button>
          )}

          {c?.web && (
            <button
              onClick={() => abrir(c.web.startsWith('http') ? c.web : `https://${c.web}`)}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl text-white text-left transition active:scale-95"
              style={{ background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.35)' }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(14,165,233,0.25)' }}>
                <Globe size={20} color="#38bdf8" />
              </div>
              <div>
                <p className="text-xs text-white/40 mb-0.5">Sitio web</p>
                <p className="font-semibold text-sm">{c.web}</p>
              </div>
            </button>
          )}

          {c?.redes && (
            <button
              onClick={() => abrir(c.redes.startsWith('http') ? c.redes : `https://instagram.com/${c.redes.replace('@', '')}`)}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl text-white text-left transition active:scale-95"
              style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.35)' }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(236,72,153,0.25)' }}>
                <Share2 size={20} color="#f472b6" />
              </div>
              <div>
                <p className="text-xs text-white/40 mb-0.5">Redes sociales</p>
                <p className="font-semibold text-sm">{c.redes}</p>
              </div>
            </button>
          )}
        </div>
      ) : (
        <p className="text-white/30 text-sm italic">Sin datos de contacto cargados aún.</p>
      )}

      <p className="text-white/20 text-xs text-center mt-auto pt-8">Mendoza Bureau · Convention & Visitors</p>
    </div>
  )
}
