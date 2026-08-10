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
   Hero cinemático con parallax, transiciones en degradé (sin serruchos).
   ───────────────────────────────────────────────────────────── */

const display = Fraunces({ subsets: ['latin'], weight: ['400', '600', '700', '900'], style: ['normal', 'italic'], variable: '--font-display', display: 'swap' })
const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-sans', display: 'swap' })

const FORM_SOCIO = '/form/socio'
const SERVICIOS = '/servicios-adicionales'
const WA = 'https://wa.me/5492616657058'
const TOUR_MARGOT = 'https://elfaro360.com/tour-virtuales/bodegas/destacadas/margot/'
const TOUR_PALOMA = 'https://elfaro360.com/tour-virtuales/gastronomia/cafeterias/paloma/'
const O = '#e8541f'

// Imágenes (stock) — se pueden reemplazar por fotos reales cuando estén disponibles.
const IMG_HERO = 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1800&q=70'
const IMG_MARGOT = 'https://images.unsplash.com/photo-1474722883778-792e7990302f?auto=format&fit=crop&w=900&q=72'
const IMG_PALOMA = 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=900&q=72'

const NAV = [
  ['Qué es', '#que-es'], ['Cómo funciona', '#como'], ['Ejemplos', '#ejemplos'],
  ['Ampliá', '#ampliar'], ['Servicios', '#servicios'], ['Beneficios', '#beneficios'], ['FAQ', '#faq'],
] as const

