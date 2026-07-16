'use client'

import { useEffect, useRef, useState } from 'react'
import { getConfigSistema, setConfigSistema, getConfigMigracion, setConfigMigracion } from '@/lib/firestore'
import type { ItemLista } from '@/lib/firestore'
import { uploadImage } from '@/lib/storage'
import { CATEGORIAS, SUBZONAS_MENDOZA } from '@/types'
import { DocumentacionSection } from '@/components/DocumentacionSection'
import { useTheme } from '@/context/ThemeContext'
import toast from 'react-hot-toast'
import {
  Save, Plus, X, Moon, Sun, Lock, MapPin, Tags, Loader2, ImageIcon, Upload,
  Server, CheckSquare, Square, ChevronDown, ChevronUp, ExternalLink,
} from 'lucide-react'

const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))

// Departamentos por defecto (semilla si nunca se configuró)
const DEPARTAMENTOS_SEED = Object.values(SUBZONAS_MENDOZA).filter(v => v !== 'Otra zona')

export default function ConfiguracionPage() {
  const { theme, setTheme } = useTheme()
  const [departamentos, setDepartamentos] = useState<ItemLista[]>([])
  const [categoriasExtra, setCategoriasExtra] = useState<ItemLista[]>([])
  const [logoUrl, setLogoUrl] = useState('')
  const [logoElFaroUrl, setLogoElFaroUrl] = useState('')
  const [subiendoLogo, setSubiendoLogo] = useState(false)
  const [subiendoLogoFaro, setSubiendoLogoFaro] = useState(false)
  const [nuevoDepto, setNuevoDepto] = useState('')
  const [nuevaCat, setNuevaCat] = useState('')
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const logoFaroInputRef = useRef<HTMLInputElement>(null)

  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [notasMigracion, setNotasMigracion] = useState('')
  const [guardandoMigracion, setGuardandoMigracion] = useState(false)

  useEffect(() => {
    getConfigSistema().then(cfg => {
      if (cfg) {
        setDepartamentos(cfg.departamentos.length ? cfg.departamentos : DEPARTAMENTOS_SEED.map(n => ({ id: uid(), nombre: n })))
        setCategoriasExtra(cfg.categoriasExtra)
        setLogoUrl(cfg.logoUrl ?? '')
        setLogoElFaroUrl(cfg.logoElFaroUrl ?? '')
      } else {
        setDepartamentos(DEPARTAMENTOS_SEED.map(n => ({ id: uid(), nombre: n })))
      }
      setLoading(false)
    })
    getConfigMigracion().then(m => {
      setChecklist(m.checklist)
      setNotasMigracion(m.notas)
    })
  }, [])

  const toggleChecklist = async (key: string) => {
    const nuevo = { ...checklist, [key]: !checklist[key] }
    setChecklist(nuevo)
    try {
      await setConfigMigracion({ checklist: nuevo, notas: notasMigracion })
    } catch {
      toast.error('Error al guardar el checklist')
    }
  }

  const guardarNotasMigracion = async () => {
    setGuardandoMigracion(true)
    try {
      await setConfigMigracion({ checklist, notas: notasMigracion })
      toast.success('Notas guardadas')
    } catch {
      toast.error('Error al guardar')
    } finally {
      setGuardandoMigracion(false)
    }
  }

  const subirLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Debe ser una imagen'); return }
    setSubiendoLogo(true)
    try {
      const url = await uploadImage(file, undefined, undefined, { preserveAlpha: true, maxPx: 500 })
      setLogoUrl(url)
      await setConfigSistema({ departamentos, categoriasExtra, logoUrl: url, logoElFaroUrl })
      toast.success('Logo actualizado')
    } catch {
      toast.error('Error al subir el logo')
    } finally {
      setSubiendoLogo(false)
      e.target.value = ''
    }
  }

  const subirLogoFaro = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Debe ser una imagen'); return }
    setSubiendoLogoFaro(true)
    try {
      const url = await uploadImage(file, undefined, undefined, { preserveAlpha: true, maxPx: 500 })
      setLogoElFaroUrl(url)
      await setConfigSistema({ departamentos, categoriasExtra, logoUrl, logoElFaroUrl: url })
      toast.success('Logo actualizado')
    } catch {
      toast.error('Error al subir el logo')
    } finally {
      setSubiendoLogoFaro(false)
      e.target.value = ''
    }
  }

  const addDepto = () => {
    const n = nuevoDepto.trim()
    if (!n) return
    if (departamentos.some(d => d.nombre.toLowerCase() === n.toLowerCase())) {
      toast.error('Ese departamento ya existe'); return
    }
    setDepartamentos(d => [...d, { id: uid(), nombre: n }])
    setNuevoDepto('')
  }

  const addCat = () => {
    const n = nuevaCat.trim()
    if (!n) return
    const existeCore = Object.values(CATEGORIAS).some(c => c.toLowerCase() === n.toLowerCase())
    if (existeCore || categoriasExtra.some(c => c.nombre.toLowerCase() === n.toLowerCase())) {
      toast.error('Esa categoría ya existe'); return
    }
    setCategoriasExtra(c => [...c, { id: uid(), nombre: n }])
    setNuevaCat('')
  }

  const guardar = async () => {
    setGuardando(true)
    try {
      await setConfigSistema({ departamentos, categoriasExtra, logoUrl, logoElFaroUrl })
      toast.success('Configuración guardada')
    } catch {
      toast.error('Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
        <Loader2 size={18} className="animate-spin" /> Cargando configuración...
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-title mb-1">Sistema</p>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Configuración</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Parámetros generales del sistema de gestión</p>
        </div>
        <button onClick={guardar} disabled={guardando} className="btn-primary">
          {guardando ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      <div className="space-y-6">

        {/* Apariencia */}
        <section className="kpi-card">
          <h3 className="font-semibold mb-1 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            {theme === 'dark' ? <Moon size={16} style={{ color: 'var(--orange-2)' }} /> : <Sun size={16} style={{ color: 'var(--orange-2)' }} />}
            Apariencia
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Elegí el tema del panel de administración.</p>
          <div className="flex gap-2">
            {(['dark', 'light'] as const).map(t => (
              <button key={t} onClick={() => setTheme(t)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition"
                style={theme === t
                  ? { background: 'rgba(241,90,36,0.14)', color: 'var(--orange-2)', border: '1px solid rgba(241,90,36,0.3)' }
                  : { background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border-2)' }}>
                {t === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
                {t === 'dark' ? 'Modo oscuro' : 'Modo claro'}
              </button>
            ))}
          </div>
        </section>

        {/* Logos */}
        <section className="kpi-card">
          <h3 className="font-semibold mb-1 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <ImageIcon size={16} style={{ color: 'var(--orange-2)' }} /> Logos
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Subí el logo tal cual lo tengas (con letras oscuras está bien): el sistema lo muestra en blanco
            automáticamente sobre fondos oscuros y en su color original sobre fondos claros. Se usan en el
            menú principal, el formulario público del socio y el tour madre.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <LogoUploader
              label="Logo Mendoza Bureau"
              url={logoUrl}
              subiendo={subiendoLogo}
              onUpload={() => logoInputRef.current?.click()}
              onQuitar={() => setLogoUrl('')}
            />
            <LogoUploader
              label="Logo El Faro 360"
              url={logoElFaroUrl}
              subiendo={subiendoLogoFaro}
              onUpload={() => logoFaroInputRef.current?.click()}
              onQuitar={() => setLogoElFaroUrl('')}
            />
          </div>

          <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={subirLogo} />
          <input ref={logoFaroInputRef} type="file" accept="image/*" className="hidden" onChange={subirLogoFaro} />
        </section>

        {/* Departamentos de Mendoza */}
        <section className="kpi-card">
          <h3 className="font-semibold mb-1 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <MapPin size={16} style={{ color: 'var(--orange-2)' }} /> Departamentos de Mendoza
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Zonas / departamentos disponibles para clasificar socios. Alta y baja libre.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {departamentos.map(d => (
              <span key={d.id} className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg text-sm"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-2)', color: 'var(--text-2)' }}>
                {d.nombre}
                <button onClick={() => setDepartamentos(list => list.filter(x => x.id !== d.id))}
                  className="transition hover:text-red-400" style={{ color: 'var(--icon)' }}>
                  <X size={14} />
                </button>
              </span>
            ))}
            {departamentos.length === 0 && <span className="text-sm" style={{ color: 'var(--text-faint)' }}>Sin departamentos.</span>}
          </div>
          <div className="flex gap-2 max-w-md">
            <input value={nuevoDepto} onChange={e => setNuevoDepto(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDepto())}
              className="input" placeholder="Nuevo departamento (ej: Godoy Cruz)" />
            <button onClick={addDepto} className="btn-outline shrink-0"><Plus size={15} /> Agregar</button>
          </div>
        </section>

        {/* Categorías */}
        <section className="kpi-card">
          <h3 className="font-semibold mb-1 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Tags size={16} style={{ color: 'var(--orange-2)' }} /> Categorías de socios
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Las categorías base tienen ficha técnica propia y no se pueden eliminar. Podés agregar categorías simples adicionales.
          </p>

          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-faint)' }}>Categorías base (fijas)</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {Object.values(CATEGORIAS).map(c => (
              <span key={c} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <Lock size={11} /> {c}
              </span>
            ))}
          </div>

          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-faint)' }}>Categorías adicionales</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {categoriasExtra.map(c => (
              <span key={c.id} className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg text-sm"
                style={{ background: 'rgba(241,90,36,0.1)', border: '1px solid rgba(241,90,36,0.28)', color: 'var(--orange-2)' }}>
                {c.nombre}
                <button onClick={() => setCategoriasExtra(list => list.filter(x => x.id !== c.id))}
                  className="transition hover:text-red-400" style={{ color: 'var(--orange-2)' }}>
                  <X size={14} />
                </button>
              </span>
            ))}
            {categoriasExtra.length === 0 && <span className="text-sm" style={{ color: 'var(--text-faint)' }}>Ninguna adicional.</span>}
          </div>
          <div className="flex gap-2 max-w-md">
            <input value={nuevaCat} onChange={e => setNuevaCat(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCat())}
              className="input" placeholder="Nueva categoría (ej: Transporte)" />
            <button onClick={addCat} className="btn-outline shrink-0"><Plus size={15} /> Agregar</button>
          </div>
        </section>

        {/* Documentación: exportable, URLs, links y manuales */}
        <DocumentacionSection />

        {/* Migración a infraestructura propia */}
        <MigracionSection
          checklist={checklist}
          onToggle={toggleChecklist}
          notas={notasMigracion}
          onChangeNotas={setNotasMigracion}
          onGuardarNotas={guardarNotasMigracion}
          guardando={guardandoMigracion}
        />
      </div>
    </div>
  )
}

