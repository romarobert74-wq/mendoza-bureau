'use client'

/**
 * BOTONERA "IR A" — se embebe como webframe dentro del tour 3DVista del socio.
 * Lee los botones del socio (Firestore) y, al tocar uno, le ordena a 3DVista
 * saltar al panorama por NOMBRE (puente: public/3dvista/puente-ir-a.js).
 */

import { useEffect, useMemo, useState } from 'react'
import {
  DoorOpen, BedDouble, Waves, Wine, Grape, Utensils, Flower2, Dumbbell,
  PartyPopper, Sofa, Images, Sunset, Umbrella, ShoppingBag, MapPin, Sparkles,
  ChevronRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { BotonPano, CategoriaSocio } from '@/types'
import { CATEGORIA_COLOR } from '@/types'

const ICON: Record<string, LucideIcon> = {
  puerta: DoorOpen, cama: BedDouble, pileta: Waves, copa: Wine, vinedo: Grape,
  cubiertos: Utensils, spa: Flower2, gimnasio: Dumbbell, salon: PartyPopper,
  sillon: Sofa, galeria: Images, atardecer: Sunset, terraza: Umbrella,
  tienda: ShoppingBag, pin: MapPin, estrella: Sparkles,
}

// Convierte #rrggbb a rgba(r,g,b,alpha) para los fondos translúcidos del rollover
function rgba(hex: string, a: number) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

export default function IrASocio({ params }: { params: { socioId: string } }) {
  const [botones, setBotones] = useState<BotonPano[] | null>(null)
  const [categoria, setCategoria] = useState<CategoriaSocio>('otro')
  const [error, setError] = useState(false)
  const [grupoActivo, setGrupoActivo] = useState<string>('')
  const [saliendo, setSaliendo] = useState(false)

  useEffect(() => {
    let vivo = true
    fetch(`/api/socio/${params.socioId}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        if (!vivo) return
        setBotones((d?.socio?.botonera ?? []) as BotonPano[])
        if (d?.socio?.categoria) setCategoria(d.socio.categoria as CategoriaSocio)
      })
      .catch(() => { if (vivo) setError(true) })
    return () => { vivo = false }
  }, [params.socioId])

  const color = CATEGORIA_COLOR[categoria] ?? '#ff6a3d'
  // Variables CSS de color de categoría para el rollover de los botones
  const catVars = {
    '--cat': color,
    '--cat-bg': rgba(color, 0.16),
    '--cat-bd': rgba(color, 0.5),
  } as React.CSSProperties

  // Puente con 3DVista (mismo patrón que el resto del sistema)
  const emitir = (msg: Record<string, unknown>) => {
    const payload = { source: 'bureau-ir-a', ...msg }
    try { window.parent?.postMessage(payload, '*') } catch {}
    try { if (window.top && window.top !== window.parent) window.top.postMessage(payload, '*') } catch {}
  }

  // Salta al panorama y cierra suavemente la botonera
  const irA = (panorama: string) => {
    emitir({ tipo: 'mb-ir-a', panorama })
    setSaliendo(true)
    setTimeout(() => emitir({ tipo: 'mb-cerrar-ir-a' }), 260)
    setTimeout(() => setSaliendo(false), 700)
  }

  const grupos = useMemo(() => {
    const gs: string[] = []
    for (const b of botones ?? []) {
      const g = (b.grupo ?? '').trim()
      if (g && !gs.includes(g)) gs.push(g)
    }
    return gs
  }, [botones])

  useEffect(() => {
    if (grupos.length && !grupoActivo) setGrupoActivo(grupos[0])
  }, [grupos, grupoActivo])

  const visibles = useMemo(() => {
    const list = botones ?? []
    if (grupos.length === 0) return list
    return list.filter(b => (b.grupo ?? '').trim() === grupoActivo)
  }, [botones, grupos, grupoActivo])

  return (
    <div style={{ ...S.wrap, ...catVars }}>
      <style>{CSS}</style>
      <div style={S.card} className={saliendo ? 'card saliendo' : 'card'}>
        <div style={S.head}>
          <div style={S.title}>¿A dónde querés ir?</div>
          <div style={S.sub}>Elegí un lugar del recorrido</div>
        </div>

        {botones === null && !error && <div style={S.info}>Cargando…</div>}
        {error && <div style={S.info}>No se pudo cargar la botonera.</div>}
        {botones !== null && botones.length === 0 && (
          <div style={S.info}>Este tour todavía no tiene botones cargados.</div>
        )}

        {grupos.length > 1 && (
          <div style={S.tabs}>
            {grupos.map(g => (
              <button key={g} onClick={() => setGrupoActivo(g)}
                className={'tab' + (g === grupoActivo ? ' on' : '')}>
                {g}
              </button>
            ))}
          </div>
        )}

        {visibles.length > 0 && (
          <div className="grid">
            {visibles.map((b, i) => {
              const Ic = b.icono ? ICON[b.icono] : undefined
              return (
                <button key={i} className="btn-go" onClick={() => irA(b.panorama)}>
                  <span style={S.left}>
                    {Ic && <span className="ic"><Ic size={20} /></span>}
                    <span>{b.etiqueta}</span>
                  </span>
                  <ChevronRight size={18} className="chev" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  wrap: { minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16, background: 'transparent' },
  card: {
    position: 'relative',
    width: 'min(560px, 96vw)', borderRadius: 24, padding: 22,
    background: 'rgba(20,15,17,.74)', backdropFilter: 'blur(22px)',
    border: '1px solid rgba(255,255,255,.10)', color: '#f5ede7',
    boxShadow: '0 24px 60px rgba(0,0,0,.45)',
  },
  head: { textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 27, fontWeight: 800, letterSpacing: '-.02em' },
  sub: { fontSize: 13, color: '#a99e97', marginTop: 2 },
  info: { textAlign: 'center', color: '#a99e97', fontSize: 14, padding: '18px 0' },
  tabs: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 14 },
  left: { display: 'flex', alignItems: 'center', gap: 12 },
}

const CSS = `
  .card{ transition:opacity .25s ease, transform .25s ease; }
  .card.saliendo{ opacity:0; transform:translateY(8px) scale(.98); pointer-events:none; }

  .grid{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }

  .btn-go{ display:flex; align-items:center; justify-content:space-between; gap:8px;
    padding:15px 16px; border-radius:15px; cursor:pointer; font-size:15px; font-weight:600;
    color:#f5ede7; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.10);
    transition:.15s; text-align:left; width:100%; }
  /* Rollover con el color de la categoría del socio (variables --cat*) */
  .btn-go:hover{ background:var(--cat-bg); border-color:var(--cat-bd); transform:translateY(-1px);
    box-shadow:0 8px 22px -10px var(--cat); }
  .btn-go:hover .ic, .btn-go:hover .chev{ color:var(--cat); }
  .btn-go:active{ transform:translateY(0); }

  .ic{ display:grid; place-items:center; color:var(--cat); transition:.15s; }
  .chev{ opacity:.5; transition:.15s; }

  .tab{ padding:9px 16px; border-radius:999px; cursor:pointer; font-size:14px; font-weight:600;
    color:#a99e97; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.12); transition:.15s; }
  .tab.on{ color:var(--cat); background:var(--cat-bg); border-color:var(--cat-bd); }

  /* Responsive celular: una sola columna y tarjeta a ancho completo */
  @media (max-width:480px){
    .grid{ grid-template-columns:1fr; gap:9px; }
    .btn-go{ font-size:14px; padding:14px; }
  }
`
