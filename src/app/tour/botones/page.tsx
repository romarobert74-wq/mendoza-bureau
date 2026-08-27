'use client'

/**
 * BOTONES FLOTANTES del tour (estilo "Halo Neón") — se embeben como webframe.
 * "Información" abre el contenedor INFO-SOCIO; "Ir a" abre BOTONERA-PPAL.
 * El fondo es transparente y solo los botones reciben clics (el resto deja
 * pasar el mouse al tour). Mantené el webframe chico y ubicado en un costado.
 *
 * Se pueden personalizar los destinos por querystring:
 *   /tour/botones?info=INFO-SOCIO&ir=BOTONERA-PPAL
 */

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Info, Compass } from 'lucide-react'

function Botones() {
  const q = useSearchParams()
  const destInfo = q.get('info') || 'INFO-SOCIO'
  const destIr = q.get('ir') || 'BOTONERA-PPAL'

  const abrir = (objetivo: string) => {
    const payload = { source: 'bureau-ir-a', tipo: 'mb-abrir', objetivo }
    try { window.parent?.postMessage(payload, '*') } catch {}
    try { if (window.top && window.top !== window.parent) window.top.postMessage(payload, '*') } catch {}
  }

  return (
    <div style={S.wrap}>
      <style>{CSS}</style>
      <div className="stack">
        <button className="glass info" onClick={() => abrir(destInfo)} aria-label="Información">
          <span className="ring" />
          <span className="ic"><Info size={22} /></span>
          <span className="lbl">Información</span>
        </button>
        <button className="glass ir" onClick={() => abrir(destIr)} aria-label="Ir a">
          <span className="ring" />
          <span className="ic"><Compass size={22} /></span>
          <span className="lbl">Ir a</span>
        </button>
      </div>
    </div>
  )
}

export default function BotonesFlotantes() {
  return (
    <Suspense fallback={null}>
      <Botones />
    </Suspense>
  )
}

const S: Record<string, React.CSSProperties> = {
  wrap: { minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'transparent' },
}

const CSS = `
  html,body{ background:transparent !important; }
  /* Todo deja pasar el mouse salvo los botones */
  .wrap, .stack{ pointer-events:none; }
  .glass{ pointer-events:auto; }

  :root{ --info:#3b82f6; --ir:#ff6a3d; }

  .stack{ display:flex; flex-direction:column; gap:20px; align-items:center; }

  /* OPCIÓN 1 · Glass Pulse (tamaño reducido) */
  .glass{ position:relative; width:58px; height:58px; border-radius:999px; cursor:pointer;
    display:grid; place-items:center; color:#e8eef7;
    background:rgba(255,255,255,.08); backdrop-filter:blur(10px);
    border:1px solid rgba(255,255,255,.20); transition:.25s cubic-bezier(.2,.8,.2,1); }
  .glass.info{ color:var(--info); } .glass.ir{ color:var(--ir); }
  .glass .ic{ display:grid; place-items:center; transition:.25s; }
  .glass .ring{ position:absolute; inset:-3px; border-radius:999px; border:2px solid currentColor;
    opacity:.35; animation:pulse 2.4s ease-out infinite; }
  .glass .lbl{ position:absolute; left:50%; bottom:-24px; transform:translateX(-50%) translateY(-5px);
    font-size:11px; font-weight:700; color:#fff; white-space:nowrap; opacity:0; transition:.25s;
    text-shadow:0 1px 6px rgba(0,0,0,.7); }
  .glass:hover{ background:color-mix(in srgb, currentColor 24%, transparent);
    border-color:currentColor; transform:translateY(-2px) scale(1.07);
    box-shadow:0 10px 26px -8px currentColor; }
  .glass:hover .ic{ transform:scale(1.12); color:#fff; }
  .glass:hover .lbl{ opacity:1; transform:translateX(-50%) translateY(0); }
  .glass:active{ transform:scale(.95); }

  @keyframes pulse{ 0%{ transform:scale(1); opacity:.4 } 70%{ transform:scale(1.4); opacity:0 } 100%{ opacity:0 } }
  @media (prefers-reduced-motion: reduce){ .glass .ring{ animation:none } }
`
