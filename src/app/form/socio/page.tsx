'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSocio, actualizarSocio } from '@/lib/firestore'
import type { Socio, SocioFormData } from '@/types'
import { CheckCircle, AlertCircle } from 'lucide-react'

function FormSocio() {
  const params = useSearchParams()
  const id = params.get('id') ?? ''

  const [socio, setSocio] = useState<Socio | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
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

  useEffect(() => {
    if (!id) { setLoading(false); return }
    getSocio(id).then(s => {
      if (s) {
        setSocio(s)
        setForm({
          infoGeneral: s.infoGeneral ?? '',
          direccion: s.direccion ?? '',
          ubicacionUrl: s.ubicacionUrl ?? '',
          fotoPortada: s.fotoPortada ?? '',
          logoUrl: s.logoUrl ?? '',
          whatsapp: s.contacto?.whatsapp ?? '',
          email: s.contacto?.email ?? '',
          web: s.contacto?.web ?? '',
          redes: s.contacto?.redes ?? '',
        })
      }
      setLoading(false)
    })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!socio) return
    setSending(true)
    setError('')
    try {
      const update: Partial<SocioFormData> = {
        infoGeneral: form.infoGeneral,
        direccion: form.direccion,
        ubicacionUrl: form.ubicacionUrl,
        fotoPortada: form.fotoPortada,
        logoUrl: form.logoUrl,
        contacto: {
          whatsapp: form.whatsapp,
          email: form.email,
          web: form.web,
          redes: form.redes,
        },
      }
      await actualizarSocio(id, update as SocioFormData)
      setDone(true)
    } catch {
      setError('Hubo un error al guardar. Por favor intentá de nuevo.')
    }
    setSending(false)
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!id || !socio) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center gap-3">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-gray-700 font-semibold">Link inválido</p>
        <p className="text-gray-400 text-sm">Este formulario no tiene un socio asociado. Pedile a Mendoza Bureau que te envíe el link correcto.</p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center gap-4">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle size={44} className="text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">¡Datos enviados!</h2>
        <p className="text-gray-500 text-sm max-w-xs">
          Tu información fue guardada correctamente. Mendoza Bureau la revisará y la verás reflejada en el tour virtual.
        </p>
        <p className="text-xs text-gray-300 mt-4">Mendoza Bureau · Convention & Visitors Bureau</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className="bg-white border-b border-gray-100 px-5 py-5">
        <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">Mendoza Bureau</p>
        <h1 className="text-xl font-bold text-gray-900">Completá los datos de tu negocio</h1>
        <p className="text-sm text-gray-400 mt-1">
          Esta información aparecerá en el tour virtual de <strong className="text-gray-600">{socio.razonSocial}</strong>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-6 space-y-6 max-w-lg mx-auto">
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Descripción del lugar</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Descripción general *</label>
              <textarea
                value={form.infoGeneral}
                onChange={set('infoGeneral')}
                rows={5}
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                placeholder="Contanos sobre tu bodega, restaurant, hotel... ¿Qué lo hace especial? ¿Qué ofrecen?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Dirección</label>
              <input
                value={form.direccion}
                onChange={set('direccion')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="Ej: Ruta 89 s/n, Tunuyán"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Link de Google Maps</label>
              <input
                value={form.ubicacionUrl}
                onChange={set('ubicacionUrl')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="https://maps.app.goo.gl/..."
              />
              <p className="text-xs text-gray-400 mt-1">Abrí Google Maps → buscá tu negocio → "Compartir" → copiá el link</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Contacto</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">WhatsApp</label>
              <input value={form.whatsapp} onChange={set('whatsapp')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="+54 261 4XX XXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input type="email" value={form.email} onChange={set('email')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="contacto@mibodega.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Sitio web</label>
              <input value={form.web} onChange={set('web')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="https://www.mibodega.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Instagram / Redes sociales</label>
              <input value={form.redes} onChange={set('redes')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="@mibodega o https://instagram.com/mibodega" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-1">Imágenes (opcional)</h3>
          <p className="text-xs text-gray-400 mb-4">Si tenés fotos subidas a internet, pegá el link directo aquí.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Foto de portada</label>
              <input value={form.fotoPortada} onChange={set('fotoPortada')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="https://..." />
              {form.fotoPortada && (
                <img src={form.fotoPortada} alt="preview" className="mt-2 w-full h-28 object-cover rounded-xl border border-gray-100" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Logo</label>
              <input value={form.logoUrl} onChange={set('logoUrl')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="https://... (PNG transparente recomendado)" />
              {form.logoUrl && (
                <img src={form.logoUrl} alt="logo preview" className="mt-2 h-14 object-contain rounded border border-gray-100 bg-gray-50 p-1" />
              )}
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full py-4 rounded-2xl font-bold text-white text-base transition active:scale-95 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #e85d04, #c0391b)' }}
        >
          {sending ? 'Enviando...' : 'Enviar mis datos'}
        </button>

        <p className="text-center text-xs text-gray-300 pb-4">Mendoza Bureau · Convention & Visitors Bureau</p>
      </form>
    </div>
  )
}

export default function FormSocioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <FormSocio />
    </Suspense>
  )
}
