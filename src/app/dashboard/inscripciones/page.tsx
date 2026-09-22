'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getInscripciones, actualizarInscripcion, eliminarInscripcion } from '@/lib/firestore'
import type { Inscripcion } from '@/lib/firestore'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { UserPlus, MessageCircle, Mail, Copy, Trash2, Loader2, Clock, FileSpreadsheet } from 'lucide-react'

const ESTADOS: Record<string, { label: string; bg: string; color: string; border: string }> = {
  nuevo:      { label: 'Nuevo',       bg: 'rgba(59,130,246,0.14)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  contactado: { label: 'Contactado',  bg: 'rgba(234,179,8,0.14)',  color: '#eab308', border: 'rgba(234,179,8,0.3)' },
  aceptado:   { label: 'Aceptado',    bg: 'rgba(34,197,94,0.14)',  color: '#4ade80', border: 'rgba(34,197,94,0.3)' },
  descartado: { label: 'Descartado',  bg: 'rgba(239,68,68,0.12)',  color: '#f87171', border: 'rgba(239,68,68,0.28)' },
}

const fmt = (v?: { toDate?: () => Date } | null) => {
  try { const d = v?.toDate?.(); return d ? d.toLocaleString('es-AR') : '—' } catch { return '—' }
}

export default function InscripcionesPage() {
  const { usuario, loading } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<Inscripcion[] | null>(null)
  const [filtro, setFiltro] = useState<string>('todos')

  useEffect(() => {
    if (!loading && usuario && usuario.rol !== 'el_faro' && usuario.rol !== 'bureau') router.replace('/dashboard')
  }, [usuario, loading, router])

  const cargar = async () => {
    try { setItems(await getInscripciones()) } catch { setItems([]) ; toast.error('No se pudieron cargar (¿reglas publicadas?)') }
  }
  useEffect(() => { cargar() }, [])

  const cambiarEstado = async (id: string, estado: string) => {
    try { await actualizarInscripcion(id, { estado }); toast.success('Estado actualizado'); cargar() }
    catch { toast.error('Error al actualizar') }
  }

  const borrar = async (i: Inscripcion) => {
    if (!confirm(`¿Eliminar la inscripción de ${i.empresa || i.nombre}?`)) return
    try { await eliminarInscripcion(i.id); toast.success('Eliminada'); cargar() }
    catch { toast.error('Error al eliminar') }
  }

  const exportarExcel = () => {
    if (!visibles.length) { toast.error('No hay inscripciones para exportar'); return }
    const filas = visibles.map(i => ({
      Empresa: i.empresa || '',
      Nombre: i.nombre || '',
      Rubro: i.rubro || '',
      WhatsApp: i.whatsapp || '',
      Email: i.email || '',
      Estado: ESTADOS[i.estado || 'nuevo']?.label || i.estado || 'Nuevo',
      Mensaje: i.mensaje || '',
      Fecha: fmt(i.creadoEn),
    }))
    const ws = XLSX.utils.json_to_sheet(filas)
    ws['!cols'] = [{ wch: 26 }, { wch: 22 }, { wch: 22 }, { wch: 16 }, { wch: 26 }, { wch: 13 }, { wch: 45 }, { wch: 20 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Inscripciones')
    const hoy = new Date().toISOString().slice(0, 10)
    const suf = filtro === 'todos' ? '' : `-${filtro}`
    XLSX.writeFile(wb, `inscripciones-mendoza-bureau${suf}-${hoy}.xlsx`)
    toast.success(`Exportadas ${filas.length} inscripciones`)
  }

  const copiarFormulario = () => {
    const url = `${window.location.origin}/form/socio`
    navigator.clipboard.writeText(url).then(() => toast.success('Link del formulario copiado'))
  }

  const waLink = (num: string, empresa: string) => {
    const n = (num || '').replace(/[^\d]/g, '')
    const msg = encodeURIComponent(`Hola${empresa ? ` ${empresa}` : ''}, te contactamos de Mendoza Bureau por tu interés en la plataforma de tours 360°.`)
    return `https://wa.me/${n}?text=${msg}`
  }

  const visibles = (items ?? []).filter(i => filtro === 'todos' || (i.estado || 'nuevo') === filtro)
  const conteo = (e: string) => (items ?? []).filter(i => (i.estado || 'nuevo') === e).length

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-1">
        <UserPlus size={24} style={{ color: 'var(--orange-2)' }} />
        <div>
          <p className="section-title">Landing</p>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Inscripciones</h2>
        </div>
      </div>
      <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
        Interesados que dejaron sus datos en la landing. Contactalos, y si aceptan, enviales el formulario del socio.
      </p>

      {/* Filtros por estado */}
      <div className="flex gap-2 flex-wrap mb-5">
        {['todos', 'nuevo', 'contactado', 'aceptado', 'descartado'].map(e => (
          <button key={e} onClick={() => setFiltro(e)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition"
            style={{
              background: filtro === e ? 'var(--orange)' : 'var(--bg-input)',
              color: filtro === e ? '#1a0f0a' : 'var(--text-muted)',
              border: '1px solid var(--border-2)',
            }}>
            {e === 'todos' ? 'Todos' : ESTADOS[e]?.label}
            {e !== 'todos' && <span className="ml-1.5 opacity-70">{conteo(e)}</span>}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={exportarExcel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-white"
          style={{ fontSize: 13, background: 'linear-gradient(135deg,#16a34a,#15803d)', border: '1px solid rgba(34,197,94,0.4)' }}
          title="Descargar Excel (respeta el filtro seleccionado)">
          <FileSpreadsheet size={14} /> Exportar a Excel
        </button>
        <button onClick={copiarFormulario}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold"
          style={{ fontSize: 13, background: 'var(--bg-input)', border: '1px solid var(--border-2)', color: 'var(--text)' }}>
          <Copy size={14} /> Copiar link del formulario
        </button>
      </div>

      {items === null ? (
        <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <Loader2 size={18} className="animate-spin" /> Cargando…
        </div>
      ) : visibles.length === 0 ? (
        <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border-2)', color: 'var(--text-muted)' }}>
          No hay inscripciones {filtro !== 'todos' ? `en estado "${ESTADOS[filtro]?.label}"` : 'todavía'}.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visibles.map(i => {
            const est = ESTADOS[i.estado || 'nuevo'] ?? ESTADOS.nuevo
            return (
              <div key={i.id} className="kpi-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold truncate" style={{ color: 'var(--text)' }}>{i.empresa || '(sin empresa)'}</span>
                      {i.rubro && <span className="badge" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border-2)' }}>{i.rubro}</span>}
                    </div>
                    {i.nombre && <div className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{i.nombre}</div>}
                  </div>
                  <span className="badge shrink-0" style={{ background: est.bg, color: est.color, border: `1px solid ${est.border}` }}>{est.label}</span>
                </div>

                {i.mensaje && (
                  <p className="text-sm mt-3 rounded-lg px-3 py-2" style={{ color: 'var(--text)', background: 'var(--bg-input)', border: '1px solid var(--border-2)' }}>{i.mensaje}</p>
                )}

                <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: 'var(--text-faint)' }}>
                  <Clock size={12} /> {fmt(i.creadoEn)}
                </div>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {i.whatsapp && (
                    <a href={waLink(i.whatsapp, i.empresa)} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)' }}>
                      <MessageCircle size={13} /> {i.whatsapp}
                    </a>
                  )}
                  {i.email && (
                    <a href={`mailto:${i.email}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-2)', color: 'var(--text)' }}>
                      <Mail size={13} /> {i.email}
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 gap-2">
                  <select value={i.estado || 'nuevo'} onChange={e => cambiarEstado(i.id, e.target.value)}
                    className="input" style={{ width: 'auto', padding: '5px 10px', fontSize: 12, background: 'var(--bg-input)' }}>
                    {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <button onClick={() => borrar(i)} className="transition hover:text-red-400" style={{ color: 'var(--icon)' }} title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
