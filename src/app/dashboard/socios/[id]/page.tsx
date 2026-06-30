'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getSocio, actualizarSocio } from '@/lib/firestore'
import { SocioForm } from '@/components/SocioForm'
import type { Socio, SocioFormData } from '@/types'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function EditarSocioPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [socio, setSocio] = useState<Socio | null>(null)
  const [loading, setLoading] = useState(true)

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

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar: {socio.razonSocial}</h2>

      <SocioForm
        defaultValues={socio}
        onSubmit={handleSubmit}
        submitLabel="Guardar cambios"
        socioId={id}
      />
    </div>
  )
}
