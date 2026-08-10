'use client'

import { useState } from 'react'
import { BrandLogos } from '@/components/BrandLogos'
import {
  Menu, X, Camera, Compass, MapPin, Sparkles, Video, Plane, Images,
  Film, Building2, Users, CheckCircle2, ChevronRight, MessageCircle,
} from 'lucide-react'

/* ─────────────────────────────────────────────────────────────
   LANDING PRINCIPAL · Mendoza Bureau × El Faro 360
   Comercial / informativa. Sin precios. CTA → formulario del socio.
   Estética premium clara (crema/blanco + naranja de acento).
   ───────────────────────────────────────────────────────────── */

const FORM_SOCIO = '/form/socio'
const SERVICIOS = '/servicios-adicionales'
const WA = 'https://wa.me/5492616657058'
const TOUR_MARGOT = 'https://elfaro360.com/tour-virtuales/bodegas/destacadas/margot/'
const TOUR_PALOMA = 'https://elfaro360.com/tour-virtuales/gastronomia/cafeterias/paloma/'
const O = '#f15a24'

const NAV = [
  ['Qué es', '#que-es'], ['Cómo funciona', '#como'], ['Ejemplos', '#ejemplos'],
  ['Ampliá', '#ampliar'], ['Servicios', '#servicios'], ['Beneficios', '#beneficios'], ['FAQ', '#faq'],
] as const

