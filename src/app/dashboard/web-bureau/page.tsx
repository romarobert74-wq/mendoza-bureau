'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import {
  getWebBureauConfig, setWebBureauConfig,
  getPrensaItems, crearPrensaItem, actualizarPrensaItem, eliminarPrensaItem,
  getObservatorioItems, crearObservatorioItem, actualizarObservatorioItem, eliminarObservatorioItem,
} from '@/lib/firestore'
import toast from 'react-hot-toast'
import { Save, Plus, Pencil, Trash2, Loader2, X, FileText, BarChart2, UserPlus, Upload } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface DirectivaMember { nombre: string; cargo: string; foto: string }

interface Config {
  heroTitulo: string; heroSubtitulo: string; heroImagen: string
  sobreNosotros: string; mision: string
  colorPrimario: string; colorSecundario: string; logoUrl: string
  contactoWhatsapp: string; contactoEmail: string
  directiva: DirectivaMember[]
}

interface GraficoDato { label: string; valor: number }
interface Grafico { tipo: 'barra' | 'linea'; titulo: string; datos: GraficoDato[]; unidad: string }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

const CFG_DEFAULT: Config = {
  heroTitulo: 'Bienvenidos a Mendoza Bureau',
  heroSubtitulo: 'Convention & Visitors Bureau — El destino corporativo líder de Argentina',
  heroImagen: '',
  sobreNosotros: '',
  mision: '',
  contactoWhatsapp: '',
  contactoEmail: 'info@mendozabureau.com',
  directiva: [],
  colorPrimario: '#E85D04',
  colorSecundario: '#C0391B',
  logoUrl: '',
}

const MAX_FOTOS = 30

// ── Helpers ────────────────────────────────────────────────────────────────────

function resizeImage(file: File, maxPx = 400): Promise<string> {
  return new Promise((res, rej) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      res(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.onerror = rej
    img.src = url
  })
}

// ── Subcomponents ──────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[var(--text-2)] mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const INPUT = "w-full border border-[var(--border-2)] rounded-lg px-3 py-2 text-sm text-[var(--text-2)] focus:ring-2 focus:ring-orange-400 outline-none"
const TEXTAREA = `${INPUT} resize-none`
const BTN_PRIMARY = "flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-60"
const BTN_GHOST = "flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-2)] text-sm transition"

// ── Tab: Inicio ───────────────────────────────────────────────────────────────

