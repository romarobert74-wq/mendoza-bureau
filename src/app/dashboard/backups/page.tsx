'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  generarBackupCompleto, contarBackup, restaurarBackup, contarRegistros,
  guardarSnapshotNube, listarSnapshots, getSnapshotData, eliminarSnapshot,
} from '@/lib/firestore'
import type { BackupData, SnapshotNube } from '@/lib/firestore'
import toast from 'react-hot-toast'
import {
  DatabaseBackup, Download, Upload, Cloud, HardDrive, Github, ShieldCheck,
  Loader2, Trash2, RotateCcw, FileDown, Clock, Package, AlertTriangle,
} from 'lucide-react'

const COL_LABEL: Record<string, string> = {
  socios: 'Socios', usuarios: 'Usuarios', configuracion: 'Configuración',
  web_bureau: 'Web institucional', web_bureau_prensa: 'Prensa',
  web_bureau_observatorio: 'Observatorio', analytics: 'Analytics (eventos)',
}

function descargarJSON(data: unknown, nombre: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  URL.revokeObjectURL(url)
}

const fmtFecha = (iso?: string) => iso ? new Date(iso).toLocaleString('es-AR') : '—'

export default function BackupsPage() {
  const { usuario, loading } = useAuth()
  const router = useRouter()
  const [resumen, setResumen] = useState<Record<string, number> | null>(null)
  const [snapshots, setSnapshots] = useState<SnapshotNube[]>([])
  const [descargando, setDescargando] = useState(false)
  const [snapeando, setSnapeando] = useState(false)
  const [restaurando, setRestaurando] = useState(false)
  const [cargandoLista, setCargandoLista] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!loading && usuario?.rol !== 'el_faro') router.replace('/dashboard')
  }, [usuario, loading, router])

  const cargarLista = async () => {
    setCargandoLista(true)
    try { setSnapshots(await listarSnapshots()) } catch { /* rules */ }
    setCargandoLista(false)
  }

  useEffect(() => {
    cargarLista()
    // Conteo liviano de registros (sin descargar los documentos)
    contarRegistros().then(setResumen).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Backup local completo ──
  const descargarBackup = async () => {
    setDescargando(true)
    const t = toast.loading('Generando backup completo...')
    try {
      const backup = await generarBackupCompleto(true)
      descargarJSON(backup, `backup-mendoza-bureau-${new Date().toISOString().slice(0, 10)}.json`)
      setResumen(contarBackup(backup))
      toast.success('Backup descargado', { id: t })
    } catch {
      toast.error('Error al generar el backup', { id: t })
    } finally {
      setDescargando(false)
    }
  }

  // ── Snapshot en la nube ──
  const crearSnapshot = async () => {
    setSnapeando(true)
    const t = toast.loading('Guardando snapshot en la nube...')
    try {
      await guardarSnapshotNube()
      toast.success('Snapshot guardado en la nube', { id: t })
      cargarLista()
    } catch {
      toast.error('Error al guardar el snapshot', { id: t })
    } finally {
      setSnapeando(false)
    }
  }

  const restaurarSnapshot = async (s: SnapshotNube) => {
    if (!confirm(`¿Restaurar el snapshot del ${fmtFecha(s.fecha)}?\n\nSe van a sobrescribir los registros actuales con los de esa copia (los datos que no existan en el snapshot NO se borran). Las imágenes no se ven afectadas.`)) return
    setRestaurando(true)
    const t = toast.loading('Restaurando...')
    try {
      const data = await getSnapshotData(s.id)
      if (!data) throw new Error('no data')
      await restaurarBackup(data)
      toast.success('Snapshot restaurado', { id: t })
    } catch {
      toast.error('Error al restaurar', { id: t })
    } finally {
      setRestaurando(false)
    }
  }

  const borrarSnapshot = async (s: SnapshotNube) => {
    if (!confirm(`¿Eliminar el snapshot del ${fmtFecha(s.fecha)}?`)) return
    try { await eliminarSnapshot(s.id); toast.success('Eliminado'); cargarLista() }
    catch { toast.error('Error al eliminar') }
  }

  // ── Restaurar desde archivo ──
  const restaurarArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!confirm('Vas a restaurar desde un archivo de backup. Se van a sobrescribir los registros actuales con los del archivo (no se borran datos extra). ¿Continuar?')) return
    setRestaurando(true)
    const t = toast.loading('Restaurando desde archivo...')
    try {
      const texto = await file.text()
      const data = JSON.parse(texto) as BackupData
      if (!data.colecciones) throw new Error('formato inválido')
      await restaurarBackup(data)
      toast.success('Restauración completada', { id: t })
      contarRegistros().then(setResumen).catch(() => {})
    } catch {
      toast.error('Archivo inválido o error al restaurar', { id: t })
    } finally {
      setRestaurando(false)
    }
  }

  if (loading) {
    return <div className="p-8 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}><Loader2 size={18} className="animate-spin" /> Cargando...</div>
  }

  const totalRegistros = resumen ? Object.values(resumen).reduce((a, b) => a + b, 0) : null

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <DatabaseBackup size={26} style={{ color: 'var(--orange-2)' }} />
        <div>
          <p className="section-title">Seguridad de datos</p>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Copias de seguridad</h2>
        </div>
      </div>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        Resguardá todo el sistema en varios lugares. Seguimos la regla profesional <b>3-2-1</b>:
        3 copias, en 2 medios distintos, con 1 fuera de sitio.
      </p>

      {/* Resumen de registros */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <ResumenCard label="Registros totales" value={totalRegistros} icon={Package} accent="#f15a24" />
        <ResumenCard label="Socios" value={resumen?.socios ?? null} icon={DatabaseBackup} accent="#3b82f6" />
        <ResumenCard label="Snapshots en nube" value={snapshots.length} icon={Cloud} accent="#a855f7" />
        <ResumenCard label="Usuarios" value={resumen?.usuarios ?? null} icon={ShieldCheck} accent="#22c55e" />
      </div>

      <div className="space-y-6">

        {/* 1. Backup local */}
        <section className="kpi-card">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(59,130,246,0.14)' }}>
              <HardDrive size={20} style={{ color: '#3b82f6' }} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold" style={{ color: 'var(--text)' }}>1. Backup local completo</h3>
              <p className="text-sm mt-0.5 mb-3" style={{ color: 'var(--text-muted)' }}>
                Descarga <b>toda</b> la base de datos —socios, usuarios, configuración, imágenes y analytics—
                en un archivo <code>.json</code> a tu computadora. Es tu copia fuera de la nube. Hacelo al menos 1 vez por semana.
              </p>
              <button onClick={descargarBackup} disabled={descargando} className="btn-primary">
                {descargando ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                Descargar backup completo
              </button>
            </div>
          </div>
        </section>

        {/* 2. Snapshots en la nube */}
        <section className="kpi-card">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(168,85,247,0.14)' }}>
              <Cloud size={20} style={{ color: '#a855f7' }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-semibold" style={{ color: 'var(--text)' }}>2. Snapshots en la nube (versionado)</h3>
                <button onClick={crearSnapshot} disabled={snapeando} className="btn-outline">
                  {snapeando ? <Loader2 size={14} className="animate-spin" /> : <Cloud size={14} />}
                  Crear snapshot
                </button>
              </div>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Copias versionadas guardadas en la nube (Firestore) para volver atrás ante un error.
                Guardan los datos de texto (sin imágenes, para ser livianas). Las imágenes viven en el backup local y en la base activa.
              </p>
            </div>
          </div>

          {cargandoLista ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}><Loader2 size={15} className="animate-spin" /> Cargando snapshots...</div>
          ) : snapshots.length === 0 ? (
            <p className="text-sm px-1" style={{ color: 'var(--text-faint)' }}>Todavía no hay snapshots. Creá el primero con el botón de arriba.</p>
          ) : (
            <div className="space-y-2">
              {snapshots.map(s => (
                <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                  <Clock size={15} style={{ color: 'var(--text-faint)' }} className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{fmtFecha(s.fecha)}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {Object.entries(s.resumen).map(([k, v]) => `${v} ${COL_LABEL[k] ?? k}`).join(' · ')}
                    </div>
                  </div>
                  <button onClick={() => getSnapshotData(s.id).then(d => d && descargarJSON(d, `snapshot-${s.id}.json`))}
                    className="transition hover:text-blue-400 shrink-0" style={{ color: 'var(--icon)' }} title="Descargar">
                    <FileDown size={16} />
                  </button>
                  <button onClick={() => restaurarSnapshot(s)} disabled={restaurando}
                    className="transition hover:text-[var(--orange-2)] shrink-0" style={{ color: 'var(--icon)' }} title="Restaurar">
                    <RotateCcw size={16} />
                  </button>
                  <button onClick={() => borrarSnapshot(s)}
                    className="transition hover:text-red-400 shrink-0" style={{ color: 'var(--icon)' }} title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 3. Restaurar desde archivo */}
        <section className="kpi-card">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(34,197,94,0.14)' }}>
              <Upload size={20} style={{ color: '#22c55e' }} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold" style={{ color: 'var(--text)' }}>3. Restaurar desde archivo</h3>
              <p className="text-sm mt-0.5 mb-3" style={{ color: 'var(--text-muted)' }}>
                Subí un archivo <code>.json</code> de backup para volver a cargar esos datos en el sistema.
                Sobrescribe los registros que existan; no borra datos extra.
              </p>
              <button onClick={() => fileRef.current?.click()} disabled={restaurando} className="btn-outline">
                {restaurando ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Elegir archivo de backup
              </button>
              <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={restaurarArchivo} />
            </div>
          </div>
        </section>

        {/* 4. Backup del código */}
        <section className="kpi-card">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(139,92,246,0.14)' }}>
              <Github size={20} style={{ color: '#c4b5fd' }} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold" style={{ color: 'var(--text)' }}>4. Backup del código</h3>
              <p className="text-sm mt-0.5 mb-2" style={{ color: 'var(--text-muted)' }}>
                El código completo (frontend + backend) vive versionado en GitHub. Para guardarte una copia local:
              </p>
              <ul className="text-sm space-y-1 mb-3" style={{ color: 'var(--text-2)' }}>
                <li>• En GitHub: botón verde <b>Code</b> → <b>Download ZIP</b> (copia completa del código).</li>
                <li>• O clonar con Git: <code>git clone https://github.com/romarobert74-wq/mendoza-bureau.git</code></li>
              </ul>
              <a href="https://github.com/romarobert74-wq/mendoza-bureau" target="_blank" rel="noreferrer" className="btn-outline">
                <Github size={14} /> Abrir repositorio
              </a>
            </div>
          </div>
        </section>

        {/* Guía 3-2-1 */}
        <section className="rounded-xl p-5" style={{ background: 'rgba(241,90,36,0.06)', border: '1px solid rgba(241,90,36,0.2)' }}>
          <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--orange-2)' }}>
            <ShieldCheck size={16} /> Rutina recomendada (regla 3-2-1)
          </h3>
          <ul className="text-sm space-y-1.5" style={{ color: 'var(--text-2)' }}>
            <li><b>Semanal:</b> descargá el backup local completo y guardalo en tu PC + un disco externo o Google Drive.</li>
            <li><b>Antes de cambios grandes:</b> creá un snapshot en la nube (para volver atrás en segundos).</li>
            <li><b>Mensual:</b> exportá también desde Firebase Console (Firestore → Export) como tercera copia.</li>
            <li><b>El código</b> ya está seguro en GitHub; descargá el ZIP de vez en cuando por las dudas.</li>
          </ul>
          <div className="flex items-start gap-2 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
            <span>Guardá tus backups en un lugar seguro: contienen todos los datos del sistema. No los subas a lugares públicos.</span>
          </div>
        </section>
      </div>
    </div>
  )
}

function ResumenCard({ label, value, icon: Icon, accent }: {
  label: string; value: number | null; icon: React.ElementType; accent: string
}) {
  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}1e`, border: `1px solid ${accent}40` }}>
          <Icon size={15} style={{ color: accent }} />
        </div>
      </div>
      <div className="text-2xl font-bold" style={{ color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
        {value === null ? '…' : value.toLocaleString('es-AR')}
      </div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </div>
  )
}