export default function PlataformaLanding() {
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const heroBgRef = useRef<HTMLDivElement>(null)
  const heroCopyRef = useRef<HTMLDivElement>(null)

  // Scroll: navbar sólida + parallax del hero
  useEffect(() => {
    let raf = 0
    const apply = () => {
      const y = window.scrollY
      setScrolled(y > 12)
      if (heroBgRef.current) heroBgRef.current.style.transform = `translate3d(0,${Math.min(y, 900) * 0.4}px,0) scale(1.18)`
      if (heroCopyRef.current) {
        const o = Math.max(0, 1 - y / 520)
        heroCopyRef.current.style.opacity = String(o)
        heroCopyRef.current.style.transform = `translate3d(0,${y * 0.12}px,0)`
      }
      raf = 0
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply) }
    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
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
          <a href="#top" className="nav-logo"><BrandLogos logos={['bureau']} color size={72} /></a>
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

      {/* ── Hero cinemático con parallax ── */}
      <section id="top" className="hero">
        <div ref={heroBgRef} className="hero-bg" style={{ backgroundImage: `url(${IMG_HERO})` }} aria-hidden />
        <div className="hero-veil" aria-hidden />
        <div className="hero-in">
          <div className="hero-copy" ref={heroCopyRef}>
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
        </div>
        <span className="hero-scroll" aria-hidden><span /></span>
      </section>

      {/* ── Qué estamos haciendo ── */}
      <section id="que-es" className="sec reveal">
        <div className="sec-head">
          <span className="kicker">01 · El proyecto</span>
          <h2>No es una sesión de fotos.<br />Es una herramienta institucional.</h2>
        </div>
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
        <div className="sec-head">
          <span className="kicker">02 · El camino</span>
          <h2>Cómo funciona</h2>
          <p className="sub">Del primer contacto a tu recorrido publicado, en cinco pasos.</p>
        </div>
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
        <div className="sec-head">
          <span className="kicker">03 · En vivo</span>
          <h2>Mirá cómo se vive un recorrido 360°</h2>
          <p className="sub">Ejemplos reales producidos por El Faro 360.</p>
        </div>
        <div className="ejemplos">
          {[
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
                <span className="btn-link">Explorar recorrido <ChevronRight size={15} /></span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Tour base 5 panoramas ── */}
      <section className="sec sec-soft reveal">
        <div className="two two-mid">
          <div>
            <span className="kicker kicker-left">04 · Tour base</span>
            <h2 className="h2-left">Tu recorrido comienza con 5 panoramas 360°</h2>
            <p className="p-lg" style={{ marginTop: 16 }}>
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

      {/* ── Ampliá tu recorrido + Servicios (unidos, Ampliá resaltado) ── */}
      <section id="ampliar" className="sec reveal">
        <div className="sec-head">
          <span className="kicker">05 · Ampliá y sumá contenido</span>
          <h2>Ampliá tu recorrido y potenciá tu presencia</h2>
          <p className="sub">Mostrá cada rincón de tu espacio y aprovechá la visita para generar más contenido profesional.</p>
        </div>

        {/* Ampliá — bloque destacado */}
        <div className="ampliar-panel">
          <div className="ampliar-head">
            <span className="ampliar-badge">Lo principal</span>
            <h3>Ampliá tu recorrido</h3>
            <p>Hay espacios donde cinco puntos alcanzan, y otros donde vale mostrar más. Elegí cuánto querés mostrar.</p>
          </div>
          <div className="cards-4">
            {[
              ['Panorama adicional', 'Para incorporar un punto puntual que no entró en los 5 iniciales.'],
              ['Pack 3', 'Ideal para espacios pequeños o medianos con algunos sectores más.'],
              ['Pack 5', 'Ideal para hoteles, bodegas o restaurantes con varias áreas relevantes.'],
              ['Pack 10', 'Para proyectos de mayor escala y experiencias más completas.'],
            ].map(([t, d]) => (
              <div key={t} className="card card-pack">
                <span className="card-ic"><MapPin size={20} color={O} /></span>
                <h4 className="card-h">{t}</h4>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Servicios audiovisuales — complementario */}
        <span id="servicios" className="anchor" />
        <div className="sub-block">
          <h3 className="mini-title">Aprovechá la visita y generá más contenido</h3>
          <p className="sub sub-tight">
            Ya que nuestro equipo estará en tu establecimiento, aprovechá la misma producción para redes,
            web, campañas y comunicación institucional.
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
                  <h4 className="card-h">{t as string}</h4>
                  <p>{d as string}</p>
                </div>
              )
            })}
          </div>
          <div className="center"><a href={SERVICIOS} className="btn btn-primary">Ver servicios disponibles</a></div>
        </div>
      </section>

      {/* ── Experiencias inmersivas ── */}
      <section className="sec sec-dark reveal">
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

      {/* ── ¿Cuánto querés mostrar? ── */}
      <section className="sec sec-soft reveal">
        <div className="sec-head">
          <span className="kicker">06 · Tu medida</span>
          <h2>¿Cuánto querés mostrar?</h2>
          <p className="sub">Cada proyecto se personaliza según las características de tu espacio.</p>
        </div>
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
            <h2 className="h2-left" style={{ marginTop: 14 }}>¿Ofrecés servicios y no tenés un espacio para recorrer?</h2>
            <p className="p-lg" style={{ marginTop: 16 }}>También podemos integrar tu empresa dentro de la plataforma.</p>
            <a href={FORM_SOCIO} className="btn btn-primary" style={{ marginTop: 20 }}>Quiero mostrar mis servicios</a>
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
        <div className="sec-head">
          <span className="kicker">07 · Por qué sumarte</span>
          <h2>Beneficios de formar parte</h2>
        </div>
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
        <div className="sec-head">
          <span className="kicker">08 · Cómo avanzar</span>
          <h2>Opciones simples para avanzar</h2>
          <p className="sub">Distintas modalidades según los servicios contratados.</p>
        </div>
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
        <div className="sec-head">
          <span className="kicker">09 · Dudas</span>
          <h2>Preguntas frecuentes</h2>
        </div>
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
        <div className="cta-bg" style={{ backgroundImage: `url(${IMG_HERO})` }} aria-hidden />
        <div className="cta-veil" aria-hidden />
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
            <BrandLogos logos={['bureau']} color size={58} />
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
            <BrandLogos logos={['faro']} color size={36} />
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
.anchor{display:block;position:relative;top:-80px;visibility:hidden}

.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:700;font-size:15px;
  padding:13px 24px;border-radius:999px;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,background .18s;border:none}
