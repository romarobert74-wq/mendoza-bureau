'use client'

import { Fraunces, Manrope } from 'next/font/google'
import { useEffect, useMemo, useState } from 'react'
import { getLandingServicios } from '@/lib/firestore'
import type { LandingConfig } from '@/lib/serviciosAdicionales'

/* ─────────────────────────────────────────────────────────────
   EL FARO 360 · Servicios adicionales para socios de Mendoza Bureau
   Misma identidad que la landing principal: Fraunces + Manrope,
   terracota #ff6a3d sobre oscuro premium.
   ───────────────────────────────────────────────────────────── */

const display = Fraunces({ subsets: ['latin'], weight: ['400', '600', '700', '900'], style: ['normal', 'italic'], variable: '--font-display', display: 'swap' })
const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-sans', display: 'swap' })
const FONT_DISPLAY = 'var(--font-display), Georgia, serif'
const LOGO_BUREAU = '/ejemplos/logo-bureau.png'

const WA = '5492616657058' // WhatsApp El Faro 360
const ORANGE = '#ff6a3d'

type Servicio = {
  id: string
  nombre: string
  precio: number
  ideal: string
  ejemplos?: string
  icon: React.ReactNode
  destacado?: boolean
}

/* ── Ilustraciones vectoriales (SVG) por servicio ── */
const IcoPano = (
  <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
    <ellipse cx="24" cy="24" rx="20" ry="12" stroke={ORANGE} strokeWidth="2" />
    <path d="M4 24c0-4 9-7 20-7s20 3 20 7" stroke={ORANGE} strokeWidth="1.4" opacity=".5" />
    <circle cx="24" cy="24" r="6.5" stroke="#fff" strokeWidth="2" />
    <circle cx="24" cy="24" r="2.2" fill="#fff" />
    <path d="M24 4v6M24 38v6" stroke="#fff" strokeWidth="1.4" opacity=".4" />
  </svg>
)
const IcoPack = (n: number) => (
  <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
    <rect x="7" y="14" width="20" height="14" rx="3" stroke={ORANGE} strokeWidth="2" />
    <rect x="15" y="20" width="20" height="14" rx="3" stroke="#fff" strokeWidth="2" opacity=".85" />
    <rect x="21" y="26" width="20" height="14" rx="3" stroke={ORANGE} strokeWidth="2" opacity=".6" />
    <text x="31" y="37" fontSize="10" fontWeight="800" fill="#fff" textAnchor="middle">×{n}</text>
  </svg>
)
const IcoExp = (
  <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
    <path d="M24 6l3.2 8.2L36 16l-6.6 5.6L31 30l-7-4.6L17 30l1.6-8.4L12 16l8.8-1.8L24 6z" stroke={ORANGE} strokeWidth="2" strokeLinejoin="round" />
    <path d="M12 40c4-3 8-3 12 0s8 3 12 0" stroke="#fff" strokeWidth="1.6" opacity=".5" />
  </svg>
)
const IcoPremium = (
  <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
    <rect x="6" y="12" width="24" height="18" rx="3" stroke="#fff" strokeWidth="2" />
    <circle cx="18" cy="21" r="4" stroke={ORANGE} strokeWidth="2" />
    <path d="M33 16l9-4v22l-9-4z" stroke={ORANGE} strokeWidth="2" strokeLinejoin="round" />
    <path d="M10 36h28" stroke="#fff" strokeWidth="1.4" opacity=".4" />
  </svg>
)
const IcoFoto = (
  <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
    <rect x="5" y="13" width="38" height="26" rx="4" stroke="#fff" strokeWidth="2" />
    <path d="M16 13l3-4h10l3 4" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="24" cy="26" r="7" stroke={ORANGE} strokeWidth="2" />
    <text x="38" y="20" fontSize="7" fontWeight="800" fill={ORANGE} textAnchor="end">HDR</text>
  </svg>
)
const IcoReel = (
  <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
    <rect x="15" y="5" width="18" height="38" rx="4" stroke="#fff" strokeWidth="2" />
    <path d="M21 18l9 6-9 6z" fill={ORANGE} />
  </svg>
)
const IcoVideoH = (
  <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
    <rect x="5" y="11" width="38" height="26" rx="4" stroke="#fff" strokeWidth="2" />
    <path d="M20 19l9 5-9 5z" fill={ORANGE} />
  </svg>
)
const IcoDrone = (
  <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
    <circle cx="11" cy="14" r="5" stroke={ORANGE} strokeWidth="2" />
    <circle cx="37" cy="14" r="5" stroke={ORANGE} strokeWidth="2" />
    <path d="M14 17l7 6M34 17l-7 6" stroke="#fff" strokeWidth="2" />
    <rect x="19" y="22" width="10" height="7" rx="2" stroke="#fff" strokeWidth="2" />
    <circle cx="24" cy="34" r="3" stroke={ORANGE} strokeWidth="2" />
  </svg>
)
const IcoVideo360 = (
  <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
    <ellipse cx="24" cy="24" rx="20" ry="12" stroke={ORANGE} strokeWidth="2" />
    <path d="M20 18l10 6-10 6z" fill="#fff" />
  </svg>
)

