'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { X, Sparkles, Loader2, Copy, Trash2, MapPin } from 'lucide-react'
import {
  getTipoAgenteMeta,
  getRubroMeta,
  type Agente,
} from '@/types/agentes'
import { eliminarAgente } from '@/lib/agentes'

interface Props {
  agente: Agente
  onClose: () => void
  onEliminado: () => void
}

export default function AgenteDetalle({ agente, onClose, onEliminado }: Props) {
  const meta = getTipoAgenteMeta(agente.tipo)
  const rubro = getRubroMeta(agente.rubro)

  const [idea, setIdea] = useState('')
  const [generando, setGenerando] = useState(false)
  const [resultado, setResultado] = useState('')

  const esEstratega = agente.tipo === 'estratega'

  const generar = async () => {
    if (!idea.trim() || generando) return
    setGenerando(true)
    setResultado('')
    try {
      const res = await fetch('/api/agentes/estrategia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          rubro: agente.rubro,
          pais: agente.pais,
          departamento: agente.departamento,
          comercio: agente.comercio,
        }),
      })
      if (!res.ok) throw new Error('error')
      const data = await res.json()
      setResultado(data.estrategia || '')
    } catch (err) {
      console.error(err)
      toast.error('Error al generar la estrategia')
    } finally {
      setGenerando(false)
    }
  }

  const eliminar = async () => {
    if (!confirm('¿Eliminar este agente?')) return
    try {
      await eliminarAgente(agente.id)
      toast.success('Agente eliminado')
      onEliminado()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="card w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
              style={{ background: `${meta.color}22`, border: `1px solid ${meta.color}55` }}
            >
              {meta.emoji}
            </div>
            <div>
              <h2 className="font-bold" style={{ color: 'var(--text)' }}>{agente.nombre}</h2>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{rubro.emoji} {rubro.nombre}</span>
                <span className="flex items-center gap-0.5"><MapPin size={11} /> {agente.departamento}, {agente.pais}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={eliminar} title="Eliminar" style={{ color: 'var(--text-muted)' }} className="hover:text-red-500 transition">
              <Trash2 size={17} />
            </button>
            <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {rubro.advertencia && (
            <div className="rounded-lg p-3 mb-4 text-xs" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)', color: 'var(--orange-2)' }}>
              ⚠ {rubro.advertencia}
            </div>
          )}

          {esEstratega ? (
            <>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>
                Idea de la pauta
              </label>
              <textarea
                className="input resize-none"
                rows={3}
                value={idea}
                onChange={e => setIdea(e.target.value)}
                placeholder="Ej: Quiero vender 3 casas en Chacras de Coria este mes, presupuesto $150.000, generar visitas..."
              />
              <button onClick={generar} disabled={generando || !idea.trim()} className="btn-primary mt-3">
                {generando ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                {generando ? 'Elaborando estrategia...' : 'Generar estrategia'}
              </button>

              {resultado && (
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="section-title">Estrategia generada</p>
                    <button
                      onClick={() => { navigator.clipboard.writeText(resultado); toast.success('Copiado') }}
                      className="flex items-center gap-1 text-xs transition"
                      style={{ color: 'var(--blue-3)' }}
                    >
                      <Copy size={13} /> Copiar
                    </button>
                  </div>
                  <div
                    className="rounded-xl p-4 text-sm whitespace-pre-wrap leading-relaxed"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-2)', color: 'var(--text-2)' }}
                  >
                    {resultado}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card p-6 text-center" style={{ background: 'var(--bg-input)' }}>
              <div className="text-3xl mb-2">{meta.emoji}</div>
              <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>{meta.nombre} — Próximamente</p>
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{meta.descripcion}</p>
              <span className="badge badge-amber">En construcción</span>
              <p className="text-xs mt-4" style={{ color: 'var(--text-faint)' }}>
                Este agente ya quedó configurado con su rubro, comercio y credenciales. Se activará cuando conectemos su integración.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
