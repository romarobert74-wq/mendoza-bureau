'use client'

import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { getSocios } from '@/lib/firestore'
import { CATEGORIAS } from '@/types'
import type { Socio } from '@/types'
import toast from 'react-hot-toast'
import {
  FileSpreadsheet, Link2, BookOpen, Server, Copy, Check, Loader2, ExternalLink, FileDown,
} from 'lucide-react'

// Dominio base para las URLs de producción del webmaster
const DOMINIO = 'mendozabureau.com'
// Base actual del sistema (Vercel) para los links operativos
const APP = 'https://mendoza-bureau.vercel.app'
const FORM_SOCIO = `${APP}/form/socio`

// "Hilton Mendoza Hotel" → "hilton-mendoza-hotel"
function slug(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function urlSocio(socio: Socio): string {
  return `${DOMINIO}/${socio.categoria}/${slug(socio.razonSocial)}`
}

const estadoTxt = (s: Socio) => (s.activo ? 'Activo' : s.razonSocial ? 'Pendiente' : 'Inactivo')

export function DocumentacionSection() {
  const [socios, setSocios] = useState<Socio[]>([])
  const [cargando, setCargando] = useState(true)
  const [copiado, setCopiado] = useState<string | null>(null)

  useEffect(() => {
    getSocios().then(setSocios).catch(() => {}).finally(() => setCargando(false))
  }, [])

  const copiar = (texto: string, key: string) => {
    navigator.clipboard.writeText(texto)
    setCopiado(key)
    toast.success('Copiado')
    setTimeout(() => setCopiado(null), 2000)
  }

  const exportarExcel = () => {
    const rows = [
      ['Razón Social', 'Categoría', 'Dirección', 'Estado', 'URL sugerida (webmaster)'],
      ...socios.map(s => [
        s.razonSocial,
        CATEGORIAS[s.categoria] ?? s.categoria,
        s.direccion || '',
        estadoTxt(s),
        urlSocio(s),
      ]),
    ]
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 32 }, { wch: 16 }, { wch: 40 }, { wch: 12 }, { wch: 46 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Socios')
    XLSX.writeFile(wb, `socios-mendoza-bureau-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const copiarEstructura = () => {
    const lineas = [
      `Tour madre:\t${DOMINIO}`,
      '',
      'Tours de socios:',
      ...socios.map(s => `${s.razonSocial}\t${urlSocio(s)}`),
    ]
    copiar(lineas.join('\n'), 'estructura')
  }

  return (
    <>
      {/* ── Exportable de socios ── */}
      <section className="kpi-card">
        <h3 className="font-semibold mb-1 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <FileSpreadsheet size={16} style={{ color: 'var(--orange-2)' }} /> Exportar socios (Excel)
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Planilla .xlsx con todos los socios (razón social, categoría, dirección, estado y la URL sugerida).
          Para entregar a directivos y al webmaster. {socios.length} socios.
        </p>
        <button onClick={exportarExcel} disabled={cargando} className="btn-primary">
          {cargando ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
          Descargar Excel
        </button>
      </section>

      {/* ── Estructura de URLs ── */}
      <section className="kpi-card">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Link2 size={16} style={{ color: 'var(--orange-2)' }} /> Estructura de URLs para el webmaster
          </h3>
          <button onClick={copiarEstructura} className="btn-outline" style={{ padding: '5px 10px', fontSize: '12px' }}>
            {copiado === 'estructura' ? <Check size={13} /> : <Copy size={13} />} Copiar todo
          </button>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Estructura que el webmaster debe crear en el servidor <b>{DOMINIO}</b>. Cada tour de socio se carga
          en su URL. Cuando sumes un socio nuevo, se agrega solo a esta lista.
        </p>
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 px-4 py-2.5" style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border)' }}>
            <span className="text-xs font-bold uppercase tracking-wide shrink-0" style={{ color: 'var(--orange-2)', width: '130px' }}>Tour madre</span>
            <code className="text-sm flex-1" style={{ color: 'var(--text)' }}>{DOMINIO}</code>
          </div>
          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
            {socios.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-2.5"
                style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <span className="text-xs shrink-0 truncate" style={{ color: 'var(--text-muted)', width: '130px' }}>{s.razonSocial}</span>
                <code className="text-sm flex-1 truncate" style={{ color: 'var(--text-2)' }}>{urlSocio(s)}</code>
                <button onClick={() => copiar(urlSocio(s), s.id)} className="transition hover:text-[var(--orange-2)] shrink-0" style={{ color: 'var(--icon)' }}>
                  {copiado === s.id ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            ))}
            {socios.length === 0 && !cargando && (
              <div className="px-4 py-6 text-sm text-center" style={{ color: 'var(--text-faint)' }}>No hay socios cargados.</div>
            )}
          </div>
        </div>
      </section>

      {/* ── Links útiles ── */}
      <section className="kpi-card">
        <h3 className="font-semibold mb-1 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <ExternalLink size={16} style={{ color: 'var(--orange-2)' }} /> Links del sistema
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Enlaces operativos para compartir y usar.</p>
        <div className="space-y-2">
          <LinkFila label="Formulario público del socio" desc="Se lo enviás al socio para que cargue sus datos" url={FORM_SOCIO} copiado={copiado === 'form'} onCopy={() => copiar(FORM_SOCIO, 'form')} />
          <LinkFila label="Panel de administración" desc="Acceso del equipo Bureau / El Faro" url={`${APP}/dashboard`} copiado={copiado === 'panel'} onCopy={() => copiar(`${APP}/dashboard`, 'panel')} />
          <LinkFila label="Web institucional (pública)" desc="Sitio público de Mendoza Bureau" url={`${APP}/web_bureau`} copiado={copiado === 'web'} onCopy={() => copiar(`${APP}/web_bureau`, 'web')} />
          <LinkFila label="Ficha de socio (WebFrame 3DVista)" desc="Reemplazá {ID} por el id del socio (botón Ver → Copiar)" url={`${APP}/tour/socio/ficha?id={ID}`} copiado={copiado === 'ficha'} onCopy={() => copiar(`${APP}/tour/socio/ficha?id={ID}`, 'ficha')} />
        </div>
      </section>

      {/* ── Documentos imprimibles ── */}
      <section className="kpi-card">
        <h3 className="font-semibold mb-1 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <BookOpen size={16} style={{ color: 'var(--orange-2)' }} /> Documentación
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Documentos para entregar. Se abren en una pestaña nueva; desde ahí "Imprimir / Guardar como PDF".
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => abrirDoc(manualHtml())} className="btn-outline">
            <BookOpen size={15} /> Manual de usuario
          </button>
          <button onClick={() => abrirDoc(migracionHtml(socios.length))} className="btn-outline">
            <Server size={15} /> Documento de migración
          </button>
        </div>
      </section>
    </>
  )
}

function LinkFila({ label, desc, url, copiado, onCopy }: {
  label: string; desc: string; url: string; copiado: boolean; onCopy: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</div>
        <code className="text-xs block truncate" style={{ color: 'var(--text-muted)' }}>{url}</code>
        <div className="text-[11px]" style={{ color: 'var(--text-faint)' }}>{desc}</div>
      </div>
      <button onClick={onCopy} className="btn-outline shrink-0" style={{ padding: '5px 10px', fontSize: '12px' }}>
        {copiado ? <Check size={13} /> : <Copy size={13} />} Copiar
      </button>
    </div>
  )
}

// ── Documentos imprimibles ─────────────────────────────────────────────────
function abrirDoc(html: string) {
  const w = window.open('', '_blank')
  if (!w) { alert('Permití las ventanas emergentes.'); return }
  w.document.write(html)
  w.document.close()
}

const DOC_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, -apple-system, sans-serif; color: #1c1917; padding: 48px; max-width: 820px; margin: 0 auto; line-height: 1.6; }
  .eyebrow { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #f15a24; }
  h1 { font-size: 28px; margin: 6px 0 4px; }
  .sub { color: #78716c; font-size: 14px; margin-bottom: 8px; }
  h2 { font-size: 17px; margin: 28px 0 8px; padding-bottom: 6px; border-bottom: 2px solid #f15a24; }
  h3 { font-size: 14px; margin: 16px 0 4px; color: #44403c; }
  p, li { font-size: 13.5px; color: #292524; }
  ul, ol { margin: 6px 0 6px 22px; }
  li { margin-bottom: 4px; }
  code { background: #f5f5f4; padding: 1px 6px; border-radius: 4px; font-size: 12.5px; }
  .box { background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 10px; padding: 14px 18px; margin: 12px 0; }
  .foot { margin-top: 40px; padding-top: 14px; border-top: 2px solid #1c1917; font-size: 11px; color: #a8a29e; display: flex; justify-content: space-between; }
  @media print { body { padding: 22px; } .noprint { display: none; } }
  .btn { display: inline-block; margin-top: 26px; background: #f15a24; color: #fff; border: none; border-radius: 8px; padding: 10px 22px; font-size: 14px; font-weight: 600; cursor: pointer; }
`

const docShell = (titulo: string, eyebrow: string, cuerpo: string) => `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${titulo}</title><style>${DOC_CSS}</style></head><body>
  <div class="eyebrow">${eyebrow}</div>
  <h1>${titulo}</h1>
  <div class="sub">Mendoza Bureau · El Faro 360 · ${new Date().toLocaleDateString('es-AR')}</div>
  ${cuerpo}
  <div class="foot"><span>Mendoza Bureau · Convention &amp; Visitors Bureau</span><span>Desarrollado por El Faro 360</span></div>
  <button class="btn noprint" onclick="window.print()">Imprimir / Guardar como PDF</button>
</body></html>`

function manualHtml(): string {
  return docShell('Manual de Usuario', 'Plataforma de gestión de tours', `
    <h2>1. Acceso</h2>
    <p>Ingresá a <code>${APP}/login</code> con tu email y contraseña. Según tu rol vas a ver distintas secciones:</p>
    <ul>
      <li><b>El Faro (superadmin):</b> acceso total, incluido Chat IA, Usuarios y Configuración.</li>
      <li><b>Bureau (admin):</b> gestión de socios y web institucional.</li>
      <li><b>Socio:</b> solo su propia ficha.</li>
    </ul>

    <h2>2. Dashboard</h2>
    <p>Muestra el resumen: socios activos por categoría, visitas a tours y clics de interacción.</p>

    <h2>3. Socios</h2>
    <h3>Alta de un socio</h3>
    <ol>
      <li>Botón <b>“Nuevo socio”</b>. Completá Información básica (razón social, categoría, dirección).</li>
      <li><b>Contacto</b>: WhatsApp, email, web y redes.</li>
      <li><b>Reseñas</b>: puntaje y link de Google / TripAdvisor.</li>
      <li><b>Ficha técnica</b> según categoría (hotel, bodega, etc.), <b>idiomas</b> con botones.</li>
      <li><b>Foto de portada</b> y <b>logo</b>: botón “Subir imagen”.</li>
      <li>Guardá. Luego podés cargar la <b>galería de fotos</b> (hasta 25).</li>
    </ol>
    <h3>Baja / edición</h3>
    <p>En la grilla: <b>ojo</b> (ver ficha e indicadores + reporte PDF), <b>lápiz</b> (editar), <b>tacho</b> (eliminar). Las columnas se ordenan haciendo clic en el encabezado.</p>
    <div class="box"><b>Link para el socio:</b> enviále <code>${FORM_SOCIO}</code> para que cargue sus datos sin necesidad de usuario. Los revisás y activás desde el panel.</div>

    <h2>4. Reportes de estadísticas</h2>
    <p>Entrá a un socio con el <b>ojo</b> y generá el <b>Reporte mensual o trimestral</b> (PDF): compara el período con el anterior y mide la conversión de leads (contactos ÷ visitas).</p>

    <h2>5. Tour Madre y Web Institucional</h2>
    <p><b>Tour Madre:</b> configura el menú del tour y los datos del Bureau. <b>Web Institucional:</b> edita el sitio público (hero, imagen de fondo, prensa, observatorio).</p>

    <h2>6. Chat IA</h2>
    <p>Configura el asistente (tono, modelo, prompt), carga documentos de conocimiento, prueba el bot y controla el consumo en la solapa <b>Costos</b> (crédito cargado, consultas y costo real).</p>

    <h2>7. Usuarios y Configuración</h2>
    <p><b>Usuarios:</b> alta/baja y cambio de rol. <b>Configuración:</b> tema claro/oscuro, logos, departamentos, categorías, y esta documentación.</p>
  `)
}

function migracionHtml(cantSocios: number): string {
  return docShell('Documento de Migración', 'Traspaso de la plataforma a Mendoza Bureau', `
    <p>La plataforma fue desarrollada por <b>El Faro 360</b>. Está compuesta por 4 servicios independientes.
    El día del traspaso, Mendoza Bureau crea sus propias cuentas y El Faro transfiere el contenido; solo cambian las credenciales, no el código.</p>

    <h2>Componentes</h2>
    <div class="box">
      <p><b>1. Código (GitHub):</b> el repositorio con todo el sistema. Se transfiere la propiedad a la cuenta de Mendoza Bureau.</p>
      <p><b>2. Hosting (Vercel):</b> donde corre la aplicación. Se conecta al repositorio transferido.</p>
      <p><b>3. Base de datos e imágenes (Firebase):</b> Firestore guarda socios, usuarios, configuración y las imágenes (integradas en los registros). Incluye el login (Authentication). Se exporta e importa al proyecto nuevo.</p>
      <p><b>4. Bot de IA (Anthropic):</b> la API del asistente. Se crea una cuenta nueva con su propia clave y crédito.</p>
    </div>

    <h2>Pasos</h2>
    <ol>
      <li><b>GitHub:</b> crear cuenta y recibir la transferencia del repositorio (Settings → Transfer ownership).</li>
      <li><b>Vercel:</b> crear cuenta, importar el repositorio (detecta Next.js automáticamente).</li>
      <li><b>Firebase:</b> crear proyecto, activar Firestore y Authentication (Email/Password), exportar los datos actuales e importarlos. Copiar las 6 credenciales.</li>
      <li><b>Anthropic:</b> crear cuenta, generar API Key y cargar crédito (ver estimación en Chat IA → Costos).</li>
      <li><b>Variables de entorno en Vercel:</b> cargar las 6 de Firebase + la API Key de Anthropic con los mismos nombres. Redeploy.</li>
      <li><b>Dominio:</b> apuntar <code>${DOMINIO}</code> en Vercel (Settings → Domains).</li>
    </ol>

    <h2>Estructura de URLs del tour</h2>
    <p>Actualmente hay <b>${cantSocios}</b> socios. El webmaster debe crear en <code>${DOMINIO}</code>:</p>
    <ul>
      <li>Tour madre: <code>${DOMINIO}</code></li>
      <li>Cada socio: <code>${DOMINIO}/categoria/nombre-del-socio</code> (ver el Excel exportable con la lista completa).</li>
    </ul>
    <div class="box"><b>Importante:</b> las imágenes viajan dentro de la base de datos (Firebase), así que al migrar Firebase se migran también las fotos. No hay un servicio de imágenes separado que configurar.</div>
  `)
}
