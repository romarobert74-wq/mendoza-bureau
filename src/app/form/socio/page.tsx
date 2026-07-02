'use client'

import { Suspense, useState, useRef } from 'react'
import { crearSocio } from '@/lib/firestore'
import { uploadImage } from '@/lib/storage'
import type {
  SocioFormData, CategoriaSocio, SalonIndividual,
  HotelData, RestauranteData, BodegaData, AlojamientoData, ServicioData,
} from '@/types'
import {
  CATEGORIAS,
  HOTEL_VACIO, RESTAURANTE_VACIO, BODEGA_VACIA, ALOJAMIENTO_VACIO, SERVICIO_VACIO,
} from '@/types'
import { CategoryEditor } from '@/components/CategoryEditor'
import { SalonesEditor } from '@/components/SalonesEditor'
import { CheckCircle, AlertCircle, ChevronRight, Upload, Loader2, X } from 'lucide-react'

const CATEGORIAS_OPTIONS = Object.entries(CATEGORIAS) as [CategoriaSocio, string][]

// ── Shared inline styles ──────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: '100%',
  background: '#111827',
  border: '1px solid #1e293b',
  borderRadius: '10px',
  padding: '10px 12px',
  fontSize: '14px',
  color: '#f1f5f9',
  outline: 'none',
}

const lbl: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#64748b',
  marginBottom: '6px',
}

const cardStyle: React.CSSProperties = {
  background: '#0d1225',
  border: '1px solid #1a2235',
  borderRadius: '16px',
  padding: '24px',
}

const secTitle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#f97316',
  marginBottom: '20px',
}

