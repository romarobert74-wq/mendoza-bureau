'use client'

import { useForm, useWatch } from 'react-hook-form'
import { useRef, useState } from 'react'
import type {
  SocioFormData, CategoriaSocio, SalonIndividual,
  HotelData, RestauranteData, BodegaData, AlojamientoData, ServicioData,
} from '@/types'
import {
  CATEGORIAS,
  HOTEL_VACIO, RESTAURANTE_VACIO, BODEGA_VACIA, ALOJAMIENTO_VACIO, SERVICIO_VACIO,
} from '@/types'
import { useAuth } from '@/context/AuthContext'
import { SocioFotos } from './SocioFotos'
import { SalonesEditor } from './SalonesEditor'
import { CategoryEditor } from './CategoryEditor'
import { uploadImage } from '@/lib/storage'
import { Upload, Loader2, X } from 'lucide-react'

const CATEGORIAS_OPTIONS = Object.entries(CATEGORIAS) as [CategoriaSocio, string][]
const lbl = 'block text-xs font-semibold uppercase tracking-wide mb-1.5'
const lbl_color = { color: '#94a3b8' }

interface Props {
  defaultValues?: Partial<SocioFormData>
  onSubmit: (data: SocioFormData) => Promise<void>
  submitLabel: string
  socioId?: string
}