function LogoUploader({ label, url, subiendo, onUpload, onQuitar }: {
  label: string; url: string; subiendo: boolean; onUpload: () => void; onQuitar: () => void
}) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-2)' }}>
      <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-faint)' }}>{label}</p>
      <div className="flex items-center gap-3 mb-3">
        {/* Preview sobre fondo oscuro (blanco automático) */}
        <div className="w-16 h-16 rounded-lg flex items-center justify-center shrink-0 overflow-hidden" style={{ background: '#0a0a0b' }}>
          {url
            ? <img src={url} alt={label} className="w-full h-full object-contain p-2" style={{ filter: 'brightness(0) invert(1)' }} />
            : <ImageIcon size={20} style={{ color: '#3f3f42' }} />}
        </div>
        {/* Preview sobre fondo claro (color original) */}
        <div className="w-16 h-16 rounded-lg flex items-center justify-center shrink-0 overflow-hidden" style={{ background: '#f5f5f4' }}>
          {url
            ? <img src={url} alt={label} className="w-full h-full object-contain p-2" />
            : <ImageIcon size={20} style={{ color: '#d6d3d1' }} />}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onUpload} disabled={subiendo} className="btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>
          {subiendo ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {subiendo ? 'Subiendo...' : 'Subir'}
        </button>
        {url && (
          <button onClick={onQuitar} className="text-xs transition hover:text-red-400" style={{ color: 'var(--text-muted)' }}>
            Quitar
          </button>
        )}
      </div>
    </div>
  )
}