function TabInicio() {
  const [cfg, setCfg] = useState<Config>(CFG_DEFAULT)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)
  const [editMember, setEditMember] = useState<(DirectivaMember & { idx: number }) | null>(null)
  const [newMember, setNewMember] = useState<DirectivaMember>({ nombre: '', cargo: '', foto: '' })
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    getWebBureauConfig().then(d => {
      if (d) setCfg({ ...CFG_DEFAULT, ...(d as Config) })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const guardar = async () => {
    setSaving(true)
    try {
      await setWebBureauConfig(cfg as unknown as AnyRecord)
      toast.success('Configuración guardada')
    } catch { toast.error('Error al guardar') } finally { setSaving(false) }
  }

  const addMember = () => {
    if (!newMember.nombre) { toast.error('El nombre es obligatorio'); return }
    if (cfg.directiva.length >= MAX_FOTOS) { toast.error(`Máximo ${MAX_FOTOS} fotos`); return }
    setCfg(c => ({ ...c, directiva: [...c.directiva, { ...newMember }] }))
    setNewMember({ nombre: '', cargo: '', foto: '' })
    setShowAddForm(false)
  }

  const updateMember = () => {
    if (!editMember) return
    setCfg(c => ({
      ...c,
      directiva: c.directiva.map((m, i) => i === editMember.idx ? { nombre: editMember.nombre, cargo: editMember.cargo, foto: editMember.foto } : m),
    }))
    setEditMember(null)
  }

  const removeMember = (idx: number) => {
    setCfg(c => ({ ...c, directiva: c.directiva.filter((_, i) => i !== idx) }))
  }

  const handleFotoUpload = async (file: File, setter: (v: string) => void) => {
    try {
      const b64 = await resizeImage(file)
      setter(b64)
    } catch { toast.error('Error al procesar la imagen') }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Hero */}
      <div className="bg-[var(--bg-elev)] rounded-xl border border-[var(--border)] p-6 space-y-4">
        <h3 className="font-bold text-[var(--text)]">Hero</h3>
        <Field label="Título principal">
          <input className={INPUT} value={cfg.heroTitulo} onChange={e => setCfg(c => ({ ...c, heroTitulo: e.target.value }))} />
        </Field>
        <Field label="Subtítulo">
          <input className={INPUT} value={cfg.heroSubtitulo} onChange={e => setCfg(c => ({ ...c, heroSubtitulo: e.target.value }))} />
        </Field>
        <Field label="Imagen de fondo del Hero">
          {/* Si ya hay imagen: preview grande + quitar. Si no: zona de subida. */}
          {cfg.heroImagen ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '16/9', maxWidth: '420px', border: '1px solid var(--border)' }}>
                <img src={cfg.heroImagen} alt="Imagen de fondo" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setCfg(c => ({ ...c, heroImagen: '' }))}
                  className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <X size={12} /> Quitar
                </button>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-1.5 bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] rounded-lg text-xs font-medium transition" style={{ color: 'var(--text-2)' }}>
                <Upload size={13} /> Cambiar imagen
                <input type="file" accept="image/*" className="hidden" onChange={async e => {
                  const f = e.target.files?.[0]; if (!f) return
                  const b64 = await resizeImage(f, 1600)
                  setCfg(c => ({ ...c, heroImagen: b64 }))
                }} />
              </label>
            </div>
          ) : (
            <label
              className="flex flex-col items-center justify-center gap-2 cursor-pointer rounded-xl transition"
              style={{ border: '2px dashed var(--border-2)', padding: '32px 20px', background: 'var(--bg-input)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(241,90,36,0.14)' }}>
                <Upload size={22} style={{ color: 'var(--orange-2)' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Subir imagen de fondo</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Hacé click para elegir un archivo de tu computadora</span>
              <span className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Recomendado: 1920 × 1080 px (16:9) · horizontal · JPG</span>
              <input type="file" accept="image/*" className="hidden" onChange={async e => {
                const f = e.target.files?.[0]; if (!f) return
                const b64 = await resizeImage(f, 1600)
                setCfg(c => ({ ...c, heroImagen: b64 }))
              }} />
            </label>
          )}
          {/* Opción avanzada: pegar una URL en vez de subir */}
          <details className="mt-2">
            <summary className="text-xs cursor-pointer" style={{ color: 'var(--text-muted)' }}>o pegar una URL manualmente</summary>
            <input className={`${INPUT} mt-2`} placeholder="https://..."
              value={cfg.heroImagen.startsWith('data:') ? '' : cfg.heroImagen}
              onChange={e => setCfg(c => ({ ...c, heroImagen: e.target.value }))} />
          </details>
        </Field>
      </div>

      {/* Sobre nosotros */}
      <div className="bg-[var(--bg-elev)] rounded-xl border border-[var(--border)] p-6 space-y-4">
        <h3 className="font-bold text-[var(--text)]">Sobre Mendoza Bureau</h3>
        <Field label="Texto principal">
          <textarea rows={4} className={TEXTAREA} value={cfg.sobreNosotros} onChange={e => setCfg(c => ({ ...c, sobreNosotros: e.target.value }))} />
        </Field>
        <Field label="¿Por qué Mendoza? (recuadro naranja)">
          <textarea rows={4} className={TEXTAREA} value={cfg.mision} onChange={e => setCfg(c => ({ ...c, mision: e.target.value }))} />
        </Field>
      </div>

      {/* Contacto */}
      <div className="bg-[var(--bg-elev)] rounded-xl border border-[var(--border)] p-6 space-y-4">
        <h3 className="font-bold text-[var(--text)]">Contacto</h3>
        <Field label="WhatsApp (sólo números, ej: 5492614001000)">
          <input className={INPUT} value={cfg.contactoWhatsapp} onChange={e => setCfg(c => ({ ...c, contactoWhatsapp: e.target.value }))} />
        </Field>
        <Field label="Email">
          <input type="email" className={INPUT} value={cfg.contactoEmail} onChange={e => setCfg(c => ({ ...c, contactoEmail: e.target.value }))} />
        </Field>
      </div>

      {/* Comisión Directiva */}
      <div className="bg-[var(--bg-elev)] rounded-xl border border-[var(--border)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[var(--text)]">Comisión Directiva ({cfg.directiva.length}/{MAX_FOTOS})</h3>
          {cfg.directiva.length < MAX_FOTOS && (
            <button onClick={() => setShowAddForm(v => !v)} className={BTN_PRIMARY}>
              <UserPlus size={15} /> Agregar
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="border border-orange-200 bg-orange-50 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-orange-800">Nuevo integrante</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombre">
                <input className={INPUT} value={newMember.nombre} onChange={e => setNewMember(m => ({ ...m, nombre: e.target.value }))} />
              </Field>
              <Field label="Cargo">
                <input className={INPUT} value={newMember.cargo} onChange={e => setNewMember(m => ({ ...m, cargo: e.target.value }))} />
              </Field>
            </div>
            <Field label="Foto">
              <div className="flex gap-2 items-center">
                <input className={INPUT} placeholder="URL de imagen o subir..." value={newMember.foto.startsWith('data:') ? '' : newMember.foto}
                  onChange={e => setNewMember(m => ({ ...m, foto: e.target.value }))} />
                <label className="cursor-pointer px-3 py-2 bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] rounded-lg text-xs font-medium whitespace-nowrap transition">
                  Subir
                  <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFotoUpload(f, v => setNewMember(m => ({ ...m, foto: v }))) }} />
                </label>
              </div>
              {newMember.foto && <img src={newMember.foto} alt="" className="w-16 h-16 rounded-full object-cover mt-2 border-2 border-orange-200" />}
            </Field>
            <div className="flex gap-2">
              <button onClick={addMember} className={BTN_PRIMARY}><Plus size={14} /> Agregar</button>
              <button onClick={() => setShowAddForm(false)} className={BTN_GHOST}><X size={14} /> Cancelar</button>
            </div>
          </div>
        )}

        {cfg.directiva.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm">No hay integrantes cargados.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cfg.directiva.map((m, i) => (
              <div key={i} className="relative border border-[var(--border)] rounded-xl p-3 text-center group">
                <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-[var(--bg-input)] mb-2 border-2 border-[var(--border)]">
                  {m.foto ? <img src={m.foto} alt={m.nombre} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[var(--text-muted)]">{m.nombre[0]}</div>}
                </div>
                <p className="font-semibold text-sm text-[var(--text)] truncate">{m.nombre}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{m.cargo}</p>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => setEditMember({ ...m, idx: i })} className="w-6 h-6 bg-[var(--bg-elev)] rounded-full shadow flex items-center justify-center text-[var(--text-muted)] hover:text-blue-500"><Pencil size={11} /></button>
                  <button onClick={() => removeMember(i)} className="w-6 h-6 bg-[var(--bg-elev)] rounded-full shadow flex items-center justify-center text-[var(--text-muted)] hover:text-red-500"><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit member modal */}
        {editMember && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--bg-elev)] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[var(--text)]">Editar integrante</h4>
                <button onClick={() => setEditMember(null)}><X size={18} className="text-[var(--text-muted)]" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nombre">
                  <input className={INPUT} value={editMember.nombre} onChange={e => setEditMember(m => m ? { ...m, nombre: e.target.value } : m)} />
                </Field>
                <Field label="Cargo">
                  <input className={INPUT} value={editMember.cargo} onChange={e => setEditMember(m => m ? { ...m, cargo: e.target.value } : m)} />
                </Field>
              </div>
              <Field label="Foto">
                <div className="flex gap-2 items-center">
                  <input className={INPUT} placeholder="URL..." value={editMember.foto.startsWith('data:') ? '' : editMember.foto}
                    onChange={e => setEditMember(m => m ? { ...m, foto: e.target.value } : m)} />
                  <label className="cursor-pointer px-3 py-2 bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] rounded-lg text-xs font-medium whitespace-nowrap transition">
                    Subir
                    <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFotoUpload(f, v => setEditMember(m => m ? { ...m, foto: v } : m)) }} />
                  </label>
                </div>
                {editMember.foto && <img src={editMember.foto} alt="" className="w-16 h-16 rounded-full object-cover mt-2 border-2 border-orange-200" />}
              </Field>
              <div className="flex gap-2">
                <button onClick={updateMember} className={BTN_PRIMARY}><Save size={14} /> Guardar</button>
                <button onClick={() => setEditMember(null)} className={BTN_GHOST}><X size={14} /> Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logo & Colores */}
      <div className="bg-[var(--bg-elev)] rounded-xl border border-[var(--border)] p-6 space-y-5">
        <h3 className="font-bold text-[var(--text)]">Logo & Paleta de colores</h3>

        <Field label="Logo de Mendoza Bureau (URL o subir)">
          <div className="flex gap-3 items-start">
            <div className="flex-1 space-y-2">
              <input className={INPUT} placeholder="https://... (PNG transparente recomendado)"
                value={cfg.logoUrl.startsWith('data:') ? '' : cfg.logoUrl}
                onChange={e => setCfg(c => ({ ...c, logoUrl: e.target.value }))} />
              <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-1.5 bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] rounded-lg text-xs font-medium transition">
                Subir imagen
                <input type="file" accept="image/*" className="hidden" onChange={async e => {
                  const f = e.target.files?.[0]; if (!f) return
                  const b64 = await resizeImage(f, 300)
                  setCfg(c => ({ ...c, logoUrl: b64 }))
                }} />
              </label>
            </div>
            {cfg.logoUrl && (
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <div className="w-20 h-14 bg-gray-800 rounded-lg flex items-center justify-center p-2">
                  <img src={cfg.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                </div>
                <button type="button" onClick={() => setCfg(c => ({ ...c, logoUrl: '' }))}
                  className="text-xs transition hover:text-red-400" style={{ color: 'var(--text-muted)' }}>
                  Quitar
                </button>
              </div>
            )}
          </div>
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Color primario (navbar, botones, acentos)">
            <div className="flex items-center gap-3">
              <input type="color" value={cfg.colorPrimario} onChange={e => setCfg(c => ({ ...c, colorPrimario: e.target.value }))}
                className="w-12 h-10 rounded-lg border border-[var(--border)] cursor-pointer p-0.5" />
              <input className={INPUT} value={cfg.colorPrimario} onChange={e => setCfg(c => ({ ...c, colorPrimario: e.target.value }))} />
              <div className="w-10 h-10 rounded-lg border border-[var(--border)] flex-shrink-0" style={{ background: cfg.colorPrimario }} />
            </div>
          </Field>
          <Field label="Color secundario (gradiente)">
            <div className="flex items-center gap-3">
              <input type="color" value={cfg.colorSecundario} onChange={e => setCfg(c => ({ ...c, colorSecundario: e.target.value }))}
                className="w-12 h-10 rounded-lg border border-[var(--border)] cursor-pointer p-0.5" />
              <input className={INPUT} value={cfg.colorSecundario} onChange={e => setCfg(c => ({ ...c, colorSecundario: e.target.value }))} />
              <div className="w-10 h-10 rounded-lg border border-[var(--border)] flex-shrink-0" style={{ background: cfg.colorSecundario }} />
            </div>
          </Field>
        </div>

        {/* Preview */}
        <div className="rounded-xl overflow-hidden">
          <div className="h-10 flex items-center px-4 gap-3" style={{ background: cfg.colorPrimario }}>
            {cfg.logoUrl
              ? <img src={cfg.logoUrl} alt="Logo" className="h-6 object-contain" />
              : <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-white font-black text-sm">M</div>
            }
            <span className="text-white font-bold text-sm">Mendoza Bureau</span>
          </div>
          <div className="h-12" style={{ background: `linear-gradient(135deg,${cfg.colorPrimario},${cfg.colorSecundario})` }} />
        </div>
      </div>

      <button onClick={guardar} disabled={saving} className={BTN_PRIMARY}>
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {saving ? 'Guardando...' : 'Guardar todo'}
      </button>
    </div>
  )
}

