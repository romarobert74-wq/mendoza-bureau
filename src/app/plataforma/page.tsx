'use client'

import { useEffect, useRef, useState } from 'react'
import { Fraunces, Manrope } from 'next/font/google'
import { BrandLogos } from '@/components/BrandLogos'
import {
  Menu, X, Camera, Compass, MapPin, Sparkles, Video, Plane, Images,
  Film, Building2, Users, CheckCircle2, ChevronRight, MessageCircle,
} from 'lucide-react'

/* ─────────────────────────────────────────────────────────────
   LANDING PRINCIPAL · Mendoza Bureau × El Faro 360
   Comercial / informativa. Sin precios. CTA → formulario del socio.
   Impronta: terroir mendocino + experiencia inmersiva.
   Paleta: marfil cálido, Malbec profundo y terracota de acento.
   ───────────────────────────────────────────────────────────── */

const display = Fraunces({ subsets: ['latin'], weight: ['400', '600', '700', '900'], style: ['normal', 'italic'], variable: '--font-display', display: 'swap' })
const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-sans', display: 'swap' })

const FORM_SOCIO = '/form/socio'
const SERVICIOS = '/servicios-adicionales'
const WA = 'https://wa.me/5492616657058'
const TOUR_MARGOT = 'https://elfaro360.com/tour-virtuales/bodegas/destacadas/margot/'
const TOUR_PALOMA = 'https://elfaro360.com/tour-virtuales/gastronomia/cafeterias/paloma/'
const O = '#e8541f'

const NAV = [
  ['Qué es', '#que-es'], ['Cómo funciona', '#como'], ['Ejemplos', '#ejemplos'],
  ['Ampliá', '#ampliar'], ['Servicios', '#servicios'], ['Beneficios', '#beneficios'], ['FAQ', '#faq'],
] as const

/* Silueta de los Andes — firma visual que separa secciones */
function Andes({ fill = '#4a1524', flip = false }: { fill?: string; flip?: boolean }) {
  return (
    <svg className="andes" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden
      style={flip ? { transform: 'scaleY(-1)' } : undefined}>
      <path fill={fill} d="M0,120 L0,70 L120,44 L210,78 L320,28 L400,66 L520,10 L610,58 L720,22 L820,64 L940,18 L1040,70 L1150,32 L1260,74 L1360,40 L1440,72 L1440,120 Z" />
    </svg>
  )
}

