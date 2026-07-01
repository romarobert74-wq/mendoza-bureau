'use client'

import { useForm } from 'react-hook-form'
import type { SocioFormData, CategoriaSocio } from '@/types'
import { CATEGORIAS } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { SocioFotos } from './SocioFotos'

const CATEGORIAS_OPTIONS = Object.entries(CATEGORIAS) as [CategoriaSocio, string][]

const lbl = 'block text-xs font-semibold uppercase tracking-wide mb-1.5'
const lbl_color = { color: '#94a3b8' }

interface Props {
  defaultValues?: Partial<SocioFormData>
  onSubmit: (data: SocioFormData) => Promise<void>
  submitLabel: string
  socioId?: string
}

export function SocioForm({ defaultValues, onSubmit, submitLabel, socioId }: Props) {
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

  const Section = ({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) => (
    <section className="rounded-xl p-6 space-y-4" style={{ background: '#0d1225', border: '1px solid #1a2235' }}>
      <div>
        <p className="section-title">{title}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{sub}</p>}
      </div>
      {children}
    </section>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Info básica */}
      <Section title="Información básica">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={lbl} style={lbl_color}>Razón Social *</label>
            <input {...register('razonSocial', { required: 'Requerido' })} className="input" placeholder="Ej: Bodega Salentein" />
            {errors.razonSocial && <p className="text-red-400 text-xs mt-1">{errors.razonSocial.message}</p>}
          </div>

          <div>
            <label className={lbl} style={lbl_color}>Etiqueta en Tour Madre *</label>
            <input {...register('etiqueta', { required: 'Requerido' })} className="input" placeholder="Nombre en el menú del tour" />
            {errors.etiqueta && <p className="text-red-400 text-xs mt-1">{errors.etiqueta.message}</p>}
          </div>

          <div>
            <label className={lbl} style={lbl_color}>Categoría</label>
            <select {...register('categoria')} className="input" style={{ background: '#111827' }}>
              {CATEGORIAS_OPTIONS.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={lbl} style={lbl_color}>Dirección</label>
            <input {...register('direccion')} className="input" placeholder="Ej: Ruta 89 s/n, Tunuyán" />
          </div>

          <div>
            <label className={lbl} style={lbl_color}>URL Google Maps</label>
            <input {...register('ubicacionUrl')} className="input" placeholder="https://maps.app.goo.gl/..." />
            <p className="text-xs mt-1" style={{ color: '#475569' }}>Link de "Compartir" de Google Maps</p>
          </div>

          <div className="md:col-span-2">
            <label className={lbl} style={lbl_color}>Información general</label>
            <textarea {...register('infoGeneral')} rows={4} className="input resize-none" placeholder="Descripción del socio..." />
          </div>

          <div>
            <label className={lbl} style={lbl_color}>URL Foto de Portada</label>
            <input {...register('fotoPortada')} className="input" placeholder="https://..." />
          </div>

          <div>
            <label className={lbl} style={lbl_color}>URL Logo del Socio</label>
            <input {...register('logoUrl')} className="input" placeholder="https://... (PNG transparente)" />
            <p className="text-xs mt-1" style={{ color: '#475569' }}>Se mostrará en el banner de la web institucional</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input type="checkbox" id="activo" {...register('activo')} className="w-4 h-4 accent-blue-500 cursor-pointer" />
            <label htmlFor="activo" className="text-sm cursor-pointer" style={{ color: '#94a3b8' }}>
              Socio activo <span style={{ color: '#475569' }}>(visible en tours)</span>
            </label>
          </div>
        </div>
      </Section>

      {/* Contacto */}
      <Section title="Contacto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={lbl} style={lbl_color}>WhatsApp</label>
            <input {...register('contacto.whatsapp')} className="input" placeholder="+54 261..." />
          </div>
          <div>
            <label className={lbl} style={lbl_color}>Email</label>
            <input {...register('contacto.email')} type="email" className="input" placeholder="contacto@..." />
          </div>
          <div>
            <label className={lbl} style={lbl_color}>Web institucional</label>
            <input {...register('contacto.web')} className="input" placeholder="https://..." />
          </div>
          <div>
            <label className={lbl} style={lbl_color}>Redes sociales</label>
            <input {...register('contacto.redes')} className="input" placeholder="@usuario o URL" />
          </div>
        </div>
      </Section>

      {/* URLs internas — solo el_faro */}
      {isElFaro && (
        <Section title="URLs internas (3DVista)" sub="Solo visibles para El Faro">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={lbl} style={lbl_color}>URL interna — Ida</label>
              <input {...register('urlInternaTour')} className="input" placeholder="URL tour madre → tour socio" />
            </div>
            <div>
              <label className={lbl} style={lbl_color}>URL interna — Vuelta</label>
              <input {...register('urlInternaVuelta')} className="input" placeholder="URL para regresar al tour madre" />
            </div>
            <div className="md:col-span-2">
              <label className={lbl} style={lbl_color}>URL Drive (archivos del proyecto)</label>
              <input {...register('urlDrive')} className="input" placeholder="https://drive.google.com/..." />
            </div>
          </div>
        </Section>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary px-8 py-2.5 disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : submitLabel}
        </button>
      </div>

      {socioId && <SocioFotos socioId={socioId} />}
    </form>
  )
}