const SERVICIOS: Servicio[] = [
  { id: 'pano1', nombre: 'Panorama 360° adicional', precio: 100, icon: IcoPano,
    ideal: 'Sumar un espacio puntual que no entró en los 5 iniciales.',
    ejemplos: 'Salón secundario · Habitación · Lobby · Terraza · Cava · Piscina · Sala de reuniones' },
  { id: 'pack3', nombre: 'Pack 3 panoramas 360°', precio: 225, icon: IcoPack(3),
    ideal: 'Mostrar un sector complementario completo.',
    ejemplos: 'Cava + sala de degustación + viñedo · Lobby + habitación + reuniones' },
  { id: 'pack5', nombre: 'Pack 5 panoramas 360°', precio: 350, icon: IcoPack(5), destacado: true,
    ideal: 'Ampliar el recorrido y mostrar una experiencia más completa.',
    ejemplos: 'Ideal para duplicar tu recorrido base.' },
  { id: 'pack10', nombre: 'Pack 10 panoramas 360°', precio: 600, icon: IcoPack(10),
    ideal: 'Una presentación inmersiva completa y comercialmente potente.',
    ejemplos: 'La opción más elegida por hoteles y bodegas grandes.' },
  { id: 'exp', nombre: 'Experiencia adicional', precio: 130, icon: IcoExp,
    ideal: 'Mostrar una vivencia del lugar, no solo el espacio físico.',
    ejemplos: 'Cata · Sunset · Almuerzo · Visita guiada · Montaje de evento · Degustación' },
  { id: 'premium', nombre: 'Bloque visual premium', precio: 450, icon: IcoPremium,
    ideal: 'Material profesional para redes, web y campañas — en el mismo relevamiento.',
    ejemplos: 'Hasta 30 fotos HDR + 2 reels (30s) · o 1 video institucional (60s)' },
  { id: 'video360', nombre: 'Video 360°', precio: 350, icon: IcoVideo360,
    ideal: 'Video inmersivo 360° para vivir el espacio en movimiento.',
    ejemplos: 'Recorrido inmersivo del lugar, ideal para redes y la plataforma.' },
  { id: 'fotohdr', nombre: 'Fotografías HDR', precio: 250, icon: IcoFoto,
    ideal: 'Producción fotográfica profesional HDR.',
    ejemplos: 'Fotos de alta calidad para web, redes y presentaciones.' },
  { id: 'reel', nombre: 'Reel vertical', precio: 250, icon: IcoReel,
    ideal: 'Reel vertical de hasta 30 segundos.',
    ejemplos: 'Perfecto para Instagram, TikTok y redes.' },
  { id: 'videoh', nombre: 'Video horizontal', precio: 250, icon: IcoVideoH,
    ideal: 'Video institucional horizontal de hasta 60 segundos.',
    ejemplos: 'Ideal para web, YouTube y presentaciones comerciales.' },
  { id: 'drone', nombre: 'Servicio de drone', precio: 250, icon: IcoDrone,
    ideal: 'Tomas aéreas con drone, según permisos y condiciones técnicas.',
    ejemplos: 'Vistas panorámicas del predio, viñedos o entorno.' },
]

const RUBROS = ['Hotel', 'Bodega', 'Restaurante', 'Servicio turístico', 'Organizador / Planner', 'Otro']

const POR_SOCIO = [
  { t: 'Hoteles', d: 'Sumá habitaciones, lobby, salones secundarios, rooftop, piscina o restaurante.' },
  { t: 'Bodegas', d: 'Sumá cava, sala de cata, viñedos, restaurante, terraza o experiencias.' },
  { t: 'Restaurantes', d: 'Sumá salón, barra, cocina, terraza, cava o experiencia gastronómica.' },
  { t: 'Servicios', d: 'Sumá showroom, base operativa, unidades, equipo técnico o presentación del servicio.' },
]

