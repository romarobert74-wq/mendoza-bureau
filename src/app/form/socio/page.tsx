'use client'

import { Suspense, useState } from 'react'
import { crearSocio } from '@/lib/firestore'
import type { SocioFormData, CategoriaSocio } from '@/types'
import { CATEGORIAS } from '@/types'
import { CheckCircle, AlertCircle, ChevronRight } from 'lucide-react'

const CATEGORIAS_OPTIONS = Object.entries(CATEGORIAS) as [CategoriaSocio, string][]

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

const card: React.CSSProperties = {
  background: '#0d1225',
  border: '1px solid #1a2235',
  borderRadius: '16px',
  padding: '24px',
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

function FormSocio() {
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    razonSocial: '',
    etiqueta: '',
    categoria: 'bodega' as CategoriaSocio,
    infoGeneral: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const data: SocioFormData = {
        razonSocial: form.razonSocial,
        etiqueta: form.etiqueta || form.razonSocial,
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
      }
      await crearSocio(data)
      setDone(true)
    } catch {
      setError('Hubo un error al enviar. Por favor intentá de nuevo.')
    }
    setSending(false)
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: '#080c18', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '16px', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={40} color="#4ade80" />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>¡Datos enviados!</h2>
        <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '300px', margin: 0, lineHeight: 1.6 }}>
          Tu información fue recibida. En breve la revisaremos y la verás reflejada en el tour virtual.
        </p>
        <p style={{ fontSize: '11px', color: '#1e293b', marginTop: '24px' }}>Mendoza Bureau · El Faro 360</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080c18', color: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Hero landing ── */}
      <div style={{ background: 'linear-gradient(160deg, #0d1225 0%, #080c18 70%)', borderBottom: '1px solid #1a2235', padding: '56px 20px 48px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>

          {/* Pill badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '99px', padding: '4px 16px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fb923c', marginBottom: '24px' }}>
            ✦ Mendoza Bureau · El Faro 360
          </div>

          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#f1f5f9', margin: '0 0 8px', lineHeight: 1.2 }}>
            Bienvenido al futuro del
          </h1>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#3b82f6', margin: '0 0 20px', lineHeight: 1.2 }}>
            turismo inmersivo
          </h1>

          {/* Gradient divider */}
          <div style={{ width: '40px', height: '3px', background: 'linear-gradient(90deg, #2563eb, #f97316)', borderRadius: '99px', margin: '0 auto 24px' }} />

          <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '520px', margin: '0 auto 14px', lineHeight: 1.7 }}>
            Mendoza Bureau junto a El Faro 360 están desarrollando una plataforma inmersiva
            para que tu destino se vea en{' '}
            <strong style={{ color: '#f1f5f9' }}>360°</strong>{' '}
            y puedas mostrar tu lugar de una manera completamente diferente.
          </p>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
            Para eso te pedimos que completes el siguiente formulario, que nos servirá de ayuda
            para desarrollar la aplicación web.{' '}
            <strong style={{ color: '#f1f5f9' }}>Muchas gracias.</strong>
          </p>
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} style={{ padding: '32px 20px 60px', maxWidth: '540px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Tu negocio */}
        <div style={card}>
          <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f97316', marginBottom: '20px' }}>Tu negocio</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field label="Nombre del negocio *">
              <input value={form.razonSocial} onChange={set('razonSocial')} required style={inp} placeholder="Ej: Bodega Salentein" />
            </Field>
            <Field label="Rubro *">
              <select value={form.categoria} onChange={set('categoria')} style={{ ...inp, background: '#111827' }}>
                {CATEGORIAS_OPTIONS.map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* Descripción */}
        <div style={card}>
          <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f97316', marginBottom: '20px' }}>Descripción</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field label="Descripción general *">
              <textarea value={form.infoGeneral} onChange={set('infoGeneral')} required rows={5}
                style={{ ...inp, resize: 'none' }}
                placeholder="Contanos sobre tu negocio. ¿Qué ofrecen? ¿Qué lo hace especial? ¿Cuál es su historia?" />
            </Field>
            <Field label="Dirección">
              <input value={form.direccion} onChange={set('direccion')} style={inp} placeholder="Ej: Ruta 89 s/n, Tunuyán, Mendoza" />
            </Field>
            <Field label="Link de Google Maps" hint="Google Maps → buscá tu negocio → tocá 'Compartir' → copiá el link">
              <input value={form.ubicacionUrl} onChange={set('ubicacionUrl')} style={inp} placeholder="https://maps.app.goo.gl/..." />
            </Field>
          </div>
        </div>

        {/* Contacto */}
        <div style={card}>
          <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f97316', marginBottom: '20px' }}>Contacto</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          </div>
        </div>

        {/* Imágenes */}
        <div style={card}>
          <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f97316', marginBottom: '4px' }}>Imágenes (opcional)</p>
          <p style={{ fontSize: '12px', color: '#334155', marginBottom: '20px' }}>Si tenés fotos publicadas en internet, pegá el link aquí.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field label="Foto de portada">
              <input value={form.fotoPortada} onChange={set('fotoPortada')} style={inp} placeholder="https://..." />
              {form.fotoPortada && (
                <img src={form.fotoPortada} alt="preview" style={{ marginTop: '8px', width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #1e293b' }} />
              )}
            </Field>
            <Field label="Logo">
              <input value={form.logoUrl} onChange={set('logoUrl')} style={inp} placeholder="https://... (PNG con fondo transparente ideal)" />
              {form.logoUrl && (
                <img src={form.logoUrl} alt="logo" style={{ marginTop: '8px', height: '48px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #1e293b', background: '#111827', padding: '4px' }} />
              )}
            </Field>
          </div>
        </div>

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