// ── Plan de migración a infraestructura propia ─────────────────────────────

interface PasoMigracion {
  key: string
  titulo: string
  detalle: string
}

const PASOS_MIGRACION: PasoMigracion[] = [
  {
    key: 'github',
    titulo: 'Transferir el repositorio de GitHub',
    detalle: 'Creá una cuenta de GitHub propia (gratis). Pedile a quien administre el repositorio actual que use la opción "Transfer ownership" desde Settings del repo, ingresando el nombre de tu cuenta nueva. El código completo pasa a ser tuyo, con todo el historial.',
  },
  {
    key: 'vercel',
    titulo: 'Crear cuenta Vercel propia y conectar el repo',
    detalle: 'Registrate en vercel.com con tu cuenta de GitHub ya transferida. Importá el repositorio (botón "Add New Project"). Vercel detecta que es Next.js automáticamente. Todavía no va a funcionar hasta completar el paso de Firebase y Cloudinary (siguientes pasos) porque faltan las variables de entorno.',
  },
  {
    key: 'firebase',
    titulo: 'Crear proyecto Firebase propio y migrar los datos',
    detalle: 'En console.firebase.google.com creá un proyecto nuevo con tu cuenta de Google. Activá Firestore Database y Authentication (método Email/Password). Exportá los datos del proyecto actual (Firestore tiene "Export" a un bucket) e importalos al nuevo. Copiá también los usuarios de Authentication. Al final vas a tener 6 valores nuevos (API Key, Auth Domain, Project ID, etc.) que hay que cargar en Vercel.',
  },
  {
    key: 'cloudinary',
    titulo: 'Crear cuenta Cloudinary propia y migrar imágenes',
    detalle: 'Registrate gratis en cloudinary.com. Creá un Upload Preset en modo "Unsigned" (Settings → Upload). Después hay que descargar las fotos del Cloudinary actual y volver a subirlas a tu cuenta nueva, actualizando los links guardados en Firebase (esto requiere un script, no es manual).',
  },
  {
    key: 'anthropic',
    titulo: 'Transferir la cuenta del bot (Claude / Anthropic)',
    detalle: 'Creá tu propia cuenta en console.anthropic.com y generá una API Key nueva (Settings → API Keys → Create Key). Cargá crédito según tu uso esperado (ver la solapa Costos de Chat IA para estimar). Esa clave nueva reemplaza la actual.',
  },
  {
    key: 'envvars',
    titulo: 'Cargar todas las claves nuevas en Vercel',
    detalle: 'En tu proyecto de Vercel: Settings → Environment Variables. Ahí cargás los 6 valores de Firebase, el Cloud Name y Upload Preset de Cloudinary, y la API Key de Anthropic — todos con el mismo nombre de variable que tienen hoy (así no hay que tocar código). Después hacés Redeploy.',
  },
  {
    key: 'dominio',
    titulo: 'Apuntar tu dominio propio',
    detalle: 'Si tenés un dominio propio (ej. mendozabureau.com), en Vercel → Settings → Domains lo agregás y seguís las instrucciones para apuntar el DNS. Así el sitio queda con tu dirección en vez de vercel.app.',
  },
]