// ── Tab: Prensa ────────────────────────────────────────────────────────────────

function TabPrensaItem({ item, onSave, onDelete }: { item: AnyRecord; onSave: (data: AnyRecord) => Promise<void>; onDelete: () => Promise<void> }) {
  const [d, setD] = useState<AnyRecord>(item)
  const [saving, setSaving] = useState(false)

  return (
    <div className="bg-[var(--bg-elev)] rounded-xl border border-[var(--border)] p-5 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Título">
          <input className={INPUT} value={d.titulo ?? ''} onChange={e => setD(x => ({ ...x, titulo: e.target.value }))} />
        </Field>
        <Field label="Fecha">
          <input type="date" className={INPUT} value={d.fecha ?? ''} onChange={e => setD(x => ({ ...x, fecha: e.target.value }))} />
        </Field>
      </div>
      <Field label="URL de imagen (portada)">
        <input className={INPUT} placeholder="https://..." value={d.imagen ?? ''} onChange={e => setD(x => ({ ...x, imagen: e.target.value }))} />
      </Field>
      <Field label="Resumen (se muestra en la grilla)">
        <textarea rows={2} className={TEXTAREA} value={d.resumen ?? ''} onChange={e => setD(x => ({ ...x, resumen: e.target.value }))} />
      </Field>
      <Field label="Contenido completo (se expande al hacer clic)">
        <textarea rows={5} className={TEXTAREA} value={d.contenido ?? ''} onChange={e => setD(x => ({ ...x, contenido: e.target.value }))} />
      </Field>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-[var(--text-2)] cursor-pointer">
          <input type="checkbox" checked={d.activo ?? true} onChange={e => setD(x => ({ ...x, activo: e.target.checked }))} className="accent-orange-500" />
          Publicar
        </label>
        <button disabled={saving} onClick={async () => { setSaving(true); await onSave(d); setSaving(false) }} className={BTN_PRIMARY}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar
        </button>
        {d.id && (
          <button onClick={onDelete} className="flex items-center gap-1 text-sm text-red-400 hover:text-red-600 transition ml-auto">
            <Trash2 size={14} /> Eliminar
          </button>
        )}
      </div>
    </div>
  )
}

