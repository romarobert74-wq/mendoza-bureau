'use client'

import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { X, Loader2, Wand2, CheckCircle2, AlertTriangle, ExternalLink, Palette, Rocket, Brain } from 'lucide-react'
import { getTipoAgenteMeta, getRubroMeta, type Agente } from '@/types/agentes'

interface Props {
  agentes: Agente[]
  onClose: () => void
}

interface OrqResultado {
  estrategia: string
  creativos: {
    paquete: { variantes: { titulo: string; textoPrincipal: string; descripcion: string; cta: string; promptImagen: string }[]; carrusel: { titulo: string; texto: string }[]; guionVideo: string }
    simulacion: boolean
    canva?: { editUrl?: string; imagenUrl?: string }
    canvaError?: string
  }
  publicador: {
    spec: { nombreCampania: string; objetivo: string; presupuestoDiarioArs: number; targeting: { ciudad: string; intereses: string[]; edadMin: number; edadMax: number }; creativo: { cta: string; enlace: string } }
    simulacion: boolean
    resultado?: { campaignId: string; adSetId: string; adId?: string; geoResuelto: string; advertencias: string[] }
  }
}

const PASOS = [
  { icon: Brain, label: 'Estratega' },
  { icon: Palette, label: 'Creativo' },
  { icon: Rocket, label: 'Publicador' },
]

