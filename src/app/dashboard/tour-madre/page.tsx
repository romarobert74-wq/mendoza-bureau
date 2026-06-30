'use client'

import { useEffect, useState } from 'react'
import { getConfigTourMadre, setConfigTourMadre, getSocios } from '@/lib/firestore'
import type { Socio } from '@/types'
import { CATEGORIAS } from '@/types'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'

export default function TourMadrePage() {
  const [socios, setSocios] = useState<Socio[]>([])
  const [config, setConfig] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const [s, c] = await Promise.all([getSocios(), getConfigTourMadre()])
      setSocios(s)
      if (c) setConfig(c)
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await setConfigTourMadre(config)
      toast.success('Configuración guardada')
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const sociosActivos = socios.filter(s => s.activo)

  const porCategoria = Object.entries(CATEGORIAS).map(([cat, label]) => ({
    cat,
    label,
    items: sociosActivos.filter(s => s.categoria === cat),
  })).filter(g => g.items.length > 0)

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tour Madre</h2>
          <p className="text-gray-500 text-sm mt-1">Configuración del menú del tour madre</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Guardando...' : 'Guardar config'}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          Cargando...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Info Bureau */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Info Bureau (skin madre)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp Bureau</label>
                <input
                  value={(config.telefonoBureau as string) || ''}
                  onChange={e => setConfig(c => ({ ...c, telefonoBureau: e.target.value }))}
                  className="input"
                  placeholder="+54 261..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Bureau</label>
                <input
                  value={(config.emailBureau as string) || ''}
                  onChange={e => setConfig(c => ({ ...c, emailBureau: e.target.value }))}
                  className="input"
                  placeholder="info@mendozabureau.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                <input
                  value={(config.ubicacionBureau as string) || ''}
                  onChange={e => setConfig(c => ({ ...c, ubicacionBureau: e.target.value }))}
                  className="input"
                  placeholder="Mendoza, Argentina"
                />
              </div>
            </div>
          </section>

          {/* Socios activos por categoría */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Socios activos en el tour</h3>
            <p className="text-gray-400 text-xs mb-4">
              {sociosActivos.length} socios activos — aparecen en el menú del tour madre
            </p>
            {porCategoria.map(({ cat, label, items }) => (
              <div key={cat} className="mb-4">
                <h4 className="text-sm font-semibold text-primary-700 uppercase tracking-wide mb-2">{label}</h4>
                <div className="space-y-1">
                  {items.map(s => (
                    <div key={s.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                      <span className="font-medium text-gray-900">{s.etiqueta}</span>
                      <span className="text-gray-400 text-xs truncate max-w-xs">{s.urlInternaTour || 'Sin URL interna'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {porCategoria.length === 0 && (
              <p className="text-gray-400 text-sm">No hay socios activos</p>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
