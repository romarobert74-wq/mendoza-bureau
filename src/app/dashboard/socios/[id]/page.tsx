'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getSocio, actualizarSocio } from '@/lib/firestore'
import { SocioForm } from '@/components/SocioForm'
import type { Socio, SocioFormData } from '@/types'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ChevronLeft, Copy, Check } from 'lucide-react'

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
      <Link
        href="/dashboard/socios"
        className="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm mb-6 transition"
      >
        <ChevronLeft size={16} />
        Volver a socios
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Editar: {socio.razonSocial}</h2>
      </div>

      {/* ID para 3DVista */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-0.5">ID de Firestore — usar en WebFrame 3DVista</p>
          <p className="font-mono text-sm text-indigo-900 select-all">{id}</p>
          <p className="text-xs text-indigo-400 mt-0.5">
            Ejemplo URL: <span className="font-mono">https://mendoza-bureau.vercel.app/tour/socio/fotos?id={id}</span>
          </p>
        </div>
        <button
          onClick={copyId}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition shrink-0"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copiado' : 'Copiar ID'}
        </button>
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

