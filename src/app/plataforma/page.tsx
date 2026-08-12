'use client'

import { useEffect, useRef, useState } from 'react'
import { Fraunces, Manrope } from 'next/font/google'
import {
  Menu, X, Camera, Compass, MapPin, Sparkles, Video, Plane, Images,
  Film, CheckCircle2, MessageCircle, ArrowRight, Eye, TrendingUp,
  Award, Layers, Users2, ScanSearch, CalendarClock, Aperture, Wand2, Rocket, Gift,
} from 'lucide-react'

/* ─────────────────────────────────────────────────────────────
   LANDING PRINCIPAL · Mendoza Bureau × El Faro 360
   Reorganizada: directa y orientada al socio.
   Qué ofrecemos · Beneficios · Cómo se hace · Formas de pago · Inscripción.
   ───────────────────────────────────────────────────────────── */

const display = Fraunces({ subsets: ['latin'], weight: ['400', '600', '700', '900'], style: ['normal', 'italic'], variable: '--font-display', display: 'swap' })
const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-sans', display: 'swap' })

const FORM_SOCIO = '/form/socio'
const SERVICIOS = '/servicios-adicionales'
const WA = 'https://wa.me/5492616657058'
const TOUR_VIAMONTE = 'https://elfaro360.com/tour-virtuales/alojamientos/temporales/viamontelodge/'
const TOUR_MARGOT = 'https://elfaro360.com/tour-virtuales/bodegas/destacadas/margot/'
const TOUR_PALOMA = 'https://elfaro360.com/tour-virtuales/gastronomia/cafeterias/paloma/'
const O = '#ff6a3d'

// Fondo del hero (foto propia subida a public/ejemplos/)
const IMG_HERO = '/ejemplos/portada.jpg'
const LOGO_BUREAU = '/ejemplos/logo-bureau.png'
// Portadas de ejemplos: archivos locales en public/ejemplos/ (subir por repo)
const IMG_VIAMONTE = '/ejemplos/viamonte.jpg'
const IMG_MARGOT = '/ejemplos/margot.jpg'
const IMG_PALOMA = '/ejemplos/paloma.jpg'

const NAV = [
  ['El proyecto', '#proyecto'], ['Beneficios', '#beneficios'], ['Ejemplos', '#ejemplos'],
  ['Cómo funciona', '#como'], ['Servicios', '#servicios'], ['Pagos', '#pagos'], ['FAQ', '#faq'],
] as const

/* Botón con borde "estrella" animado (StarBorder de React Bits), adaptado a
   nuestras pills naranjas. */
function StarButton({ href, children, target, color = '#ffe0cc', speed = '6s' }: {
  href: string; children: React.ReactNode; target?: string; color?: string; speed?: string
}) {
  return (
    <a href={href} target={target} rel={target ? 'noopener noreferrer' : undefined} className="star-btn">
      <span className="star-b star-bottom" style={{ background: `radial-gradient(circle, ${color}, transparent 10%)`, animationDuration: speed }} aria-hidden />
      <span className="star-b star-top" style={{ background: `radial-gradient(circle, ${color}, transparent 10%)`, animationDuration: speed }} aria-hidden />
      <span className="star-inner">{children}</span>
    </a>
  )
}