export default function PlataformaLanding() {
  const [menu, setMenu] = useState(false)

  return (
    <div className="mb-landing">
      <style>{CSS}</style>

      {/* ── Navbar ── */}
      <header className="nav">
        <div className="nav-in">
          <a href="#top" className="nav-logos"><BrandLogos logos={['bureau', 'faro']} color size={38} /></a>
          <nav className="nav-links">
            {NAV.map(([t, h]) => <a key={h} href={h}>{t}</a>)}
          </nav>
          <a href={FORM_SOCIO} className="btn btn-primary nav-cta">Quiero virtualizar mi espacio</a>
          <button className="nav-burger" onClick={() => setMenu(m => !m)} aria-label="Menú">
            {menu ? <X size={22} /> : <Menu size={22} />}
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
        <div className="hero-in">
          <span className="eyebrow">Plataforma inmersiva · Mendoza Bureau × El Faro 360</span>
          <h1>Mostrá tu espacio, servicio o experiencia dentro de <span className="hl">Mendoza Bureau en 360°</span></h1>
          <p className="lead">
            Junto a El Faro 360 estamos virtualizando los espacios, servicios y experiencias de los socios
            de Mendoza Bureau, para que organizadores, empresas y visitantes puedan conocerlos antes de llegar.
          </p>
          <div className="hero-cta">
            <a href={FORM_SOCIO} className="btn btn-primary">Quiero virtualizar mi espacio</a>
            <a href="#ejemplos" className="btn btn-ghost">Ver ejemplos</a>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="btn-link">Consultar por WhatsApp</a>
          </div>
          <div className="hero-bullets">
            <span><CheckCircle2 size={16} /> Mostrá tu espacio antes de la visita</span>
            <span><CheckCircle2 size={16} /> Destacá ambientes y servicios</span>
            <span><CheckCircle2 size={16} /> Generá contenido reutilizable</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden>
          <div className="hero-sphere"><Compass size={60} color={O} /></div>
          <div className="hero-badge b1"><MapPin size={15} color={O} /> 360°</div>
          <div className="hero-badge b2"><Camera size={15} color={O} /> Recorrido</div>
        </div>
      </section>

      {/* ── Qué estamos haciendo ── */}
      <section id="que-es" className="sec">
        <h2>¿Qué estamos haciendo?</h2>
        <div className="two">
          <p className="p-lg">
            Mendoza Bureau impulsa una <b>plataforma inmersiva institucional</b> donde sus socios pueden
            mostrar espacios, servicios y experiencias de forma profesional e interactiva.
          </p>
          <p className="p-lg">
            El Faro 360 desarrolla los <b>recorridos virtuales 360°</b>, la experiencia inmersiva y los
            contenidos complementarios. No es simplemente una sesión de fotos: es una <b>herramienta
            institucional</b> para mostrar toda la oferta de los socios.
          </p>
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section id="como" className="sec sec-soft">
        <h2>Cómo funciona</h2>
        <p className="sub">Del primer contacto a tu recorrido publicado, en 5 pasos.</p>
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
      <section id="ejemplos" className="sec">
        <h2>Mirá cómo se vive un recorrido 360°</h2>
        <p className="sub">Ejemplos reales producidos por El Faro 360.</p>
        <div className="ejemplos">
          {[
            ['Bodega Margot', 'Enoturismo · recorrido inmersivo', TOUR_MARGOT, 'Explorar Bodega Margot'],
            ['Café Paloma', 'Gastronomía · experiencia 360°', TOUR_PALOMA, 'Explorar Café Paloma'],
          ].map(([nom, desc, url, cta]) => (
            <a key={nom} href={url} target="_blank" rel="noopener noreferrer" className="ejemplo">
              <div className="ejemplo-img"><Compass size={44} color="#fff" /><span className="ej-360">360°</span></div>
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
      <section className="sec sec-soft">
        <div className="two two-mid">
          <div>
            <span className="eyebrow">Tour base</span>
            <h2 style={{ marginTop: 8 }}>Tu recorrido comienza con 5 panoramas 360°</h2>
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
      <section id="ampliar" className="sec">
        <h2>Ampliá tu recorrido</h2>
        <p className="sub">Hay espacios donde 5 puntos alcanzan, y otros donde vale mostrar más. Elegí cuánto querés mostrar.</p>
        <div className="cards-4">
          {[
            ['Panorama adicional', 'Para incorporar un punto puntual que no entró en los 5 iniciales.'],
            ['Pack 3', 'Ideal para espacios pequeños o medianos con algunos sectores más.'],
            ['Pack 5', 'Ideal para hoteles, bodegas o restaurantes con varias áreas relevantes.'],
            ['Pack 10', 'Para proyectos de mayor escala y experiencias más completas.'],
          ].map(([t, d]) => (
            <div key={t} className="card">
              <MapPin size={22} color={O} />
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Experiencias inmersivas ── */}
      <section className="sec sec-dark">
        <span className="eyebrow eyebrow-light">A medida</span>
        <h2 className="h2-light">Experiencias inmersivas</h2>
        <p className="sub sub-light">
          Además de recorrer un espacio, diseñamos experiencias <b>dentro del propio tour</b>.
        </p>
        <div className="exp-grid">
          {['Cata guiada', 'Experiencia gastronómica', 'Recorrido por un proceso productivo', 'Un sommelier explicando un varietal',
            'Un chef presentando un plato', 'Personal mostrando una habitación', 'Hotspots especiales e interactivos',
            'Juegos, búsqueda de objetos, beneficios'].map(x => (
            <span key={x} className="exp-chip"><Sparkles size={14} color={O} /> {x}</span>
          ))}
        </div>
        <p className="exp-ex">
          “Imaginá recorrer una bodega y, al acercarte a una estación de degustación, activar un
          <b> video 360°</b> donde una persona explica uno de los varietales.”
        </p>
        <a href={WA} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Quiero crear una experiencia</a>
      </section>

      {/* ── Aprovechá la visita (audiovisual) ── */}
      <section id="servicios" className="sec">
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
                <Icon size={22} color={O} />
                <h3>{t as string}</h3>
                <p>{d as string}</p>
              </div>
            )
          })}
        </div>
        <div className="center"><a href={SERVICIOS} className="btn btn-primary">Ver servicios disponibles</a></div>
      </section>

      {/* ── ¿Cuánto querés mostrar? ── */}
      <section className="sec sec-soft">
        <h2>¿Cuánto querés mostrar?</h2>
        <p className="sub">Cada proyecto se personaliza según las características de tu espacio.</p>
        <div className="cards-3">
          {[
            ['Esencial', 'Mostrá lo más importante', 'Los cinco puntos principales de tu espacio.'],
            ['Ampliado', 'Mostrá más ambientes', 'Más sectores, habitaciones, salones, terrazas o exteriores.'],
            ['Experiencia completa', 'Contá toda la experiencia', 'Tour + más panoramas + fotografía + video + drone + contenido inmersivo.'],
          ].map(([t, s, d]) => (
            <div key={t} className="card card-tier">
              <span className="tier-tag">{t}</span>
              <h3>{s}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Empresas de servicios ── */}
      <section className="sec">
        <div className="two two-mid">
          <div>
            <Building2 size={26} color={O} />
            <h2 style={{ marginTop: 10 }}>¿Ofrecés servicios y no tenés un espacio para recorrer?</h2>
            <p className="p-lg">También podemos integrar tu empresa dentro de la plataforma.</p>
            <a href={FORM_SOCIO} className="btn btn-primary" style={{ marginTop: 8 }}>Quiero mostrar mis servicios</a>
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
      <section id="beneficios" className="sec sec-soft">
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
            return <div key={t as string} className="benef"><Icon size={20} color={O} /><span>{t as string}</span></div>
          })}
        </div>
      </section>

      {/* ── Formas de pago ── */}
      <section className="sec">
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
      <section id="faq" className="sec sec-soft">
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
      <section className="cta-final">
        <h2>Tu espacio puede ser parte de la plataforma inmersiva de Mendoza Bureau</h2>
        <p>Mostralo mejor. Explicalo mejor. Hacelo recorrible.</p>
        <div className="hero-cta center">
          <a href={FORM_SOCIO} className="btn btn-primary btn-lg">Quiero virtualizar mi espacio</a>
          <a href="#ejemplos" className="btn btn-ghost btn-ghost-dark">Ver ejemplos</a>
          <a href={WA} target="_blank" rel="noopener noreferrer" className="btn-link btn-link-light">Consultar por WhatsApp</a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="foot">
        <div className="foot-logos"><BrandLogos logos={['bureau', 'faro']} color size={34} /></div>
        <div className="foot-links">
          <a href="#que-es">Proyecto</a><a href="#ejemplos">Ejemplos</a>
          <a href="#servicios">Servicios</a><a href="#faq">Preguntas frecuentes</a>
          <a href={WA} target="_blank" rel="noopener noreferrer">Contacto</a>
        </div>
        <p className="foot-copy">Mendoza Bureau · Convention &amp; Visitors Bureau — producido por El Faro 360</p>
      </footer>

      {/* ── WhatsApp flotante + CTA sticky mobile ── */}
      <a href={WA} target="_blank" rel="noopener noreferrer" className="wa-float" aria-label="WhatsApp"><MessageCircle size={24} /></a>
      <a href={FORM_SOCIO} className="sticky-cta">Quiero virtualizar mi espacio</a>
    </div>
  )
}

