'use client'

import { useEffect, useState } from 'react'
import { getLandingServicios, setLandingServicios } from '@/lib/firestore'
import { SERVICIOS_META } from '@/lib/serviciosAdicionales'
import { uploadImage } from '@/lib/storage'
import { Save, Upload, Trash2, ImagePlus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function LandingServiciosSection() {
  const [precios, setPrecios] = useState<Record<string, number>>({})
  const [heroImg, setHeroImg] = useState('')
  const [galeria, setGaleria] = useState<string[]>([])
  const [mostrarPrecios, setMostrarPrecios] = useState(true)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [subiendo, setSubiendo] = useState<'hero' | 'galeria' | null>(null)

  useEffect(() => {
    getLandingServicios()
      .then(cfg => {
        setPrecios(cfg?.precios ?? {})
        setHeroImg(cfg?.heroImg ?? '')
        setGaleria(cfg?.galeria ?? [])
        setMostrarPrecios(cfg?.mostrarPrecios !== false)
      })
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [])

  const precioDe = (id: string, def: number) => (precios[id] ?? def)

  const subirHero = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Debe ser una imagen'); return }
    setSubiendo('hero')
    try {
      const url = await uploadImage(file, undefined, undefined, { maxPx: 1600 })
      setHeroImg(url)
      toast.success('Imagen de portada lista (acordate de Guardar)')
    } catch { toast.error('Error al subir la imagen') }
    finally { setSubiendo(null); e.target.value = '' }
  }

  const agregarGaleria = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setSubiendo('galeria')
    try {
      const urls: string[] = []
      for (const f of files) {
        if (!f.type.startsWith('image/')) continue
        urls.push(await uploadImage(f, undefined, undefined, { maxPx: 1200 }))
      }
      setGaleria(g => [...g, ...urls])
      toast.success(`${urls.length} imagen(es) agregada(s) (acordate de Guardar)`)
    } catch { toast.error('Error al subir imágenes') }
    finally { setSubiendo(null); e.target.value = '' }
  }

  const guardar = async () => {
    setGuardando(true)
    try {
      await setLandingServicios({ precios, heroImg, galeria, mostrarPrecios })
      toast.success('Landing actualizada')
    } catch {
      toast.error('Error al guardar')
    } finally { setGuardando(false) }
  }

  if (cargando) return (
    <section className="kpi-card">
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Loader2 size={15} className="animate-spin" /> Cargando landing…
      </div>
    </section>
  )

  return (
    <section className="kpi-card space-y-5">
      <div>
        <h3 className="font-semibold text-base" style={{ color: 'var(--text)' }}>Landing de servicios adicionales</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Editá los precios y las imágenes de la página que le enviás al socio
          (<code>/servicios-adicionales</code>).
        </p>
      </div>

      {/* Mostrar/ocultar precios en la landing */}
      <label className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 cursor-pointer"
        style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Mostrar precios en la landing</p>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            Si lo apagás, el socio elige servicios pero no ve importes: el botón pasa a “Solicitar cotización”.
          </p>
        </div>
        <input type="checkbox" checked={mostrarPrecios} onChange={e => setMostrarPrecios(e.target.checked)}
          className="w-5 h-5 shrink-0" style={{ accentColor: '#f15a24' }} />
      </label>

      {/* Precios */}
      <div style={{ opacity: mostrarPrecios ? 1 : 0.5 }}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-faint)' }}>Precios (USD)</p>
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
          {SERVICIOS_META.map(s => (
            <label key={s.id} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <span className="text-sm truncate" style={{ color: 'var(--text)' }}>{s.nombre}</span>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>USD</span>
                <input
                  type="number" min={0}
                  value={precioDe(s.id, s.precio)}
                  onChange={e => setPrecios(p => ({ ...p, [s.id]: Number(e.target.value) }))}
                  className="w-20 text-right rounded-md px-2 py-1 text-sm"
                  style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Imagen de portada (hero) */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-faint)' }}>Imagen de portada (hero)</p>
        <div className="flex items-start gap-3 flex-wrap">
          {heroImg ? (
            <div className="relative">
              <img src={heroImg} alt="Portada" className="rounded-lg object-cover"
                style={{ width: 220, height: 124, border: '1px solid var(--border)' }} />
              <button onClick={() => setHeroImg('')}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: '#ef4444', color: '#fff' }} title="Quitar">
                <Trash2 size={13} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-1 rounded-lg cursor-pointer text-sm"
              style={{ width: 220, height: 124, border: '2px dashed var(--border)', color: 'var(--text-muted)' }}>
              {subiendo === 'hero' ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              <span>Subir portada</span>
              <input type="file" accept="image/*" className="hidden" onChange={subirHero} disabled={subiendo === 'hero'} />
            </label>
          )}
          <p className="text-xs max-w-[220px]" style={{ color: 'var(--text-faint)' }}>
            Horizontal, ~1600×900 px. Se muestra debajo del título principal.
          </p>
        </div>
      </div>

      {/* Galería */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-faint)' }}>Galería (banda de fotos)</p>
        <div className="flex gap-2 flex-wrap">
          {galeria.map((img, i) => (
            <div key={i} className="relative">
              <img src={img} alt={`Galería ${i + 1}`} className="rounded-lg object-cover"
                style={{ width: 96, height: 72, border: '1px solid var(--border)' }} />
              <button onClick={() => setGaleria(g => g.filter((_, j) => j !== i))}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: '#ef4444', color: '#fff' }} title="Quitar">
                <Trash2 size={11} />
              </button>
            </div>
          ))}
          <label className="flex flex-col items-center justify-center gap-1 rounded-lg cursor-pointer text-xs"
            style={{ width: 96, height: 72, border: '2px dashed var(--border)', color: 'var(--text-muted)' }}>
            {subiendo === 'galeria' ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
            <span>Agregar</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={agregarGaleria} disabled={subiendo === 'galeria'} />
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button onClick={guardar} disabled={guardando}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg,#f15a24,#ff7a45)', opacity: guardando ? 0.6 : 1 }}>
          {guardando ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Guardar cambios
        </button>
      </div>
    </section>
  )
}
