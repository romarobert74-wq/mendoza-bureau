'use client'

/**
 * BANCO DE PRUEBAS DEL PUENTE 3DVista ⇄ Sistema  (ejemplo chico)
 * ─────────────────────────────────────────────────────────────
 * Objetivo: probar que el webframe puede ordenarle a 3DVista saltar
 * a un panorama POR NOMBRE, y ver el resultado en pantalla.
 *
 * Cómo se usa:
 *  1) Publicá esta página (develop) y metela como WEBFRAME dentro del tour.
 *  2) Pegá el snippet del listener en 3DVista (Begin → Execute JavaScript).
 *     El snippet está en:  public/3dvista/puente-ir-a.js  (y abajo, comentado).
 *  3) Abrí el tour, tocá "Ping" → si el puente vive, aparece "PONG".
 *     Tocá "Listar panoramas" → 3DVista devuelve los nombres reales.
 *     Escribí un nombre y "Ir a" → 3DVista salta a ese panorama.
 *
 * Todo lo que 3DVista responde se muestra en el LOG de abajo.
 */

import { useEffect, useRef, useState } from 'react'

// Botones de ejemplo (después esto viene de Firestore, por socio)
const EJEMPLO = [
  { etiqueta: 'Recepción', panorama: 'recepcion' },
  { etiqueta: 'Habitaciones', panorama: 'habitaciones' },
  { etiqueta: 'Piscina', panorama: 'piscina' },
  { etiqueta: 'Sala de cata', panorama: 'sala-cata' },
  { etiqueta: 'Sunset', panorama: 'sunset' },
]

type LogItem = { t: string; msg: string; kind: 'out' | 'in' | 'info' }