// ── Image Upload Widget ───────────────────────────────────────────────────────
function ImageUpload({ label, hint, value, onChange, storagePath, aspect }: {
  label: string; hint?: string; value: string; onChange: (url: string) => void
  storagePath: string; aspect: 'cover' | 'logo'
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    try {
      const url = aspect === 'logo'
        ? await uploadImage(file, undefined, setProgress, { preserveAlpha: true, maxPx: 500 })
        : await uploadImage(file, undefined, setProgress, { maxPx: 1400, quality: 0.82 })
      onChange(url)
    } catch {
      alert('Error al subir la imagen. Intentá de nuevo.')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div>
      <label className={lbl} style={lbl_color}>{label}</label>
      <div className="flex flex-col gap-2">
        {value && (
          <div className="relative group w-fit">
            <img src={value} alt={label} className="rounded-lg border object-contain"
              style={{ height: aspect === 'cover' ? '90px' : '52px', width: aspect === 'cover' ? '100%' : 'auto', maxWidth: '100%', background: '#111827', borderColor: '#1e293b' }} />
            <button type="button" onClick={() => onChange('')}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              style={{ background: '#ef4444', border: '1px solid #f87171' }}>
              <X size={10} color="white" />
            </button>
          </div>
        )}
        <input value={value} onChange={e => onChange(e.target.value)} className="input text-xs"
          placeholder="https://... (o subí una imagen)" style={{ fontSize: '12px' }} />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition w-fit"
          style={{ background: '#1a2235', border: '1px solid #1e293b', color: '#94a3b8' }}>
          {uploading
            ? <><Loader2 size={13} className="animate-spin" /> Subiendo {progress}%</>
            : <><Upload size={13} /> Subir imagen</>}
        </button>
        {hint && <p className="text-xs" style={{ color: '#475569' }}>{hint}</p>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────
export function SocioForm({ defaultValues, onSubmit, submitLabel, socioId }: Props) {
  const { usuario } = useAuth()
  const isElFaro = usuario?.rol === 'el_faro'

  const { register, handleSubmit, setValue, control, formState: { errors, isSubmitting } } = useForm<SocioFormData>({
    defaultValues: {
      activo: true,
      categoria: 'bodega',
      contacto: { whatsapp: '', email: '', web: '', redes: '' },
      fotoPortada: '',
      logoUrl: '',
      salones: [],
      ...defaultValues,
    },
  })

  const fotoPortada = useWatch({ control, name: 'fotoPortada' }) ?? ''
  const logoUrl = useWatch({ control, name: 'logoUrl' }) ?? ''
  const categoria = useWatch({ control, name: 'categoria' }) ?? 'bodega'

  const [salones, setSalones] = useState<SalonIndividual[]>(defaultValues?.salones ?? [])
  const [hotelData, setHotelData] = useState<HotelData>(defaultValues?.hotelData ?? HOTEL_VACIO())
  const [restauranteData, setRestauranteData] = useState<RestauranteData>(defaultValues?.restauranteData ?? RESTAURANTE_VACIO())
  const [bodegaData, setBodegaData] = useState<BodegaData>(defaultValues?.bodegaData ?? BODEGA_VACIA())
  const [alojamientoData, setAlojamientoData] = useState<AlojamientoData>(defaultValues?.alojamientoData ?? ALOJAMIENTO_VACIO())
  const [servicioData, setServicioData] = useState<ServicioData>(defaultValues?.servicioData ?? SERVICIO_VACIO())

  const doSubmit = async (data: SocioFormData) => {
    await onSubmit({
      ...data,
      salones,
      hotelData,
      restauranteData,
      bodegaData,
      alojamientoData,
      servicioData,
    })
  }

  const Section = ({ title, sub, children, defaultOpen = true }: { title: string; sub?: string; children: React.ReactNode; defaultOpen?: boolean }) => {
    const [open, setOpen] = useState(defaultOpen)
    return (
      <section className="rounded-xl overflow-hidden" style={{ background: '#0d1225', border: '1px solid #1a2235' }}>
        <button type="button" onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-left"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <div>
            <p className="section-title" style={{ margin: 0 }}>{title}</p>
            {sub && <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{sub}</p>}
          </div>
          <span style={{ color: '#475569', flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
        </button>
        {open && <div className="px-6 pb-6 space-y-4">{children}</div>}
      </section>
    )
  }

  return (
    <form onSubmit={handleSubmit(doSubmit)} className="space-y-5">

      {/* ── Info básica ── */}
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

          <ImageUpload label="Foto de Portada" value={fotoPortada}
            onChange={url => setValue('fotoPortada', url)}
            storagePath={`socios/${socioId ?? 'nuevo'}/portada`} aspect="cover" />
          <ImageUpload label="Logo del Socio" hint="Se mostrará en la web institucional" value={logoUrl}
            onChange={url => setValue('logoUrl', url)}
            storagePath={`socios/${socioId ?? 'nuevo'}/logo`} aspect="logo" />

          <div className="flex items-center gap-3 pt-2">
            <input type="checkbox" id="activo" {...register('activo')} className="w-4 h-4 accent-blue-500 cursor-pointer" />
            <label htmlFor="activo" className="text-sm cursor-pointer" style={{ color: '#94a3b8' }}>
              Socio activo <span style={{ color: '#475569' }}>(visible en tours)</span>
            </label>
          </div>
        </div>
      </Section>

      {/* ── Ficha técnica según categoría ── */}
      <CategoryEditor
        categoria={categoria as CategoriaSocio}
        hotelData={hotelData}
        restauranteData={restauranteData}
        bodegaData={bodegaData}
        alojamientoData={alojamientoData}
        servicioData={servicioData}
        onChange={updates => {
          if (updates.hotelData) setHotelData(updates.hotelData)
          if (updates.restauranteData) setRestauranteData(updates.restauranteData)
          if (updates.bodegaData) setBodegaData(updates.bodegaData)
          if (updates.alojamientoData) setAlojamientoData(updates.alojamientoData)
          if (updates.servicioData) setServicioData(updates.servicioData)
        }}
      />

      {/* ── Salones de eventos — disponible para cualquier categoría ── */}
      <SalonesEditor salones={salones} onChange={setSalones} />

      {/* ── Contacto ── */}
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

      {/* ── URLs internas — solo el_faro ── */}
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
        <button type="submit" disabled={isSubmitting} className="btn-primary px-8 py-2.5 disabled:opacity-50">
          {isSubmitting ? 'Guardando...' : submitLabel}
        </button>
      </div>

      {socioId && <SocioFotos socioId={socioId} />}
    </form>
  )
}
