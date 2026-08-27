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
        <div className="col">
          <button className="halo info" onClick={() => abrir(destInfo)} aria-label="Información">
            <span className="ic"><Info size={26} /></span>
          </button>
          <span className="cap">Información</span>
        </div>
        <div className="col">
          <button className="halo ir" onClick={() => abrir(destIr)} aria-label="Ir a">
            <span className="ic"><Compass size={26} /></span>
          </button>
          <span className="cap">Ir a</span>
        </div>
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
  .wrap, .stack, .col, .cap{ pointer-events:none; }
  .halo{ pointer-events:auto; }

  :root{ --info:#3b82f6; --ir:#ff6a3d; }

  .stack{ display:flex; flex-direction:column; gap:22px; align-items:center; }
  .col{ display:flex; flex-direction:column; align-items:center; gap:9px; }

  .halo{ position:relative; width:72px; height:72px; border-radius:999px; cursor:pointer;
    display:grid; place-items:center; background:#0e131c; border:none; color:var(--c);
    animation:bob 3.2s ease-in-out infinite; transition:box-shadow .25s ease, transform .2s ease; }
  .halo.info{ --c:var(--info); box-shadow:0 0 0 2px var(--info), 0 0 18px -2px var(--info); }
  .halo.ir{ --c:var(--ir); box-shadow:0 0 0 2px var(--ir), 0 0 18px -2px var(--ir); }
  .halo .ic{ display:grid; place-items:center; transition:.2s; }
  .halo:hover{ box-shadow:0 0 0 2px var(--c), 0 0 34px 2px var(--c); }
  .halo:hover .ic{ animation:boing .5s ease; color:#fff; }
  .halo:active{ transform:scale(.94); }

  .cap{ font-size:12px; font-weight:700; letter-spacing:.04em; color:#e8eef7; text-transform:uppercase;
    text-shadow:0 1px 6px rgba(0,0,0,.6); }

  @keyframes bob{ 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-7px) } }
  @keyframes boing{ 0%{ transform:scale(1) } 35%{ transform:scale(1.25) } 60%{ transform:scale(.9) } 100%{ transform:scale(1) } }
  @media (prefers-reduced-motion: reduce){ .halo{ animation:none } }
`