export default function IrATest() {
  const [log, setLog] = useState<LogItem[]>([])
  const [destino, setDestino] = useState('recepcion')
  const [pong, setPong] = useState<boolean | null>(null)
  const [panoramas, setPanoramas] = useState<string[]>([])
  const logRef = useRef<HTMLDivElement>(null)

  const addLog = (msg: string, kind: LogItem['kind'] = 'info') =>
    setLog(l => [...l.slice(-40), { t: new Date().toLocaleTimeString(), msg, kind }])

  // Emite hacia el tour padre (mismo patrón que el menú flotante actual)
  const emitir = (msg: Record<string, unknown>) => {
    const payload = { source: 'bureau-ir-a', ...msg }
    try { window.parent?.postMessage(payload, '*') } catch {}
    try { if (window.top && window.top !== window.parent) window.top.postMessage(payload, '*') } catch {}
    addLog(`→ enviado: ${JSON.stringify(msg)}`, 'out')
  }

  // Escucha respuestas de 3DVista
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data
      if (!d || typeof d !== 'object' || d.source !== 'bureau-tour') return
      addLog(`← recibido: ${JSON.stringify(d)}`, 'in')
      if (d.tipo === 'mb-pong') setPong(true)
      if (d.tipo === 'mb-panoramas' && Array.isArray(d.lista)) setPanoramas(d.lista)
      if (d.tipo === 'mb-ir-a-ok') addLog(`✓ saltó a "${d.panorama}" · método: ${d.metodo} · playlist ${d.playlist} idx ${d.indice}`, 'in')
      if (d.tipo === 'mb-ir-a-fail') addLog(`✗ falló "${d.panorama}" (playlists detectadas: ${d.playlists ?? '?'})`, 'in')
      if (d.tipo === 'mb-dump') addLog(`🔎 DUMP: ${JSON.stringify(d.info)}`, 'in')
    }
    window.addEventListener('message', onMsg)
    addLog('Banco de pruebas listo. Esperando al tour…', 'info')
    return () => window.removeEventListener('message', onMsg)
  }, [])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [log])

  const estaSolo = typeof window !== 'undefined' && window.parent === window

  return (
    <div style={S.wrap}>
      <style>{CSS}</style>

      <div style={S.card}>
        <div style={S.head}>
          <div style={S.title}>Explorá el recorrido</div>
          <div style={S.sub}>Banco de pruebas del puente · Ir a (por nombre)</div>
        </div>

        {estaSolo && (
          <div style={S.aviso}>
            Estás viendo esta página fuera del tour. El puente solo responde cuando
            está embebida como webframe dentro de 3DVista.
          </div>
        )}

        {/* Diagnóstico */}
        <div style={S.diagRow}>
          <button
            className="btn-mini"
            onClick={() => { setPong(null); emitir({ tipo: 'mb-ping' }) }}
          >
            Ping al tour
          </button>
          <span style={{
            ...S.estado,
            color: pong === true ? '#7CFFB2' : pong === null ? '#a99e97' : '#ff8a8a',
          }}>
            {pong === true ? '● PONG — puente OK' : pong === null ? '○ sin probar' : '○ sin respuesta'}
          </span>
          <button className="btn-mini" onClick={() => emitir({ tipo: 'mb-listar' })}>
            Listar panoramas
          </button>
          <button className="btn-mini" onClick={() => emitir({ tipo: 'mb-dump' })}>
            Dump API
          </button>
        </div>

        {panoramas.length > 0 && (
          <div style={S.panos}>
            <div style={S.panosLbl}>Panoramas reales en el tour (tocá para ir):</div>
            <div style={S.panosGrid}>
              {panoramas.map(p => (
                <button key={p} className="chip" onClick={() => emitir({ tipo: 'mb-ir-a', panorama: p })}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botonera de ejemplo */}
        <div style={S.grid}>
          {EJEMPLO.map(b => (
            <button
              key={b.panorama}
              className="btn-go"
              onClick={() => emitir({ tipo: 'mb-ir-a', panorama: b.panorama })}
            >
              <span>{b.etiqueta}</span>
              <span style={S.chev}>›</span>
            </button>
          ))}
        </div>

        {/* Ir a nombre libre */}
        <div style={S.freeRow}>
          <input
            className="inp"
            value={destino}
            onChange={e => setDestino(e.target.value)}
            placeholder="nombre del panorama…"
          />
          <button className="btn-go solid" onClick={() => emitir({ tipo: 'mb-ir-a', panorama: destino.trim() })}>
            Ir a
          </button>
        </div>

        {/* Log */}
        <div style={S.logHead}>Registro del puente</div>
        <div ref={logRef} style={S.logBox}>
          {log.map((l, i) => (
            <div key={i} style={{
              ...S.logLine,
              color: l.kind === 'out' ? '#ffb37a' : l.kind === 'in' ? '#7CFFB2' : '#a99e97',
            }}>
              <span style={{ opacity: .5 }}>{l.t}</span>  {l.msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  wrap: { minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16, background: 'transparent' },
  card: {
    width: 'min(560px, 96vw)', borderRadius: 22, padding: 20,
    background: 'rgba(20,15,17,.72)', backdropFilter: 'blur(22px)',
    border: '1px solid rgba(255,255,255,.10)', color: '#f5ede7',
    boxShadow: '0 24px 60px rgba(0,0,0,.45)',
  },
  head: { textAlign: 'center', marginBottom: 14 },
  title: { fontSize: 26, fontWeight: 800, letterSpacing: '-.02em' },
  sub: { fontSize: 13, color: '#a99e97', marginTop: 2 },
  aviso: {
    fontSize: 12, color: '#ffd7b0', background: 'rgba(255,106,61,.10)',
    border: '1px solid rgba(255,106,61,.25)', borderRadius: 12, padding: '8px 10px', marginBottom: 12,
  },
  diagRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 },
  estado: { fontSize: 12, fontWeight: 600, flex: 1, minWidth: 120 },
  panos: { marginBottom: 12 },
  panosLbl: { fontSize: 11, color: '#a99e97', marginBottom: 6 },
  panosGrid: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 },
  chev: { opacity: .5, fontSize: 20 },
  freeRow: { display: 'flex', gap: 8, marginBottom: 16 },
  logHead: { fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: '#a99e97', marginBottom: 6 },
  logBox: {
    height: 150, overflowY: 'auto', fontFamily: 'ui-monospace, monospace', fontSize: 11.5,
    background: 'rgba(0,0,0,.35)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: 10,
  },
  logLine: { padding: '1px 0', lineHeight: 1.5 },
}

const CSS = `
  .btn-go{ display:flex; align-items:center; justify-content:space-between; gap:8px;
    padding:14px 16px; border-radius:14px; cursor:pointer; font-size:15px; font-weight:600;
    color:#f5ede7; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.10);
    transition:.15s; }
  .btn-go:hover{ background:rgba(255,106,61,.14); border-color:rgba(255,106,61,.4); transform:translateY(-1px); }
  .btn-go.solid{ background:linear-gradient(135deg,#ff6a3d,#ffa057); color:#1b1416; border:none; justify-content:center; }
  .btn-mini{ padding:8px 12px; border-radius:10px; cursor:pointer; font-size:13px; font-weight:600;
    color:#f5ede7; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); }
  .btn-mini:hover{ background:rgba(255,255,255,.12); }
  .chip{ padding:6px 10px; border-radius:999px; cursor:pointer; font-size:12px; color:#ffb37a;
    background:rgba(255,106,61,.10); border:1px solid rgba(255,106,61,.3); }
  .chip:hover{ background:rgba(255,106,61,.2); }
  .inp{ flex:1; padding:12px 14px; border-radius:12px; font-size:14px; color:#f5ede7;
    background:rgba(0,0,0,.3); border:1px solid rgba(255,255,255,.14); outline:none; }
  .inp:focus{ border-color:rgba(255,106,61,.5); }
`
