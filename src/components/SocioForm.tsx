'use client'

import { useForm, useWatch, useFieldArray } from 'react-hook-form'
import type { Control, UseFormSetValue, UseFormRegister } from 'react-hook-form'
import { useRef, useState } from 'react'
import type {
  SocioFormData, CategoriaSocio, SalonIndividual,
  HotelData, RestauranteData, BodegaData, AlojamientoData, ServicioData,
} from '@/types'
import {
  CATEGORIAS, ICONOS_BOTONERA,
  HOTEL_VACIO, RESTAURANTE_VACIO, BODEGA_VACIA, ALOJAMIENTO_VACIO, SERVICIO_VACIO,
} from '@/types'
import { useAuth } from '@/context/AuthContext'
import { SocioFotos } from './SocioFotos'
import { SalonesEditor } from './SalonesEditor'
import { CategoryEditor } from './CategoryEditor'
import { uploadImage } from '@/lib/storage'
import {
  Upload, Loader2, X, Plus, ArrowUp, ArrowDown, Compass, ChevronDown, Copy, Check,
  DoorOpen, BedDouble, Waves, Wine, Grape, Utensils, Flower2, Dumbbell,
  PartyPopper, Sofa, Images, Sunset, Umbrella, ShoppingBag, MapPin, Sparkles,
  MessageCircle, CalendarDays,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ICONOS_OPTS = Object.entries(ICONOS_BOTONERA) as [string, string][]

const ICONO_COMP: Record<string, LucideIcon> = {
  puerta: DoorOpen, cama: BedDouble, pileta: Waves, copa: Wine, vinedo: Grape,
  cubiertos: Utensils, spa: Flower2, gimnasio: Dumbbell, salon: PartyPopper,
  sillon: Sofa, galeria: Images, atardecer: Sunset, terraza: Umbrella,
  tienda: ShoppingBag, pin: MapPin, estrella: Sparkles,
  whatsapp: MessageCircle, calendario: CalendarDays,
}

// Selector visual de ícono (muestra el dibujo + el nombre)
function IconoPicker({ value, onChange }: { value: string; onChange: (k: string) => void }) {
  const Actual = value ? ICONO_COMP[value] : undefined
  return (
    <details className="relative">
      <summary className="input flex items-center gap-2 cursor-pointer list-none" style={{ userSelect: 'none' }}>
        {Actual ? <Actual size={16} /> : <span style={{ color: '#64748b' }}>—</span>}
        <span className="flex-1 truncate" style={{ fontSize: 13 }}>
          {value ? ICONOS_BOTONERA[value] : 'Sin ícono'}
        </span>
        <ChevronDown size={14} style={{ color: '#64748b' }} />
      </summary>
      <div className="absolute z-20 mt-1 p-2 rounded-lg grid grid-cols-4 gap-1 shadow-xl"
        style={{ background: '#0f1729', border: '1px solid #1e293b', width: 260, maxHeight: 240, overflowY: 'auto' }}>
        <button type="button" onClick={e => { onChange(''); (e.currentTarget.closest('details') as HTMLDetailsElement).open = false }}
          className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-slate-700/40"
          title="Sin ícono" style={{ color: '#94a3b8' }}>
          <X size={18} /><span style={{ fontSize: 9 }}>Ninguno</span>
        </button>
        {ICONOS_OPTS.map(([k, label]) => {
          const Ic = ICONO_COMP[k]
          const on = k === value
          return (
            <button key={k} type="button" title={label}
              onClick={e => { onChange(k); (e.currentTarget.closest('details') as HTMLDetailsElement).open = false }}
              className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-slate-700/40"
              style={{ color: on ? '#ff8a4d' : '#cbd5e1', background: on ? 'rgba(255,106,61,.12)' : 'transparent' }}>
              <Ic size={18} />
              <span style={{ fontSize: 9, textAlign: 'center', lineHeight: 1.1 }}>{label.split(' / ')[0]}</span>
            </button>
          )
        })}
      </div>
    </details>
  )
}

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

// Muestra la URL del webframe "Ir a" con botón para copiarla al portapapeles
function CopiarLinkWebframe({ socioId }: { socioId: string }) {
  const url = `https://mendoza-bureau.vercel.app/tour/ir-a/${socioId}`
  const [copiado, setCopiado] = useState(false)
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1800)
    } catch { /* algunos navegadores bloquean clipboard sin gesto */ }
  }
  return (
    <div className="flex items-center gap-2 flex-wrap rounded-lg p-2.5"
      style={{ background: '#0b1220', border: '1px solid #1e293b' }}>
      <Compass size={14} style={{ color: '#64748b', flexShrink: 0 }} />
      <span className="text-xs" style={{ color: '#64748b' }}>URL del webframe (3DVista):</span>
      <code className="text-xs flex-1 truncate" style={{ color: '#93c5fd', minWidth: 120 }}>{url}</code>
      <button type="button" onClick={copiar}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
        style={copiado
          ? { background: '#052e16', border: '1px solid #16a34a', color: '#4ade80' }
          : { background: '#1a2235', border: '1px solid #1e293b', color: '#93c5fd' }}>
        {copiado ? <><Check size={13} /> ¡Copiado!</> : <><Copy size={13} /> Copiar link</>}
      </button>
    </div>
  )
}