const CSS = `
.mb-landing{--o:#f15a24;--ink:#1b1b1f;--muted:#6b6b73;--cream:#faf7f2;--soft:#f3efe9;--line:#eadfd4;
  background:#fff;color:var(--ink);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  -webkit-font-smoothing:antialiased;overflow-x:hidden;}
.mb-landing *{box-sizing:border-box}
.mb-landing h1,.mb-landing h2,.mb-landing h3{margin:0;letter-spacing:-.02em;line-height:1.1}
.mb-landing p{margin:0}
.mb-landing a{color:inherit;text-decoration:none}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:700;font-size:15px;
  padding:13px 22px;border-radius:999px;cursor:pointer;transition:transform .15s,box-shadow .15s,background .15s;border:none}
.btn-primary{background:linear-gradient(135deg,#f15a24,#ff7a45);color:#fff;box-shadow:0 8px 22px rgba(241,90,36,.28)}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 12px 28px rgba(241,90,36,.36)}
.btn-lg{padding:16px 30px;font-size:16px}
.btn-ghost{background:#fff;color:var(--ink);border:1px solid var(--line)}
.btn-ghost:hover{background:var(--cream)}
.btn-ghost-dark{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.4)}
.btn-link{color:var(--o);font-weight:700;font-size:14px;display:inline-flex;align-items:center;gap:4px}
.btn-link-light{color:#fff}
.center{display:flex;justify-content:center;flex-wrap:wrap;gap:12px}

/* nav */
.nav{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.85);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.nav-in{max-width:1200px;margin:0 auto;padding:12px 20px;display:flex;align-items:center;gap:18px}
.nav-logos{display:flex}
.nav-links{display:flex;gap:20px;margin-left:auto;font-size:14px;font-weight:600;color:var(--muted)}
.nav-links a:hover{color:var(--o)}
.nav-cta{margin-left:8px;padding:10px 18px;font-size:14px}
.nav-burger{display:none;margin-left:auto;background:none;border:none;color:var(--ink);cursor:pointer}
.nav-mobile{display:flex;flex-direction:column;gap:14px;padding:16px 20px 20px;border-top:1px solid var(--line);font-weight:600}
.nav-mobile a{color:var(--ink)}

/* hero */
.hero{max-width:1200px;margin:0 auto;padding:64px 20px 40px;display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:center}
.eyebrow{display:inline-block;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--o);
  background:rgba(241,90,36,.08);border:1px solid rgba(241,90,36,.25);padding:6px 14px;border-radius:999px;margin-bottom:18px}
.eyebrow-light{background:rgba(241,90,36,.16);border-color:rgba(241,90,36,.4)}
.hero h1{font-size:clamp(30px,5vw,52px);font-weight:800}
.hl{color:var(--o)}
.lead{font-size:clamp(15px,2vw,19px);color:var(--muted);line-height:1.6;margin:18px 0 26px;max-width:560px}
.hero-cta{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
.hero-bullets{display:flex;flex-wrap:wrap;gap:16px;margin-top:26px;color:var(--muted);font-size:13px;font-weight:600}
.hero-bullets span{display:inline-flex;align-items:center;gap:6px}
.hero-bullets svg{color:var(--o)}
.hero-art{position:relative;height:340px;border-radius:28px;background:linear-gradient(135deg,#fff,#f3efe9);
  border:1px solid var(--line);box-shadow:0 30px 60px rgba(0,0,0,.06);display:flex;align-items:center;justify-content:center}
.hero-sphere{width:150px;height:150px;border-radius:50%;background:#fff;border:1px solid var(--line);
  box-shadow:0 20px 40px rgba(241,90,36,.14);display:flex;align-items:center;justify-content:center}
.hero-badge{position:absolute;background:#fff;border:1px solid var(--line);border-radius:12px;padding:8px 12px;
  font-weight:700;font-size:13px;display:inline-flex;align-items:center;gap:6px;box-shadow:0 10px 24px rgba(0,0,0,.08)}
.hero-badge.b1{top:34px;left:24px}
.hero-badge.b2{bottom:34px;right:24px}

/* secciones */
.sec{max-width:1200px;margin:0 auto;padding:64px 20px}
.sec-soft{background:var(--cream);max-width:none}
.sec-soft>*{max-width:1200px;margin-left:auto;margin-right:auto}
.sec h2,.sec-soft h2{font-size:clamp(24px,3.5vw,38px);font-weight:800;text-align:center}
.sub{text-align:center;color:var(--muted);font-size:16px;margin:12px auto 34px;max-width:640px;line-height:1.6}
.p-lg{font-size:17px;color:#3a3a42;line-height:1.7}
.two{display:grid;grid-template-columns:1fr 1fr;gap:34px}
.two-mid{align-items:center}

.steps{display:grid;grid-template-columns:repeat(5,1fr);gap:16px}
.step{background:#fff;border:1px solid var(--line);border-radius:18px;padding:22px}
.step-n{display:inline-flex;width:34px;height:34px;border-radius:50%;background:rgba(241,90,36,.1);color:var(--o);
  font-weight:800;align-items:center;justify-content:center;margin-bottom:12px}
.step h3{font-size:15px;margin-bottom:6px}
.step p{font-size:13px;color:var(--muted);line-height:1.5}

.ejemplos{display:grid;grid-template-columns:1fr 1fr;gap:22px;max-width:900px;margin:0 auto}
.ejemplo{border:1px solid var(--line);border-radius:22px;overflow:hidden;background:#fff;transition:transform .15s,box-shadow .15s;display:block}
.ejemplo:hover{transform:translateY(-3px);box-shadow:0 24px 48px rgba(0,0,0,.1)}
.ejemplo-img{position:relative;height:190px;background:linear-gradient(135deg,#f15a24,#ff8a5c);display:flex;align-items:center;justify-content:center}
.ej-360{position:absolute;top:12px;right:12px;background:rgba(255,255,255,.9);color:var(--o);font-weight:800;font-size:12px;padding:4px 10px;border-radius:999px}
.ejemplo-body{padding:20px}
.ejemplo-body h3{font-size:19px}
.ejemplo-body p{color:var(--muted);font-size:14px;margin:6px 0 14px}

.incluye{background:#fff;border:1px solid var(--line);border-radius:22px;padding:24px}
.incluye-t{font-weight:800;text-transform:uppercase;letter-spacing:.1em;font-size:12px;color:var(--o);margin-bottom:14px}
.incluye-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.incluye-grid span{display:inline-flex;align-items:center;gap:8px;font-size:14px;color:#3a3a42}

.cards-4{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.cards-3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:24px;transition:transform .15s,box-shadow .15s}
.card:hover{transform:translateY(-3px);box-shadow:0 20px 40px rgba(0,0,0,.07)}
.card h3{font-size:18px;margin:12px 0 8px}
.card p{color:var(--muted);font-size:14px;line-height:1.6}
.card-tier .tier-tag{display:inline-block;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;
  color:var(--o);background:rgba(241,90,36,.1);padding:5px 12px;border-radius:999px;margin-bottom:10px}

.sec-dark{background:var(--ink);max-width:none;text-align:center}
.sec-dark>*{max-width:900px;margin-left:auto;margin-right:auto}
.h2-light{color:#fff}
.sub-light{color:rgba(255,255,255,.7)}
.exp-grid{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:26px}
.exp-chip{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);
  color:#eee;border-radius:999px;padding:9px 16px;font-size:14px}
.exp-ex{color:rgba(255,255,255,.85);font-size:17px;line-height:1.7;font-style:italic;margin-bottom:26px}

.benef{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px 20px;font-weight:600;color:#3a3a42}
.pay-note{max-width:760px;margin:26px auto 0;text-align:center;color:var(--muted);font-size:14px;line-height:1.7}

.faq{max-width:820px;margin:0 auto;display:flex;flex-direction:column;gap:10px}
.faq-item{background:#fff;border:1px solid var(--line);border-radius:14px;padding:4px 18px}
.faq-item summary{cursor:pointer;font-weight:700;font-size:15px;padding:14px 0;list-style:none;display:flex;justify-content:space-between;align-items:center}
.faq-item summary::-webkit-details-marker{display:none}
.faq-item summary::after{content:"+";color:var(--o);font-size:22px;font-weight:400}
.faq-item[open] summary::after{content:"–"}
.faq-item p{color:var(--muted);font-size:14px;line-height:1.65;padding:0 0 16px}

.cta-final{background:linear-gradient(135deg,#1b1b1f,#2a2118);color:#fff;text-align:center;padding:72px 20px}
.cta-final h2{font-size:clamp(24px,4vw,40px);font-weight:800;max-width:820px;margin:0 auto 12px;text-wrap:balance}
.cta-final p{color:rgba(255,255,255,.75);font-size:18px;margin-bottom:28px}

.foot{background:#111;color:#aaa;padding:40px 20px;text-align:center}
.foot-logos{display:flex;justify-content:center;margin-bottom:18px}
.foot-links{display:flex;flex-wrap:wrap;gap:20px;justify-content:center;font-size:14px;font-weight:600;margin-bottom:16px}
.foot-links a{color:#ccc}.foot-links a:hover{color:var(--o)}
.foot-copy{font-size:12px;color:#666}

.wa-float{position:fixed;right:18px;bottom:18px;width:52px;height:52px;border-radius:50%;background:#25D366;color:#fff;
  display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(37,211,102,.45);z-index:60}
.sticky-cta{display:none}

@media(max-width:900px){
  .hero{grid-template-columns:1fr;padding-top:40px}
  .hero-art{height:240px;order:-1}
  .two,.ejemplos{grid-template-columns:1fr}
  .steps{grid-template-columns:1fr 1fr}
  .cards-4,.cards-3{grid-template-columns:1fr 1fr}
  .nav-links,.nav-cta{display:none}
  .nav-burger{display:block}
}
@media(max-width:560px){
  .steps,.cards-4,.cards-3,.incluye-grid{grid-template-columns:1fr}
  .btn{width:100%}
  .hero-cta{flex-direction:column;align-items:stretch}
  .hero-cta .btn-link{text-align:center;padding:6px}
  .sticky-cta{display:block;position:fixed;left:12px;right:12px;bottom:12px;z-index:59;text-align:center;
    background:linear-gradient(135deg,#f15a24,#ff7a45);color:#fff;font-weight:700;padding:14px;border-radius:14px;
    box-shadow:0 8px 24px rgba(241,90,36,.4)}
  .wa-float{bottom:74px}
  .sec{padding:44px 18px}
}
`