export default function OrquestadorModal({ agentes, onClose }: Props) {
  // Comercios únicos derivados de los agentes existentes
  const comercios = useMemo(() => {
    const map = new Map<string, Agente>()
    for (const a of agentes) if (a.comercio?.nombre && !map.has(a.comercio.nombre)) map.set(a.comercio.nombre, a)
    return Array.from(map.values())
  }, [agentes])

  const [baseId, setBaseId] = useState<string>(comercios[0]?.id ?? '')
  const [idea, setIdea] = useState('')
  const [contextoExtra, setContextoExtra] = useState('')
  const [cargando, setCargando] = useState(false)
  const [pasoActual, setPasoActual] = useState(-1)
  const [out, setOut] = useState<OrqResultado | null>(null)

  const base = agentes.find(a => a.id === baseId) ?? comercios[0]

  // Merge de credenciales de todos los agentes del mismo comercio
  const credencialesMerge = useMemo(() => {
    if (!base) return {}
    const merged: Record<string, string> = {}
    for (const a of agentes) {
      if (a.comercio?.nombre === base.comercio.nombre) {
        for (const [k, v] of Object.entries(a.credenciales ?? {})) if (v) merged[k] = v
      }
    }
    return merged
  }, [agentes, base])

  const tieneCanva = !!credencialesMerge.canva_access_token && !!credencialesMerge.canva_brand_template_id
  const tieneMeta = !!credencialesMerge.meta_access_token && !!credencialesMerge.meta_ad_account_id

  const ejecutar = async () => {
    if (!base || !idea.trim() || cargando) return
    setCargando(true); setOut(null); setPasoActual(0)
    // Animación de pasos (aproximada; el server corre secuencial)
    const t1 = setTimeout(() => setPasoActual(1), 12000)
    const t2 = setTimeout(() => setPasoActual(2), 24000)
    try {
      const res = await fetch('/api/agentes/orquestar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea, contextoExtra,
          rubro: base.rubro, pais: base.pais, departamento: base.departamento, comercio: base.comercio,
          credenciales: credencialesMerge,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'error')
      setOut(data)
      setPasoActual(3)
      toast.success('Campaña completa generada')
    } catch (err) {
      toast.error((err as Error).message); setPasoActual(-1)
    } finally {
      clearTimeout(t1); clearTimeout(t2); setCargando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="card w-full max-w-3xl max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#2563eb,#8b5cf6)' }}>
              <Wand2 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold" style={{ color: 'var(--text)' }}>Campaña completa</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Estratega → Creativo → Publicador, en un flujo</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {comercios.length === 0 ? (
            <div className="card p-6 text-center" style={{ background: 'var(--bg-input)' }}>
              <p style={{ color: 'var(--text-muted)' }}>Creá al menos un agente con datos de comercio para orquestar una campaña.</p>
            </div>
          ) : (
            <>
              {/* Selección de comercio */}
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>Comercio</label>
              <select className="input" value={baseId} onChange={e => setBaseId(e.target.value)}>
                {comercios.map(a => {
                  const r = getRubroMeta(a.rubro)
                  return <option key={a.id} value={a.id}>{a.comercio.nombre} · {r.nombre} · {a.departamento}</option>
                })}
              </select>

              {/* Credenciales combinadas */}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`badge ${tieneCanva ? 'badge-green' : 'badge-amber'}`}>{tieneCanva ? '● ' : '○ '}Canva {tieneCanva ? 'conectado' : '(simulación)'}</span>
                <span className={`badge ${tieneMeta ? 'badge-green' : 'badge-amber'}`}>{tieneMeta ? '● ' : '○ '}Meta {tieneMeta ? 'conectado' : '(simulación)'}</span>
              </div>
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-faint)' }}>
                Se combinan las credenciales de todos los agentes de <b>{base?.comercio.nombre}</b>.
              </p>

              {/* Idea */}
              <label className="block text-sm font-semibold mb-1.5 mt-4" style={{ color: 'var(--text-2)' }}>Idea de la pauta</label>
              <textarea className="input resize-none" rows={3} value={idea} onChange={e => setIdea(e.target.value)}
                placeholder="Ej: Campaña de lanzamiento para captar interesados en departamentos de 2 ambientes, presupuesto $8.000/día..." />

              <label className="block text-xs font-medium mb-1 mt-3" style={{ color: 'var(--text-muted)' }}>Contexto adicional (opcional)</label>
              <textarea className="input resize-none" rows={2} value={contextoExtra} onChange={e => setContextoExtra(e.target.value)}
                placeholder="Tono, ángulo, restricciones..." />

              <button onClick={ejecutar} disabled={cargando || !idea.trim()} className="btn-primary mt-4">
                {cargando ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
                {cargando ? 'Ejecutando campaña...' : 'Ejecutar campaña completa'}
              </button>

              {/* Progreso de pasos */}
              {(cargando || out) && (
                <div className="flex items-center gap-2 mt-4">
                  {PASOS.map((p, i) => {
                    const hecho = pasoActual > i || !!out
                    const activo = pasoActual === i && cargando
                    return (
                      <div key={i} className="flex items-center gap-2 flex-1">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs w-full" style={{
                          background: hecho ? 'rgba(34,197,94,0.1)' : activo ? 'rgba(37,99,235,0.12)' : 'var(--bg-input)',
                          border: `1px solid ${hecho ? 'rgba(34,197,94,0.3)' : activo ? 'var(--blue)' : 'var(--border-2)'}`,
                          color: hecho ? '#16a34a' : activo ? 'var(--blue-3)' : 'var(--text-muted)',
                        }}>
                          {hecho ? <CheckCircle2 size={13} /> : activo ? <Loader2 size={13} className="animate-spin" /> : <p.icon size={13} />}
                          {p.label}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Resultados */}
              {out && (
                <div className="mt-5 space-y-5">
                  {/* Estrategia */}
                  <section>
                    <p className="section-title mb-2 flex items-center gap-1"><Brain size={13} /> Estrategia</p>
                    <div className="rounded-xl p-4 text-sm whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-2)', color: 'var(--text-2)' }}>{out.estrategia}</div>
                  </section>

                  {/* Creativos */}
                  <section>
                    <p className="section-title mb-2 flex items-center gap-1"><Palette size={13} /> Creativos</p>
                    {out.creativos.canva?.imagenUrl && (
                      <div className="mb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={out.creativos.canva.imagenUrl} alt="Creativo" className="rounded-xl w-full max-w-xs" style={{ border: '1px solid var(--border-2)' }} />
                        <a href={out.creativos.canva.imagenUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs mt-1" style={{ color: 'var(--blue-3)' }}><ExternalLink size={12} /> Descargar PNG</a>
                      </div>
                    )}
                    {out.creativos.canvaError && <p className="text-xs mb-2" style={{ color: 'var(--orange-2)' }}>⚠ Canva: {out.creativos.canvaError}</p>}
                    <div className="space-y-2">
                      {out.creativos.paquete.variantes.map((v, i) => (
                        <div key={i} className="rounded-lg p-3 text-sm" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-2)', color: 'var(--text-2)' }}>
                          <div className="flex items-center justify-between mb-1"><b style={{ color: 'var(--text)' }}>{v.titulo}</b><span className="badge badge-blue">{v.cta}</span></div>
                          <p className="whitespace-pre-wrap">{v.textoPrincipal}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Publicador */}
                  <section>
                    <p className="section-title mb-2 flex items-center gap-1"><Rocket size={13} /> Campaña en Meta</p>
                    {out.publicador.simulacion && (
                      <div className="rounded-lg p-3 text-xs flex items-start gap-2 mb-2" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#d97706' }}>
                        <AlertTriangle size={13} className="mt-0.5 shrink-0" /><span><b>Simulación.</b> Sin credenciales de Meta en los agentes de este comercio; la campaña no se creó en tu cuenta.</span>
                      </div>
                    )}
                    <div className="rounded-xl p-4 text-sm space-y-1" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-2)', color: 'var(--text-2)' }}>
                      <div><b style={{ color: 'var(--text)' }}>{out.publicador.spec.nombreCampania}</b></div>
                      <div>Objetivo: {out.publicador.spec.objetivo.replace('OUTCOME_', '')} · ${out.publicador.spec.presupuestoDiarioArs.toLocaleString('es-AR')}/día</div>
                      <div>Geo: {out.publicador.spec.targeting.ciudad} · Edad {out.publicador.spec.targeting.edadMin}-{out.publicador.spec.targeting.edadMax}</div>
                      {out.publicador.resultado && (
                        <div className="mt-2 pt-2 space-y-0.5" style={{ borderTop: '1px solid var(--border-2)' }}>
                          <p className="flex items-center gap-1" style={{ color: '#16a34a' }}><CheckCircle2 size={13} /> Creado en Meta (PAUSADO)</p>
                          <p className="font-mono text-xs">Campaign: {out.publicador.resultado.campaignId}</p>
                          <p className="font-mono text-xs">Ad Set: {out.publicador.resultado.adSetId}</p>
                          {out.publicador.resultado.adId && <p className="font-mono text-xs">Ad: {out.publicador.resultado.adId}</p>}
                        </div>
                      )}
                    </div>
                    {out.publicador.resultado && (
                      <a href="https://adsmanager.facebook.com/adsmanager" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs mt-2" style={{ color: 'var(--blue-3)' }}>
                        <ExternalLink size={13} /> Revisar y activar en el Administrador de Anuncios
                      </a>
                    )}
                  </section>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