// Conecta el IconoPicker con react-hook-form (lee/escribe botonera.i.icono)
function BotonIcono({ control, index, setValue }: {
  control: Control<SocioFormData>; index: number; setValue: UseFormSetValue<SocioFormData>
}) {
  const value = (useWatch({ control, name: `botonera.${index}.icono` }) as string) ?? ''
  return (
    <IconoPicker
      value={value}
      onChange={k => setValue(`botonera.${index}.icono`, k, { shouldDirty: true })}
    />
  )
}

// Una fila de la botonera. Según la acción muestra el campo panorama o el aviso
// de que el botón usa el WhatsApp del socio.
function BotonRow({ index, register, control, setValue, isFirst, isLast, onUp, onDown, onRemove }: {
  index: number
  register: UseFormRegister<SocioFormData>
  control: Control<SocioFormData>
  setValue: UseFormSetValue<SocioFormData>
  isFirst: boolean; isLast: boolean
  onUp: () => void; onDown: () => void; onRemove: () => void
}) {
  const tipo = (useWatch({ control, name: `botonera.${index}.tipo` }) as string) || 'panorama'
  const esWhats = tipo === 'whatsapp'
  const btnMini = { background: '#1a2235', border: '1px solid #1e293b', color: '#94a3b8' } as const

  return (
    <div className="rounded-lg p-3 flex flex-col gap-2"
      style={{ background: '#0f1729', border: `1px solid ${esWhats ? '#14532d' : '#1e293b'}` }}>
      {/* Selector de acción */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={lbl} style={{ ...lbl_color, marginBottom: 0 }}>Acción:</span>
        {(['panorama', 'whatsapp'] as const).map(op => (
          <button key={op} type="button"
            onClick={() => setValue(`botonera.${index}.tipo`, op, { shouldDirty: true })}
            className="px-2.5 py-1 rounded-md text-xs font-semibold transition"
            style={tipo === op
              ? (op === 'whatsapp'
                ? { background: '#052e16', border: '1px solid #16a34a', color: '#4ade80' }
                : { background: '#1e293b', border: '1px solid #3b82f6', color: '#93c5fd' })
              : { background: 'transparent', border: '1px solid #1e293b', color: '#64748b' }}>
            {op === 'panorama' ? 'Ir a panorama' : 'WhatsApp del socio'}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-end gap-2">
        <div className="flex-1">
          <label className={lbl} style={lbl_color}>Texto del botón</label>
          <input {...register(`botonera.${index}.etiqueta` as const)} className="input"
            placeholder={esWhats ? 'Reservar ahora' : 'Recepción'} />
        </div>

        <div className="flex-1">
          {esWhats ? (
            <>
              <label className={lbl} style={lbl_color}>Destino</label>
              <div className="input flex items-center gap-1.5" style={{ color: '#4ade80', background: '#0b1220' }}>
                <MessageCircle size={14} /> <span style={{ fontSize: 12 }}>Usa el WhatsApp del socio</span>
              </div>
            </>
          ) : (
            <>
              <label className={lbl} style={lbl_color}>Panorama en 3DVista</label>
              <input {...register(`botonera.${index}.panorama` as const)} className="input" placeholder="recepcion" />
            </>
          )}
        </div>

        <div style={{ minWidth: 170 }}>
          <label className={lbl} style={lbl_color}>Ícono</label>
          <BotonIcono control={control} index={index} setValue={setValue} />
        </div>
        <div style={{ minWidth: 130 }}>
          <label className={lbl} style={lbl_color}>Grupo (opcional)</label>
          <input {...register(`botonera.${index}.grupo` as const)} className="input" placeholder="Hotel" />
        </div>
        <div className="flex gap-1 pb-0.5">
          <button type="button" title="Subir" disabled={isFirst} onClick={onUp}
            className="w-8 h-9 rounded-lg flex items-center justify-center disabled:opacity-30" style={btnMini}>
            <ArrowUp size={14} />
          </button>
          <button type="button" title="Bajar" disabled={isLast} onClick={onDown}
            className="w-8 h-9 rounded-lg flex items-center justify-center disabled:opacity-30" style={btnMini}>
            <ArrowDown size={14} />
          </button>
          <button type="button" title="Eliminar" onClick={onRemove}
            className="w-8 h-9 rounded-lg flex items-center justify-center"
            style={{ background: '#2a1520', border: '1px solid #7f1d1d', color: '#f87171' }}>
            <X size={14} />
          </button>
        </div>
      </div>
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
      videos: ['', '', ''],
      botonera: [],
      ...defaultValues,
    },
  })

  const botonera = useFieldArray({ control, name: 'botonera' })

  const fotoPortada = useWatch({ control, name: 'fotoPortada' }) ?? ''
  const logoUrl = useWatch({ control, name: 'logoUrl' }) ?? ''
  const categoria = useWatch({ control, name: 'categoria' }) ?? 'bodega'

  const [salones, setSalones] = useState<SalonIndividual[]>(defaultValues?.salones ?? [])
  // Se mergea con los defaults para que socios viejos tengan los campos nuevos
  const [hotelData, setHotelData] = useState<HotelData>({ ...HOTEL_VACIO(), ...defaultValues?.hotelData })
  const [restauranteData, setRestauranteData] = useState<RestauranteData>({ ...RESTAURANTE_VACIO(), ...defaultValues?.restauranteData })
  const [bodegaData, setBodegaData] = useState<BodegaData>({ ...BODEGA_VACIA(), ...defaultValues?.bodegaData })
  const [alojamientoData, setAlojamientoData] = useState<AlojamientoData>({ ...ALOJAMIENTO_VACIO(), ...defaultValues?.alojamientoData })
  const [servicioData, setServicioData] = useState<ServicioData>({ ...SERVICIO_VACIO(), ...defaultValues?.servicioData })

  const doSubmit = async (data: SocioFormData) => {
    // Los inputs numéricos vacíos llegan como NaN → Firestore no los acepta
    const limpiarRating = (v: number | null | undefined) =>
      typeof v === 'number' && !isNaN(v) ? v : null
    await onSubmit({
      ...data,
      googleRating: limpiarRating(data.googleRating),
      tripadvisorRating: limpiarRating(data.tripadvisorRating),
      googleUrl: data.googleUrl ?? '',
      tripadvisorUrl: data.tripadvisorUrl ?? '',
      videos: (data.videos ?? []).map(v => (v ?? '').toString().trim()).filter(Boolean),
      botonera: (data.botonera ?? [])
        .map(b => ({
          etiqueta: (b.etiqueta ?? '').toString().trim(),
          panorama: (b.panorama ?? '').toString().trim(),
          icono: (b.icono ?? '').toString().trim(),
          grupo: (b.grupo ?? '').toString().trim(),
          tipo: (b.tipo === 'whatsapp' ? 'whatsapp' : 'panorama') as 'panorama' | 'whatsapp',
        }))
        // Panorama: requiere nombre. WhatsApp: solo requiere etiqueta.
        .filter(b => b.etiqueta && (b.tipo === 'whatsapp' || b.panorama)),
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

      {/* ── Reseñas ── */}
      <Section title="Reseñas" sub="Puntaje y link a las plataformas (se muestran en la ficha del tour)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={lbl} style={lbl_color}>Puntaje Google (0 a 5)</label>
            <input {...register('googleRating', { valueAsNumber: true })} type="number" step="0.1" min="0" max="5" className="input" placeholder="Ej: 4.5" />
          </div>
          <div>
            <label className={lbl} style={lbl_color}>Link a reseñas de Google</label>
            <input {...register('googleUrl')} className="input" placeholder="https://g.page/... o maps..." />
          </div>
          <div>
            <label className={lbl} style={lbl_color}>Puntaje TripAdvisor (0 a 5)</label>
            <input {...register('tripadvisorRating', { valueAsNumber: true })} type="number" step="0.1" min="0" max="5" className="input" placeholder="Ej: 4.0" />
          </div>
          <div>
            <label className={lbl} style={lbl_color}>Link a TripAdvisor</label>
            <input {...register('tripadvisorUrl')} className="input" placeholder="https://tripadvisor.com/..." />
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

      <Section title="Videos (YouTube o Vimeo)" sub="Hasta 3. Pegá el link del video; se muestran en la ficha del tour.">
        <div className="grid grid-cols-1 gap-3">
          {[0, 1, 2].map(i => (
            <div key={i}>
              <label className={lbl} style={lbl_color}>Video {i + 1}</label>
              <input {...register(`videos.${i}` as const)} className="input" placeholder="https://youtu.be/... o https://vimeo.com/..." />
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Botonera del tour — “Ir a”"
        sub="Botones que aparecen dentro del tour 3DVista para saltar a cada panorama. El nombre del panorama debe coincidir EXACTO con el que le pusiste en 3DVista (sin acentos, ej: recepcion, sala-cata)."
      >
        <div className="flex flex-col gap-3">
          {botonera.fields.length === 0 && (
            <p className="text-xs" style={{ color: '#64748b' }}>
              Todavía no hay botones. Agregá uno con el botón de abajo.
            </p>
          )}

          {botonera.fields.map((f, i) => (
            <BotonRow
              key={f.id} index={i} register={register} control={control} setValue={setValue}
              isFirst={i === 0} isLast={i === botonera.fields.length - 1}
              onUp={() => botonera.move(i, i - 1)} onDown={() => botonera.move(i, i + 1)}
              onRemove={() => botonera.remove(i)}
            />
          ))}

          <div className="flex flex-wrap gap-2">
            <button type="button"
              onClick={() => botonera.append({ etiqueta: '', panorama: '', icono: '', grupo: '', tipo: 'panorama' })}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition w-fit"
              style={{ background: '#1a2235', border: '1px solid #1e293b', color: '#94a3b8' }}>
              <Plus size={14} /> Agregar botón
            </button>
            <button type="button"
              onClick={() => botonera.append({ etiqueta: 'Reservar ahora', panorama: '', icono: 'whatsapp', grupo: '', tipo: 'whatsapp' })}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition w-fit"
              style={{ background: '#052e16', border: '1px solid #16a34a', color: '#4ade80' }}>
              <MessageCircle size={14} /> Agregar botón “Reservar” (WhatsApp)
            </button>
          </div>

          {socioId && <CopiarLinkWebframe socioId={socioId} />}
        </div>
      </Section>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={isSubmitting} className="btn-primary px-8 py-2.5 disabled:opacity-50">
          {isSubmitting ? 'Guardando...' : submitLabel}
        </button>
      </div>

      {socioId && <SocioFotos socioId={socioId} />}
    </form>
  )
}
