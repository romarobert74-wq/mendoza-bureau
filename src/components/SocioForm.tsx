'use client'

import { useForm } from 'react-hook-form'
import type { SocioFormData, CategoriaSocio } from '@/types'
import { CATEGORIAS } from '@/types'
import { useAuth } from '@/context/AuthContext'

const CATEGORIAS_OPTIONS = Object.entries(CATEGORIAS) as [CategoriaSocio, string][]

interface Props {
  defaultValues?: Partial<SocioFormData>
  onSubmit: (data: SocioFormData) => Promise<void>
  submitLabel: string
}

export function SocioForm({ defaultValues, onSubmit, submitLabel }: Props) {
  const { usuario } = useAuth()
  const isElFaro = usuario?.rol === 'el_faro'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SocioFormData>({
    defaultValues: {
      activo: true,
      categoria: 'bodega',
      contacto: { whatsapp: '', email: '', web: '', redes: '' },
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Info básica */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Información básica</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social *</label>
            <input
              {...register('razonSocial', { required: 'Requerido' })}
              className="input"
              placeholder="Ej: Bodega Salentein"
            />
            {errors.razonSocial && <p className="text-red-500 text-xs mt-1">{errors.razonSocial.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta en Tour Madre *</label>
            <input
              {...register('etiqueta', { required: 'Requerido' })}
              className="input"
              placeholder="Nombre que aparece en el menú del tour"
            />
            {errors.etiqueta && <p className="text-red-500 text-xs mt-1">{errors.etiqueta.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            <select {...register('categoria')} className="input">
              {CATEGORIAS_OPTIONS.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input
              {...register('direccion')}
              className="input"
              placeholder="Ej: Ruta 89 s/n, Tunuyán"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Información general</label>
            <textarea
              {...register('infoGeneral')}
              rows={4}
              className="input resize-none"
              placeholder="Descripción del socio..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Foto de Portada</label>
            <input
              {...register('fotoPortada')}
              className="input"
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="activo" {...register('activo')} className="w-4 h-4 accent-primary-600" />
            <label htmlFor="activo" className="text-sm text-gray-700">Socio activo (visible en tours)</label>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <input {...register('contacto.whatsapp')} className="input" placeholder="+54 261..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input {...register('contacto.email')} type="email" className="input" placeholder="contacto@..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Web institucional</label>
            <input {...register('contacto.web')} className="input" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Redes sociales</label>
            <input {...register('contacto.redes')} className="input" placeholder="@usuario o URL" />
          </div>
        </div>
      </section>

      {/* URLs internas — solo el_faro */}
      {isElFaro && (
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-1">URLs internas (3DVista)</h3>
          <p className="text-gray-400 text-xs mb-4">Solo visibles para El Faro</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL interna — Ida</label>
              <input
                {...register('urlInternaTour')}
                className="input"
                placeholder="URL dentro del tour madre → tour del socio"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL interna — Vuelta</label>
              <input
                {...register('urlInternaVuelta')}
                className="input"
                placeholder="URL para regresar al tour madre"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Drive (archivos del proyecto)</label>
              <input
                {...register('urlDrive')}
                className="input"
                placeholder="https://drive.google.com/..."
              />
            </div>
          </div>
        </section>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