function MigracionSection({ checklist, onToggle, notas, onChangeNotas, onGuardarNotas, guardando }: {
  checklist: Record<string, boolean>
  onToggle: (key: string) => void
  notas: string
  onChangeNotas: (v: string) => void
  onGuardarNotas: () => void
  guardando: boolean
}) {
  const [abierto, setAbierto] = useState<string | null>(null)
  const completados = PASOS_MIGRACION.filter(p => checklist[p.key]).length

  return (
    <section className="kpi-card">
      <h3 className="font-semibold mb-1 flex items-center gap-2" style={{ color: 'var(--text)' }}>
        <Server size={16} style={{ color: 'var(--orange-2)' }} /> Migración a infraestructura propia
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        Manual de referencia para el día que quieras pasar todo (código, base de datos, imágenes y el bot)
        a cuentas 100% tuyas. Andá tildando cada paso a medida que lo completes — queda guardado acá,
        no depende de la memoria de nadie.
      </p>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(completados / PASOS_MIGRACION.length) * 100}%`, background: 'var(--orange-2)' }} />
        </div>
        <span className="text-xs font-bold shrink-0" style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
          {completados}/{PASOS_MIGRACION.length}
        </span>
      </div>

      <div className="space-y-2 mb-5">
        {PASOS_MIGRACION.map((paso, i) => {
          const hecho = !!checklist[paso.key]
          const expandido = abierto === paso.key
          return (
            <div key={paso.key} className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 px-3 py-2.5" style={{ background: 'var(--bg-input)' }}>
                <button onClick={() => onToggle(paso.key)} className="shrink-0 transition hover:opacity-70"
                  style={{ color: hecho ? 'var(--green)' : 'var(--text-faint)' }}>
                  {hecho ? <CheckSquare size={18} /> : <Square size={18} />}
                </button>
                <button onClick={() => setAbierto(expandido ? null : paso.key)}
                  className="flex-1 flex items-center justify-between text-left gap-2"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <span className="text-sm font-medium" style={{
                    color: hecho ? 'var(--text-muted)' : 'var(--text)',
                    textDecoration: hecho ? 'line-through' : 'none',
                  }}>
                    {i + 1}. {paso.titulo}
                  </span>
                  {expandido ? <ChevronUp size={14} style={{ color: 'var(--text-faint)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-faint)' }} />}
                </button>
              </div>
              {expandido && (
                <div className="px-3 py-3 text-sm leading-relaxed" style={{ color: 'var(--text-2)', borderTop: '1px solid var(--border)' }}>
                  {paso.detalle}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="rounded-lg p-3 mb-5 flex items-start gap-2 text-xs leading-relaxed"
        style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd' }}>
        <ExternalLink size={14} className="shrink-0 mt-0.5" />
        <span>
          Importante: nada de esto se hace tildando casilleros — cada paso implica crear cuentas nuevas y
          copiar credenciales reales fuera de este sistema. El checklist es solo para no perderte ni
          repetir pasos ya hechos.
        </span>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Notas de referencia (nombres de cuentas destino, contactos, etc. — sin contraseñas)
        </label>
        <textarea
          value={notas}
          onChange={e => onChangeNotas(e.target.value)}
          rows={4}
          className="input resize-none"
          placeholder="Ej: Cuenta GitHub destino: usuario-nuevo · Contacto DonWeb: soporte@... · etc."
        />
        <button onClick={onGuardarNotas} disabled={guardando} className="btn-outline mt-2">
          {guardando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {guardando ? 'Guardando...' : 'Guardar notas'}
        </button>
      </div>
    </section>
  )
}
