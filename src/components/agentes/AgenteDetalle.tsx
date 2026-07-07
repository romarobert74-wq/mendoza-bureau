'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { X, Sparkles, Loader2, Copy, Trash2, MapPin, Rocket, CheckCircle2, AlertTriangle, ExternalLink, Palette } from 'lucide-react'
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

interface SpecPreview {
  nombreCampania: string
  objetivo: string
  presupuestoDiarioArs: number
  targeting: { ciudad: string; radioKm: number; edadMin: number; edadMax: number; generos: number[]; intereses: string[] }
  creativo: { textoPrincipal: string; titulo: string; descripcion: string; cta: string; enlace: string }
}
interface Resultado {
  campaignId: string; adSetId: string; creativeId?: string; adId?: string
  geoResuelto: string; interesesResueltos: string[]; advertencias: string[]
}
interface Variante { textoPrincipal: string; titulo: string; descripcion: string; cta: string; promptImagen: string; briefVisual: string }
interface PaqueteCreativo { variantes: Variante[]; carrusel: { titulo: string; texto: string }[]; guionVideo: string }
interface CanvaOut { designId: string; editUrl?: string; imagenUrl?: string }

export default function AgenteDetalle({ agente, onClose, onEliminado }: Props) {
  const meta = getTipoAgenteMeta(agente.tipo)
  const rubro = getRubroMeta(agente.rubro)

  const [idea, setIdea] = useState('')
  const [cargando, setCargando] = useState(false)

  // Estratega
  const [resultado, setResultado] = useState('')

  // Publicador
  const [imagenUrl, setImagenUrl] = useState('')
  const [spec, setSpec] = useState<SpecPreview | null>(null)
  const [pubResultado, setPubResultado] = useState<Resultado | null>(null)
  const [simulacion, setSimulacion] = useState(false)

  // Creativo
  const [paquete, setPaquete] = useState<PaqueteCreativo | null>(null)
  const [canva, setCanva] = useState<CanvaOut | null>(null)
  const [creativoSim, setCreativoSim] = useState(false)

  const esEstratega = agente.tipo === 'estratega'
  const esPublicador = agente.tipo === 'publicador'
  const esCreativo = agente.tipo === 'creativos'

  const generarEstrategia = async () => {
    if (!idea.trim() || cargando) return
    setCargando(true); setResultado('')
    try {
      const res = await fetch('/api/agentes/estrategia', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, rubro: agente.rubro, pais: agente.pais, departamento: agente.departamento, comercio: agente.comercio }),
      })
      if (!res.ok) throw new Error('error')
      const data = await res.json()
      setResultado(data.estrategia || '')
    } catch { toast.error('Error al generar la estrategia') }
    finally { setCargando(false) }
  }

  const publicar = async () => {
    if (!idea.trim() || cargando) return
    setCargando(true); setSpec(null); setPubResultado(null)
    try {
      const res = await fetch('/api/agentes/publicar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea, rubro: agente.rubro, pais: agente.pais, departamento: agente.departamento,
          comercio: agente.comercio, imagenUrl, credenciales: agente.credenciales,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'error')
      setSpec(data.spec)
      setSimulacion(!!data.simulacion)
      setPubResultado(data.resultado ?? null)
      toast.success(data.simulacion ? 'Campaña generada (simulación)' : 'Borrador creado en Meta')
    } catch (err) { toast.error((err as Error).message) }
    finally { setCargando(false) }
  }

  const generarCreativos = async () => {
    if (!idea.trim() || cargando) return
    setCargando(true); setPaquete(null); setCanva(null)
    try {
      const res = await fetch('/api/agentes/creativos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, rubro: agente.rubro, pais: agente.pais, departamento: agente.departamento, comercio: agente.comercio, credenciales: agente.credenciales }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'error')
      setPaquete(data.paquete)
      setCreativoSim(!!data.simulacion)
      setCanva(data.canva ?? null)
      toast.success(data.canva ? 'Creativos + imagen generados' : 'Creativos generados')
    } catch (err) { toast.error((err as Error).message) }
    finally { setCargando(false) }
  }

  const dispatch = esEstratega ? generarEstrategia : esPublicador ? publicar : generarCreativos

  const eliminar = async () => {
    if (!confirm('¿Eliminar este agente?')) return
    try { await eliminarAgente(agente.id); toast.success('Agente eliminado'); onEliminado() }
    catch { toast.error('Error al eliminar') }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="card w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: `${meta.color}22`, border: `1px solid ${meta.color}55` }}>{meta.emoji}</div>
            <div>
              <h2 className="font-bold" style={{ color: 'var(--text)' }}>{agente.nombre}</h2>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{rubro.emoji} {rubro.nombre}</span>
                <span className="flex items-center gap-0.5"><MapPin size={11} /> {agente.departamento}, {agente.pais}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={eliminar} title="Eliminar" style={{ color: 'var(--text-muted)' }} className="hover:text-red-500 transition"><Trash2 size={17} /></button>
            <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {rubro.advertencia && (
            <div className="rounded-lg p-3 mb-4 text-xs" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)', color: 'var(--orange-2)' }}>⚠ {rubro.advertencia}</div>
          )}

          {(esEstratega || esPublicador || esCreativo) ? (
            <>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>Idea de la pauta</label>
              <textarea className="input resize-none" rows={3} value={idea} onChange={e => setIdea(e.target.value)}
                placeholder="Ej: Quiero vender 3 casas en Chacras de Coria este mes, presupuesto $150.000 diarios, generar visitas..." />

              {esPublicador && (
                <div className="mt-3">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>URL de imagen del anuncio (opcional — necesaria para crear el anuncio automático)</label>
                  <input className="input" value={imagenUrl} onChange={e => setImagenUrl(e.target.value)} placeholder="https://..." />
                </div>
              )}

              <button onClick={dispatch} disabled={cargando || !idea.trim()} className="btn-primary mt-3">
                {cargando ? <Loader2 size={15} className="animate-spin" /> : esEstratega ? <Sparkles size={15} /> : esPublicador ? <Rocket size={15} /> : <Palette size={15} />}
                {cargando
                  ? (esEstratega ? 'Elaborando estrategia...' : esPublicador ? 'Creando campaña...' : 'Generando creativos...')
                  : esEstratega ? 'Generar estrategia' : esPublicador ? 'Generar y crear borrador en Meta' : 'Generar creativos'}
              </button>

              {/* Resultado Estratega */}
              {esEstratega && resultado && (
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="section-title">Estrategia generada</p>
                    <button onClick={() => { navigator.clipboard.writeText(resultado); toast.success('Copiado') }} className="flex items-center gap-1 text-xs" style={{ color: 'var(--blue-3)' }}><Copy size={13} /> Copiar</button>
                  </div>
                  <div className="rounded-xl p-4 text-sm whitespace-pre-wrap leading-relaxed" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-2)', color: 'var(--text-2)' }}>{resultado}</div>
                </div>
              )}

              {/* Resultado Publicador */}
              {esPublicador && spec && (
                <div className="mt-5 space-y-4">
                  {simulacion && (
                    <div className="rounded-lg p-3 text-xs flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#d97706' }}>
                      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                      <span><b>Modo simulación.</b> No cargaste Access Token + Ad Account ID de Meta, así que la campaña no se creó en tu cuenta. Cargá esas credenciales en el agente para publicar de verdad.</span>
                    </div>
                  )}

                  <div>
                    <p className="section-title mb-2">Estructura de campaña</p>
                    <div className="rounded-xl p-4 text-sm space-y-1.5" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-2)', color: 'var(--text-2)' }}>
                      <Fila k="Campaña" v={spec.nombreCampania} />
                      <Fila k="Objetivo" v={spec.objetivo.replace('OUTCOME_', '')} />
                      <Fila k="Presupuesto diario" v={`$${spec.presupuestoDiarioArs.toLocaleString('es-AR')} ARS`} />
                      <Fila k="Ubicación" v={`${spec.targeting.ciudad} · radio ${spec.targeting.radioKm}km`} />
                      <Fila k="Edad" v={`${spec.targeting.edadMin}-${spec.targeting.edadMax}`} />
                      <Fila k="Intereses" v={spec.targeting.intereses.join(', ') || '—'} />
                      <Fila k="CTA" v={spec.creativo.cta} />
                      <Fila k="Enlace" v={spec.creativo.enlace} />
                    </div>
                  </div>

                  <div>
                    <p className="section-title mb-2">Creativo</p>
                    <div className="rounded-xl p-4 text-sm space-y-2" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-2)', color: 'var(--text-2)' }}>
                      <p><b>{spec.creativo.titulo}</b></p>
                      <p className="whitespace-pre-wrap">{spec.creativo.textoPrincipal}</p>
                      <p style={{ color: 'var(--text-muted)' }}>{spec.creativo.descripcion}</p>
                    </div>
                  </div>

                  {pubResultado && (
                    <div>
                      <p className="section-title mb-2 flex items-center gap-1"><CheckCircle2 size={13} style={{ color: '#16a34a' }} /> Creado en Meta (borrador PAUSADO)</p>
                      <div className="rounded-xl p-4 text-sm space-y-1.5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)', color: 'var(--text-2)' }}>
                        <Fila k="Campaign ID" v={pubResultado.campaignId} mono />
                        <Fila k="Ad Set ID" v={pubResultado.adSetId} mono />
                        {pubResultado.adId && <Fila k="Ad ID" v={pubResultado.adId} mono />}
                        <Fila k="Geo resuelto" v={pubResultado.geoResuelto} />
                        {pubResultado.interesesResueltos.length > 0 && <Fila k="Intereses reales" v={pubResultado.interesesResueltos.join(', ')} />}
                      </div>
                      <a href="https://adsmanager.facebook.com/adsmanager" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs mt-2" style={{ color: 'var(--blue-3)' }}>
                        <ExternalLink size={13} /> Abrir Administrador de Anuncios para revisar y activar
                      </a>
                      {pubResultado.advertencias.map((a, i) => (
                        <p key={i} className="text-xs mt-2 flex items-start gap-1" style={{ color: 'var(--orange-2)' }}><AlertTriangle size={12} className="mt-0.5 shrink-0" /> {a}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Resultado Creativo */}
              {esCreativo && paquete && (
                <div className="mt-5 space-y-4">
                  {creativoSim && (
                    <div className="rounded-lg p-3 text-xs flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#d97706' }}>
                      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                      <span><b>Sin imagen automática.</b> Cargá el Access Token + Brand Template de Canva en el agente para generar la imagen. Mientras tanto, usá los prompts de abajo en Canva o tu generador de imágenes.</span>
                    </div>
                  )}

                  {canva?.imagenUrl && (
                    <div>
                      <p className="section-title mb-2 flex items-center gap-1"><CheckCircle2 size={13} style={{ color: '#16a34a' }} /> Imagen generada en Canva</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={canva.imagenUrl} alt="Creativo" className="rounded-xl w-full max-w-sm" style={{ border: '1px solid var(--border-2)' }} />
                      <div className="flex gap-3 mt-2 text-xs">
                        <a href={canva.imagenUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1" style={{ color: 'var(--blue-3)' }}><ExternalLink size={13} /> Descargar PNG</a>
                        {canva.editUrl && <a href={canva.editUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1" style={{ color: 'var(--blue-3)' }}><Palette size={13} /> Editar en Canva</a>}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="section-title mb-2">Variantes de anuncio</p>
                    <div className="space-y-3">
                      {paquete.variantes.map((v, i) => (
                        <div key={i} className="rounded-xl p-4 text-sm space-y-1.5" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-2)', color: 'var(--text-2)' }}>
                          <div className="flex items-center justify-between">
                            <b style={{ color: 'var(--text)' }}>{v.titulo}</b>
                            <span className="badge badge-blue">{v.cta}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{v.textoPrincipal}</p>
                          <p style={{ color: 'var(--text-muted)' }}>{v.descripcion}</p>
                          <div className="rounded-lg p-2 mt-1" style={{ background: 'var(--bg-hover)' }}>
                            <p className="text-xs" style={{ color: 'var(--text-faint)' }}><b>Prompt imagen:</b> {v.promptImagen}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="section-title mb-2">Carrusel</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {paquete.carrusel.map((s, i) => (
                        <div key={i} className="rounded-lg p-3 text-sm" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-2)' }}>
                          <p style={{ color: 'var(--text-faint)', fontSize: 11 }}>Slide {i + 1}</p>
                          <p style={{ color: 'var(--text)', fontWeight: 600 }}>{s.titulo}</p>
                          <p style={{ color: 'var(--text-muted)' }}>{s.texto}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="section-title">Guion de video (Reel 9:16)</p>
                      <button onClick={() => { navigator.clipboard.writeText(paquete.guionVideo); toast.success('Copiado') }} className="flex items-center gap-1 text-xs" style={{ color: 'var(--blue-3)' }}><Copy size={13} /> Copiar</button>
                    </div>
                    <div className="rounded-xl p-4 text-sm whitespace-pre-wrap" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-2)', color: 'var(--text-2)' }}>{paquete.guionVideo}</div>
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Fila({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex gap-2">
      <span className="shrink-0" style={{ color: 'var(--text-muted)', minWidth: 120 }}>{k}</span>
      <span className={mono ? 'font-mono text-xs' : ''} style={{ color: 'var(--text)', wordBreak: 'break-all' }}>{v}</span>
    </div>
  )
}
