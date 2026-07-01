'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getSocio, actualizarSocio } from '@/lib/firestore'
import { SocioForm } from '@/components/SocioForm'
import type { Socio, SocioFormData } from '@/types'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ChevronLeft, Copy, Check, MessageCircle } from 'lucide-react'

export default function EditarSocioPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [socio, setSocio] = useState<Socio | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const copyId = () => {
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const compartirWhatsApp = () => {
    const formUrl = `https://mendoza-bureau.vercel.app/form/socio?id=${id}`
    const texto = `Hola! Te enviamos el formulario para completar los datos de tu negocio en el tour virtual de Mendoza Bureau. Completalo cuando puedas: ${formUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

  useEffect(() => {
    getSocio(id).then(data => {
      setSocio(data)
      setLoading(false)
    })
  }, [id])

  const handleSubmit = async (data: SocioFormData) => {
    try {
      await actualizarSocio(id, data)
      toast.success('Socio actualizado')
      router.push('/dashboard/socios')
    } catch {
      toast.error('Error al actualizar')
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-gray-400">
        <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        Cargando...
      </div>
    )
  }

  if (!socio) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Socio no encontrado</p>
        <Link href="/dashboard/socios" className="text-primary-600 text-sm mt-2 inline-block">
          Volver a socios
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/dashboard/socios"
        className="flex items-center gap-1 text-sm transition mb-6" style={{ color: '#475569' }}
        onMouseOver={e => (e.currentTarget.style.color = '#94a3b8')}
        onMouseOut={e => (e.currentTarget.style.color = '#475569')}
      >
        <ChevronLeft size={15} />
        Volver a socios
      </Link>

      <p className="section-title mb-1">Editar socio</p>
      <h2 className="text-2xl font-bold text-white mb-6">{socio.razonSocial}</h2>

      {/* Banners de acción */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {/* Compartir formulario */}
        <div className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
          style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: '#4ade80' }}>Formulario socio</p>
            <p className="text-xs" style={{ color: '#475569' }}>Enviá el link al socio para que llene sus datos</p>
          </div>
          <button onClick={compartirWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition shrink-0"
            style={{ background: '#16a34a', border: '1px solid #22c55e' }}>
            <MessageCircle size={12} />
            WhatsApp
          </button>
        </div>

        {/* ID Firestore */}
        <div className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
          style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: '#60a5fa' }}>ID Firestore · 3DVista</p>
            <p className="font-mono text-xs select-all truncate" style={{ color: '#93c5fd' }}>{id}</p>
          </div>
          <button onClick={copyId}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition shrink-0"
            style={{ background: '#2563eb', border: '1px solid #3b82f6' }}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      </div>

      <SocioForm
        defaultValues={socio}
        onSubmit={handleSubmit}
        submitLabel="Guardar cambios"
        socioId={id}
      />
    </div>
  )
}