function ImageUploadField({ label, hint, value, onChange, storageId, aspect }: {
  label: string; hint?: string; value: string; onChange: (url: string) => void
  storageId: string; aspect: 'cover' | 'logo'
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const url = await uploadImage(file, `form/${storageId}/${aspect}.${ext}`, setProgress)
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
      <label style={lbl}>{label}</label>
      {hint && <p style={{ fontSize: '11px', color: '#334155', marginBottom: '8px' }}>{hint}</p>}

      {value ? (
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <img src={value} alt={label}
            style={{
              width: '100%',
              height: aspect === 'cover' ? '120px' : '64px',
              objectFit: aspect === 'cover' ? 'cover' : 'contain',
              borderRadius: '10px',
              border: '1px solid #1e293b',
              background: '#111827',
              display: 'block',
            }} />
          <button type="button" onClick={() => onChange('')}
            style={{ position: 'absolute', top: '6px', right: '6px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(15,23,42,0.85)', border: '1px solid #334155', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={12} color="#94a3b8" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          style={{ width: '100%', padding: '20px', borderRadius: '10px', border: '2px dashed #1e293b', background: '#0a0f1e', cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'border-color 0.2s' }}
          onMouseEnter={e => !uploading && ((e.currentTarget as HTMLButtonElement).style.borderColor = '#3b82f6')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = '#1e293b')}>
          {uploading ? (
            <>
              <Loader2 size={22} color="#3b82f6" style={{ animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '13px', color: '#64748b' }}>Subiendo... {progress}%</span>
              <div style={{ width: '100%', height: '3px', background: '#1e293b', borderRadius: '99px' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#2563eb,#60a5fa)', borderRadius: '99px', transition: 'width 0.2s' }} />
              </div>
            </>
          ) : (
            <>
              <Upload size={22} color="#475569" />
              <span style={{ fontSize: '13px', color: '#475569' }}>Tocá para subir {label.toLowerCase()}</span>
              <span style={{ fontSize: '11px', color: '#334155' }}>JPG, PNG, WEBP</span>
            </>
          )}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
    </div>
  )
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: '11px', color: '#334155', marginTop: '4px' }}>{hint}</p>}
    </div>
  )
}

function AccSection({ emoji, title, sub, defaultOpen = true, children }: {
  emoji: string; title: string; sub?: string; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
      <button type="button" onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' as const }}>
        <div>
          <p style={{ ...secTitle, marginBottom: sub ? '2px' : 0 }}>{emoji} {title}</p>
          {sub && <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>{sub}</p>}
        </div>
        <span style={{ color: '#475569', fontSize: '12px', flexShrink: 0, marginLeft: '12px' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>{children}</div>}
    </div>
  )
}

// ── Form ──────────────────────────────────────────────────────────────────────
function FormSocio() {
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  // Campos generales
  const [form, setForm] = useState({
    razonSocial: '',
    infoGeneral: '',
    categoria: 'bodega' as CategoriaSocio,
    direccion: '',
    ubicacionUrl: '',
    fotoPortada: '',
    logoUrl: '',
    whatsapp: '',
    email: '',
    web: '',
    redes: '',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  // Datos por categoría
  const [salones, setSalones] = useState<SalonIndividual[]>([])
  const [hotelData, setHotelData] = useState<HotelData>(HOTEL_VACIO())
  const [restauranteData, setRestauranteData] = useState<RestauranteData>(RESTAURANTE_VACIO())
  const [bodegaData, setBodegaData] = useState<BodegaData>(BODEGA_VACIA())
  const [alojamientoData, setAlojamientoData] = useState<AlojamientoData>(ALOJAMIENTO_VACIO())
  const [servicioData, setServicioData] = useState<ServicioData>(SERVICIO_VACIO())

  const handleCategoryChange = (updates: {
    hotelData?: HotelData
    restauranteData?: RestauranteData
    bodegaData?: BodegaData
    alojamientoData?: AlojamientoData
    servicioData?: ServicioData
  }) => {
    if (updates.hotelData) setHotelData(updates.hotelData)
    if (updates.restauranteData) setRestauranteData(updates.restauranteData)
    if (updates.bodegaData) setBodegaData(updates.bodegaData)
    if (updates.alojamientoData) setAlojamientoData(updates.alojamientoData)
    if (updates.servicioData) setServicioData(updates.servicioData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const data: SocioFormData = {
        razonSocial: form.razonSocial,
        etiqueta: form.razonSocial,
        categoria: form.categoria,
        infoGeneral: form.infoGeneral,
        direccion: form.direccion,
        ubicacionUrl: form.ubicacionUrl,
        fotoPortada: form.fotoPortada,
        logoUrl: form.logoUrl,
        activo: false,
        contacto: { whatsapp: form.whatsapp, email: form.email, web: form.web, redes: form.redes },
        urlInternaTour: '',
        urlInternaVuelta: '',
        urlDrive: '',
        salones,
        hotelData,
        restauranteData,
        bodegaData,
        alojamientoData,
        servicioData,
      }
      await crearSocio(data)
      setDone(true)
    } catch {
      setError('Hubo un error al enviar. Por favor intentá de nuevo.')
    }
    setSending(false)
  }

  // ── Pantalla de éxito ──────────────────────────────────────────────────────
  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: '#080c18', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '16px', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={40} color="#4ade80" />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>¡Datos enviados!</h2>
        <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '300px', margin: 0, lineHeight: 1.6 }}>
          Tu información fue recibida con éxito. En breve la revisaremos y la verás reflejada en el tour virtual.
        </p>
        <p style={{ fontSize: '11px', color: '#1e293b', marginTop: '24px' }}>Mendoza Bureau · El Faro 360</p>
      </div>
    )
  }

  const categoriaLabel = CATEGORIAS[form.categoria]
  const hasCategoryFields = ['hotel', 'restaurante', 'bodega', 'alojamiento', 'servicio'].includes(form.categoria)

  return (
    <div style={{ minHeight: '100vh', background: '#080c18', color: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(160deg, #0d1225 0%, #080c18 70%)', borderBottom: '1px solid #1a2235', padding: '56px 20px 48px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '99px', padding: '4px 16px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fb923c', marginBottom: '24px' }}>
            ✦ Mendoza Bureau · El Faro 360
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#f1f5f9', margin: '0 0 8px', lineHeight: 1.2 }}>
            Bienvenido al futuro del
          </h1>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#3b82f6', margin: '0 0 20px', lineHeight: 1.2 }}>
            turismo inmersivo
          </h1>
          <div style={{ width: '40px', height: '3px', background: 'linear-gradient(90deg, #2563eb, #f97316)', borderRadius: '99px', margin: '0 auto 24px' }} />
          <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '520px', margin: '0 auto 14px', lineHeight: 1.7 }}>
            Mendoza Bureau junto a El Faro 360 están desarrollando una plataforma inmersiva
            para que tu destino se vea en{' '}
            <strong style={{ color: '#f1f5f9' }}>360°</strong>{' '}
            y puedas mostrar tu lugar de una manera completamente diferente.
          </p>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
            Completá el siguiente formulario. Cuanto más detallado, mejor podremos representar tu negocio en el tour virtual.{' '}
            <strong style={{ color: '#f1f5f9' }}>¡Muchas gracias!</strong>
          </p>
        </div>
      </div>

      {/* ── Formulario ── */}
      <form onSubmit={handleSubmit} style={{ padding: '32px 20px 60px', maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Tu negocio */}
        <AccSection emoji="🏢" title="Tu negocio" defaultOpen={true}>
          <Field label="Nombre del negocio *">
            <input value={form.razonSocial} onChange={set('razonSocial')} required style={inp} placeholder="Ej: Bodega Salentein" />
          </Field>
          <Field label="Rubro *" hint="Elegí el que mejor describa tu negocio — aparecerán campos específicos a continuación">
            <select value={form.categoria} onChange={set('categoria')} style={{ ...inp, background: '#111827', cursor: 'pointer' }}>
              {CATEGORIAS_OPTIONS.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label="Descripción general *">
            <textarea value={form.infoGeneral} onChange={set('infoGeneral')} required rows={4}
              style={{ ...inp, resize: 'none' }}
              placeholder="Contanos sobre tu negocio: qué ofrecen, qué lo hace especial, cuál es su historia..." />
          </Field>
          <Field label="Dirección">
            <input value={form.direccion} onChange={set('direccion')} style={inp} placeholder="Ej: Ruta 89 s/n, Tunuyán, Mendoza" />
          </Field>
          <Field label="Link de Google Maps" hint="Google Maps → buscá tu negocio → tocá 'Compartir' → copiá el link">
            <input value={form.ubicacionUrl} onChange={set('ubicacionUrl')} style={inp} placeholder="https://maps.app.goo.gl/..." />
          </Field>
        </AccSection>

        {/* Ficha técnica según categoría */}
        {hasCategoryFields && (
          <AccSection
            emoji="📋"
            title={`Ficha técnica · ${categoriaLabel}`}
            sub={`Completá los datos específicos de tu ${categoriaLabel.toLowerCase()}. Aparecerán en el tour virtual y el directorio del Bureau.`}
            defaultOpen={true}
          >
            <CategoryEditor
              categoria={form.categoria}
              hotelData={hotelData}
              restauranteData={restauranteData}
              bodegaData={bodegaData}
              alojamientoData={alojamientoData}
              servicioData={servicioData}
              onChange={handleCategoryChange}
            />
          </AccSection>
        )}

        {/* Salones de eventos */}
        <div style={{ ...cardStyle, padding: '0', overflow: 'hidden' }}>
          <SalonesEditor salones={salones} onChange={setSalones} />
        </div>

        {/* Imágenes */}
        <AccSection emoji="🖼️" title="Imágenes" sub="Subí una foto de portada y tu logo. También los podemos agregar después." defaultOpen={false}>
          <ImageUploadField
            label="Foto de portada"
            hint="Imagen que representa tu negocio — fachada, interior, paisaje"
            value={form.fotoPortada}
            onChange={url => setForm(f => ({ ...f, fotoPortada: url }))}
            storageId={form.razonSocial.toLowerCase().replace(/\s+/g, '-') || 'nuevo'}
            aspect="cover"
          />
          <ImageUploadField
            label="Logo"
            hint="PNG con fondo transparente, ideal"
            value={form.logoUrl}
            onChange={url => setForm(f => ({ ...f, logoUrl: url }))}
            storageId={form.razonSocial.toLowerCase().replace(/\s+/g, '-') || 'nuevo'}
            aspect="logo"
          />
        </AccSection>

        {/* Contacto */}
        <AccSection emoji="📞" title="Contacto" defaultOpen={true}>
          <Field label="WhatsApp">
            <input value={form.whatsapp} onChange={set('whatsapp')} style={inp} placeholder="+54 261 4XX XXXX" />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={set('email')} style={inp} placeholder="contacto@minegocio.com" />
          </Field>
          <Field label="Sitio web">
            <input value={form.web} onChange={set('web')} style={inp} placeholder="https://www.minegocio.com" />
          </Field>
          <Field label="Instagram / Redes sociales">
            <input value={form.redes} onChange={set('redes')} style={inp} placeholder="@minegocio" />
          </Field>
        </AccSection>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 14px', color: '#f87171', fontSize: '13px' }}>
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <button type="submit" disabled={sending}
          style={{ width: '100%', padding: '15px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', color: 'white', background: sending ? '#1d4ed8' : 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: '1px solid #3b82f6', cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {sending ? 'Enviando...' : (
            <>Enviar mis datos <ChevronRight size={16} /></>
          )}
        </button>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#1e293b', paddingBottom: '8px' }}>
          Mendoza Bureau · Convention & Visitors Bureau · El Faro 360
        </p>
      </form>
    </div>
  )
}

export default function FormSocioPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080c18' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #1e293b', borderTop: '2px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <FormSocio />
    </Suspense>
  )
}
