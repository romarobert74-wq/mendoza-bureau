'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { X, ArrowLeft, ArrowRight, Check, Loader2, Lock } from 'lucide-react'
import {
  TIPOS_AGENTE,
  RUBROS,
  CREDENCIALES_PLATAFORMA,
  COMERCIO_VACIO,
  getTipoAgenteMeta,
  type TipoAgente,
  type Rubro,
  type Comercio,
  type AgenteFormData,
} from '@/types/agentes'
import { crearAgente } from '@/lib/agentes'

interface Props {
  onClose: () => void
  onCreado: () => void
}

const PASOS = ['Tipo', 'Rubro', 'Ubicación', 'Comercio', 'Credenciales'] as const

export default function AgregarAgenteModal({ onClose, onCreado }: Props) {
  const [paso, setPaso] = useState(0)
  const [guardando, setGuardando] = useState(false)

  const [tipo, setTipo] = useState<TipoAgente | null>(null)
  const [rubro, setRubro] = useState<Rubro | null>(null)
  const [pais, setPais] = useState('Argentina')
  const [departamento, setDepartamento] = useState('Mendoza')
  const [comercio, setComercio] = useState<Comercio>(COMERCIO_VACIO())
  const [nombre, setNombre] = useState('')
  const [credenciales, setCredenciales] = useState<Record<string, string>>({})

  const tipoMeta = tipo ? getTipoAgenteMeta(tipo) : null
  const plataformas = tipoMeta?.plataformas ?? []

  const puedeAvanzar = (): boolean => {
    switch (paso) {
      case 0: return !!tipo
      case 1: return !!rubro
      case 2: return pais.trim().length > 0 && departamento.trim().length > 0
      case 3: return comercio.nombre.trim().length > 0
      case 4: return true // credenciales opcionales (modo simulación)
      default: return false
    }
  }

  const avanzar = () => {
    if (!puedeAvanzar()) return
    if (paso < PASOS.length - 1) setPaso(p => p + 1)
    else guardar()
  }

  const guardar = async () => {
    if (!tipo || !rubro || !tipoMeta) return
    setGuardando(true)
    try {
      const data: AgenteFormData = {
        tipo,
        nombre: nombre.trim() || `${tipoMeta.nombre} · ${comercio.nombre}`,
        rubro,
        pais: pais.trim(),
        departamento: departamento.trim(),
        comercio,
        credenciales,
        estado: tipoMeta.disponible ? 'activo' : 'proximamente',
      }
      await crearAgente(data)
      toast.success('Agente creado')
      onCreado()
    } catch (err) {
      console.error(err)
      toast.error('Error al crear el agente')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="card w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="font-bold text-lg" style={{ color: 'var(--text)' }}>Agregar Agente</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Paso {paso + 1} de {PASOS.length} · {PASOS[paso]}
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex gap-1 px-6 pt-4">
          {PASOS.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition"
              style={{ background: i <= paso ? 'var(--blue)' : 'var(--border-2)' }}
            />
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Paso 0 — Tipo de agente */}
          {paso === 0 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {TIPOS_AGENTE.map(t => {
                const sel = tipo === t.tipo
                return (
                  <button
                    key={t.tipo}
                    onClick={() => setTipo(t.tipo)}
                    className="text-left rounded-xl p-4 transition relative"
                    style={{
                      background: 'var(--bg-input)',
                      border: `1px solid ${sel ? t.color : 'var(--border-2)'}`,
                      boxShadow: sel ? `0 0 0 1px ${t.color}` : 'none',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                        style={{ background: `${t.color}22`, border: `1px solid ${t.color}55` }}
                      >
                        {t.emoji}
                      </div>
                      <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{t.nombre}</span>
                    </div>
                    <p className="text-xs leading-snug" style={{ color: 'var(--text-muted)' }}>{t.descripcion}</p>
                    {!t.disponible && (
                      <span className="badge badge-amber mt-2">Próximamente</span>
                    )}
                    {sel && (
                      <div className="absolute top-3 right-3" style={{ color: t.color }}>
                        <Check size={16} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Paso 1 — Rubro */}
          {paso === 1 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {RUBROS.map(r => {
                const sel = rubro === r.rubro
                return (
                  <button
                    key={r.rubro}
                    onClick={() => setRubro(r.rubro)}
                    className="text-left rounded-xl p-4 transition"
                    style={{
                      background: 'var(--bg-input)',
                      border: `1px solid ${sel ? 'var(--blue)' : 'var(--border-2)'}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{r.emoji}</span>
                      <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{r.nombre}</span>
                    </div>
                    {r.advertencia && (
                      <p className="text-xs leading-snug mt-1" style={{ color: 'var(--orange-2)' }}>
                        ⚠ {r.advertencia}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Paso 2 — Ubicación */}
          {paso === 2 && (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>País</label>
                <input className="input" value={pais} onChange={e => setPais(e.target.value)} placeholder="Argentina" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>Departamento / Provincia</label>
                <input className="input" value={departamento} onChange={e => setDepartamento(e.target.value)} placeholder="Mendoza" />
              </div>
            </div>
          )}

          {/* Paso 3 — Comercio */}
          {paso === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>Nombre del comercio *</label>
                <input className="input" value={comercio.nombre} onChange={e => setComercio(c => ({ ...c, nombre: e.target.value }))} placeholder="Ej: Inmobiliaria Andes" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>¿Qué ofrece?</label>
                <textarea className="input resize-none" rows={2} value={comercio.descripcion} onChange={e => setComercio(c => ({ ...c, descripcion: e.target.value }))} placeholder="Venta y alquiler de propiedades en el Gran Mendoza..." />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>Oferta / diferencial</label>
                <input className="input" value={comercio.oferta} onChange={e => setComercio(c => ({ ...c, oferta: e.target.value }))} placeholder="Tasación gratis, financiación propia..." />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>Sitio web</label>
                  <input className="input" value={comercio.sitioWeb} onChange={e => setComercio(c => ({ ...c, sitioWeb: e.target.value }))} placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>WhatsApp</label>
                  <input className="input" value={comercio.whatsapp} onChange={e => setComercio(c => ({ ...c, whatsapp: e.target.value }))} placeholder="+54 261 ..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>Nombre del agente (opcional)</label>
                <input className="input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Se genera automático si lo dejás vacío" />
              </div>
            </div>
          )}

          {/* Paso 4 — Credenciales */}
          {paso === 4 && (
            <div className="space-y-5">
              {plataformas.length === 0 ? (
                <div className="card p-5 text-sm" style={{ color: 'var(--text-muted)' }}>
                  Este agente funciona solo con IA y no requiere credenciales externas. Ya está listo. ✅
                </div>
              ) : (
                <>
                  <div className="rounded-lg p-3 text-xs flex items-start gap-2" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)', color: 'var(--orange-2)' }}>
                    <Lock size={14} className="mt-0.5 shrink-0" />
                    <span>Las credenciales son sensibles. Podés dejarlas vacías ahora y el agente funciona en <b>modo simulación</b> hasta que las cargues.</span>
                  </div>
                  {plataformas.map(p => {
                    const spec = CREDENCIALES_PLATAFORMA[p]
                    return (
                      <div key={p}>
                        <p className="section-title mb-2">{spec.nombre}</p>
                        <div className="space-y-3">
                          {spec.campos.map(campo => (
                            <div key={campo.key}>
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                                {campo.label}
                              </label>
                              <input
                                className="input"
                                type={campo.sensible ? 'password' : 'text'}
                                value={credenciales[campo.key] ?? ''}
                                onChange={e => setCredenciales(c => ({ ...c, [campo.key]: e.target.value }))}
                                placeholder={campo.placeholder}
                                autoComplete="off"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => (paso === 0 ? onClose() : setPaso(p => p - 1))}
            className="btn-outline"
            disabled={guardando}
          >
            <ArrowLeft size={15} />
            {paso === 0 ? 'Cancelar' : 'Atrás'}
          </button>
          <button onClick={avanzar} className="btn-primary" disabled={!puedeAvanzar() || guardando}>
            {guardando ? <Loader2 size={15} className="animate-spin" /> : paso === PASOS.length - 1 ? <Check size={15} /> : <ArrowRight size={15} />}
            {paso === PASOS.length - 1 ? 'Crear agente' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  )
}
