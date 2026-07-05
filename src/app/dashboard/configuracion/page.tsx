'use client'

import { useEffect, useRef, useState } from 'react'
import { getConfigSistema, setConfigSistema } from '@/lib/firestore'
import type { ItemLista } from '@/lib/firestore'
import { uploadImage } from '@/lib/storage'
import { CATEGORIAS, SUBZONAS_MENDOZA } from '@/types'
import { useTheme } from '@/context/ThemeContext'
import toast from 'react-hot-toast'
import { Save, Plus, X, Moon, Sun, Lock, MapPin, Tags, Loader2, ImageIcon, Upload } from 'lucide-react'

const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))

// Departamentos por defecto (semilla si nunca se configuró)
const DEPARTAMENTOS_SEED = Object.values(SUBZONAS_MENDOZA).filter(v => v !== 'Otra zona')

export default function ConfiguracionPage() {
  const { theme, setTheme } = useTheme()
  const [departamentos, setDepartamentos] = useState<ItemLista[]>([])
  const [categoriasExtra, setCategoriasExtra] = useState<ItemLista[]>([])
  const [logoUrl, setLogoUrl] = useState('')
  const [subiendoLogo, setSubiendoLogo] = useState(false)
  const [nuevoDepto, setNuevoDepto] = useState('')
  const [nuevaCat, setNuevaCat] = useState('')
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getConfigSistema().then(cfg => {
      if (cfg) {
        setDepartamentos(cfg.departamentos.length ? cfg.departamentos : DEPARTAMENTOS_SEED.map(n => ({ id: uid(), nombre: n })))
        setCategoriasExtra(cfg.categoriasExtra)
        setLogoUrl(cfg.logoUrl ?? '')
      } else {
        setDepartamentos(DEPARTAMENTOS_SEED.map(n => ({ id: uid(), nombre: n })))
      }
      setLoading(false)
    })
  }, [])

  const subirLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Debe ser una imagen'); return }
    setSubiendoLogo(true)
    try {
      const ext = file.name.split('.').pop()
      const url = await uploadImage(file, `sistema/logo-bureau.${ext}`)
      setLogoUrl(url)
      await setConfigSistema({ departamentos, categoriasExtra, logoUrl: url })
      toast.success('Logo actualizado')
    } catch {
      toast.error('Error al subir el logo')
    } finally {
      setSubiendoLogo(false)
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
      await setConfigSistema({ departamentos, categoriasExtra, logoUrl })
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

        {/* Logo del Bureau */}
        <section className="kpi-card">
          <h3 className="font-semibold mb-1 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <ImageIcon size={16} style={{ color: 'var(--orange-2)' }} /> Logo de Bureau
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Se muestra arriba en el menú izquierdo y queda guardado para usarlo en el tour madre.
          </p>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-2)' }}>
              {logoUrl
                ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                : <span className="text-white text-lg font-black">MB</span>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => logoInputRef.current?.click()} disabled={subiendoLogo} className="btn-outline">
                {subiendoLogo ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                {subiendoLogo ? 'Subiendo...' : 'Subir logo'}
              </button>
              {logoUrl && (
                <button onClick={() => setLogoUrl('')} className="text-sm transition hover:text-red-400" style={{ color: 'var(--text-muted)' }}>
                  Quitar
                </button>
              )}
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={subirLogo} />
          </div>
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
      </div>
    </div>
  )
}
