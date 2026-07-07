'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Bot, Plus, Loader2, MapPin } from 'lucide-react'
import { getAgentes } from '@/lib/agentes'
import { getTipoAgenteMeta, getRubroMeta, type Agente } from '@/types/agentes'
import AgregarAgenteModal from '@/components/agentes/AgregarAgenteModal'
import AgenteDetalle from '@/components/agentes/AgenteDetalle'

export default function AgentesPage() {
  const { usuario, loading } = useAuth()
  const router = useRouter()

  const [agentes, setAgentes] = useState<Agente[]>([])
  const [cargando, setCargando] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [seleccionado, setSeleccionado] = useState<Agente | null>(null)

  useEffect(() => {
    if (!loading && usuario?.rol !== 'el_faro') router.replace('/dashboard')
  }, [usuario, loading, router])

  const cargar = async () => {
    try {
      setAgentes(await getAgentes())
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  if (loading || cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" style={{ color: 'var(--blue-3)' }} size={28} />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bot size={28} style={{ color: 'var(--blue-3)' }} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Agentes IA</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Panel central de tus agentes de automatización de campañas
            </p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /> Agregar Agente
        </button>
      </div>

      {/* Grid de agentes */}
      {agentes.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">🤖</div>
          <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Todavía no tenés agentes</p>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
            Creá tu primer agente para empezar a automatizar tus campañas de Meta Ads.
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary mx-auto">
            <Plus size={16} /> Agregar Agente
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agentes.map(a => {
            const meta = getTipoAgenteMeta(a.tipo)
            const rubro = getRubroMeta(a.rubro)
            return (
              <button
                key={a.id}
                onClick={() => setSeleccionado(a)}
                className="card p-5 text-left transition hover:brightness-110"
                style={{ borderColor: `${meta.color}44` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: `${meta.color}22`, border: `1px solid ${meta.color}55` }}
                  >
                    {meta.emoji}
                  </div>
                  {a.estado === 'activo'
                    ? <span className="badge badge-green">● Activo</span>
                    : <span className="badge badge-amber">Próximamente</span>}
                </div>
                <p className="font-semibold text-sm mb-0.5 truncate" style={{ color: 'var(--text)' }}>{a.nombre}</p>
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{meta.nombre}</p>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-faint)' }}>
                  <span>{rubro.emoji} {rubro.nombre}</span>
                  <span className="flex items-center gap-0.5"><MapPin size={11} /> {a.departamento}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {showModal && (
        <AgregarAgenteModal
          onClose={() => setShowModal(false)}
          onCreado={() => { setShowModal(false); cargar() }}
        />
      )}
      {seleccionado && (
        <AgenteDetalle
          agente={seleccionado}
          onClose={() => setSeleccionado(null)}
          onEliminado={() => { setSeleccionado(null); cargar() }}
        />
      )}
    </div>
  )
}
