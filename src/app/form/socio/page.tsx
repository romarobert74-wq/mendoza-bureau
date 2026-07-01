'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import { crearSocio } from '@/lib/firestore'
import type { SocioFormData, CategoriaSocio } from '@/types'
import { CATEGORIAS } from '@/types'
import { CheckCircle, AlertCircle } from 'lucide-react'

const CATEGORIAS_OPTIONS = Object.entries(CATEGORIAS) as [CategoriaSocio, string][]

const inp = {
  width: '100%',
  background: '#111827',
  border: '1px solid #1e293b',
  borderRadius: '10px',
  padding: '10px 12px',
  fontSize: '14px',
  color: '#f1f5f9',
  outline: 'none',
} as React.CSSProperties

const lbl = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '700',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  color: '#64748b',
  marginBottom: '6px',
}

const card = {
  background: '#0d1225',
  border: '1px solid #1a2235',
  borderRadius: '16px',
  padding: '20px',
} as React.CSSProperties

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
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-4"
        style={{ background: '#080c18', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={36} color="#4ade80" />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>¡Datos enviados!</h2>
        <p style={{ fontSize: '14px', color: '#475569', maxWidth: '280px', margin: 0 }}>
          Tu información fue recibida por Mendoza Bureau. En breve la revisaremos y la verás reflejada en el tour virtual.
        </p>
        <p style={{ fontSize: '11px', color: '#1e293b', marginTop: '16px' }}>Mendoza Bureau · Convention & Visitors Bureau</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080c18', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#0d1225', borderBottom: '1px solid #1a2235', padding: '24px 20px' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <p style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#f97316', marginBottom: '6px' }}>
            Mendoza Bureau
          </p>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 6px' }}>
            Completá los datos de tu negocio
          </h1>
          <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
            Esta información aparecerá en el tour virtual de Mendoza Bureau Convention & Visitors.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '24px 20px', maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Tu negocio */}
        <div style={card}>
          <p style={{ ...lbl, color: '#f97316', marginBottom: '16px', fontSize: '10px' }}>Tu negocio</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field label="Nombre del negocio *">
              <input value={form.razonSocial} onChange={set('razonSocial')} required style={inp} placeholder="Ej: Bodega Salentein" />
            </Field>
            <Field label="Rubro *">
              <select value={form.categoria} onChange={set('categoria')} style={{ ...inp, background: '#111827' }}>
                {CATEGORIAS_OPTIONS.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* Descripción */}
        <div style={card}>
          <p style={{ ...lbl, color: '#f97316', marginBottom: '16px', fontSize: '10px' }}>Descripción</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field label="Descripción general *">
              <textarea value={form.infoGeneral} onChange={set('infoGeneral')} required rows={5}
                style={{ ...inp, resize: 'none' }}
                placeholder="Contanos sobre tu negocio. ¿Qué ofrecen? ¿Qué lo hace especial? ¿Cuál es su historia?" />
            </Field>
            <Field label="Dirección">
              <input value={form.direccion} onChange={set('direccion')} style={inp} placeholder="Ej: Ruta 89 s/n, Tunuyán, Mendoza" />
            </Field>
            <Field label="Link de Google Maps" hint="Google Maps → buscá tu negocio → tocá "Compartir" → copiá el link">
              <input value={form.ubicacionUrl} onChange={set('ubicacionUrl')} style={inp} placeholder="https://maps.app.goo.gl/..." />
            </Field>
          </div>
        </div>

        {/* Contacto */}
        <div style={card}>
          <p style={{ ...lbl, color: '#f97316', marginBottom: '16px', fontSize: '10px' }}>Contacto</p>
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
          <p style={{ ...lbl, color: '#f97316', marginBottom: '4px', fontSize: '10px' }}>Imágenes (opcional)</p>
          <p style={{ fontSize: '11px', color: '#334155', marginBottom: '16px' }}>Si tenés fotos publicadas en internet, pegá el link aquí.</p>
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
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '15px',
            color: 'white',
            background: sending ? '#1d4ed8' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            border: '1px solid #3b82f6',
            cursor: sending ? 'not-allowed' : 'pointer',
            opacity: sending ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}>
          {sending ? 'Enviando...' : 'Enviar mis datos'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#1e293b', paddingBottom: '24px' }}>
          Mendoza Bureau · Convention & Visitors Bureau
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
