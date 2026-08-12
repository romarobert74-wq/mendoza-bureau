'use client'

import { useEffect, useMemo, useState } from 'react'
import { getChatLogs, type ChatLog } from '@/lib/firestore'
import { MessageSquare, AlertCircle, RefreshCw } from 'lucide-react'

/* Conversaciones del bot de IA — para "aprendizaje curado":
   ver qué preguntan y, sobre todo, qué NO supo responder, para sumarlo al .md. */
export default function ConversacionesPage() {
  const [logs, setLogs] = useState<ChatLog[]>([])
  const [cargando, setCargando] = useState(true)
  const [soloSin, setSoloSin] = useState(false)

  const cargar = () => {
    setCargando(true)
    getChatLogs(300).then(setLogs).catch(() => {}).finally(() => setCargando(false))
  }
  useEffect(cargar, [])

  const vistos = useMemo(() => (soloSin ? logs.filter(l => l.sinRespuesta) : logs), [logs, soloSin])
  const sinResp = useMemo(() => logs.filter(l => l.sinRespuesta).length, [logs])

  const fmt = (d?: Date) => d ? d.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''

  return (
    <div className="dashboard-scope p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-1">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Conversaciones del bot</h1>
        <button onClick={cargar} className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
          style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
          <RefreshCw size={15} /> Actualizar
        </button>
      </div>
      <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
        Mirá qué preguntan y qué el bot <b>no supo responder</b>. Con eso actualizás el <b>.md</b> de conocimiento y el bot mejora.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>
          <MessageSquare size={16} style={{ color: 'var(--blue-3)' }} />
          <span className="text-sm" style={{ color: 'var(--text)' }}><b>{logs.length}</b> consultas</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>
          <AlertCircle size={16} style={{ color: '#f59e0b' }} />
          <span className="text-sm" style={{ color: 'var(--text)' }}><b>{sinResp}</b> sin respuesta</span>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer ml-auto" style={{ color: 'var(--text-2)' }}>
          <input type="checkbox" checked={soloSin} onChange={e => setSoloSin(e.target.checked)} />
          Ver solo "sin respuesta"
        </label>
      </div>

      {cargando ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando…</p>
      ) : vistos.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {soloSin ? 'No hay preguntas sin respuesta 🎉' : 'Todavía no hay conversaciones registradas.'}
        </p>
      ) : (
        <div className="space-y-3">
          {vistos.map(l => (
            <div key={l.id} className="rounded-xl p-4" style={{
              background: 'var(--bg-elev)',
              border: `1px solid ${l.sinRespuesta ? 'rgba(245,158,11,.5)' : 'var(--border)'}`,
            }}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmt(l.ts)}</span>
                {l.sinRespuesta && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(245,158,11,.15)', color: '#f59e0b' }}>Sin respuesta</span>
                )}
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>❓ {l.pregunta}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{l.respuesta}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