export default function PlataformaLanding() {
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showFloat, setShowFloat] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const heroBgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const apply = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      // Los botones flotantes aparecen recién en el "segundo scroll"
      setShowFloat(y > window.innerHeight * 1.15)
      if (heroBgRef.current) heroBgRef.current.style.transform = `translate3d(0,${Math.min(y, 900) * 0.4}px,0) scale(1.2)`
      raf = 0
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply) }
    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])

  useEffect(() => {
    const els = rootRef.current?.querySelectorAll('.reveal')
    if (!els?.length) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } })
    }, { threshold: 0.12 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div ref={rootRef} className={`mb-landing ${display.variable} ${sans.variable}`}>
      <style>{CSS}</style>

      {/* ── Navbar ── */}
      <header className={`nav ${scrolled ? 'nav-solid' : ''}`}>
        <div className="nav-in">
          <a href="#top" className="nav-logo"><img src={LOGO_BUREAU} alt="Mendoza Bureau" style={{ height: scrolled ? 40 : 54 }} /></a>
          <nav className="nav-links">
            {NAV.map(([t, h]) => <a key={h} href={h}>{t}</a>)}
          </nav>
          <a href={FORM_SOCIO} className="btn btn-primary nav-cta">Quiero virtualizar mi espacio</a>
          <button className="nav-burger" onClick={() => setMenu(m => !m)} aria-label="Menú">
            {menu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {menu && (
          <div className="nav-mobile">
            {NAV.map(([t, h]) => <a key={h} href={h} onClick={() => setMenu(false)}>{t}</a>)}
            <a href={FORM_SOCIO} className="btn btn-primary" style={{ marginTop: 8 }}>Quiero virtualizar mi espacio</a>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section id="top" className="hero">
        <div ref={heroBgRef} className="hero-bg" style={{ backgroundImage: `url(${IMG_HERO})` }} aria-hidden />
        <div className="hero-mesh" aria-hidden />
        <div className="hero-veil" aria-hidden />
        <div className="hero-in">
          <div className="hero-copy">
            <h1>Mostrá tu espacio dentro de la plataforma <span className="hl">inmersiva de Mendoza Bureau</span></h1>
            <p className="lead">
              Junto a El Faro 360 virtualizamos tu bodega, hotel, restaurante o servicio en un recorrido
              360°, para que tus clientes lo conozcan y lo recorran antes de llegar.
            </p>
            <div className="hero-cta">
              <StarButton href={FORM_SOCIO}>Quiero virtualizar mi espacio <ArrowRight size={18} /></StarButton>
              <a href="#ejemplos" className="btn btn-outline">Ver ejemplos</a>
            </div>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="btn-link btn-link-light hero-wa">
              <MessageCircle size={16} /> Consultar por WhatsApp
            </a>
          </div>
        </div>
        <span className="hero-scroll" aria-hidden><span /></span>
      </section>

      {/* ── 1 · El proyecto ── */}
      <section id="proyecto" className="sec reveal">
        <div className="sec-head">
          <span className="kicker">01 · El proyecto</span>
          <h2>Una plataforma para <span className="ital">mostrar y recorrer</span> los espacios de los socios</h2>
          <p className="sub">
            Mendoza Bureau, junto a El Faro 360, reúne a sus socios en una plataforma inmersiva donde cada
            uno muestra su espacio, sus servicios y sus experiencias en 360°.
          </p>
        </div>
        <div className="cards-3">
          <div className="card">
            <span className="card-ic"><Compass size={20} color={O} /></span>
            <h3>Qué hace</h3>
            <p>Convierte tu espacio en un recorrido virtual 360° navegable desde el celular o la computadora, con fotos, datos y enlaces.</p>
          </div>
          <div className="card">
            <span className="card-ic"><Eye size={20} color={O} /></span>
            <h3>Para qué</h3>
            <p>Para que te conozcan antes de llegar: sumás visibilidad, mostrás mejor y ayudás a que el cliente decida.</p>
          </div>
          <div className="card">
            <span className="card-ic"><Users2 size={20} color={O} /></span>
            <h3>Para quiénes</h3>
            <p>Bodegas, hoteles, restaurantes, salones de eventos y empresas de servicios socias de Mendoza Bureau.</p>
          </div>
        </div>
      </section>

      {/* ── 2 · Beneficios ── */}
      <section id="beneficios" className="sec sec-soft reveal">
        <div className="sec-head">
          <span className="kicker">02 · Por qué sumarte</span>
          <h2>Lo que ganás estando en la plataforma</h2>
          <p className="sub">Beneficios concretos para tu negocio desde el día que publicamos tu recorrido.</p>
        </div>
        <div className="cards-3">
          {[
            [Eye, 'Más visibilidad', 'Aparecés dentro de la plataforma institucional de Mendoza Bureau, frente a organizadores, empresas y turistas.'],
            [Compass, 'Mostrás mejor tu espacio', 'El cliente recorre cada ambiente en 360° antes de la visita, sin dudas ni sorpresas.'],
            [TrendingUp, 'Más consultas y ventas', 'Quien ve y recorre, decide más rápido. Un espacio que se muestra bien, vende mejor.'],
            [Award, 'Te diferenciás de la competencia', 'Muy pocos ofrecen una experiencia inmersiva. Vos sí.'],
            [Images, 'Material audiovisual reutilizable', 'Fotos y videos profesionales que usás en tu web, redes y campañas.'],
            [Sparkles, 'Presencia profesional 24/7', 'Tu espacio se puede visitar en cualquier momento, desde cualquier lugar.'],
          ].map(([Ic, t, d]) => {
            const Icon = Ic as typeof Eye
            return (
              <div key={t as string} className="card">
                <span className="card-ic"><Icon size={20} color={O} /></span>
                <h3>{t as string}</h3>
                <p>{d as string}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 3 · Ejemplos ── */}
      <section id="ejemplos" className="sec reveal">
        <div className="sec-head">
          <span className="kicker">03 · Ejemplos reales</span>
          <h2>Mirá cómo se vive un recorrido 360°</h2>
          <p className="sub">Recorridos producidos por El Faro 360. Tocá para explorarlos.</p>
        </div>
        <div className="ejemplos ejemplos-3">
          {[
            ['Viamonte Lodge', 'Alojamiento de primer nivel · 360°', TOUR_VIAMONTE, IMG_VIAMONTE],
            ['Bodega Margot', 'Enoturismo · recorrido inmersivo', TOUR_MARGOT, IMG_MARGOT],
            ['Café Paloma', 'Gastronomía · experiencia 360°', TOUR_PALOMA, IMG_PALOMA],
          ].map(([nom, desc, url, img]) => (
            <a key={nom} href={url} target="_blank" rel="noopener noreferrer" className="ejemplo">
              <div className="ejemplo-img" style={{ backgroundImage: `url(${img})` }}>
                <span className="ej-play"><Compass size={28} color="#fff" /></span>
                <span className="ej-360">360°</span>
              </div>
              <div className="ejemplo-body">
                <h3>{nom}</h3>
                <p>{desc}</p>
                <span className="btn-link">Explorar recorrido <ArrowRight size={15} /></span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── 4 · Cómo funciona (tarjetas iguales) ── */}
      <section id="como" className="sec sec-soft reveal">
        <div className="sec-head">
          <span className="kicker">04 · Cómo se hace</span>
          <h2>De la charla a tu recorrido publicado</h2>
          <p className="sub">Un proceso simple, en cinco pasos. Vos solo elegís qué mostrar.</p>
        </div>
        <div className="pasos">
          {[
            [ScanSearch, 'Conocemos tu propuesta', 'Entendemos tu espacio y qué querés destacar.'],
            [CalendarClock, 'Coordinamos la visita', 'Agendamos día y horario del relevamiento.'],
            [Aperture, 'Capturamos en 360°', 'Tomamos los puntos elegidos de tu espacio.'],
            [Wand2, 'Editamos el recorrido', 'Navegación, hotspots y optimización.'],
            [Rocket, 'Publicamos', 'Tu recorrido queda dentro de Mendoza Bureau.'],
          ].map(([Ic, t, d], i) => {
            const Icon = Ic as typeof Rocket
            return (
              <div key={t as string} className="paso">
                <span className="paso-n">{i + 1}</span>
                <span className="paso-ic"><Icon size={22} color={O} /></span>
                <h3>{t as string}</h3>
                <p>{d as string}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 5 · Qué incorpora el tour base ── */}
      <section className="sec reveal">
        <div className="split">
          <div>
            <span className="kicker kicker-left">05 · Tour base</span>
            <h2 className="h2-left">Qué incluye tu tour base</h2>
            <p className="p-lg">
              Elegís los <b>5 lugares que mejor representan tu propuesta</b> y nosotros armamos el recorrido
              completo, listo para publicar dentro de la plataforma.
            </p>
          </div>
          <div className="incluye">
            <p className="incluye-t">Incluye</p>
            <div className="incluye-grid">
              {['5 panoramas 360°', 'Edición y optimización', 'Navegación fluida', 'Hotspots básicos',
                'Armado del recorrido', 'Ficha del socio', 'Logo y fotos', 'Descripción',
                'Web y WhatsApp', 'Redes y links', 'Info comercial', 'Publicación en la plataforma'].map(x => (
                <span key={x}><CheckCircle2 size={14} color={O} /> {x}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6 · Servicios adicionales ── */}
      <section id="servicios" className="sec sec-soft reveal">
        <div className="sec-head">
          <span className="kicker">06 · Servicios adicionales</span>
          <h2>Sumá más panoramas y contenido</h2>
          <p className="sub">Opcionales, para mostrar cada rincón y aprovechar la misma producción.</p>
        </div>
        <div className="cards-3">
          {[
            [Layers, 'Panoramas / packs extra', 'Sumá puntos al recorrido con packs de 3, 5 o 10 panoramas.'],
            [Images, 'Fotografías HDR', 'Imágenes profesionales para web, redes, Booking y publicidad.'],
            [Film, 'Reel vertical', 'Contenido para Instagram, TikTok y campañas.'],
            [Video, 'Video institucional', 'Presentá tu espacio, propuesta o experiencia.'],
            [Plane, 'Tomas con drone', 'Mostrá ubicación, escala, entorno y paisaje.'],
            [Camera, 'Video 360°', 'Escenas inmersivas con movimiento, sonido y personas.'],
          ].map(([Ic, t, d]) => {
            const Icon = Ic as typeof Images
            return (
              <div key={t as string} className="card">
                <span className="card-ic"><Icon size={20} color={O} /></span>
                <h3>{t as string}</h3>
                <p>{d as string}</p>
              </div>
            )
          })}
        </div>
        <div className="center"><a href={SERVICIOS} className="btn btn-primary">Ver servicios y armar tu presupuesto</a></div>
      </section>

      {/* ── 7 · Experiencias dentro del tour ── */}
      <section className="sec-feature reveal">
        <div className="feature-in">
          <span className="eyebrow">A medida</span>
          <h2 className="h2-light">Experiencias dentro del tour</h2>
          <p className="sub sub-light">No solo se recorre: se vive. Diseñamos escenas interactivas dentro del propio recorrido.</p>
          <div className="exp-grid">
            {['Cata guiada', 'Experiencia gastronómica', 'Recorrido por un proceso productivo', 'Un sommelier explicando un varietal',
              'Un chef presentando un plato', 'Personal mostrando una habitación', 'Hotspots interactivos',
              'Juegos y búsqueda de objetos'].map(x => (
              <span key={x} className="exp-chip"><Sparkles size={14} color={O} /> {x}</span>
            ))}
          </div>
          <p className="exp-ex">
            “Recorrés una bodega y, al llegar a la sala de degustación, se activa un <b>video 360°</b> donde
            un sommelier te explica el varietal.”
          </p>
          <a href={WA} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">Quiero una experiencia a medida</a>
        </div>
      </section>

      {/* ── 8 · Formas de pago ── */}
      <section id="pagos" className="sec reveal">
        <div className="sec-head">
          <span className="kicker">07 · Formas de pago</span>
          <h2>Simple y flexible</h2>
        </div>
        <div className="pagos">
          <details className="pago-acc" open>
            <summary>Formas de pago</summary>
            <div className="pago-body">
              <div className="pay-cards">
                {[
                  ['Tour Base', '5 panoramas', '50% inicio + 50% entrega', 'Pago anticipado: 5 fotos Express'],
                  ['Base + Pack 3', '8 panoramas', '50% inicio + 50% a 30 días (+3%)', '10 fotos Express'],
                  ['Base + Pack 5', '10 panoramas', '50% inicio + 25% a 30 días (+3%) + 25% a 60 días (+6%)', 'Reel vertical 30 s'],
                  ['Base + Pack 10', '15 panoramas', '50% inicio + 25% a 30 días (+3%) + 25% a 60 días (+6%)', 'Reel + “Tesoro escondido”'],
                ].map(([tit, pan, pago, bonus]) => (
                  <div key={tit} className="pay-card">
                    <div className="pay-card-top">
                      <span className="pay-title">{tit}</span>
                      <span className="pay-panos">{pan}</span>
                    </div>
                    <div className="pay-pago"><span className="pay-lbl">Pago</span>{pago}</div>
                    <div className="pay-bonus"><Gift size={14} /> {bonus}</div>
                  </div>
                ))}
              </div>
              <p className="pago-note">
                Financiación mediante <b>ECHEQ</b> propio del contratante. Los recargos se aplican
                únicamente sobre las cuotas financiadas.
              </p>
            </div>
          </details>
          <details className="pago-acc">
            <summary>Medios de pago</summary>
            <div className="pago-body">
              <div className="medios-cards">
                {[
                  ['Transferencia bancaria', 'Disponible'],
                  ['Efectivo', 'Disponible'],
                  ['Mercado Pago', 'Disponible, sujeto a los costos propios de la plataforma'],
                  ['ECHEQ', 'Disponible y recomendado para operaciones financiadas'],
                ].map(([medio, cond]) => (
                  <div key={medio} className="medio-card">
                    <span className="medio-name"><CheckCircle2 size={15} color={O} /> {medio}</span>
                    <span className="medio-cond">{cond}</span>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </div>
      </section>

      {/* ── Cómo inscribirse / CTA final ── */}
      <section className="cta-final reveal">
        <div className="cta-bg" style={{ backgroundImage: `url(${IMG_HERO})` }} aria-hidden />
        <div className="cta-veil" aria-hidden />
        <div className="cta-in">
          <span className="eyebrow">Cómo inscribirte</span>
          <h2>Sumarte es muy simple</h2>
          <p>Completá el formulario con los datos de tu espacio y coordinamos el relevamiento. Del resto nos ocupamos nosotros.</p>
          <div className="hero-cta center">
            <StarButton href={FORM_SOCIO}>Completar mi inscripción <ArrowRight size={18} /></StarButton>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="btn btn-outline">Consultar por WhatsApp</a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="sec sec-soft reveal">
        <div className="sec-head">
          <span className="kicker">08 · Dudas</span>
          <h2>Preguntas frecuentes</h2>
        </div>
        <div className="faq">
          {[
            ['¿Qué incluye el recorrido base?', 'Cinco panoramas 360°, edición, navegación, hotspots básicos, la ficha del socio (logo, fotos, descripción, web, WhatsApp, redes) e integración en la plataforma.'],
            ['¿Quién elige los cinco panoramas?', 'Los elegís vos: son los cinco puntos que mejor representan tu propuesta.'],
            ['¿Qué pasa si necesito mostrar más espacios?', 'Podés ampliar con panoramas adicionales o packs de 3, 5 o 10.'],
            ['¿Puedo sumar fotografías o videos?', 'Sí: fotos HDR, reels, video institucional, drone y video 360°.'],
            ['¿Qué son las experiencias inmersivas?', 'Escenas interactivas dentro del tour (catas, procesos, videos 360°, hotspots especiales). Se arman a medida.'],
            ['¿Cuánto demora la producción?', 'Depende del alcance; lo coordinamos al momento del relevamiento.'],
            ['¿Cómo se coordina la visita?', 'Agendás fecha y horario del relevamiento y nuestro equipo se acerca.'],
            ['¿Hay financiación?', 'Sí, según la modalidad y los servicios. Consultanos las alternativas disponibles.'],
            ['¿Quién publica el tour?', 'La plataforma inmersiva es institucional de Mendoza Bureau; El Faro 360 produce e integra el recorrido.'],
            ['¿Puedo usar el material en mi web y redes?', 'Sí, el contenido audiovisual es tuyo para usar donde quieras.'],
          ].map(([q, a]) => (
            <details key={q as string} className="faq-item">
              <summary>{q as string}</summary>
              <p>{a as string}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="foot">
        <div className="foot-grid">
          <div className="foot-brand">
            <p className="foot-desc">Plataforma inmersiva institucional para los socios de Mendoza Bureau.</p>
          </div>
          <div className="foot-col">
            <h4>Explorar</h4>
            <a href="#proyecto">El proyecto</a>
            <a href="#ejemplos">Ejemplos</a>
            <a href="#servicios">Servicios</a>
            <a href="#faq">Preguntas frecuentes</a>
          </div>
          <div className="foot-col">
            <h4>Contacto</h4>
            <a href={WA} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href={FORM_SOCIO}>Quiero virtualizar mi espacio</a>
            <a href="https://mendozabureau.com.ar" target="_blank" rel="noopener noreferrer">mendozabureau.com.ar</a>
          </div>
        </div>
        {/* Logos: Mendoza Bureau a la izquierda, El Faro a la derecha */}
        <div className="foot-logos">
          <img className="foot-logo-b" src="/ejemplos/logo-bureau.png" alt="Mendoza Bureau"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
          <span className="foot-power">
            <span>Producido por</span>
            <img className="foot-logo-f" src="/ejemplos/logo-faro.png" alt="El Faro 360"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
          </span>
        </div>
        <p className="foot-copy">© {new Date().getFullYear()} Mendoza Bureau. Todos los derechos reservados.</p>
      </footer>

      {/* ── Flotantes (aparecen en el segundo scroll) ── */}
      <a href={WA} target="_blank" rel="noopener noreferrer" className={`wa-float ${showFloat ? 'show' : ''}`} aria-label="WhatsApp"><MessageCircle size={24} /></a>
      <a href={FORM_SOCIO} className={`sticky-cta ${showFloat ? 'show' : ''}`}>Quiero virtualizar mi espacio</a>
    </div>
  )
}

const CSS = `
.mb-landing{
  --o:#ff6a3d;--o2:#ffb37a;--bg:#0e0a0c;--bg2:#151011;--panel:#1b1416;
  --text:#f5ede7;--muted:#a99e97;--line:rgba(255,255,255,.09);--line2:rgba(255,255,255,.14);
  background:var(--bg);color:var(--text);
  font-family:var(--font-sans),ui-sans-serif,system-ui,-apple-system,sans-serif;
  -webkit-font-smoothing:antialiased;overflow-x:hidden;line-height:1.5}
.mb-landing *{box-sizing:border-box}
.mb-landing h1,.mb-landing h2,.mb-landing h3{margin:0;font-family:var(--font-display),Georgia,serif;letter-spacing:-.015em;line-height:1.08;font-weight:700}
.mb-landing h4{margin:0;font-family:var(--font-sans)}
.mb-landing p{margin:0}
.mb-landing a{color:inherit;text-decoration:none}
.mb-landing b{color:var(--text)}
.ital{font-style:italic;color:var(--o2);font-weight:600}

.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;font-weight:700;font-size:15px;
  padding:14px 26px;border-radius:999px;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,background .18s;border:none}
.btn-primary{background:linear-gradient(135deg,#ff6a3d,#ffa057);color:#241209;box-shadow:0 12px 30px rgba(255,106,61,.34)}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 18px 40px rgba(255,106,61,.46)}
.btn-lg{padding:17px 32px;font-size:16px}
.btn-outline{background:rgba(255,255,255,.06);color:var(--text);border:1.5px solid var(--line2);backdrop-filter:blur(6px)}
.btn-outline:hover{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.4)}
/* StarButton (borde estrella animado) */
.star-btn{display:inline-flex;position:relative;border-radius:999px;overflow:hidden;padding:2px;isolation:isolate;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease;box-shadow:0 12px 30px rgba(255,106,61,.3)}
.star-btn:hover{transform:translateY(-2px);box-shadow:0 18px 40px rgba(255,106,61,.46)}
.star-b{position:absolute;width:300%;height:50%;opacity:.75;border-radius:50%;z-index:0}
.star-bottom{bottom:-11px;right:-250%;animation:star-mov-b linear infinite alternate}
.star-top{top:-11px;left:-250%;animation:star-mov-t linear infinite alternate}
.star-inner{position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;gap:9px;
  background:linear-gradient(135deg,#ff6a3d,#ffa057);color:#241209;font-weight:700;font-size:16px;
  padding:16px 30px;border-radius:999px;white-space:nowrap}
@keyframes star-mov-b{0%{transform:translate(0,0);opacity:1}100%{transform:translate(-100%,0);opacity:0}}
@keyframes star-mov-t{0%{transform:translate(0,0);opacity:1}100%{transform:translate(100%,0);opacity:0}}
.btn-link{color:var(--o);font-weight:700;font-size:14px;display:inline-flex;align-items:center;gap:6px}
.btn-link-light{color:var(--text);opacity:.9}.btn-link-light:hover{opacity:1}
.center{display:flex;justify-content:center;flex-wrap:wrap;gap:14px;margin-top:36px}

/* nav */
.nav{position:sticky;top:0;z-index:50;transition:background .3s,box-shadow .3s,border-color .3s;border-bottom:1px solid transparent}
.nav-solid{background:rgba(14,10,12,.82);backdrop-filter:blur(16px);border-bottom-color:var(--line)}
.nav-in{max-width:1220px;margin:0 auto;padding:8px 22px;display:flex;align-items:center;gap:20px;min-height:72px;transition:min-height .25s}
.nav-solid .nav-in{min-height:60px}
.nav-logo{display:flex;align-items:center;transition:opacity .2s}
.nav-links{display:flex;gap:22px;margin-left:auto;font-size:14px;font-weight:600;color:var(--muted)}
.nav-links a{position:relative;padding:4px 0;transition:color .15s}
.nav-links a::after{content:"";position:absolute;left:0;right:100%;bottom:-2px;height:2px;background:var(--o);transition:right .22s}
.nav-links a:hover{color:var(--text)}.nav-links a:hover::after{right:0}
.nav-cta{margin-left:6px;padding:11px 18px;font-size:14px}
.nav-burger{display:none;margin-left:auto;background:none;border:none;color:var(--text);cursor:pointer}
.nav-mobile{display:flex;flex-direction:column;gap:16px;padding:18px 22px 24px;background:var(--bg2);border-top:1px solid var(--line);font-weight:600}

/* hero */
.hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden}
.hero-bg{position:absolute;inset:-10% 0;background-size:cover;background-position:center;will-change:transform;z-index:0;filter:saturate(1.05)}
.hero-mesh{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.85;
  background:radial-gradient(60% 60% at 12% 20%,rgba(255,106,61,.32),transparent 60%),
  radial-gradient(50% 50% at 90% 85%,rgba(122,31,56,.5),transparent 60%);
  animation:meshFloat 16s ease-in-out infinite alternate}
@keyframes meshFloat{from{transform:translate3d(0,0,0) scale(1)}to{transform:translate3d(0,-3%,0) scale(1.08)}}
.hero-veil{position:absolute;inset:0;z-index:2;background:
  linear-gradient(90deg,rgba(14,10,12,.92),rgba(14,10,12,.68) 45%,rgba(14,10,12,.34) 80%,rgba(14,10,12,.14)),
  linear-gradient(180deg,rgba(14,10,12,.55),transparent 30%,rgba(14,10,12,0) 68%,var(--bg))}
.hero-in{position:relative;z-index:3;max-width:1220px;margin:0 auto;padding:120px 22px;width:100%}
.hero-copy{max-width:760px}
.hero-logo{display:flex;margin-bottom:30px}
.hero h1{font-size:clamp(38px,6vw,74px);font-weight:900;letter-spacing:-.025em;text-shadow:0 4px 40px rgba(0,0,0,.4)}
/* brillo animado en la parte destacada del título */
.hl{font-style:italic;background:linear-gradient(110deg,#ff8149 25%,#ffe0cc 48%,#ff8149 62%);
  background-size:220% auto;-webkit-background-clip:text;background-clip:text;color:transparent;
  -webkit-text-fill-color:transparent;animation:shine 5.5s linear infinite}
@keyframes shine{to{background-position:-220% center}}
/* revelado escalonado del hero al cargar */
.hero-copy>*{animation:heroUp .85s cubic-bezier(.2,.7,.2,1) both}
.hero-logo{animation-delay:.02s}
.hero h1{animation-delay:.1s}
.lead{animation-delay:.22s}
.hero-cta{animation-delay:.34s}
.hero-wa{animation-delay:.44s}
@keyframes heroUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
.lead{font-size:clamp(16px,1.6vw,20px);color:rgba(245,237,231,.9);line-height:1.7;margin:36px 0 40px;max-width:560px}
.hero-cta{display:flex;flex-wrap:wrap;gap:14px;align-items:center}
.hero-wa{display:inline-flex;margin-top:18px}
.hero-scroll{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);z-index:3;width:24px;height:40px;
  border:2px solid rgba(255,255,255,.45);border-radius:14px;display:flex;justify-content:center;padding-top:7px}
.hero-scroll span{width:4px;height:9px;border-radius:2px;background:#fff;animation:scrolldot 1.6s ease-in-out infinite}
@keyframes scrolldot{0%{opacity:0;transform:translateY(-4px)}40%{opacity:1}80%{opacity:0;transform:translateY(10px)}}

/* secciones */
.sec{position:relative;z-index:2;max-width:1220px;margin:0 auto;padding:96px 22px}
.sec-soft{background:var(--bg2);max-width:none}
.sec-soft>*{max-width:1220px;margin-left:auto;margin-right:auto}
.sec-head{max-width:780px;margin:0 auto 56px;text-align:center}
.kicker{display:block;font-size:12px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--o);margin-bottom:18px}
.kicker-left{text-align:left}
.sec-head h2,.sec h2{font-size:clamp(28px,3.8vw,44px);font-weight:700;text-wrap:balance;line-height:1.06}
.sec-head .sub{margin:22px auto 0}
.h2-left{text-align:left!important;margin:0!important}
.sub{color:var(--muted);font-size:17px;max-width:620px;margin:0 auto;line-height:1.7;text-align:center;text-wrap:balance}
.p-lg{font-size:17px;color:#cdc3bc;line-height:1.8;margin-top:22px}

.cards-3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;align-items:stretch}
.card{background:var(--panel);border:1px solid var(--line);border-radius:22px;padding:28px;transition:transform .18s,box-shadow .18s,border-color .18s;display:flex;flex-direction:column}
.card:hover{transform:translateY(-4px);box-shadow:0 22px 46px rgba(0,0,0,.4);border-color:var(--line2)}
.card-ic{display:inline-flex;width:48px;height:48px;border-radius:14px;background:rgba(255,106,61,.12);align-items:center;justify-content:center;margin-bottom:14px}
.card h3{font-size:20px;margin-bottom:9px}
.card p{color:var(--muted);font-size:14.5px;line-height:1.65}

/* pasos (cómo funciona) — todas iguales */
.pasos{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;align-items:stretch}
.paso{position:relative;background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:26px 22px;
  display:flex;flex-direction:column;transition:transform .18s,border-color .18s}
.paso:hover{transform:translateY(-4px);border-color:rgba(255,106,61,.4)}
.paso-n{position:absolute;top:18px;right:20px;font-family:var(--font-display),serif;font-weight:900;font-size:30px;
  color:transparent;-webkit-text-stroke:1px rgba(255,179,122,.4);line-height:1}
.paso-ic{display:inline-flex;width:46px;height:46px;border-radius:13px;background:rgba(255,106,61,.12);align-items:center;justify-content:center;margin-bottom:16px}
.paso h3{font-size:16px;margin-bottom:8px}
.paso p{color:var(--muted);font-size:13.5px;line-height:1.55}

/* split (tour base) */
.split{display:grid;grid-template-columns:1fr 1fr;gap:52px;align-items:center}
.incluye{background:var(--panel);border:1px solid var(--line);border-radius:24px;padding:32px}
.incluye-t{font-weight:800;text-transform:uppercase;letter-spacing:.14em;font-size:12px;color:var(--o);margin-bottom:20px}
.incluye-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px}
.incluye-grid span{display:inline-flex;align-items:center;gap:9px;font-size:14px;color:#cdc3bc}

/* ejemplos */
.ejemplos{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:980px;margin:0 auto}
.ejemplos-3{grid-template-columns:repeat(3,1fr);max-width:1120px}
.ejemplo{border:1px solid var(--line);border-radius:24px;overflow:hidden;background:var(--panel);transition:transform .18s,box-shadow .18s,border-color .18s;display:block}
.ejemplo:hover{transform:translateY(-4px);box-shadow:0 30px 60px rgba(0,0,0,.5);border-color:var(--line2)}
.ejemplo-img{position:relative;height:230px;background-color:#2a1420;background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;transition:transform .4s}
.ejemplo:hover .ejemplo-img{transform:scale(1.04)}
.ejemplo-img::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,10,12,.1),rgba(14,10,12,.6))}
.ej-play{position:relative;z-index:1;width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#ff6a3d,#ffa057);display:flex;align-items:center;justify-content:center;box-shadow:0 16px 36px rgba(0,0,0,.5)}
.ej-360{position:absolute;top:16px;right:16px;z-index:1;background:rgba(14,10,12,.7);backdrop-filter:blur(6px);color:#fff;font-weight:800;font-size:12px;padding:5px 12px;border-radius:999px;border:1px solid var(--line2)}
.ejemplo-body{padding:24px}
.ejemplo-body h3{font-size:22px}
.ejemplo-body p{color:var(--muted);font-size:14px;margin:8px 0 16px}

/* feature (experiencias) */
.sec-feature{position:relative;z-index:2;background:radial-gradient(120% 120% at 80% 0%,#2a1424,#160e10 60%,#0e0a0c);
  border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:110px 22px;text-align:center}
.feature-in{max-width:980px;margin:0 auto}
.eyebrow{display:inline-block;font-size:12px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--o2);background:rgba(255,106,61,.12);border:1px solid rgba(255,106,61,.32);padding:7px 16px;border-radius:999px;margin-bottom:24px}
.h2-light{font-size:clamp(28px,4vw,46px)}
.sub-light{margin:26px auto 0;color:rgba(245,237,231,.72);text-align:center}
.exp-grid{display:flex;flex-wrap:wrap;gap:11px;justify-content:center;margin:40px 0 34px}
.exp-chip{display:inline-flex;align-items:center;gap:9px;background:rgba(255,255,255,.05);border:1px solid var(--line);color:#e7ddd6;border-radius:999px;padding:11px 18px;font-size:14px;font-weight:500;transition:border-color .2s,background .2s}
.exp-chip:hover{border-color:rgba(255,106,61,.4);background:rgba(255,106,61,.08)}
.exp-ex{color:rgba(245,237,231,.9);font-size:clamp(17px,2vw,21px);line-height:1.7;font-style:italic;font-family:var(--font-display),serif;margin:0 auto 34px;max-width:720px}

/* pagos — desplegables */
.pagos{max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:14px}
.pago-acc{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:2px 24px;transition:border-color .2s}
.pago-acc[open]{border-color:rgba(255,106,61,.4)}
.pago-acc summary{cursor:pointer;font-weight:700;font-size:17px;padding:20px 0;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:16px}
.pago-acc summary::-webkit-details-marker{display:none}
.pago-acc summary::after{content:"+";color:var(--o);font-size:26px;font-weight:300;line-height:1;flex:none}
.pago-acc[open] summary::after{content:"–"}
.pago-body{padding:0 0 22px}
.pago-note{margin-top:18px;color:var(--muted);font-size:13.5px;line-height:1.6}

/* tarjetas de formas de pago */
.pay-cards{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.pay-card{background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:12px}
.pay-card-top{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;
  padding-bottom:12px;border-bottom:1px solid var(--line)}
.pay-title{font-family:var(--font-display),serif;font-weight:700;font-size:18px}
.pay-panos{color:var(--o2);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
.pay-pago{color:#cdc3bc;font-size:14.5px;line-height:1.55}
.pay-lbl{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:4px;font-weight:700}
.pay-bonus{margin-top:auto;display:inline-flex;align-items:center;gap:7px;align-self:flex-start;
  background:rgba(255,106,61,.12);border:1px solid rgba(255,106,61,.3);color:var(--o2);
  font-weight:700;font-size:13px;padding:8px 13px;border-radius:999px;line-height:1.3}
.pay-bonus svg{flex:none}

/* tarjetas de medios de pago */
.medios-cards{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.medio-card{background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:16px 18px;display:flex;flex-direction:column;gap:6px}
.medio-name{display:inline-flex;align-items:center;gap:9px;font-weight:700;font-size:15px}
.medio-cond{color:var(--muted);font-size:13.5px;line-height:1.5;padding-left:24px}

@media(max-width:640px){
  .pay-cards,.medios-cards{grid-template-columns:1fr}
}

/* cta final */
.cta-final{position:relative;z-index:2;overflow:hidden;text-align:center;padding:130px 22px}
.cta-bg{position:absolute;inset:0;background-size:cover;background-position:center;z-index:0}
.cta-veil{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(14,10,12,.86),rgba(14,10,12,.92)),radial-gradient(60% 60% at 50% 30%,rgba(255,106,61,.26),transparent 70%)}
.cta-in{position:relative;z-index:2;max-width:800px;margin:0 auto}
.cta-final h2{font-size:clamp(30px,4.6vw,50px);font-weight:700;margin:18px auto 16px;text-wrap:balance}
.cta-final p{color:rgba(245,237,231,.82);font-size:18px;line-height:1.6}

/* faq */
.faq{max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:14px}
.faq-item{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:2px 24px;transition:border-color .2s}
.faq-item[open]{border-color:var(--line2)}
.faq-item summary{cursor:pointer;font-weight:700;font-size:16px;padding:20px 0;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:18px}
.faq-item summary::-webkit-details-marker{display:none}
.faq-item summary::after{content:"+";color:var(--o);font-size:26px;font-weight:300;line-height:1;flex:none}
.faq-item[open] summary::after{content:"–"}
.faq-item p{color:var(--muted);font-size:15px;line-height:1.75;padding:0 0 22px}

/* footer */
.foot{position:relative;z-index:2;background:#0a0708;color:#a99e97;padding:64px 22px 30px;border-top:1px solid var(--line)}
.foot-grid{max-width:1220px;margin:0 auto;display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;padding-bottom:36px;border-bottom:1px solid var(--line)}
.foot-brand>div{justify-content:flex-start!important}
.foot-brand .foot-desc{margin-top:20px;font-size:14px;line-height:1.65;max-width:340px;color:#8a7f78}
.foot-col h4{font-size:13px;text-transform:uppercase;letter-spacing:.12em;color:var(--text);margin-bottom:16px;font-weight:700}
.foot-col{display:flex;flex-direction:column;gap:11px;font-size:14px}
.foot-col a{color:#a99e97;transition:color .15s}.foot-col a:hover{color:var(--o2)}
.foot-logos{max-width:1220px;margin:30px auto 0;padding-top:28px;border-top:1px solid var(--line);
  display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap}
.foot-logo-b{height:82px;object-fit:contain}
.foot-power{display:inline-flex;align-items:center;gap:14px;font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:#7d7268;font-weight:600}
.foot-logo-f{height:42px;object-fit:contain}
.foot-copy{max-width:1220px;margin:22px auto 0;font-size:12.5px;color:#7d7268;text-align:center}

/* flotantes (ocultos hasta el 2do scroll) */
.wa-float{position:fixed;right:20px;bottom:20px;width:56px;height:56px;border-radius:50%;background:#25D366;color:#fff;
  display:flex;align-items:center;justify-content:center;box-shadow:0 12px 32px rgba(37,211,102,.5);z-index:60;
  opacity:0;transform:translateY(14px);pointer-events:none;transition:opacity .3s,transform .3s}
.wa-float.show{opacity:1;transform:none;pointer-events:auto}
.wa-float:hover{transform:scale(1.08)}
.sticky-cta{display:none}

.reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease}
.reveal.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){
  .reveal{opacity:1;transform:none;transition:none}
  .hero-bg{transform:none!important}.hero-scroll{display:none}
  .hero-copy>*{animation:none!important}
  .hl{animation:none;color:var(--o2);-webkit-text-fill-color:var(--o2)}
  .star-b{animation:none!important}
  .hero-mesh{animation:none!important}
}

@media(max-width:960px){
  .cards-3{grid-template-columns:1fr 1fr}
  .pasos{grid-template-columns:1fr 1fr 1fr}
  .split,.ejemplos,.pagos{grid-template-columns:1fr;gap:32px}
  .nav-links,.nav-cta{display:none}
  .nav-burger{display:block}
  .foot-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:560px){
  /* logo del header más contenido en celular */
  .nav-logo img{height:44px!important}
  .foot-logo-b{height:64px}
  .nav-in{min-height:64px;padding:6px 18px}
  /* hero: menos espacio arriba, contenido arriba y no centrado */
  .hero{min-height:auto;align-items:flex-start}
  .hero-in{padding:96px 20px 64px}
  .hero h1{font-size:clamp(32px,9vw,44px)}
  .cards-3,.pasos,.incluye-grid,.foot-grid{grid-template-columns:1fr}
  .btn,.star-btn{width:100%}
  .star-inner{width:100%}
  .hero-cta{flex-direction:column;align-items:stretch}
  .sec,.sec-feature,.cta-final{padding:64px 18px}
  .sec-head{margin-bottom:40px}
  .foot-logos{flex-direction:column;align-items:center;gap:22px;text-align:center}
  /* CTA fija inferior — también aparece en el 2do scroll */
  .sticky-cta{display:block;position:fixed;left:12px;right:12px;bottom:12px;z-index:59;text-align:center;
    background:linear-gradient(135deg,#ff6a3d,#ffa057);color:#241209;font-weight:700;padding:15px;border-radius:14px;
    box-shadow:0 12px 30px rgba(255,106,61,.45);opacity:0;transform:translateY(16px);pointer-events:none;transition:opacity .3s,transform .3s}
  .sticky-cta.show{opacity:1;transform:none;pointer-events:auto}
  .wa-float{bottom:78px}
}
`
