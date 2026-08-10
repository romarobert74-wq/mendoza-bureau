'use client'

import { useEffect, useRef, useState } from 'react'
import { Fraunces, Manrope } from 'next/font/google'
import { BrandLogos } from '@/components/BrandLogos'
import {
  Menu, X, Camera, Compass, MapPin, Sparkles, Video, Plane, Images,
  Film, Building2, Users, CheckCircle2, ChevronRight, MessageCircle,
  ScanSearch, CalendarClock, Aperture, Wand2, Rocket, ArrowRight,
} from 'lucide-react'

/* ─────────────────────────────────────────────────────────────
   LANDING PRINCIPAL · Mendoza Bureau × El Faro 360
   Rediseño v3 — Editorial oscuro inmersivo.
   Hero cinemático con parallax + grano, marquee, scroll-story
   con panel fijo, grillas bento. Sin precios. Misma información.
   ───────────────────────────────────────────────────────────── */

const display = Fraunces({ subsets: ['latin'], weight: ['400', '600', '700', '900'], style: ['normal', 'italic'], variable: '--font-display', display: 'swap' })
const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-sans', display: 'swap' })

const FORM_SOCIO = '/form/socio'
const SERVICIOS = '/servicios-adicionales'
const WA = 'https://wa.me/5492616657058'
const TOUR_MARGOT = 'https://elfaro360.com/tour-virtuales/bodegas/destacadas/margot/'
const TOUR_PALOMA = 'https://elfaro360.com/tour-virtuales/gastronomia/cafeterias/paloma/'
const O = '#ff6a3d'

const IMG_HERO = 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1900&q=72'
const IMG_MARGOT = 'https://images.unsplash.com/photo-1474722883778-792e7990302f?auto=format&fit=crop&w=1000&q=74'
const IMG_PALOMA = 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1000&q=74'
// Grano cinematográfico (SVG noise embebido)
const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")"

const NAV = [
  ['Qué es', '#que-es'], ['Cómo funciona', '#como'], ['Ejemplos', '#ejemplos'],
  ['Ampliá', '#ampliar'], ['Servicios', '#servicios'], ['Beneficios', '#beneficios'], ['FAQ', '#faq'],
] as const

const STEPS: [typeof ScanSearch, string, string][] = [
  [ScanSearch, 'Conocemos tu propuesta', 'Entendemos tu espacio o servicio y qué querés destacar.'],
  [CalendarClock, 'Coordinamos el relevamiento', 'Agendamos día y horario de la visita de producción.'],
  [Aperture, 'Capturamos en 360°', 'Realizamos las tomas inmersivas de los puntos elegidos.'],
  [Wand2, 'Editamos y armamos el recorrido', 'Optimización, navegación y hotspots interactivos.'],
  [Rocket, 'Integramos a la plataforma', 'Tu propuesta queda publicada dentro de Mendoza Bureau.'],
]