export default function PlataformaLanding() {
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Reveal al hacer scroll
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
          <a href="#top" className="nav-logo"><BrandLogos logos={['bureau']} color size={54} /></a>
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

      {/* ── Hero inmersivo ── */}
      <section id="top" className="hero">
        <div className="hero-glow" aria-hidden />
        <div className="hero-in">
          <div className="hero-copy">
            <span className="eyebrow eyebrow-light">Plataforma inmersiva · Mendoza Bureau × El Faro 360</span>
            <h1>Mostrá tu espacio, servicio o experiencia dentro de <span className="hl">Mendoza Bureau en 360°</span></h1>
            <p className="lead">
              Junto a El Faro 360 virtualizamos los espacios, servicios y experiencias de los socios de
              Mendoza Bureau, para que organizadores, empresas y visitantes puedan conocerlos antes de llegar.
            </p>
            <div className="hero-cta">
              <a href={FORM_SOCIO} className="btn btn-primary btn-lg">Quiero virtualizar mi espacio <ChevronRight size={18} /></a>
              <a href="#ejemplos" className="btn btn-outline">Ver ejemplos</a>
            </div>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="btn-link btn-link-light hero-wa">
              <MessageCircle size={16} /> Consultar por WhatsApp
            </a>
            <div className="hero-bullets">
              <span><CheckCircle2 size={16} /> Mostrá tu espacio antes de la visita</span>
              <span><CheckCircle2 size={16} /> Destacá ambientes y servicios</span>
              <span><CheckCircle2 size={16} /> Generá contenido reutilizable</span>
            </div>
          </div>

          <div className="hero-art" aria-hidden>
            <div className="viewer">
              <div className="viewer-top"><span className="dot" /><span className="dot" /><span className="dot" /><b>Recorrido 360°</b></div>
              <div className="viewer-stage">
                <div className="ring"><div className="ring-inner"><Compass size={54} color="#fff" /></div></div>
                <span className="tag tag-a"><MapPin size={13} /> Sala de barricas</span>
                <span className="tag tag-b"><Camera size={13} /> Panorámica</span>
                <span className="tag tag-c"><Sparkles size={13} /> Hotspot</span>
              </div>
              <div className="viewer-strip">{Array.from({ length: 6 }).map((_, i) => <span key={i} />)}</div>
            </div>
          </div>
        </div>
        <Andes fill="#f7f3ec" />
      </section>

      {/* ── Qué estamos haciendo ── */}
      <section id="que-es" className="sec reveal">
        <span className="kicker">01 · El proyecto</span>
        <h2>No es una sesión de fotos. Es una herramienta institucional.</h2>
        <div className="two two-que">
          <p className="p-lg">
            Mendoza Bureau impulsa una <b>plataforma inmersiva institucional</b> donde sus socios muestran
            espacios, servicios y experiencias de forma profesional e interactiva.
          </p>
          <p className="p-lg">
            El Faro 360 desarrolla los <b>recorridos virtuales 360°</b>, la experiencia inmersiva y los
            contenidos complementarios, para que toda la oferta de los socios se pueda descubrir en un solo lugar.
          </p>
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section id="como" className="sec sec-soft reveal">
        <span className="kicker">02 · El camino</span>
        <h2>Cómo funciona</h2>
        <p className="sub">Del primer contacto a tu recorrido publicado, en cinco pasos.</p>
        <div className="steps">
          {[
            ['Conocemos tu propuesta', 'Entendemos tu espacio o servicio y qué querés destacar.'],
            ['Coordinamos el relevamiento', 'Agendamos día y horario de la visita de producción.'],
            ['Capturamos en 360°', 'Realizamos las tomas inmersivas de los puntos elegidos.'],
            ['Editamos y armamos el recorrido', 'Optimización, navegación y hotspots.'],
            ['Integramos a la plataforma', 'Tu propuesta queda dentro de Mendoza Bureau.'],
          ].map(([t, d], i) => (
            <div key={t} className="step">
              <span className="step-n">{i + 1}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ejemplos reales ── */}
      <section id="ejemplos" className="sec reveal">
        <span className="kicker">03 · En vivo</span>
        <h2>Mirá cómo se vive un recorrido 360°</h2>
        <p className="sub">Ejemplos reales producidos por El Faro 360.</p>
        <div className="ejemplos">
          {[
            ['Bodega Margot', 'Enoturismo · recorrido inmersivo', TOUR_MARGOT, 'Explorar recorrido'],
            ['Café Paloma', 'Gastronomía · experiencia 360°', TOUR_PALOMA, 'Explorar recorrido'],
          ].map(([nom, desc, url, cta]) => (
            <a key={nom} href={url} target="_blank" rel="noopener noreferrer" className="ejemplo">
              <div className="ejemplo-img">
                <span className="ej-play"><Compass size={30} color="#fff" /></span>
                <span className="ej-360">360°</span>
              </div>
              <div className="ejemplo-body">
                <h3>{nom}</h3>
                <p>{desc}</p>
                <span className="btn-link">{cta} <ChevronRight size={15} /></span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Tour base 5 panoramas ── */}
      <section className="sec sec-soft reveal">
        <div className="two two-mid">
          <div>
            <span className="kicker">04 · Tour base</span>
            <h2 className="h2-left">Tu recorrido comienza con 5 panoramas 360°</h2>
            <p className="p-lg">
              Vos elegís los <b>cinco lugares que mejor representan tu propuesta</b>. Se distribuyen libremente
              dentro del mismo establecimiento y se realizan durante el relevamiento programado.
            </p>
          </div>
          <div className="incluye">
            <p className="incluye-t">Incluye</p>
            <div className="incluye-grid">
              {['5 panoramas 360°', 'Edición y optimización', 'Navegación', 'Hotspots básicos', 'Armado del recorrido',
                'Ficha del socio', 'Logo y fotos', 'Descripción', 'Web y WhatsApp', 'Redes y links',
                'Info comercial', 'Integración en la plataforma'].map(x => (
                <span key={x}><CheckCircle2 size={14} color={O} /> {x}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Ampliá tu recorrido ── */}
      <section id="ampliar" className="sec reveal">
        <span className="kicker">05 · Escalá</span>
        <h2>Ampliá tu recorrido</h2>
        <p className="sub">Hay espacios donde cinco puntos alcanzan, y otros donde vale mostrar más. Elegí cuánto querés mostrar.</p>
        <div className="cards-4">
          {[
            ['Panorama adicional', 'Para incorporar un punto puntual que no entró en los 5 iniciales.'],
            ['Pack 3', 'Ideal para espacios pequeños o medianos con algunos sectores más.'],
            ['Pack 5', 'Ideal para hoteles, bodegas o restaurantes con varias áreas relevantes.'],
            ['Pack 10', 'Para proyectos de mayor escala y experiencias más completas.'],
          ].map(([t, d]) => (
            <div key={t} className="card card-pack">
              <span className="card-ic"><MapPin size={20} color={O} /></span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Experiencias inmersivas ── */}
      <section className="sec sec-dark reveal">
        <Andes fill="#f7f3ec" flip />
        <div className="dark-in">
          <span className="eyebrow eyebrow-light">A medida</span>
          <h2 className="h2-light">Experiencias inmersivas dentro del tour</h2>
          <p className="sub sub-light">
            Además de recorrer un espacio, diseñamos experiencias <b>dentro del propio recorrido</b>.
          </p>
          <div className="exp-grid">
            {['Cata guiada', 'Experiencia gastronómica', 'Recorrido por un proceso productivo', 'Un sommelier explicando un varietal',
              'Un chef presentando un plato', 'Personal mostrando una habitación', 'Hotspots especiales e interactivos',
              'Juegos, búsqueda de objetos y beneficios'].map(x => (
              <span key={x} className="exp-chip"><Sparkles size={14} color={O} /> {x}</span>
            ))}
          </div>
          <p className="exp-ex">
            “Imaginá recorrer una bodega y, al acercarte a una estación de degustación, activar un
            <b> video 360°</b> donde una persona explica uno de los varietales.”
          </p>
          <a href={WA} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">Quiero crear una experiencia</a>
        </div>
      </section>

      {/* ── Aprovechá la visita (audiovisual) ── */}
      <section id="servicios" className="sec reveal">
        <span className="kicker">06 · Más contenido</span>
        <h2>Aprovechá la visita y generá más contenido</h2>
        <p className="sub">
          Ya que nuestro equipo estará en tu establecimiento, aprovechá la misma producción para generar
          contenido profesional para redes, web, campañas y comunicación institucional.
        </p>
        <div className="cards-3">
          {[
            [Images, 'Fotografías HDR', 'Imágenes profesionales para web, redes, Booking y publicidad.'],
            [Film, 'Reel vertical', 'Contenido pensado para Instagram, TikTok y campañas.'],
            [Video, 'Video institucional', 'Presentá tu espacio, propuesta o experiencia.'],
            [Plane, 'Drone', 'Mostrá ubicación, escala, entorno y paisaje.'],
            [Compass, 'Video 360°', 'Experiencias inmersivas con movimiento, sonido y personas.'],
            [Sparkles, 'Pack audiovisual premium', 'Combina fotos, video, reels y/o drone en una producción.'],
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
        <div className="center"><a href={SERVICIOS} className="btn btn-primary">Ver servicios disponibles</a></div>
      </section>

      {/* ── ¿Cuánto querés mostrar? ── */}
      <section className="sec sec-soft reveal">
        <span className="kicker">07 · Tu medida</span>
        <h2>¿Cuánto querés mostrar?</h2>
        <p className="sub">Cada proyecto se personaliza según las características de tu espacio.</p>
        <div className="cards-3">
          {[
            ['Esencial', 'Mostrá lo más importante', 'Los cinco puntos principales de tu espacio.'],
            ['Ampliado', 'Mostrá más ambientes', 'Más sectores, habitaciones, salones, terrazas o exteriores.'],
            ['Experiencia completa', 'Contá toda la experiencia', 'Tour + más panoramas + fotografía + video + drone + contenido inmersivo.'],
          ].map(([t, s, d], i) => (
            <div key={t} className={`card card-tier ${i === 2 ? 'card-tier-hl' : ''}`}>
              <span className="tier-tag">{t}</span>
              <h3>{s}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Empresas de servicios ── */}
      <section className="sec reveal">
        <div className="two two-mid">
          <div>
            <span className="card-ic"><Building2 size={22} color={O} /></span>
            <h2 className="h2-left" style={{ marginTop: 12 }}>¿Ofrecés servicios y no tenés un espacio para recorrer?</h2>
            <p className="p-lg">También podemos integrar tu empresa dentro de la plataforma.</p>
            <a href={FORM_SOCIO} className="btn btn-primary" style={{ marginTop: 12 }}>Quiero mostrar mis servicios</a>
          </div>
          <div className="incluye">
            <p className="incluye-t">Podés sumar</p>
            <div className="incluye-grid">
              {['Ficha institucional', 'Servicios', 'Fotografías', 'Videos', 'Datos de contacto', 'WhatsApp',
                'Redes', 'Web', 'Casos y experiencias', 'Contenido interactivo'].map(x => (
                <span key={x}><CheckCircle2 size={14} color={O} /> {x}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Beneficios ── */}
      <section id="beneficios" className="sec sec-soft reveal">
        <span className="kicker">08 · Por qué sumarte</span>
        <h2>Beneficios de formar parte</h2>
        <div className="cards-3">
          {[
            [MapPin, 'Mostrá tu espacio antes de la visita'],
            [Compass, 'Ayudá a entender instalaciones, distribución y capacidades'],
            [Images, 'Generá material visual reutilizable'],
            [Sparkles, 'Diferenciate de otros establecimientos'],
            [Users, 'Formá parte de la plataforma institucional de Mendoza Bureau'],
          ].map(([Ic, t]) => {
            const Icon = Ic as typeof MapPin
            return <div key={t as string} className="benef"><span className="card-ic"><Icon size={18} color={O} /></span><span>{t as string}</span></div>
          })}
        </div>
      </section>

      {/* ── Formas de pago ── */}
      <section className="sec reveal">
        <span className="kicker">09 · Cómo avanzar</span>
        <h2>Opciones simples para avanzar</h2>
        <p className="sub">Distintas modalidades según los servicios contratados.</p>
        <div className="cards-3">
          {[
            ['Tour base', '50% para comenzar y 50% contra entrega.'],
            ['Recorrido ampliado', 'Financiación disponible según la configuración del proyecto.'],
            ['Proyectos más completos', 'Financiación disponible hasta 60 días según servicios contratados.'],
          ].map(([t, d]) => (
            <div key={t} className="card"><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
        <p className="pay-note">
          Medios de pago: transferencia bancaria, efectivo, Mercado Pago, cheque y ECHEQ.
          Los valores se expresan en dólares como referencia y se convierten a pesos al momento de cada pago
          según la cotización establecida. <b>Consultanos por las alternativas de financiación para tu proyecto.</b>
        </p>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="sec sec-soft reveal">
        <span className="kicker">10 · Dudas</span>
        <h2>Preguntas frecuentes</h2>
        <div className="faq">
          {[
            ['¿Qué incluye el recorrido base?', 'Cinco panoramas 360°, edición, navegación, hotspots básicos, la ficha del socio (logo, fotos, descripción, web, WhatsApp, redes) e integración en la plataforma.'],
            ['¿Quién elige los cinco panoramas?', 'Los elegís vos: son los cinco puntos que mejor representan tu propuesta.'],
            ['¿Qué pasa si necesito mostrar más espacios?', 'Podés ampliar con panoramas adicionales o packs de 3, 5 o 10.'],
            ['¿Puedo sumar fotografías o videos?', 'Sí: fotos HDR, reels, video institucional, drone y video 360°.'],
            ['¿Qué son las experiencias inmersivas?', 'Escenas interactivas dentro del tour (catas, procesos, videos 360°, hotspots especiales). Se arman a medida.'],
            ['¿Y si presto servicios y no tengo espacio físico?', 'Igual te integramos: ficha institucional, fotos, videos, contacto, casos y contenido interactivo.'],
            ['¿Cuánto demora la producción?', 'Depende del alcance; lo coordinamos al momento del relevamiento.'],
            ['¿Cómo se coordina la visita?', 'Agendás fecha y horario del relevamiento y nuestro equipo se acerca.'],
            ['¿Hay financiación?', 'Sí, según la modalidad y los servicios. Consultanos las alternativas disponibles.'],
            ['¿Qué es un ECHEQ?', 'Es un cheque electrónico: se emite y transfiere de forma digital, con la misma validez que uno físico.'],
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

      {/* ── CTA final ── */}
      <section className="cta-final reveal">
        <div className="hero-glow" aria-hidden />
        <div className="cta-in">
          <span className="eyebrow eyebrow-light">Sumate a la plataforma</span>
          <h2>Tu espacio puede ser parte de la plataforma inmersiva de Mendoza Bureau</h2>
          <p>Mostralo mejor. Explicalo mejor. Hacelo recorrible.</p>
          <div className="hero-cta center">
            <a href={FORM_SOCIO} className="btn btn-primary btn-lg">Quiero virtualizar mi espacio <ChevronRight size={18} /></a>
            <a href="#ejemplos" className="btn btn-outline">Ver ejemplos</a>
          </div>
          <a href={WA} target="_blank" rel="noopener noreferrer" className="btn-link btn-link-light hero-wa">
            <MessageCircle size={16} /> Consultar por WhatsApp
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="foot">
        <div className="foot-grid">
          <div className="foot-brand">
            <BrandLogos logos={['bureau']} color size={46} />
            <p className="foot-desc">Plataforma inmersiva institucional para los socios de Mendoza Bureau.</p>
          </div>
          <div className="foot-col">
            <h4>Explorar</h4>
            <a href="#que-es">El proyecto</a>
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
        <div className="foot-bottom">
          <span className="foot-copy">© {new Date().getFullYear()} Mendoza Bureau. Todos los derechos reservados.</span>
          <span className="foot-power">
            <span>Producido por</span>
            <BrandLogos logos={['faro']} color size={34} />
          </span>
        </div>
      </footer>

      {/* ── WhatsApp flotante + CTA sticky mobile ── */}
      <a href={WA} target="_blank" rel="noopener noreferrer" className="wa-float" aria-label="WhatsApp"><MessageCircle size={24} /></a>
      <a href={FORM_SOCIO} className="sticky-cta">Quiero virtualizar mi espacio</a>
    </div>
  )
}

const CSS = `
.mb-landing{
  --o:#e8541f;--o2:#ff8149;--ink:#1c1613;--muted:#6f645b;--ivory:#f7f3ec;--soft:#efe8dd;
  --card:#fffdfa;--line:#e7dccd;--wine:#4a1524;--wine2:#6a1f33;
  background:var(--ivory);color:var(--ink);
  font-family:var(--font-sans),ui-sans-serif,system-ui,-apple-system,sans-serif;
  -webkit-font-smoothing:antialiased;overflow-x:hidden;line-height:1.5}
.mb-landing *{box-sizing:border-box}
.mb-landing h1,.mb-landing h2,.mb-landing h3{margin:0;font-family:var(--font-display),Georgia,serif;
  letter-spacing:-.015em;line-height:1.08;font-weight:700}
.mb-landing h4{margin:0;font-family:var(--font-sans)}
.mb-landing p{margin:0}
.mb-landing a{color:inherit;text-decoration:none}

.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:700;font-size:15px;
  padding:13px 24px;border-radius:999px;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,background .18s;border:none}
.btn-primary{background:linear-gradient(135deg,#e8541f,#ff8149);color:#fff;box-shadow:0 10px 26px rgba(232,84,31,.32)}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 16px 34px rgba(232,84,31,.42)}
.btn-lg{padding:16px 30px;font-size:16px}
.btn-outline{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.35)}
.btn-outline:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.6)}
.btn-ghost{background:var(--card);color:var(--ink);border:1px solid var(--line)}
.btn-ghost:hover{background:var(--soft)}
.btn-link{color:var(--o);font-weight:700;font-size:14px;display:inline-flex;align-items:center;gap:5px}
.btn-link-light{color:#fff;opacity:.9}
.btn-link-light:hover{opacity:1}
.center{display:flex;justify-content:center;flex-wrap:wrap;gap:12px}

/* nav */
.nav{position:sticky;top:0;z-index:50;transition:background .25s,box-shadow .25s,border-color .25s;border-bottom:1px solid transparent}
.nav-solid{background:rgba(247,243,236,.86);backdrop-filter:blur(14px);border-bottom-color:var(--line);box-shadow:0 6px 24px rgba(28,22,19,.05)}
.nav-in{max-width:1200px;margin:0 auto;padding:14px 22px;display:flex;align-items:center;gap:18px}
.nav-logo{display:flex;align-items:center}
.nav-links{display:flex;gap:22px;margin-left:auto;font-size:14px;font-weight:600;color:var(--muted)}
.nav-links a{position:relative;padding:4px 0;transition:color .15s}
.nav-links a::after{content:"";position:absolute;left:0;right:100%;bottom:-2px;height:2px;background:var(--o);transition:right .2s}
.nav-links a:hover{color:var(--ink)}
.nav-links a:hover::after{right:0}
.nav-cta{margin-left:6px;padding:10px 18px;font-size:14px}
.nav-burger{display:none;margin-left:auto;background:none;border:none;color:var(--ink);cursor:pointer}
.nav-mobile{display:flex;flex-direction:column;gap:14px;padding:16px 22px 22px;background:var(--ivory);border-top:1px solid var(--line);font-weight:600}
.nav-mobile a{color:var(--ink)}

/* hero */
.hero{position:relative;background:radial-gradient(120% 120% at 80% -10%,#6a1f33 0%,#4a1524 45%,#2e0d18 100%);
  color:#fff;padding:0;overflow:hidden}
.hero-glow{position:absolute;inset:0;background:
  radial-gradient(600px 300px at 15% 20%,rgba(232,84,31,.28),transparent 60%),
  radial-gradient(500px 260px at 90% 80%,rgba(255,129,73,.16),transparent 60%);pointer-events:none}
.hero-in{position:relative;max-width:1200px;margin:0 auto;padding:96px 22px 130px;
  display:grid;grid-template-columns:1.05fr .95fr;gap:52px;align-items:center}
.hero h1{font-size:clamp(34px,5.2vw,60px);font-weight:900;letter-spacing:-.02em}
.hl{color:var(--o2);font-style:italic;font-weight:700}
.lead{font-size:clamp(16px,1.6vw,19px);color:rgba(255,255,255,.82);line-height:1.65;margin:22px 0 30px;max-width:560px}
.hero-cta{display:flex;flex-wrap:wrap;gap:14px;align-items:center}
.hero-wa{display:inline-flex;margin-top:16px}
.hero-bullets{display:flex;flex-wrap:wrap;gap:18px;margin-top:30px;color:rgba(255,255,255,.72);font-size:13px;font-weight:600}
.hero-bullets span{display:inline-flex;align-items:center;gap:7px}
.hero-bullets svg{color:var(--o2)}

/* hero viewer mockup */
.hero-art{display:flex;justify-content:center}
.viewer{width:100%;max-width:420px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);
  border-radius:22px;padding:14px;backdrop-filter:blur(8px);box-shadow:0 40px 80px rgba(0,0,0,.4)}
.viewer-top{display:flex;align-items:center;gap:7px;padding:4px 6px 12px;font-size:12px;color:rgba(255,255,255,.7);font-weight:600}
.viewer-top b{margin-left:auto;font-family:var(--font-display),serif;font-weight:700;color:#fff}
.viewer-top .dot{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.35)}
.viewer-stage{position:relative;height:250px;border-radius:14px;overflow:hidden;
  background:radial-gradient(120% 120% at 50% 30%,#7a2438,#3a0f1c);display:flex;align-items:center;justify-content:center}
.ring{width:130px;height:130px;border-radius:50%;border:2px dashed rgba(255,255,255,.28);display:flex;
  align-items:center;justify-content:center;animation:spin 22s linear infinite}
.ring-inner{width:92px;height:92px;border-radius:50%;background:linear-gradient(135deg,rgba(232,84,31,.9),rgba(255,129,73,.7));
  display:flex;align-items:center;justify-content:center;box-shadow:0 12px 30px rgba(232,84,31,.5)}
@keyframes spin{to{transform:rotate(360deg)}}
.tag{position:absolute;display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.95);color:var(--ink);
  font-size:11px;font-weight:700;padding:6px 10px;border-radius:999px;box-shadow:0 8px 20px rgba(0,0,0,.25)}
.tag svg{color:var(--o)}
.tag-a{top:18px;left:16px}.tag-b{bottom:20px;right:16px}.tag-c{top:50%;right:22px}
.viewer-strip{display:flex;gap:7px;padding:12px 4px 4px}
.viewer-strip span{flex:1;height:34px;border-radius:7px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.12)}
.viewer-strip span:first-child{background:rgba(232,84,31,.5);border-color:rgba(255,129,73,.6)}

/* silueta Andes */
.andes{position:absolute;left:0;right:0;bottom:-1px;width:100%;height:70px;display:block}
.sec-dark .andes{top:-1px;bottom:auto}

/* secciones */
.sec{position:relative;max-width:1200px;margin:0 auto;padding:76px 22px}
.sec-soft{background:var(--soft);max-width:none}
.sec-soft>*{max-width:1200px;margin-left:auto;margin-right:auto}
.kicker{display:block;text-align:center;font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;
  color:var(--o);margin-bottom:14px}
.sec h2,.sec-soft h2{font-size:clamp(26px,3.6vw,42px);font-weight:700;text-align:center;text-wrap:balance;max-width:900px;margin:0 auto}
.h2-left{text-align:left!important;margin:0!important}
.sub{text-align:center;color:var(--muted);font-size:16px;margin:14px auto 40px;max-width:660px;line-height:1.6}
.p-lg{font-size:17px;color:#41372f;line-height:1.75}
.two{display:grid;grid-template-columns:1fr 1fr;gap:38px}
.two-que{margin-top:26px}
.two-mid{align-items:center}

.steps{display:grid;grid-template-columns:repeat(5,1fr);gap:16px}
.step{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:24px;transition:transform .18s,box-shadow .18s}
.step:hover{transform:translateY(-4px);box-shadow:0 22px 44px rgba(28,22,19,.08)}
.step-n{display:inline-flex;width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#e8541f,#ff8149);
  color:#fff;font-family:var(--font-display),serif;font-weight:900;font-size:18px;align-items:center;justify-content:center;margin-bottom:14px;
  box-shadow:0 8px 18px rgba(232,84,31,.3)}
.step h3{font-size:16px;margin-bottom:7px}
.step p{font-size:13px;color:var(--muted);line-height:1.55}

.ejemplos{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:920px;margin:0 auto}
.ejemplo{border:1px solid var(--line);border-radius:22px;overflow:hidden;background:var(--card);
  transition:transform .18s,box-shadow .18s;display:block}
.ejemplo:hover{transform:translateY(-4px);box-shadow:0 28px 54px rgba(28,22,19,.12)}
.ejemplo-img{position:relative;height:200px;background:
  radial-gradient(120% 140% at 30% 20%,#7a2438,#3a0f1c);display:flex;align-items:center;justify-content:center}
.ej-play{width:66px;height:66px;border-radius:50%;background:linear-gradient(135deg,rgba(232,84,31,.95),rgba(255,129,73,.8));
  display:flex;align-items:center;justify-content:center;box-shadow:0 14px 32px rgba(232,84,31,.5);transition:transform .2s}
.ejemplo:hover .ej-play{transform:scale(1.08)}
.ej-360{position:absolute;top:14px;right:14px;background:rgba(255,255,255,.95);color:var(--wine);font-weight:800;font-size:12px;padding:4px 11px;border-radius:999px}
.ejemplo-body{padding:22px}
.ejemplo-body h3{font-size:21px}
.ejemplo-body p{color:var(--muted);font-size:14px;margin:7px 0 15px}

.incluye{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:26px;box-shadow:0 14px 40px rgba(28,22,19,.05)}
.incluye-t{font-weight:800;text-transform:uppercase;letter-spacing:.12em;font-size:12px;color:var(--o);margin-bottom:16px}
.incluye-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.incluye-grid span{display:inline-flex;align-items:center;gap:8px;font-size:14px;color:#41372f}

.cards-4{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.cards-3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:26px;transition:transform .18s,box-shadow .18s,border-color .18s}
.card:hover{transform:translateY(-4px);box-shadow:0 22px 46px rgba(28,22,19,.09);border-color:#e0cfb8}
.card-ic{display:inline-flex;width:46px;height:46px;border-radius:13px;background:rgba(232,84,31,.1);
  align-items:center;justify-content:center;margin-bottom:6px}
.card h3{font-size:19px;margin:14px 0 8px}
.card p{color:var(--muted);font-size:14px;line-height:1.6}
.card-tier .tier-tag{display:inline-block;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;
  color:var(--o);background:rgba(232,84,31,.1);padding:6px 13px;border-radius:999px;margin-bottom:12px}
.card-tier h3{font-size:20px}
.card-tier-hl{background:linear-gradient(160deg,#fffdfa,#fbeee4);border-color:#f2c9ac;box-shadow:0 20px 44px rgba(232,84,31,.14)}

/* dark */
.sec-dark{position:relative;background:radial-gradient(120% 120% at 80% 0%,#6a1f33,#3a0f1c 60%,#280a14);max-width:none;text-align:center;
  padding:110px 22px 90px}
.dark-in{position:relative;max-width:960px;margin:0 auto}
.h2-light{color:#fff}
.sub-light{color:rgba(255,255,255,.72)}
.exp-grid{display:flex;flex-wrap:wrap;gap:11px;justify-content:center;margin-bottom:30px}
.exp-chip{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);
  color:#f3e9e2;border-radius:999px;padding:10px 17px;font-size:14px;font-weight:500}
.exp-ex{color:rgba(255,255,255,.9);font-size:clamp(17px,2vw,21px);line-height:1.7;font-style:italic;
  font-family:var(--font-display),serif;margin:0 auto 30px;max-width:720px}

.benef{display:flex;align-items:center;gap:14px;background:var(--card);border:1px solid var(--line);border-radius:16px;
  padding:18px 20px;font-weight:600;color:#41372f;transition:transform .18s,box-shadow .18s}
.benef:hover{transform:translateY(-3px);box-shadow:0 18px 38px rgba(28,22,19,.08)}
.benef .card-ic{margin-bottom:0;width:40px;height:40px;flex:none}
.pay-note{max-width:780px;margin:30px auto 0;text-align:center;color:var(--muted);font-size:14px;line-height:1.75}

.faq{max-width:840px;margin:0 auto;display:flex;flex-direction:column;gap:12px}
.faq-item{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:2px 20px;transition:box-shadow .18s}
.faq-item[open]{box-shadow:0 16px 36px rgba(28,22,19,.07)}
.faq-item summary{cursor:pointer;font-weight:700;font-size:15.5px;padding:16px 0;list-style:none;
  display:flex;justify-content:space-between;align-items:center;gap:16px}
.faq-item summary::-webkit-details-marker{display:none}
.faq-item summary::after{content:"+";color:var(--o);font-size:24px;font-weight:400;line-height:1;flex:none}
.faq-item[open] summary::after{content:"–"}
.faq-item p{color:var(--muted);font-size:14.5px;line-height:1.7;padding:0 0 18px}

.cta-final{position:relative;overflow:hidden;background:radial-gradient(120% 120% at 20% 10%,#6a1f33,#3a0f1c 55%,#280a14);
  color:#fff;text-align:center;padding:96px 22px}
.cta-in{position:relative;max-width:840px;margin:0 auto}
.cta-final h2{font-family:var(--font-display),serif;font-size:clamp(26px,4.2vw,44px);font-weight:700;margin:0 auto 14px;text-wrap:balance}
.cta-final p{color:rgba(255,255,255,.78);font-size:18px;margin-bottom:30px}
.cta-final .hero-wa{margin-top:18px}

/* footer */
.foot{background:#1c1613;color:#b8aca1;padding:56px 22px 30px}
.foot-grid{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:34px;
  padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,.1)}
.foot-brand .foot-desc{margin-top:16px;font-size:14px;line-height:1.6;max-width:320px;color:#8f8579}
.foot-brand>div{justify-content:flex-start!important}
.foot-col h4{font-size:13px;text-transform:uppercase;letter-spacing:.1em;color:#fff;margin-bottom:14px;font-weight:700}
.foot-col{display:flex;flex-direction:column;gap:10px;font-size:14px}
.foot-col a{color:#b8aca1;transition:color .15s}.foot-col a:hover{color:var(--o2)}
.foot-bottom{max-width:1200px;margin:24px auto 0;display:flex;justify-content:space-between;align-items:center;
  gap:18px;flex-wrap:wrap}
.foot-copy{font-size:12.5px;color:#7d7268}
.foot-power{display:inline-flex;align-items:center;gap:12px;font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#7d7268;font-weight:600}

.wa-float{position:fixed;right:20px;bottom:20px;width:54px;height:54px;border-radius:50%;background:#25D366;color:#fff;
  display:flex;align-items:center;justify-content:center;box-shadow:0 10px 28px rgba(37,211,102,.5);z-index:60;transition:transform .18s}
.wa-float:hover{transform:scale(1.08)}
.sticky-cta{display:none}

/* reveal */
.reveal{opacity:0;transform:translateY(22px);transition:opacity .6s ease,transform .6s ease}
.reveal.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none;transition:none}.ring{animation:none}}

@media(max-width:900px){
  .hero-in{grid-template-columns:1fr;padding:72px 22px 110px;gap:36px}
  .hero-art{order:-1}
  .viewer{max-width:360px}
  .two,.ejemplos{grid-template-columns:1fr}
  .steps{grid-template-columns:1fr 1fr}
  .cards-4,.cards-3{grid-template-columns:1fr 1fr}
  .nav-links,.nav-cta{display:none}
  .nav-burger{display:block}
  .foot-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:560px){
  .steps,.cards-4,.cards-3,.incluye-grid,.foot-grid{grid-template-columns:1fr}
  .btn{width:100%}
  .hero-cta{flex-direction:column;align-items:stretch}
  .sec{padding:52px 18px}
  .foot-bottom{flex-direction:column;align-items:flex-start}
  .sticky-cta{display:block;position:fixed;left:12px;right:12px;bottom:12px;z-index:59;text-align:center;
    background:linear-gradient(135deg,#e8541f,#ff8149);color:#fff;font-weight:700;padding:15px;border-radius:14px;
    box-shadow:0 10px 28px rgba(232,84,31,.45)}
  .wa-float{bottom:78px}
}
`
