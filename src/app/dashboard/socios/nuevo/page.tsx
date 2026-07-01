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
      <Link href="/dashboard/socios"
        className="flex items-center gap-1 text-sm transition mb-6" style={{ color: '#475569' }}>
        <ChevronLeft size={15} />
        Volver a socios
      </Link>

      <p className="section-title mb-1">Nuevo registro</p>
      <h2 className="text-2xl font-bold text-white mb-5">Crear Socio</h2>

      <div className="rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-2"
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}>
        📸 La <strong>galería de fotos</strong> y el <strong>ID para 3DVista</strong> aparecen al editar el socio una vez creado.
      </div>

      <SocioForm onSubmit={handleSubmit} submitLabel="Crear socio" />
    </div>
  )
}
