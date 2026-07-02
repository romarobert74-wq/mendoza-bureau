'use client'

import { useForm, useWatch } from 'react-hook-form'
import { useRef, useState } from 'react'
import type { SocioFormData, CategoriaSocio } from '@/types'
import { CATEGORIAS, SALON_DATA_DEFAULT } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { SocioFotos } from './SocioFotos'
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

// ── Image Upload Widget ──────────────────────────────────────────────────────
function ImageUpload({
  label,
  hint,
  value,
  onChange,
  storagePath,
  aspect,
}: {
  label: string
  hint?: string
  value: string
  onChange: (url: string) => void
  storagePath: string
  aspect: 'cover' | 'logo'
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const url = await uploadImage(file, `${storagePath}.${ext}`, setProgress)
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
        {/* Preview */}
        {value && (
          <div className="relative group w-fit">
            <img
              src={value}
              alt={label}
              className="rounded-lg border object-contain"
              style={{
                height: aspect === 'cover' ? '90px' : '52px',
                width: aspect === 'cover' ? '100%' : 'auto',
                maxWidth: '100%',
                background: '#111827',
                borderColor: '#1e293b',
              }}
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              style={{ background: '#ef4444', border: '1px solid #f87171' }}
            >
              <X size={10} color="white" />
            </button>
          </div>
        )}

        {/* URL input */}
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="input text-xs"
          placeholder="https://... (o subí una imagen)"
          style={{ fontSize: '12px' }}
        />

        {/* Upload button */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition w-fit"
          style={{ background: '#1a2235', border: '1px solid #1e293b', color: '#94a3b8' }}
        >
          {uploading
            ? <><Loader2 size={13} className="animate-spin" /> Subiendo {progress}%</>
            : <><Upload size={13} /> Subir imagen</>
          }
        </button>
        {hint && <p className="text-xs" style={{ color: '#475569' }}>{hint}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}

// ── Checkbox field ────────────────────────────────────────────────────────────
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 accent-blue-500 cursor-pointer flex-shrink-0"
      />
      <span className="text-sm" style={{ color: '#94a3b8' }}>{label}</span>
    </label>
  )
}

// ── Number field ─────────────────────────────────────────────────────────────
function NumInput({ label, hint, value, onChange, placeholder }: {
  label: string; hint?: string; value: number | null; onChange: (v: number | null) => void; placeholder?: string
}) {
  return (
    <div>
      <label className={lbl} style={lbl_color}>{label}</label>
      <input
        type="number"
        min={0}
        value={value ?? ''}
        onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="input"
        placeholder={placeholder}
      />
      {hint && <p className="text-xs mt-1" style={{ color: '#475569' }}>{hint}</p>}
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────
export function SocioForm({ defaultValues, onSubmit, submitLabel, socioId }: Props) {
  const { usuario } = useAuth()
  const isElFaro = usuario?.rol === 'el_faro'

  const { register, handleSubmit, setValue, getValues, control, formState: { errors, isSubmitting } } = useForm<SocioFormData>({
    defaultValues: {
      activo: true,
      categoria: 'bodega',
      contacto: { whatsapp: '', email: '', web: '', redes: '' },
      fotoPortada: '',
      logoUrl: '',
      salonData: SALON_DATA_DEFAULT,
      ...defaultValues,
    },
  })

  const categoria = useWatch({ control, name: 'categoria' })
  const fotoPortada = useWatch({ control, name: 'fotoPortada' }) ?? ''
  const logoUrl = useWatch({ control, name: 'logoUrl' }) ?? ''

  // salon state managed locally (react-hook-form doesn't handle nested object well with checkboxes)
  const [salon, setSalon] = useState<typeof SALON_DATA_DEFAULT>(
    (defaultValues?.salonData ?? SALON_DATA_DEFAULT) as typeof SALON_DATA_DEFAULT
  )
  const setSalonField = <K extends keyof typeof SALON_DATA_DEFAULT>(k: K, v: (typeof SALON_DATA_DEFAULT)[K]) => {
    setSalon(prev => ({ ...prev, [k]: v }))
  }

  const doSubmit = async (data: SocioFormData) => {
    await onSubmit({ ...data, salonData: categoria === 'salon' ? salon : undefined })
  }

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

          {/* ── Imágenes con upload ── */}
          <ImageUpload
            label="Foto de Portada"
            value={fotoPortada}
            onChange={url => setValue('fotoPortada', url)}
            storagePath={`socios/${socioId ?? 'nuevo'}/portada`}
            aspect="cover"
          />
          <ImageUpload
            label="Logo del Socio"
            hint="Se mostrará en la web institucional"
            value={logoUrl}
            onChange={url => setValue('logoUrl', url)}
            storagePath={`socios/${socioId ?? 'nuevo'}/logo`}
            aspect="logo"
          />

          <div className="flex items-center gap-3 pt-2">
            <input type="checkbox" id="activo" {...register('activo')} className="w-4 h-4 accent-blue-500 cursor-pointer" />
            <label htmlFor="activo" className="text-sm cursor-pointer" style={{ color: '#94a3b8' }}>
              Socio activo <span style={{ color: '#475569' }}>(visible en tours)</span>
            </label>
          </div>
        </div>
      </Section>

      {/* ── Salón de eventos — solo cuando categoría = salon ── */}
      {categoria === 'salon' && (
        <Section title="Salón de Eventos" sub="Completá la ficha técnica del salón para el comparador">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NumInput label="Capacidad sentados" value={salon.capacidadSentados} onChange={v => setSalonField('capacidadSentados', v)} placeholder="Ej: 200" />
            <NumInput label="Capacidad cóctel" value={salon.capacidadCoctel} onChange={v => setSalonField('capacidadCoctel', v)} placeholder="Ej: 350" />
            <NumInput label="Capacidad de pie" value={salon.capacidadPie} onChange={v => setSalonField('capacidadPie', v)} placeholder="Ej: 500" />
            <NumInput label="Metros² cubiertos" value={salon.metrosCuadrados} onChange={v => setSalonField('metrosCuadrados', v)} placeholder="Ej: 450" />
            <NumInput label="Cantidad de baños" value={salon.cantidadBanios} onChange={v => setSalonField('cantidadBanios', v)} placeholder="Ej: 4" />
            <NumInput label="Cantidad de salones" hint="Si tiene varias salas" value={salon.cantidadSalones} onChange={v => setSalonField('cantidadSalones', v)} placeholder="Ej: 3" />
          </div>

          {/* Escenario */}
          <div className="pt-2 space-y-3">
            <Check label="Tiene escenario" checked={salon.tieneEscenario} onChange={v => setSalonField('tieneEscenario', v)} />
            {salon.tieneEscenario && (
              <div>
                <label className={lbl} style={lbl_color}>Dimensiones del escenario</label>
                <input
                  value={salon.dimensionesEscenario}
                  onChange={e => setSalonField('dimensionesEscenario', e.target.value)}
                  className="input"
                  placeholder="Ej: 8m x 4m"
                />
              </div>
            )}
          </div>

          {/* Equipamiento técnico */}
          <div className="pt-2">
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#64748b' }}>Equipamiento técnico</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Check label="Sistema de música" checked={salon.tieneMusica} onChange={v => setSalonField('tieneMusica', v)} />
              <Check label="Iluminación profesional" checked={salon.tieneLuces} onChange={v => setSalonField('tieneLuces', v)} />
              <Check label="Sistema de sonido" checked={salon.tieneSonido} onChange={v => setSalonField('tieneSonido', v)} />
              <Check label="Proyector" checked={salon.tieneProyector} onChange={v => setSalonField('tieneProyector', v)} />
              <Check label="Pantalla" checked={salon.tienePantalla} onChange={v => setSalonField('tienePantalla', v)} />
            </div>
          </div>

          {/* Servicios */}
          <div className="pt-2">
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#64748b' }}>Servicios incluidos</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Check label="Catering incluido" checked={salon.incluyeCatering} onChange={v => setSalonField('incluyeCatering', v)} />
              <Check label="Estacionamiento" checked={salon.tieneEstacionamiento} onChange={v => setSalonField('tieneEstacionamiento', v)} />
              <Check label="Accesibilidad" checked={salon.tieneAccesibilidad} onChange={v => setSalonField('tieneAccesibilidad', v)} />
              <Check label="Salón divisible" checked={salon.dividible} onChange={v => setSalonField('dividible', v)} />
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className={lbl} style={lbl_color}>Observaciones / Servicios adicionales</label>
            <textarea
              value={salon.observaciones}
              onChange={e => setSalonField('observaciones', e.target.value)}
              rows={3}
              className="input resize-none"
              placeholder="Ej: Incluye guardarropas, sala VIP, terraza exterior, etc."
            />
          </div>
        </Section>
      )}

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