export default function PlataformaLanding() {
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const heroBgRef = useRef<HTMLDivElement>(null)
  const heroCopyRef = useRef<HTMLDivElement>(null)

  // Scroll: navbar + parallax
  useEffect(() => {
    let raf = 0
    const apply = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      if (heroBgRef.current) heroBgRef.current.style.transform = `translate3d(0,${Math.min(y, 900) * 0.42}px,0) scale(1.2)`
      if (heroCopyRef.current) {
        heroCopyRef.current.style.opacity = String(Math.max(0, 1 - y / 560))
        heroCopyRef.current.style.transform = `translate3d(0,${y * 0.14}px,0)`
      }
      raf = 0
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply) }
    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])

  // Reveal
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll('.reveal')
    if (!els?.length) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } })
    }, { threshold: 0.14 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  // Scroll-story: paso activo
  useEffect(() => {
    const steps = rootRef.current?.querySelectorAll('.story-step')
    if (!steps?.length) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i))
      })
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 })
    steps.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  const ActiveIcon = STEPS[active][0]

  return (
    <div ref={rootRef} className={`mb-landing ${display.variable} ${sans.variable}`}>
      <style>{CSS}</style>
      <div className="grain" aria-hidden />

      {/* ── Navbar ── */}
      <header className={`nav ${scrolled ? 'nav-solid' : ''}`}>
        <div className="nav-in">
          <a href="#top" className="nav-logo"><BrandLogos logos={['bureau']} size={scrolled ? 60 : 120} /></a>
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
          <div className="hero-copy" ref={heroCopyRef}>
            <h1>
              Mostrá tu espacio<br />dentro de la plataforma<br />
              <span className="hl">inmersiva de Mendoza Bureau</span>
            </h1>
            <p className="lead">
              Junto a El Faro 360 virtualizamos los espacios, servicios y experiencias de los socios de
              Mendoza Bureau, para que organizadores, empresas y visitantes puedan conocerlos antes de llegar.
            </p>
            <div className="hero-cta">
              <a href={FORM_SOCIO} className="btn btn-primary btn-lg">Quiero virtualizar mi espacio <ArrowRight size={18} /></a>
              <a href="#ejemplos" className="btn btn-outline">Ver ejemplos</a>
            </div>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="btn-link btn-link-light hero-wa">
              <MessageCircle size={16} /> Consultar por WhatsApp
            </a>
          </div>
        </div>
        <span className="hero-scroll" aria-hidden><span /></span>
      </section>

      {/* ── Marquee ── */}
      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {[...Array(2)].map((_, k) => (
            <span key={k}>
              {['Bodegas', 'Hoteles', 'Gastronomía', 'Experiencias', 'Enoturismo', 'Servicios', 'Espacios de eventos', 'Cafeterías'].map(w => (
                <em key={w}>{w}<i>·</i></em>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── Qué es — bento ── */}
      <section id="que-es" className="sec reveal">
        <div className="sec-head sec-head-left">
          <span className="kicker">01 · El proyecto</span>
          <h2>No es una sesión de fotos.<br /><span className="ital">Es una herramienta institucional.</span></h2>
        </div>
        <div className="bento">
          <div className="bento-cell bento-lg">
            <Compass size={26} color={O} />
            <h3>Una plataforma inmersiva institucional</h3>
            <p>Mendoza Bureau reúne a sus socios en un mismo lugar, donde cada espacio, servicio y experiencia se muestra de forma profesional e interactiva.</p>
          </div>
          <div className="bento-cell">
            <Aperture size={24} color={O} />
            <h3>Recorridos 360°</h3>
            <p>El Faro 360 desarrolla la producción inmersiva completa.</p>
          </div>
          <div className="bento-cell">
            <Sparkles size={24} color={O} />
            <h3>Experiencias a medida</h3>
            <p>Catas, procesos y escenas interactivas dentro del tour.</p>
          </div>
          <div className="bento-cell bento-wide">
            <Users size={24} color={O} />
            <h3>Pensada para descubrir antes de llegar</h3>
            <p>Organizadores, empresas y visitantes conocen tu propuesta desde cualquier dispositivo, en cualquier momento.</p>
          </div>
        </div>
      </section>

      {/* ── Cómo funciona — scroll story ── */}
      <section id="como" className="story reveal">
        <div className="sec-head">
          <span className="kicker">02 · El camino</span>
          <h2>Cómo funciona</h2>
          <p className="sub">Del primer contacto a tu recorrido publicado, en cinco pasos.</p>
        </div>
        <div className="story-in">
          <div className="story-sticky">
            <div className="story-card">
              <span className="story-num">{String(active + 1).padStart(2, '0')}</span>
              <div className="story-ic"><ActiveIcon size={64} color={O} /></div>
              <h3>{STEPS[active][1]}</h3>
              <p>{STEPS[active][2]}</p>
              <div className="story-dots">
                {STEPS.map((_, i) => <span key={i} className={i === active ? 'on' : ''} />)}
              </div>
            </div>
          </div>
          <div className="story-steps">
            {STEPS.map(([Ic, t, d], i) => (
              <div key={t} className={`story-step ${i === active ? 'active' : ''}`} data-i={i}>
                <span className="story-step-n"><Ic size={22} color={O} /></span>
                <div>
                  <h4>{String(i + 1).padStart(2, '0')} — {t}</h4>
                  <p>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ejemplos ── */}
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
                <span className="btn-link">Explorar recorrido <ArrowRight size={15} /></span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Tour base ── */}
      <section className="sec reveal">
        <div className="split">
          <div>
            <span className="kicker kicker-left">04 · Tour base</span>
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

      {/* ── Ampliá + Servicios ── */}
      <section id="ampliar" className="sec reveal">
        <div className="sec-head">
          <span className="kicker">05 · Ampliá y sumá contenido</span>
          <h2>Ampliá tu recorrido y potenciá tu presencia</h2>
          <p className="sub">Mostrá cada rincón de tu espacio y aprovechá la visita para generar más contenido profesional.</p>
        </div>

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
      <section className="sec-feature reveal">
        <div className="feature-in">
          <span className="eyebrow">A medida</span>
          <h2 className="h2-light">Experiencias inmersivas dentro del tour</h2>
          <p className="sub sub-light">Además de recorrer un espacio, diseñamos experiencias <b>dentro del propio recorrido</b>.</p>
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
      <section className="sec reveal">
        <div className="sec-head">
          <span className="kicker">06 · Tu medida</span>
          <h2>¿Cuánto querés mostrar?</h2>
          <p className="sub">Cada proyecto se personaliza según las características de tu espacio.</p>
        </div>
        <div className="cards-3 cards-tight">
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
        <div className="split">
          <div>
            <span className="card-ic"><Building2 size={22} color={O} /></span>
            <h2 className="h2-left" style={{ marginTop: 16 }}>¿Ofrecés servicios y no tenés un espacio para recorrer?</h2>
            <p className="p-lg">También podemos integrar tu empresa dentro de la plataforma.</p>
            <a href={FORM_SOCIO} className="btn btn-primary" style={{ marginTop: 22 }}>Quiero mostrar mis servicios</a>
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
      <section id="beneficios" className="sec reveal">
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
          Medios de pago: transferencia bancaria, efectivo, Mercado Pago y cheque.
          Los valores se expresan en dólares como referencia y se convierten a pesos al momento de cada pago
          según la cotización establecida. <b>Consultanos por las alternativas de financiación para tu proyecto.</b>
        </p>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="sec reveal">
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
          <span className="eyebrow">Sumate a la plataforma</span>
          <h2>Tu espacio puede ser parte de la plataforma inmersiva de Mendoza Bureau</h2>
          <p>Mostralo mejor. Explicalo mejor. Hacelo recorrible.</p>
          <div className="hero-cta center">
            <a href={FORM_SOCIO} className="btn btn-primary btn-lg">Quiero virtualizar mi espacio <ArrowRight size={18} /></a>
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
            <BrandLogos logos={['bureau']} size={96} />
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
            <BrandLogos logos={['faro']} size={40} />
          </span>
        </div>
      </footer>

      <a href={WA} target="_blank" rel="noopener noreferrer" className="wa-float" aria-label="WhatsApp"><MessageCircle size={24} /></a>
      <a href={FORM_SOCIO} className="sticky-cta">Quiero virtualizar mi espacio</a>
    </div>
  )
}

const CSS = `
.mb-landing{
  --o:#ff6a3d;--o2:#ffb37a;--bg:#0e0a0c;--bg2:#151011;--panel:#1b1416;
  --text:#f5ede7;--muted:#a99e97;--line:rgba(255,255,255,.09);--line2:rgba(255,255,255,.14);
  --wine:#7a1f38;
  background:var(--bg);color:var(--text);
  font-family:var(--font-sans),ui-sans-serif,system-ui,-apple-system,sans-serif;
  -webkit-font-smoothing:antialiased;overflow-x:hidden;line-height:1.5}
.mb-landing *{box-sizing:border-box}
.mb-landing h1,.mb-landing h2,.mb-landing h3{margin:0;font-family:var(--font-display),Georgia,serif;letter-spacing:-.015em;line-height:1.06;font-weight:700}
.mb-landing h4{margin:0;font-family:var(--font-sans)}
.mb-landing p{margin:0}
.mb-landing a{color:inherit;text-decoration:none}
.mb-landing b{color:var(--text)}
.ital{font-style:italic;color:var(--o2);font-weight:600}
.anchor{display:block;position:relative;top:-90px;visibility:hidden}

/* grano cinematográfico global */
.grain{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.06;mix-blend-mode:overlay;
  background-image:${GRAIN};background-size:180px}

.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;font-weight:700;font-size:15px;
  padding:14px 26px;border-radius:999px;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,background .18s;border:none}
.btn-primary{background:linear-gradient(135deg,#ff6a3d,#ffa057);color:#241209;box-shadow:0 12px 30px rgba(255,106,61,.34)}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 18px 40px rgba(255,106,61,.46)}
.btn-lg{padding:17px 32px;font-size:16px}
.btn-outline{background:rgba(255,255,255,.05);color:var(--text);border:1.5px solid var(--line2);backdrop-filter:blur(6px)}
.btn-outline:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.4)}
.btn-link{color:var(--o);font-weight:700;font-size:14px;display:inline-flex;align-items:center;gap:6px}
.btn-link-light{color:var(--text);opacity:.9}.btn-link-light:hover{opacity:1}
.center{display:flex;justify-content:center;flex-wrap:wrap;gap:14px}

/* nav */
.nav{position:sticky;top:0;z-index:50;transition:background .3s,box-shadow .3s,border-color .3s;border-bottom:1px solid transparent}
.nav-solid{background:rgba(14,10,12,.82);backdrop-filter:blur(16px);border-bottom-color:var(--line)}
.nav-in{max-width:1220px;margin:0 auto;padding:10px 24px;display:flex;align-items:center;gap:20px;min-height:78px}
.nav-logo{display:flex;align-items:center;transition:opacity .2s}
.nav-links{display:flex;gap:24px;margin-left:auto;font-size:14px;font-weight:600;color:var(--muted)}
.nav-links a{position:relative;padding:4px 0;transition:color .15s}
.nav-links a::after{content:"";position:absolute;left:0;right:100%;bottom:-2px;height:2px;background:var(--o);transition:right .22s}
.nav-links a:hover{color:var(--text)}.nav-links a:hover::after{right:0}
.nav-cta{margin-left:8px;padding:11px 20px;font-size:14px}
.nav-burger{display:none;margin-left:auto;background:none;border:none;color:var(--text);cursor:pointer}
.nav-mobile{display:flex;flex-direction:column;gap:16px;padding:18px 24px 24px;background:var(--bg2);border-top:1px solid var(--line);font-weight:600}

/* hero */
.hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden}
.hero-bg{position:absolute;inset:-10% 0;background-size:cover;background-position:center;will-change:transform;z-index:0;filter:saturate(1.05)}
.hero-mesh{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.85;
  background:radial-gradient(60% 60% at 12% 20%,rgba(255,106,61,.35),transparent 60%),
  radial-gradient(50% 50% at 90% 85%,rgba(122,31,56,.5),transparent 60%);animation:mesh 16s ease-in-out infinite alternate}
@keyframes mesh{to{transform:translate3d(0,-3%,0) scale(1.08)}}
.hero-veil{position:absolute;inset:0;z-index:2;background:
  linear-gradient(90deg,rgba(14,10,12,.94),rgba(14,10,12,.7) 45%,rgba(14,10,12,.35) 80%,rgba(14,10,12,.15)),
  linear-gradient(180deg,rgba(14,10,12,.6),transparent 30%,rgba(14,10,12,0) 70%,var(--bg))}
.hero-in{position:relative;z-index:3;max-width:1220px;margin:0 auto;padding:140px 24px;width:100%}
.hero-copy{max-width:760px;will-change:transform,opacity}
.hero h1{font-size:clamp(40px,6.4vw,80px);font-weight:900;letter-spacing:-.025em;text-shadow:0 4px 40px rgba(0,0,0,.4)}
.hl{color:var(--o2);font-style:italic}
.lead{font-size:clamp(16px,1.6vw,20px);color:rgba(245,237,231,.86);line-height:1.66;margin:34px 0 40px;max-width:580px}
.hero-cta{display:flex;flex-wrap:wrap;gap:16px;align-items:center}
.hero-wa{display:inline-flex;margin-top:22px}
.hero-scroll{position:absolute;left:50%;bottom:30px;transform:translateX(-50%);z-index:3;width:24px;height:40px;
  border:2px solid rgba(255,255,255,.45);border-radius:14px;display:flex;justify-content:center;padding-top:7px}
.hero-scroll span{width:4px;height:9px;border-radius:2px;background:#fff;animation:scrolldot 1.6s ease-in-out infinite}
@keyframes scrolldot{0%{opacity:0;transform:translateY(-4px)}40%{opacity:1}80%{opacity:0;transform:translateY(10px)}}

/* marquee */
.marquee{position:relative;z-index:2;overflow:hidden;border-top:1px solid var(--line);border-bottom:1px solid var(--line);
  background:var(--bg2);padding:20px 0}
.marquee-track{display:flex;width:max-content;animation:scrollx 34s linear infinite}
.marquee-track span{display:inline-flex}
.marquee em{display:inline-flex;align-items:center;font-family:var(--font-display),serif;font-style:italic;
  font-size:clamp(22px,3vw,34px);color:var(--muted);font-weight:600;white-space:nowrap}
.marquee em i{color:var(--o);font-style:normal;margin:0 26px}
@keyframes scrollx{to{transform:translateX(-50%)}}

/* secciones */
.sec{position:relative;z-index:2;max-width:1220px;margin:0 auto;padding:120px 24px}
.sec-head{max-width:780px;margin:0 auto 72px;text-align:center}
.sec-head-left{text-align:left;margin-left:0}
.kicker{display:block;font-size:12px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:var(--o);margin-bottom:24px}
.kicker-left{text-align:left}
.sec-head h2,.sec h2{font-size:clamp(30px,4.4vw,52px);font-weight:700;text-wrap:balance;line-height:1.05}
.sec-head .sub{margin:28px auto 0}
.h2-left{text-align:left!important;margin:0!important}
.sub{color:var(--muted);font-size:17px;max-width:660px;margin:0 auto;line-height:1.7}
.sub-tight{margin-top:20px}
.p-lg{font-size:17px;color:#cdc3bc;line-height:1.8;margin-top:24px}

/* bento */
.bento{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.bento-cell{background:var(--panel);border:1px solid var(--line);border-radius:22px;padding:30px;
  display:flex;flex-direction:column;gap:12px;transition:transform .2s,border-color .2s,background .2s}
.bento-cell:hover{transform:translateY(-4px);border-color:var(--line2);background:#211719}
.bento-cell h3{font-size:20px;margin-top:6px}
.bento-cell p{color:var(--muted);font-size:14.5px;line-height:1.65}
.bento-lg{grid-column:span 2;grid-row:span 2;justify-content:flex-end;
  background:linear-gradient(160deg,#231619,#170f11);border-color:var(--line2)}
.bento-lg h3{font-size:clamp(24px,2.4vw,32px)}
.bento-lg p{font-size:16px}
.bento-wide{grid-column:span 2}

/* scroll story */
.story{position:relative;z-index:2;max-width:1220px;margin:0 auto;padding:120px 24px}
.story-in{display:grid;grid-template-columns:.92fr 1.08fr;gap:60px;align-items:start}
.story-sticky{position:sticky;top:110px;height:fit-content}
.story-card{background:linear-gradient(160deg,#231619,#160e10);border:1px solid var(--line2);border-radius:28px;
  padding:44px;min-height:420px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden}
.story-card::before{content:"";position:absolute;top:-40%;right:-20%;width:70%;height:80%;
  background:radial-gradient(circle,rgba(255,106,61,.28),transparent 70%);filter:blur(10px)}
.story-num{position:relative;font-family:var(--font-display),serif;font-weight:900;font-size:120px;line-height:1;
  color:transparent;-webkit-text-stroke:1.5px rgba(255,179,122,.5);margin-bottom:8px}
.story-ic{position:relative;width:96px;height:96px;border-radius:24px;background:rgba(255,106,61,.12);
  border:1px solid rgba(255,106,61,.3);display:flex;align-items:center;justify-content:center;margin-bottom:22px}
.story-card h3{position:relative;font-size:28px;margin-bottom:12px}
.story-card p{position:relative;color:var(--muted);font-size:16px;line-height:1.7;max-width:420px}
.story-dots{position:relative;display:flex;gap:8px;margin-top:28px}
.story-dots span{width:26px;height:4px;border-radius:2px;background:rgba(255,255,255,.14);transition:background .3s}
.story-dots span.on{background:var(--o)}
.story-steps{display:flex;flex-direction:column;gap:20px}
.story-step{display:flex;gap:20px;padding:28px;border-radius:20px;border:1px solid var(--line);
  background:var(--panel);opacity:.42;transition:opacity .3s,border-color .3s,transform .3s}
.story-step.active{opacity:1;border-color:rgba(255,106,61,.4);transform:translateX(6px)}
.story-step-n{flex:none;width:48px;height:48px;border-radius:14px;background:rgba(255,106,61,.1);
  display:flex;align-items:center;justify-content:center}
.story-step h4{font-family:var(--font-display),serif;font-size:19px;font-weight:700;margin-bottom:6px}
.story-step p{color:var(--muted);font-size:14.5px;line-height:1.6}

/* ejemplos */
.ejemplos{display:grid;grid-template-columns:1fr 1fr;gap:26px;max-width:980px;margin:0 auto}
.ejemplo{border:1px solid var(--line);border-radius:24px;overflow:hidden;background:var(--panel);
  transition:transform .2s,box-shadow .2s,border-color .2s;display:block}
.ejemplo:hover{transform:translateY(-5px);box-shadow:0 34px 70px rgba(0,0,0,.5);border-color:var(--line2)}
.ejemplo-img{position:relative;height:250px;background-size:cover;background-position:center;
  display:flex;align-items:center;justify-content:center;transition:transform .4s}
.ejemplo:hover .ejemplo-img{transform:scale(1.04)}
.ejemplo-img::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,10,12,.1),rgba(14,10,12,.6))}
.ej-play{position:relative;z-index:1;width:66px;height:66px;border-radius:50%;
  background:linear-gradient(135deg,#ff6a3d,#ffa057);display:flex;align-items:center;justify-content:center;
  box-shadow:0 16px 36px rgba(0,0,0,.5)}
.ej-360{position:absolute;top:16px;right:16px;z-index:1;background:rgba(14,10,12,.7);backdrop-filter:blur(6px);
  color:#fff;font-weight:800;font-size:12px;padding:5px 12px;border-radius:999px;border:1px solid var(--line2)}
.ejemplo-body{padding:26px}
.ejemplo-body h3{font-size:22px}
.ejemplo-body p{color:var(--muted);font-size:14px;margin:8px 0 16px}

/* split */
.split{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
.incluye{background:var(--panel);border:1px solid var(--line);border-radius:24px;padding:32px}
.incluye-t{font-weight:800;text-transform:uppercase;letter-spacing:.14em;font-size:12px;color:var(--o);margin-bottom:22px}
.incluye-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.incluye-grid span{display:inline-flex;align-items:center;gap:9px;font-size:14px;color:#cdc3bc}

/* ampliá */
.ampliar-panel{background:linear-gradient(160deg,#2a1a13,#1a1010);border:1px solid rgba(255,106,61,.28);
  border-radius:30px;padding:44px;box-shadow:0 30px 70px rgba(255,106,61,.1);margin-bottom:80px}
.ampliar-head{text-align:center;max-width:660px;margin:0 auto 40px}
.ampliar-badge{display:inline-block;font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;
  color:#241209;background:linear-gradient(135deg,#ff6a3d,#ffa057);padding:7px 16px;border-radius:999px;margin-bottom:20px}
.ampliar-head h3{font-size:clamp(26px,3.4vw,38px)}
.ampliar-head p{color:var(--muted);font-size:16px;margin-top:16px;line-height:1.7}
.sub-block{margin-top:8px}
.mini-title{text-align:center;font-size:clamp(22px,2.8vw,30px);font-weight:700}

.cards-4{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.cards-3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:44px}
.cards-tight{margin-top:0}
.card{background:var(--panel);border:1px solid var(--line);border-radius:22px;padding:30px;transition:transform .2s,box-shadow .2s,border-color .2s}
.card:hover{transform:translateY(-5px);box-shadow:0 26px 54px rgba(0,0,0,.4);border-color:var(--line2)}
.card-ic{display:inline-flex;width:48px;height:48px;border-radius:14px;background:rgba(255,106,61,.12);
  align-items:center;justify-content:center;margin-bottom:6px}
.card h3,.card .card-h{font-size:20px;margin:16px 0 10px;font-family:var(--font-display),serif;font-weight:700}
.card p{color:var(--muted);font-size:14px;line-height:1.65}
.card-tier .tier-tag{display:inline-block;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;
  color:var(--o);background:rgba(255,106,61,.12);padding:7px 14px;border-radius:999px;margin-bottom:16px}
.card-tier h3{font-size:22px}
.card-tier-hl{background:linear-gradient(160deg,#2a1a13,#1a1010);border-color:rgba(255,106,61,.35);box-shadow:0 26px 58px rgba(255,106,61,.14)}

/* feature (experiencias) */
.sec-feature{position:relative;z-index:2;background:linear-gradient(180deg,#160e10,#0e0a0c);
  border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:130px 24px;text-align:center}
.feature-in{max-width:980px;margin:0 auto}
.eyebrow{display:inline-block;font-size:12px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--o2);
  background:rgba(255,106,61,.12);border:1px solid rgba(255,106,61,.32);padding:7px 16px;border-radius:999px;margin-bottom:26px}
.h2-light{font-size:clamp(28px,4vw,46px)}
.sub-light{margin:26px auto 0;color:rgba(245,237,231,.72)}
.exp-grid{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin:44px 0 38px}
.exp-chip{display:inline-flex;align-items:center;gap:9px;background:rgba(255,255,255,.05);border:1px solid var(--line);
  color:#e7ddd6;border-radius:999px;padding:11px 18px;font-size:14px;font-weight:500;transition:border-color .2s,background .2s}
.exp-chip:hover{border-color:rgba(255,106,61,.4);background:rgba(255,106,61,.08)}
.exp-ex{color:rgba(245,237,231,.9);font-size:clamp(18px,2.1vw,23px);line-height:1.7;font-style:italic;
  font-family:var(--font-display),serif;margin:0 auto 40px;max-width:740px}

.benef{display:flex;align-items:center;gap:16px;background:var(--panel);border:1px solid var(--line);border-radius:18px;
  padding:22px;font-weight:600;color:#cdc3bc;transition:transform .2s,border-color .2s}
.benef:hover{transform:translateY(-3px);border-color:var(--line2)}
.benef .card-ic{margin-bottom:0;width:42px;height:42px;flex:none}
.pay-note{max-width:800px;margin:44px auto 0;text-align:center;color:var(--muted);font-size:14px;line-height:1.8}

.faq{max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:14px}
.faq-item{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:2px 24px;transition:border-color .2s}
.faq-item[open]{border-color:var(--line2)}
.faq-item summary{cursor:pointer;font-weight:700;font-size:16px;padding:20px 0;list-style:none;
  display:flex;justify-content:space-between;align-items:center;gap:18px}
.faq-item summary::-webkit-details-marker{display:none}
.faq-item summary::after{content:"+";color:var(--o);font-size:26px;font-weight:300;line-height:1;flex:none}
.faq-item[open] summary::after{content:"–"}
.faq-item p{color:var(--muted);font-size:15px;line-height:1.75;padding:0 0 22px}

/* CTA final */
.cta-final{position:relative;z-index:2;overflow:hidden;text-align:center;padding:150px 24px}
.cta-bg{position:absolute;inset:0;background-size:cover;background-position:center;z-index:0}
.cta-veil{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(14,10,12,.86),rgba(14,10,12,.9)),
  radial-gradient(60% 60% at 50% 30%,rgba(255,106,61,.28),transparent 70%)}
.cta-in{position:relative;z-index:2;max-width:860px;margin:0 auto}
.cta-final h2{font-size:clamp(30px,4.8vw,52px);font-weight:700;margin:20px auto 20px;text-wrap:balance}
.cta-final p{color:rgba(245,237,231,.82);font-size:19px;margin-bottom:38px}
.cta-final .hero-wa{margin-top:22px}

/* footer */
.foot{position:relative;z-index:2;background:#0a0708;color:#a99e97;padding:72px 24px 34px;border-top:1px solid var(--line)}
.foot-grid{max-width:1220px;margin:0 auto;display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;
  padding-bottom:40px;border-bottom:1px solid var(--line)}
.foot-brand>div{justify-content:flex-start!important}
.foot-brand .foot-desc{margin-top:22px;font-size:14px;line-height:1.65;max-width:340px;color:#8a7f78}
.foot-col h4{font-size:13px;text-transform:uppercase;letter-spacing:.12em;color:var(--text);margin-bottom:18px;font-weight:700}
.foot-col{display:flex;flex-direction:column;gap:12px;font-size:14px}
.foot-col a{color:#a99e97;transition:color .15s}.foot-col a:hover{color:var(--o2)}
.foot-bottom{max-width:1220px;margin:30px auto 0;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}
.foot-copy{font-size:12.5px;color:#6f655f}
.foot-power{display:inline-flex;align-items:center;gap:14px;font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:#6f655f;font-weight:600}

.wa-float{position:fixed;right:22px;bottom:22px;width:56px;height:56px;border-radius:50%;background:#25D366;color:#fff;
  display:flex;align-items:center;justify-content:center;box-shadow:0 12px 32px rgba(37,211,102,.5);z-index:60;transition:transform .18s}
.wa-float:hover{transform:scale(1.08)}
.sticky-cta{display:none}

.reveal{opacity:0;transform:translateY(30px);transition:opacity .8s ease,transform .8s ease}
.reveal.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){
  .reveal{opacity:1;transform:none;transition:none}
  .hero-bg,.hero-mesh{transform:none!important;animation:none}
  .marquee-track{animation:none}.hero-scroll{display:none}
}

@media(max-width:960px){
  .bento{grid-template-columns:1fr 1fr}
  .bento-lg{grid-column:span 2;grid-row:auto}
  .story-in{grid-template-columns:1fr;gap:32px}
  .story-sticky{position:static}
  .story-card{min-height:auto}
  .split,.ejemplos{grid-template-columns:1fr;gap:36px}
  .steps{grid-template-columns:1fr 1fr}
  .cards-4,.cards-3{grid-template-columns:1fr 1fr}
  .nav-links,.nav-cta{display:none}
  .nav-burger{display:block}
  .foot-grid{grid-template-columns:1fr 1fr}
  .ampliar-panel{padding:28px}
}
@media(max-width:560px){
  .bento,.cards-4,.cards-3,.incluye-grid,.foot-grid{grid-template-columns:1fr}
  .btn{width:100%}
  .hero-cta{flex-direction:column;align-items:stretch}
  .hero-in{padding:120px 22px 90px}
  .sec,.story,.sec-feature{padding:80px 20px}
  .sec-head{margin-bottom:48px}
  .foot-bottom{flex-direction:column;align-items:flex-start}
  .sticky-cta{display:block;position:fixed;left:12px;right:12px;bottom:12px;z-index:59;text-align:center;
    background:linear-gradient(135deg,#ff6a3d,#ffa057);color:#241209;font-weight:700;padding:15px;border-radius:14px;
    box-shadow:0 12px 30px rgba(255,106,61,.45)}
  .wa-float{bottom:78px}
}
`