function TabPrensa() {
  const [items, setItems] = useState<AnyRecord[]>([])
  const [loading, setLoading] = useState(true)

  const cargar = async () => {
    setLoading(true)
    setItems(await getPrensaItems())
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const handleSave = async (item: AnyRecord) => {
    try {
      if (item.id) await actualizarPrensaItem(item.id, item)
      else await crearPrensaItem(item)
      toast.success('Guardado')
      cargar()
    } catch { toast.error('Error al guardar') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta nota?')) return
    await eliminarPrensaItem(id)
    toast.success('Eliminado')
    cargar()
  }

  if (loading) return <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{items.length} nota{items.length !== 1 ? 's' : ''} cargada{items.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setItems(x => [{ titulo: '', resumen: '', contenido: '', imagen: '', fecha: new Date().toISOString().split('T')[0], activo: true }, ...x])} className={BTN_PRIMARY}>
          <Plus size={15} /> Nueva nota
        </button>
      </div>
      {items.map((item, i) => (
        <TabPrensaItem key={item.id ?? `new-${i}`} item={item}
          onSave={handleSave}
          onDelete={async () => { item.id ? await handleDelete(item.id) : setItems(x => x.filter((_, j) => j !== i)) }} />
      ))}
      {items.length === 0 && <p className="text-[var(--text-muted)] text-sm text-center py-8">No hay notas. Creá la primera.</p>}
    </div>
  )
}

// ── Tab: Observatorio ─────────────────────────────────────────────────────────

function TabObsItem({ item, onSave, onDelete }: { item: AnyRecord; onSave: (data: AnyRecord) => Promise<void>; onDelete: () => Promise<void> }) {
  const [d, setD] = useState<AnyRecord>(() => ({
    ...item,
    grafico: item.grafico ?? { tipo: 'barra', titulo: '', datos: [], unidad: '' },
  }))
  const [saving, setSaving] = useState(false)
  const [datosStr, setDatosStr] = useState<string>(() =>
    (item.grafico?.datos ?? []).map((r: GraficoDato) => `${r.label},${r.valor}`).join('\n')
  )

  const parseDatos = (str: string): GraficoDato[] =>
    str.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
      const [label, val] = l.split(',')
      return { label: label?.trim() ?? '', valor: Number(val?.trim() ?? 0) }
    }).filter(r => r.label)

  const subirPDF = (file: File) => {
    if (file.size > 1_500_000) { toast.error('PDF máximo 1.5 MB'); return }
    const reader = new FileReader()
    reader.onload = () => {
      const b64 = (reader.result as string).split(',')[1]
      setD((x: AnyRecord) => ({ ...x, pdfBase64: b64 }))
      toast.success('PDF cargado')
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="bg-[var(--bg-elev)] rounded-xl border border-[var(--border)] p-5 space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Título">
          <input className={INPUT} value={d.titulo ?? ''} onChange={e => setD((x: AnyRecord) => ({ ...x, titulo: e.target.value }))} />
        </Field>
        <Field label="Fecha / Período">
          <input className={INPUT} placeholder="ej: 2024, Enero 2025..." value={d.fecha ?? ''} onChange={e => setD((x: AnyRecord) => ({ ...x, fecha: e.target.value }))} />
        </Field>
        <Field label="Fuente">
          <input className={INPUT} placeholder="Ministerio de Turismo..." value={d.fuente ?? ''} onChange={e => setD((x: AnyRecord) => ({ ...x, fuente: e.target.value }))} />
        </Field>
        <Field label="PDF (máx 1.5 MB)">
          <div className="flex items-center gap-2">
            {d.pdfBase64 ? (
              <>
                <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><FileText size={14} /> PDF cargado</span>
                <button onClick={() => setD((x: AnyRecord) => ({ ...x, pdfBase64: '' }))} className="text-red-400 hover:text-red-600 text-xs">Quitar</button>
              </>
            ) : (
              <label className="cursor-pointer px-3 py-2 bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] rounded-lg text-xs font-medium transition">
                Subir PDF
                <input type="file" accept="application/pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) subirPDF(f) }} />
              </label>
            )}
          </div>
        </Field>
      </div>

      <Field label="Descripción">
        <textarea rows={2} className={TEXTAREA} value={d.descripcion ?? ''} onChange={e => setD((x: AnyRecord) => ({ ...x, descripcion: e.target.value }))} />
      </Field>

      {/* Gráfico */}
      <div className="border border-[var(--border)] rounded-xl p-4 space-y-3 bg-[var(--bg-input)]">
        <div className="flex items-center gap-2">
          <BarChart2 size={15} className="text-orange-500" />
          <p className="text-sm font-semibold text-[var(--text-2)]">Gráfico</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Tipo">
            <select className={INPUT} value={d.grafico?.tipo ?? 'barra'}
              onChange={e => setD((x: AnyRecord) => ({ ...x, grafico: { ...x.grafico, tipo: e.target.value } }))}>
              <option value="barra">Barras</option>
              <option value="linea">Línea</option>
            </select>
          </Field>
          <Field label="Título del gráfico">
            <input className={INPUT} value={d.grafico?.titulo ?? ''} onChange={e => setD((x: AnyRecord) => ({ ...x, grafico: { ...x.grafico, titulo: e.target.value } }))} />
          </Field>
          <Field label="Unidad">
            <input className={INPUT} placeholder="visitantes, pesos..." value={d.grafico?.unidad ?? ''} onChange={e => setD((x: AnyRecord) => ({ ...x, grafico: { ...x.grafico, unidad: e.target.value } }))} />
          </Field>
        </div>
        <Field label="Datos (una línea por punto: Etiqueta,Valor)">
          <textarea rows={5} className={TEXTAREA} placeholder={"Ene,45000\nFeb,52000\nMar,61000"} value={datosStr}
            onChange={e => {
              setDatosStr(e.target.value)
              setD((x: AnyRecord) => ({ ...x, grafico: { ...x.grafico, datos: parseDatos(e.target.value) } }))
            }} />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-[var(--text-2)] cursor-pointer">
          <input type="checkbox" checked={d.activo ?? true} onChange={e => setD((x: AnyRecord) => ({ ...x, activo: e.target.checked }))} className="accent-orange-500" />
          Publicar
        </label>
        <button disabled={saving} onClick={async () => { setSaving(true); await onSave(d); setSaving(false) }} className={BTN_PRIMARY}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar
        </button>
        {item.id && (
          <button onClick={onDelete} className="flex items-center gap-1 text-sm text-red-400 hover:text-red-600 transition ml-auto">
            <Trash2 size={14} /> Eliminar
          </button>
        )}
      </div>
    </div>
  )
}