.btn-primary{background:linear-gradient(135deg,#e8541f,#ff8149);color:#fff;box-shadow:0 10px 26px rgba(232,84,31,.32)}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 16px 34px rgba(232,84,31,.42)}
.btn-lg{padding:16px 30px;font-size:16px}
.btn-outline{background:rgba(255,255,255,.08);color:#fff;border:1.5px solid rgba(255,255,255,.4);backdrop-filter:blur(4px)}
.btn-outline:hover{background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.7)}
.btn-link{color:var(--o);font-weight:700;font-size:14px;display:inline-flex;align-items:center;gap:5px}
.btn-link-light{color:#fff;opacity:.92}
.btn-link-light:hover{opacity:1}
.center{display:flex;justify-content:center;flex-wrap:wrap;gap:12px}

/* nav */
.nav{position:sticky;top:0;z-index:50;transition:background .25s,box-shadow .25s,border-color .25s;border-bottom:1px solid transparent}
.nav-solid{background:rgba(247,243,236,.9);backdrop-filter:blur(14px);border-bottom-color:var(--line);box-shadow:0 6px 24px rgba(28,22,19,.06)}
.nav-in{max-width:1200px;margin:0 auto;padding:10px 22px;display:flex;align-items:center;gap:18px}
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

/* hero cinemático */
.hero{position:relative;min-height:clamp(600px,92vh,860px);display:flex;align-items:center;overflow:hidden;color:#fff}
.hero-bg{position:absolute;inset:-8% 0;background-size:cover;background-position:center;will-change:transform;z-index:0}
.hero-veil{position:absolute;inset:0;z-index:1;background:
  linear-gradient(90deg,rgba(46,13,24,.94) 0%,rgba(58,15,28,.82) 40%,rgba(58,15,28,.45) 75%,rgba(58,15,28,.25) 100%),
  linear-gradient(180deg,rgba(46,13,24,.5) 0%,transparent 30%,rgba(247,243,236,0) 78%,var(--ivory) 100%)}
.hero-in{position:relative;z-index:2;max-width:1200px;margin:0 auto;padding:120px 22px 120px;width:100%}
.hero-copy{max-width:680px;will-change:transform,opacity}
.hero h1{font-size:clamp(36px,5.6vw,66px);font-weight:900;letter-spacing:-.02em;text-shadow:0 2px 30px rgba(0,0,0,.3)}
.hl{color:var(--o2);font-style:italic;font-weight:700}
.lead{font-size:clamp(16px,1.6vw,19px);color:rgba(255,255,255,.9);line-height:1.65;margin:24px 0 32px;max-width:560px}
.hero-cta{display:flex;flex-wrap:wrap;gap:14px;align-items:center}
.hero-wa{display:inline-flex;margin-top:16px}
.hero-bullets{display:flex;flex-wrap:wrap;gap:18px;margin-top:32px;color:rgba(255,255,255,.8);font-size:13px;font-weight:600}
.hero-bullets span{display:inline-flex;align-items:center;gap:7px}
.hero-bullets svg{color:var(--o2)}
.hero-scroll{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);z-index:2;width:24px;height:40px;
  border:2px solid rgba(255,255,255,.5);border-radius:14px;display:flex;justify-content:center;padding-top:7px}
.hero-scroll span{width:4px;height:9px;border-radius:2px;background:#fff;animation:scrolldot 1.6s ease-in-out infinite}
@keyframes scrolldot{0%{opacity:0;transform:translateY(-4px)}40%{opacity:1}80%{opacity:0;transform:translateY(10px)}}

/* secciones */
.sec{position:relative;max-width:1200px;margin:0 auto;padding:96px 22px}
.sec-soft{background:var(--soft);max-width:none}
.sec-soft>*{max-width:1200px;margin-left:auto;margin-right:auto}
.sec-head{max-width:760px;margin:0 auto 60px;text-align:center}
.kicker{display:block;font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:var(--o);margin-bottom:18px}
.kicker-left{text-align:left}
.sec-head h2,.sec h2,.sec-soft h2{font-size:clamp(28px,3.8vw,44px);font-weight:700;text-wrap:balance}
.sec-head .sub{margin:20px auto 0}
.h2-left{text-align:left!important;margin:0!important}
.sub{color:var(--muted);font-size:16px;max-width:640px;margin:0 auto;line-height:1.65}
.sub-tight{margin-top:14px}
.p-lg{font-size:17px;color:#41372f;line-height:1.75}
.two{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.two-que{margin-top:8px}
.two-mid{align-items:center}

.steps{display:grid;grid-template-columns:repeat(5,1fr);gap:16px}
.step{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:24px;transition:transform .18s,box-shadow .18s}
.step:hover{transform:translateY(-4px);box-shadow:0 22px 44px rgba(28,22,19,.08)}
.step-n{display:inline-flex;width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#e8541f,#ff8149);
  color:#fff;font-family:var(--font-display),serif;font-weight:900;font-size:18px;align-items:center;justify-content:center;margin-bottom:16px;
  box-shadow:0 8px 18px rgba(232,84,31,.3)}
.step h3{font-size:16px;margin-bottom:8px}
.step p{font-size:13px;color:var(--muted);line-height:1.55}

.ejemplos{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:960px;margin:0 auto}
.ejemplo{border:1px solid var(--line);border-radius:22px;overflow:hidden;background:var(--card);
  transition:transform .18s,box-shadow .18s;display:block}
.ejemplo:hover{transform:translateY(-4px);box-shadow:0 28px 54px rgba(28,22,19,.14)}
.ejemplo-img{position:relative;height:230px;background-size:cover;background-position:center;
  display:flex;align-items:center;justify-content:center}
.ejemplo-img::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(58,15,28,.15),rgba(58,15,28,.5))}
.ej-play{position:relative;z-index:1;width:64px;height:64px;border-radius:50%;
  background:linear-gradient(135deg,rgba(232,84,31,.96),rgba(255,129,73,.85));
  display:flex;align-items:center;justify-content:center;box-shadow:0 14px 32px rgba(0,0,0,.35);transition:transform .2s}
.ejemplo:hover .ej-play{transform:scale(1.1)}
.ej-360{position:absolute;top:14px;right:14px;z-index:1;background:rgba(255,255,255,.95);color:var(--wine);font-weight:800;font-size:12px;padding:4px 11px;border-radius:999px}
.ejemplo-body{padding:22px}
.ejemplo-body h3{font-size:21px}
.ejemplo-body p{color:var(--muted);font-size:14px;margin:7px 0 15px}

.incluye{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:28px;box-shadow:0 14px 40px rgba(28,22,19,.05)}
.incluye-t{font-weight:800;text-transform:uppercase;letter-spacing:.12em;font-size:12px;color:var(--o);margin-bottom:18px}
.incluye-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.incluye-grid span{display:inline-flex;align-items:center;gap:8px;font-size:14px;color:#41372f}

/* ampliá — panel destacado */
.ampliar-panel{background:linear-gradient(160deg,#fff6ef,#fbe9dc);border:1.5px solid #f2c9ac;border-radius:26px;
  padding:36px;box-shadow:0 24px 60px rgba(232,84,31,.12);margin-bottom:64px}
.ampliar-head{text-align:center;max-width:640px;margin:0 auto 28px}
.ampliar-badge{display:inline-block;font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;
  color:#fff;background:linear-gradient(135deg,#e8541f,#ff8149);padding:6px 14px;border-radius:999px;margin-bottom:14px}
.ampliar-head h3{font-size:clamp(22px,3vw,32px)}
.ampliar-head p{color:var(--muted);font-size:15px;margin-top:12px;line-height:1.6}
.sub-block{margin-top:8px}
.mini-title{text-align:center;font-size:clamp(20px,2.6vw,28px);font-weight:700}

.cards-4{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.cards-3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:32px}
.card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:26px;transition:transform .18s,box-shadow .18s,border-color .18s}
.card:hover{transform:translateY(-4px);box-shadow:0 22px 46px rgba(28,22,19,.09);border-color:#e0cfb8}
.card-ic{display:inline-flex;width:46px;height:46px;border-radius:13px;background:rgba(232,84,31,.1);
  align-items:center;justify-content:center;margin-bottom:6px}
.card h3,.card .card-h{font-size:19px;margin:14px 0 8px;font-family:var(--font-display),serif;font-weight:700}
.card p{color:var(--muted);font-size:14px;line-height:1.6}
.card-tier .tier-tag{display:inline-block;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;
  color:var(--o);background:rgba(232,84,31,.1);padding:6px 13px;border-radius:999px;margin-bottom:12px}
.card-tier h3{font-size:20px}
.card-tier-hl{background:linear-gradient(160deg,#fffdfa,#fbeee4);border-color:#f2c9ac;box-shadow:0 20px 44px rgba(232,84,31,.14)}

/* dark — con degradé de entrada/salida (sin serruchos) */
.sec-dark{position:relative;background:radial-gradient(120% 120% at 80% 0%,#6a1f33,#3a0f1c 60%,#280a14);max-width:none;text-align:center;
  padding:110px 22px;color:#fff}
.sec-dark::before,.sec-dark::after{content:"";position:absolute;left:0;right:0;height:90px;z-index:1;pointer-events:none}
.sec-dark::before{top:0;background:linear-gradient(180deg,var(--ivory),transparent)}
.sec-dark::after{bottom:0;background:linear-gradient(0deg,var(--soft),transparent)}
.dark-in{position:relative;z-index:2;max-width:960px;margin:0 auto}
.eyebrow{display:inline-block;font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--o);
  background:rgba(232,84,31,.1);border:1px solid rgba(232,84,31,.3);padding:6px 14px;border-radius:999px;margin-bottom:20px}
.eyebrow-light{background:rgba(232,84,31,.18);border-color:rgba(255,129,73,.45);color:#ffb591}
.h2-light{color:#fff;font-size:clamp(26px,3.6vw,42px)}
.sub-light{color:rgba(255,255,255,.75);margin-top:18px}
.exp-grid{display:flex;flex-wrap:wrap;gap:11px;justify-content:center;margin:36px 0 32px}
.exp-chip{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);
  color:#f3e9e2;border-radius:999px;padding:10px 17px;font-size:14px;font-weight:500}
.exp-ex{color:rgba(255,255,255,.9);font-size:clamp(17px,2vw,21px);line-height:1.7;font-style:italic;
  font-family:var(--font-display),serif;margin:0 auto 32px;max-width:720px}

.benef{display:flex;align-items:center;gap:14px;background:var(--card);border:1px solid var(--line);border-radius:16px;
  padding:20px;font-weight:600;color:#41372f;transition:transform .18s,box-shadow .18s}
.benef:hover{transform:translateY(-3px);box-shadow:0 18px 38px rgba(28,22,19,.08)}
.benef .card-ic{margin-bottom:0;width:40px;height:40px;flex:none}
.pay-note{max-width:780px;margin:36px auto 0;text-align:center;color:var(--muted);font-size:14px;line-height:1.75}

.faq{max-width:840px;margin:0 auto;display:flex;flex-direction:column;gap:12px}
.faq-item{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:2px 22px;transition:box-shadow .18s}
.faq-item[open]{box-shadow:0 16px 36px rgba(28,22,19,.07)}
.faq-item summary{cursor:pointer;font-weight:700;font-size:15.5px;padding:18px 0;list-style:none;
  display:flex;justify-content:space-between;align-items:center;gap:16px}
.faq-item summary::-webkit-details-marker{display:none}
.faq-item summary::after{content:"+";color:var(--o);font-size:24px;font-weight:400;line-height:1;flex:none}
.faq-item[open] summary::after{content:"–"}
.faq-item p{color:var(--muted);font-size:14.5px;line-height:1.7;padding:0 0 20px}

/* CTA final con imagen */
.cta-final{position:relative;overflow:hidden;color:#fff;text-align:center;padding:120px 22px}
.cta-bg{position:absolute;inset:0;background-size:cover;background-position:center;z-index:0}
.cta-veil{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(46,13,24,.9),rgba(58,15,28,.82))}
.cta-in{position:relative;z-index:2;max-width:840px;margin:0 auto}
.cta-final h2{font-family:var(--font-display),serif;font-size:clamp(28px,4.4vw,46px);font-weight:700;margin:16px auto 16px;text-wrap:balance}
.cta-final p{color:rgba(255,255,255,.85);font-size:18px;margin-bottom:32px}
.cta-final .hero-wa{margin-top:18px}

/* footer */
.foot{background:#1c1613;color:#b8aca1;padding:64px 22px 30px}
.foot-grid{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:34px;
  padding-bottom:34px;border-bottom:1px solid rgba(255,255,255,.1)}
.foot-brand>div{justify-content:flex-start!important}
.foot-brand .foot-desc{margin-top:18px;font-size:14px;line-height:1.6;max-width:320px;color:#8f8579}
.foot-col h4{font-size:13px;text-transform:uppercase;letter-spacing:.1em;color:#fff;margin-bottom:16px;font-weight:700}
.foot-col{display:flex;flex-direction:column;gap:11px;font-size:14px}
.foot-col a{color:#b8aca1;transition:color .15s}.foot-col a:hover{color:var(--o2)}
.foot-bottom{max-width:1200px;margin:26px auto 0;display:flex;justify-content:space-between;align-items:center;gap:18px;flex-wrap:wrap}
.foot-copy{font-size:12.5px;color:#7d7268}
.foot-power{display:inline-flex;align-items:center;gap:12px;font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#7d7268;font-weight:600}

.wa-float{position:fixed;right:20px;bottom:20px;width:54px;height:54px;border-radius:50%;background:#25D366;color:#fff;
  display:flex;align-items:center;justify-content:center;box-shadow:0 10px 28px rgba(37,211,102,.5);z-index:60;transition:transform .18s}
.wa-float:hover{transform:scale(1.08)}
.sticky-cta{display:none}

/* reveal */
.reveal{opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s ease}
.reveal.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){
  .reveal{opacity:1;transform:none;transition:none}
  .hero-bg{transform:none!important}.hero-scroll{display:none}
}

@media(max-width:900px){
  .hero{min-height:auto}
  .hero-in{padding:110px 22px 90px}
  .two,.ejemplos{grid-template-columns:1fr}
  .steps{grid-template-columns:1fr 1fr}
  .cards-4,.cards-3{grid-template-columns:1fr 1fr}
  .nav-links,.nav-cta{display:none}
  .nav-burger{display:block}
  .foot-grid{grid-template-columns:1fr 1fr}
  .ampliar-panel{padding:26px}
}
@media(max-width:560px){
  .steps,.cards-4,.cards-3,.incluye-grid,.foot-grid{grid-template-columns:1fr}
  .btn{width:100%}
  .hero-cta{flex-direction:column;align-items:stretch}
  .sec{padding:64px 18px}
  .sec-head{margin-bottom:40px}
  .foot-bottom{flex-direction:column;align-items:flex-start}
  .sticky-cta{display:block;position:fixed;left:12px;right:12px;bottom:12px;z-index:59;text-align:center;
    background:linear-gradient(135deg,#e8541f,#ff8149);color:#fff;font-weight:700;padding:15px;border-radius:14px;
    box-shadow:0 10px 28px rgba(232,84,31,.45)}
  .wa-float{bottom:78px}
}
`