const FAQS = [
  ['¿Los 5 panoramas iniciales están incluidos?', 'Sí. Tu tour base dentro de Mendoza Bureau incluye hasta 5 panoramas 360°. Lo de acá es todo adicional y opcional.'],
  ['¿Puedo agregar más panoramas?', 'Claro. Podés sumar panoramas de a uno o en packs de 3, 5 o 10, según cuánto quieras mostrar.'],
  ['¿Puedo contratar fotos o videos?', 'Sí, con el Bloque visual premium: hasta 30 fotos HDR + 2 reels, o un video institucional.'],
  ['¿Tengo que decidirlo antes del relevamiento?', 'Idealmente sí. Aprovechar la misma visita evita coordinar una nueva más adelante. Igual lo podés sumar después.'],
  ['¿Puedo pagarlo como socio directamente?', 'Sí. Los adicionales pueden abonarse por el socio o por Mendoza Bureau, según se acuerde.'],
  ['¿El contenido me sirve para redes y web?', 'Totalmente. Las fotos, reels y videos son tuyos para usar en redes, web, presentaciones y ventas.'],
]

const money = (n: number) => 'USD ' + n.toLocaleString('en-US')

export default function ServiciosAdicionales() {
  const [cfg, setCfg] = useState<LandingConfig | null>(null)
  const [cant, setCant] = useState<Record<string, number>>({})
  const [empresa, setEmpresa] = useState('')
  const [rubro, setRubro] = useState('')
  const [nombre, setNombre] = useState('')
  const [tel, setTel] = useState('')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  // Relevamiento principal (fecha + horario)
  const [fechaRelev, setFechaRelev] = useState('')
  const [horaRelev, setHoraRelev] = useState('')

  useEffect(() => { getLandingServicios().then(setCfg).catch(() => {}) }, [])

  const showPrices = cfg?.mostrarPrecios !== false   // por defecto, se muestran

  // precios con override desde el panel
  const servicios = useMemo(
    () => SERVICIOS.map(s => ({ ...s, precio: cfg?.precios?.[s.id] ?? s.precio })),
    [cfg]
  )

  const set = (id: string, delta: number) =>
    setCant(c => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + delta) }))

  const items = useMemo(
    () => servicios.filter(s => (cant[s.id] ?? 0) > 0).map(s => ({ ...s, q: cant[s.id] })),
    [cant, servicios]
  )
  const total = useMemo(() => items.reduce((a, s) => a + s.precio * s.q, 0), [items])

  const enviar = () => {
    const L: string[] = []
    L.push('*Solicitud de servicios adicionales — El Faro 360*', '')
    if (fechaRelev || horaRelev) L.push(`*📅 Relevamiento solicitado:* ${fechaRelev || '(fecha a coordinar)'}${horaRelev ? ' · ' + horaRelev : ''}`)
    if (empresa) L.push(`*Empresa:* ${empresa}`)
    if (rubro) L.push(`*Rubro:* ${rubro}`)
    if (nombre) L.push(`*Contacto:* ${nombre}`)
    if (tel) L.push(`*WhatsApp:* ${tel}`)
    if (email) L.push(`*Email:* ${email}`)
    L.push('', '*Servicios seleccionados:*')
    if (items.length === 0) L.push('— (todavía sin selección) Necesito asesoramiento.')
    else items.forEach(s => L.push(showPrices ? `• ${s.nombre} ×${s.q} — ${money(s.precio * s.q)}` : `• ${s.nombre} ×${s.q}`))
    if (showPrices) L.push('', `*Total estimado: ${money(total)}*`)
    if (msg) L.push('', `*Mensaje:* ${msg}`)
    if (showPrices) L.push('', '_Valores de referencia, a confirmar antes de producir._')
    const url = `https://wa.me/${WA}?text=${encodeURIComponent(L.join('\n'))}`
    window.open(url, '_blank')
  }

  return (
    <div className={`${display.variable} ${sans.variable}`} style={{ background: '#0e0a0c', color: '#f5ede7', minHeight: '100vh', overflowX: 'hidden', fontFamily: 'var(--font-sans), ui-sans-serif, system-ui, sans-serif' }}>
      {/* fondo con glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(700px 500px at 80% -10%, ${ORANGE}22, transparent 60%), radial-gradient(600px 400px at 0% 20%, rgba(122,31,56,0.18), transparent 60%)`,
      }} />

      <div style={{ position: 'relative', maxWidth: 1000, margin: '0 auto', padding: '0 20px' }}>

        {/* ── Logo ── */}
        <div style={{ paddingTop: 28, display: 'flex', justifyContent: 'center' }}>
          <img src={LOGO_BUREAU} alt="Mendoza Bureau" style={{ height: 80, maxWidth: '100%', objectFit: 'contain' }} />
        </div>

        {/* ── Hero ── */}
        <header style={{ paddingTop: 30, paddingBottom: 40, textAlign: 'center' }}>
          <span style={{
            display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
            textTransform: 'uppercase', color: ORANGE, border: `1px solid ${ORANGE}55`,
            borderRadius: 999, padding: '5px 14px', marginBottom: 22, background: `${ORANGE}12`,
          }}>El Faro 360 · para socios de Mendoza Bureau</span>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 'clamp(30px,6vw,52px)', fontWeight: 900, lineHeight: 1.06, margin: '0 0 18px', letterSpacing: '-0.02em' }}>
            Potenciá tu recorrido dentro<br />de <span style={{ color: ORANGE, fontStyle: 'italic', fontWeight: 700 }}>Mendoza Bureau</span>
          </h1>
          <p style={{ fontSize: 'clamp(15px,2.4vw,19px)', color: '#94a3b8', maxWidth: 620, margin: '0 auto 30px', lineHeight: 1.6 }}>
            Tu tour base incluye 5 panoramas. Ahora podés sumar más espacios, experiencias
            y contenido visual para mostrar todo el potencial de tu lugar.
          </p>
          <a href="#servicios" style={btnPrimary}>Quiero sumar contenido ↓</a>
          {cfg?.heroImg && (
            <div style={{ marginTop: 34, borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cfg.heroImg} alt="Mendoza Bureau · El Faro 360" style={{ width: '100%', display: 'block', maxHeight: 420, objectFit: 'cover' }} />
            </div>
          )}
        </header>

        {/* ── Paso 1: Relevamiento ── */}
        <section style={{ ...glass, borderColor: `${ORANGE}55`, boxShadow: `0 0 0 1px ${ORANGE}33, 0 10px 40px rgba(0,0,0,0.3)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ background: ORANGE, color: '#fff', fontWeight: 800, fontSize: 13, width: 26, height: 26, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
            <h2 style={{ fontSize: 'clamp(18px,3vw,24px)', fontWeight: 800, margin: 0 }}>Coordiná tu relevamiento</h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 16px', lineHeight: 1.6 }}>
            Elegí el día y horario en que querés que vayamos a hacer tu tour 360°. Después, si querés, sumás servicios extra (paso 2).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>📅 Fecha preferida</label>
              <input type="date" value={fechaRelev} onChange={e => setFechaRelev(e.target.value)} style={input} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>🕒 Horario / turno</label>
              <select value={horaRelev} onChange={e => setHoraRelev(e.target.value)} style={{ ...input, colorScheme: 'dark' }}>
                <option value="" style={optStyle}>Elegí un turno…</option>
                {['Mañana (9 a 12 h)', 'Mediodía (12 a 15 h)', 'Tarde (15 a 18 h)', 'A coordinar'].map(o =>
                  <option key={o} value={o} style={optStyle}>{o}</option>)}
              </select>
            </div>
          </div>
          <p style={{ color: '#64748b', fontSize: 12, margin: '12px 0 0' }}>
            El relevamiento base incluye hasta 5 panoramas 360° · lo confirmamos por WhatsApp.
          </p>
        </section>

        {/* ── Oportunidad ── */}
        <section style={glass}>
          <p style={{ fontSize: 'clamp(18px,3vw,24px)', fontWeight: 600, lineHeight: 1.5, margin: 0, textAlign: 'center' }}>
            “Un organizador no elige solo por ver un salón.<br />
            <span style={{ color: ORANGE }}>Elige cuando puede imaginar la experiencia completa.”</span>
          </p>
        </section>

        {/* ── Servicios (selector) ── */}
        <h2 id="servicios" style={h2}>2 · Sumá servicios (opcional)</h2>
        <p style={sub}>Tocá <b>+</b> para agregar. El total se calcula solo, abajo de todo. Si no querés extras, enviá igual con tu fecha de relevamiento.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 40 }}>
          {servicios.map(s => {
            const q = cant[s.id] ?? 0
            return (
              <div key={s.id} style={{
                ...card,
                borderColor: q > 0 ? ORANGE : 'rgba(255,255,255,0.1)',
                boxShadow: q > 0 ? `0 0 0 1px ${ORANGE}, 0 10px 30px ${ORANGE}22` : glass.boxShadow,
              }}>
                {s.destacado && <span style={badge}>Más elegido</span>}
                <div style={{ marginBottom: 10 }}>{s.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px' }}>{s.nombre}</h3>
                {showPrices && <p style={{ fontSize: 22, fontWeight: 800, color: ORANGE, margin: '0 0 10px' }}>{money(s.precio)}</p>}
                <p style={{ fontSize: 13, color: '#cbd5e1', margin: '0 0 6px', lineHeight: 1.5 }}>{s.ideal}</p>
                {s.ejemplos && <p style={{ fontSize: 12, color: '#7c8797', margin: '0 0 16px', lineHeight: 1.5 }}>{s.ejemplos}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
                  <button onClick={() => set(s.id, -1)} style={stepBtn} aria-label="Quitar">−</button>
                  <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 800, fontSize: 16 }}>{q}</span>
                  <button onClick={() => set(s.id, +1)} style={{ ...stepBtn, background: ORANGE, borderColor: ORANGE, color: '#fff' }} aria-label="Agregar">+</button>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Por tipo de socio ── */}
        <h2 style={h2}>¿Qué te conviene según tu rubro?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 40 }}>
          {POR_SOCIO.map(x => (
            <div key={x.t} style={{ ...card, gap: 6 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: ORANGE, margin: 0 }}>{x.t}</h3>
              <p style={{ fontSize: 13, color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>{x.d}</p>
            </div>
          ))}
        </div>

        {/* ── Galería (editable desde el panel) ── */}
        {cfg?.galeria && cfg.galeria.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10, marginBottom: 40 }}>
            {cfg.galeria.map((img, i) => (
              <div key={i} style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', aspectRatio: '4/3' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`Muestra ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}

        {/* ── Cómo contratar ── */}
        <h2 style={h2}>Cómo funciona</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 40 }}>
          {[
            ['1', 'Elegís', 'Marcás arriba qué querés sumar y ves el total al instante.'],
            ['2', 'Coordinamos', 'Hacemos el relevamiento junto al tour base o en una visita.'],
            ['3', 'Entregamos', 'Te dejamos el contenido listo para la plataforma y para tus ventas.'],
          ].map(([n, t, d]) => (
            <div key={n} style={{ ...card, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: ORANGE }}>{n}</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '4px 0 2px' }}>{t}</h3>
              <p style={{ fontSize: 13, color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>{d}</p>
            </div>
          ))}
        </div>

        {/* ── Formulario + total ── */}
        <h2 style={h2}>Solicitá tu cotización</h2>
        <div style={{ ...glass, display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
            <input placeholder="Empresa / Socio" value={empresa} onChange={e => setEmpresa(e.target.value)} style={input} />
            <select value={rubro} onChange={e => setRubro(e.target.value)} style={{ ...input, colorScheme: 'dark' }}>
              <option value="" style={optStyle}>Rubro…</option>
              {RUBROS.map(r => <option key={r} value={r} style={optStyle}>{r}</option>)}
            </select>
            <input placeholder="Nombre y apellido" value={nombre} onChange={e => setNombre(e.target.value)} style={input} />
            <input placeholder="WhatsApp" value={tel} onChange={e => setTel(e.target.value)} style={input} />
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={input} />
          </div>
          <textarea placeholder="¿Qué espacio o experiencia querés mostrar? (opcional)" value={msg} onChange={e => setMsg(e.target.value)} rows={3} style={{ ...input, resize: 'vertical' }} />

          {/* Resumen */}
          {items.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, display: 'grid', gap: 6 }}>
              {items.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#cbd5e1', gap: 12 }}>
                  <span>{s.nombre} ×{s.q}</span>
                  {showPrices && <span style={{ fontVariantNumeric: 'tabular-nums' }}>{money(s.precio * s.q)}</span>}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: showPrices ? 'space-between' : 'center', gap: 12, flexWrap: 'wrap' }}>
            {showPrices && (
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#7c8797', textTransform: 'uppercase', letterSpacing: 1 }}>Total estimado</p>
                <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color: ORANGE, fontVariantNumeric: 'tabular-nums' }}>{money(total)}</p>
              </div>
            )}
            <button onClick={enviar} style={{ ...btnPrimary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 'none' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.4 13.9c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.2-.9-2.7-1.1-4.4-3.9-4.6-4.1-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2 .2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.5c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1l.7-.9c.2-.3.4-.2.7-.1l2 .9c.3.1.5.2.6.3.1.3.1.8-.1 1.4Z" /></svg>
              {showPrices ? 'Enviar por WhatsApp' : 'Solicitar cotización'}
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#64748b', margin: 0, textAlign: 'center' }}>
            {showPrices
              ? 'Valores de referencia. Se confirman antes de producir. La pauta publicitaria no está incluida.'
              : 'Te enviamos la cotización a la brevedad. La pauta publicitaria no está incluida.'}
          </p>
        </div>

        {/* ── FAQ ── */}
        <h2 style={h2}>Preguntas frecuentes</h2>
        <div style={{ display: 'grid', gap: 10, marginBottom: 50 }}>
          {FAQS.map(([q, a]) => (
            <details key={q} style={{ ...card, cursor: 'pointer' }}>
              <summary style={{ fontWeight: 600, fontSize: 14, listStyle: 'none' }}>{q}</summary>
              <p style={{ fontSize: 13, color: '#cbd5e1', margin: '8px 0 0', lineHeight: 1.5 }}>{a}</p>
            </details>
          ))}
        </div>

        {/* ── CTA final ── */}
        <section style={{ ...glass, textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 800, margin: '0 0 10px' }}>
            Ya vas a estar dentro de la plataforma inmersiva
          </h2>
          <p style={{ color: '#94a3b8', margin: '0 0 22px', maxWidth: 560, marginInline: 'auto', lineHeight: 1.6 }}>
            Aprovechá esta instancia para mostrar mejor tu espacio y diferenciarte del resto de los socios.
          </p>
          <a href="#servicios" style={btnPrimary}>Quiero potenciar mi recorrido</a>
        </section>

        <footer style={{ textAlign: 'center', padding: '10px 0 50px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7d7268', fontWeight: 600 }}>Producido por</span>
            <img src="/ejemplos/logo-faro.png" alt="El Faro 360" style={{ height: 30, objectFit: 'contain' }} />
          </div>
          <p style={{ color: '#7d7268', fontSize: 12, marginTop: 14 }}>
            El Faro 360 · Contenido inmersivo para Mendoza Bureau
          </p>
        </footer>
      </div>
    </div>
  )
}