function TabObservatorio() {
  const [items, setItems] = useState<AnyRecord[]>([])
  const [loading, setLoading] = useState(true)

  const cargar = async () => {
    setLoading(true)
    setItems(await getObservatorioItems())
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const handleSave = async (item: AnyRecord) => {
    try {
      if (item.id) await actualizarObservatorioItem(item.id, item)
      else await crearObservatorioItem(item)
      toast.success('Guardado')
      cargar()
    } catch { toast.error('Error al guardar') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este reporte?')) return
    await eliminarObservatorioItem(id)
    toast.success('Eliminado')
    cargar()
  }

  if (loading) return <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{items.length} reporte{items.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setItems(x => [{ titulo: '', descripcion: '', fuente: '', fecha: '', pdfBase64: '', grafico: { tipo: 'barra', titulo: '', datos: [], unidad: '' }, activo: true }, ...x])} className={BTN_PRIMARY}>
          <Plus size={15} /> Nuevo reporte
        </button>
      </div>
      {items.map((item, i) => (
        <TabObsItem key={item.id ?? `new-${i}`} item={item}
          onSave={handleSave}
          onDelete={async () => { item.id ? await handleDelete(item.id) : setItems(x => x.filter((_, j) => j !== i)) }} />
      ))}
      {items.length === 0 && <p className="text-[var(--text-muted)] text-sm text-center py-8">No hay reportes. Creá el primero.</p>}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function WebBureauAdminPage() {
  const { usuario, loading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'inicio' | 'prensa' | 'observatorio'>('inicio')

  useEffect(() => {
    if (!loading && !['el_faro', 'bureau'].includes(usuario?.rol ?? '')) router.replace('/dashboard')
  }, [usuario, loading, router])

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg" style={{ background: '#E85D04' }}>M</div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Web Institucional</h1>
          <p className="text-[var(--text-muted)] text-sm">
            Editá el contenido de{' '}
            <a href="/web_bureau" target="_blank" className="text-orange-500 hover:underline font-medium">
              mendoza-bureau.vercel.app/web_bureau ↗
            </a>
          </p>
        </div>
      </div>

      <div className="flex gap-0 border-b border-[var(--border)] mb-6">
        {([
          { key: 'inicio', label: '🏠 Inicio & Directiva' },
          { key: 'prensa', label: '📰 Prensa' },
          { key: 'observatorio', label: '📊 Observatorio' },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 text-sm font-semibold transition border-b-2 -mb-px ${tab === t.key ? 'border-orange-500 text-orange-600' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-2)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'inicio' && <TabInicio />}
      {tab === 'prensa' && <TabPrensa />}
      {tab === 'observatorio' && <TabObservatorio />}
    </div>
  )
}
