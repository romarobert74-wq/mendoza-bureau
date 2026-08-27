'use client'

/**
 * DEMO de rediseño de los botones flotantes del tour: "Información" e "Ir a".
 * 3 opciones para elegir. Solo visual — no dispara nada todavía.
 * URL: /tour/botones-demo
 */

import { Info, Compass } from 'lucide-react'

export default function BotonesDemo() {
  return (
    <div style={S.wrap}>
      <style>{CSS}</style>

      <h1 style={S.h1}>Botones flotantes — 3 opciones</h1>
      <p style={S.p}>Pasá el mouse por encima de cada uno. Elegí el número que más te guste.</p>

      {/* OPCIÓN 1 — GLASS PULSE */}
      <section style={S.card}>
        <div style={S.tag}>Opción 1 · Glass Pulse</div>
        <div style={S.row}>
          <div className="o1 info">
            <span className="ring" /><span className="ic"><Info size={26} /></span>
            <span className="lbl">Información</span>
          </div>
          <div className="o1 ir">
            <span className="ring" /><span className="ic"><Compass size={26} /></span>
            <span className="lbl">Ir a</span>
          </div>
        </div>
        <p style={S.desc}>Vidrio esmerilado, anillo que late. En hover se ilumina con el color y la etiqueta se desliza.</p>
      </section>

      {/* OPCIÓN 2 — HALO NEÓN */}
      <section style={S.card}>
        <div style={S.tag}>Opción 2 · Halo Neón</div>
        <div style={S.row}>
          <div className="o2col">
            <div className="o2 info"><span className="ic"><Info size={26} /></span></div>
            <span className="cap">Información</span>
          </div>
          <div className="o2col">
            <div className="o2 ir"><span className="ic"><Compass size={26} /></span></div>
            <span className="cap">Ir a</span>
          </div>
        </div>
        <p style={S.desc}>Aro luminoso, flota suave. En hover el halo se intensifica y el ícono rebota. Etiqueta siempre visible.</p>
      </section>

      {/* OPCIÓN 3 — GRADIENTE + ÓRBITA */}
      <section style={S.card}>
        <div style={S.tag}>Opción 3 · Gradiente + Órbita</div>
        <div style={S.row}>
          <div className="o3 info">
            <span className="orbit" /><span className="core"><Info size={26} /></span>
            <span className="lbl">Información</span>
          </div>
          <div className="o3 ir">
            <span className="orbit" /><span className="core"><Compass size={26} /></span>
            <span className="lbl">Ir a</span>
          </div>
        </div>
        <p style={S.desc}>Círculo lleno con degradé y borde giratorio. En hover se eleva y la etiqueta entra desde el costado.</p>
      </section>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: '100vh', padding: '40px 20px 80px',
    background: 'radial-gradient(1200px 600px at 70% -10%, #1a2740, #0b0e14 60%)',
    color: '#f5ede7', fontFamily: 'system-ui, sans-serif',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
  },
  h1: { fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', margin: 0 },
  p: { color: '#9aa4b2', fontSize: 14, margin: '2px 0 24px' },
  card: {
    width: 'min(680px, 94vw)', borderRadius: 22, padding: '26px 22px 18px', marginBottom: 20,
    background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', position: 'relative',
  },
  tag: {
    position: 'absolute', top: -11, left: 22, fontSize: 12, fontWeight: 700, letterSpacing: '.03em',
    padding: '3px 12px', borderRadius: 999, background: '#111827', border: '1px solid rgba(255,255,255,.12)', color: '#cbd5e1',
  },
  row: { display: 'flex', gap: 56, justifyContent: 'center', alignItems: 'center', minHeight: 130, flexWrap: 'wrap' },
  desc: { textAlign: 'center', color: '#8a94a3', fontSize: 12.5, marginTop: 6, marginBottom: 2 },
}

const CSS = `
  :root{ --info:#3b82f6; --ir:#ff6a3d; }

  /* ---------- OPCIÓN 1 · GLASS PULSE ---------- */
  .o1{ position:relative; width:74px; height:74px; border-radius:999px; cursor:pointer;
    display:grid; place-items:center; color:#e8eef7;
    background:rgba(255,255,255,.07); backdrop-filter:blur(10px);
    border:1px solid rgba(255,255,255,.18); transition:.25s cubic-bezier(.2,.8,.2,1); }
  .o1 .ic{ display:grid; place-items:center; transition:.25s; }
  .o1 .ring{ position:absolute; inset:-4px; border-radius:999px; border:2px solid currentColor;
    opacity:.35; animation:pulse 2.4s ease-out infinite; }
  .o1.info{ color:var(--info); } .o1.ir{ color:var(--ir); }
  .o1 .lbl{ position:absolute; left:50%; bottom:-30px; transform:translateX(-50%) translateY(-6px);
    font-size:12px; font-weight:700; color:#fff; opacity:0; white-space:nowrap; transition:.25s; }
  .o1:hover{ background:color-mix(in srgb, currentColor 22%, transparent);
    border-color:currentColor; transform:translateY(-3px) scale(1.06);
    box-shadow:0 12px 30px -8px currentColor; }
  .o1:hover .ic{ transform:scale(1.12); color:#fff; }
  .o1:hover .lbl{ opacity:1; transform:translateX(-50%) translateY(0); }
  @keyframes pulse{ 0%{ transform:scale(1); opacity:.4 } 70%{ transform:scale(1.35); opacity:0 } 100%{ opacity:0 } }

  /* ---------- OPCIÓN 2 · HALO NEÓN ---------- */
  .o2col{ display:flex; flex-direction:column; align-items:center; gap:12px; }
  .o2{ position:relative; width:72px; height:72px; border-radius:999px; cursor:pointer;
    display:grid; place-items:center; background:#0e131c;
    animation:bob 3.2s ease-in-out infinite; transition:.25s; }
  .o2.info{ color:var(--info); box-shadow:0 0 0 2px var(--info), 0 0 18px -2px var(--info); }
  .o2.ir{ color:var(--ir); box-shadow:0 0 0 2px var(--ir), 0 0 18px -2px var(--ir); }
  .o2 .ic{ transition:.2s; }
  .o2:hover{ box-shadow:0 0 0 2px currentColor, 0 0 34px 2px currentColor; }
  .o2:hover .ic{ animation:boing .5s ease; color:#fff; }
  .o2col .cap{ font-size:12px; font-weight:700; letter-spacing:.04em; color:#cdd5e0; text-transform:uppercase; }
  @keyframes bob{ 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-7px) } }
  @keyframes boing{ 0%{ transform:scale(1) } 35%{ transform:scale(1.25) } 60%{ transform:scale(.9) } 100%{ transform:scale(1) } }

  /* ---------- OPCIÓN 3 · GRADIENTE + ÓRBITA ---------- */
  .o3{ position:relative; width:76px; height:76px; border-radius:999px; cursor:pointer;
    display:grid; place-items:center; transition:.28s cubic-bezier(.2,.8,.2,1); }
  .o3 .core{ position:relative; z-index:2; width:64px; height:64px; border-radius:999px;
    display:grid; place-items:center; color:#0b0e14; }
  .o3.info .core{ background:linear-gradient(135deg,#60a5fa,#2563eb); }
  .o3.ir .core{ background:linear-gradient(135deg,#ffb37a,#ff6a3d); }
  .o3 .orbit{ position:absolute; inset:-3px; border-radius:999px; z-index:1;
    background:conic-gradient(from 0deg, transparent 0 70%, currentColor 88% 100%);
    animation:spin 3.5s linear infinite; }
  .o3.info{ color:var(--info); } .o3.ir{ color:var(--ir); }
  .o3 .lbl{ position:absolute; left:86px; top:50%; transform:translateY(-50%) translateX(-8px);
    font-size:13px; font-weight:800; color:#fff; white-space:nowrap; opacity:0; transition:.28s; }
  .o3:hover{ transform:translateY(-3px); }
  .o3:hover .core{ transform:scale(1.05); }
  .o3:hover{ filter:drop-shadow(0 12px 22px color-mix(in srgb, currentColor 55%, transparent)); }
  .o3:hover .lbl{ opacity:1; transform:translateY(-50%) translateX(0); }
  @keyframes spin{ to{ transform:rotate(360deg) } }

  @media (prefers-reduced-motion: reduce){
    .o1 .ring, .o2, .o3 .orbit{ animation:none; }
  }
`