/* ── estilos ── */
const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 26,
  boxShadow: '0 10px 40px rgba(0,0,0,0.3)', marginBottom: 24,
}
const card: React.CSSProperties = {
  position: 'relative', display: 'flex', flexDirection: 'column',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 18, padding: 20, transition: 'all .2s',
  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
}
const h2: React.CSSProperties = { fontFamily: FONT_DISPLAY, fontSize: 'clamp(22px,4vw,30px)', fontWeight: 700, textAlign: 'center', margin: '10px 0 6px', letterSpacing: '-0.01em' }
const sub: React.CSSProperties = { textAlign: 'center', color: '#a99e97', fontSize: 14, margin: '0 0 22px' }
const btnPrimary: React.CSSProperties = {
  display: 'inline-block', background: `linear-gradient(135deg, ${ORANGE}, #ffa057)`,
  color: '#fff', fontWeight: 700, fontSize: 15, padding: '13px 26px', borderRadius: 999,
  textDecoration: 'none', cursor: 'pointer', boxShadow: `0 8px 24px ${ORANGE}44`,
}
const stepBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 20, fontWeight: 700,
  cursor: 'pointer', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
}
const badge: React.CSSProperties = {
  position: 'absolute', top: 14, right: 14, fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
  letterSpacing: 0.5, color: '#fff', background: ORANGE, borderRadius: 999, padding: '3px 9px',
}
const input: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 12, padding: '11px 14px', color: '#fff', fontSize: 16, outline: 'none', width: '100%', boxSizing: 'border-box',
}
// las opciones del desplegable se renderizan con el fondo del navegador (claro),
// así que las forzamos a texto oscuro sobre fondo blanco para que se lean
const optStyle: React.CSSProperties = { color: '#0a0b10', background: '#fff' }
