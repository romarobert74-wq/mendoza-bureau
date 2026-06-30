'use client'

import { useRouter } from 'next/navigation'
import { crearSocio } from '@/lib/firestore'
import { SocioForm } from '@/components/SocioForm'
import type { SocioFormData } from '@/types'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function NuevoSocioPage() {
  const router = useRouter()

  const handleSubmit = async (data: SocioFormData) => {
    try {
      await crearSocio(data)
      toast.success('Socio creado correctamente')
      router.push('/dashboard/socios')
    } catch {
      toast.error('Error al crear el socio')
    }
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

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Socio</h2>

      <SocioForm onSubmit={handleSubmit} submitLabel="Crear socio" />
    </div>
  )
}
