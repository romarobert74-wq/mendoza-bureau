'use client'

import { useEffect, useState } from 'react'
import { getUsuarios, actualizarUsuario, eliminarUsuario, crearUsuario } from '@/lib/firestore'
import { ROLES } from '@/types'
import type { Usuario, Rol } from '@/types'
import { initializeApp, getApps, deleteApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import toast from 'react-hot-toast'
import { Trash2, Plus, X, Pencil, Check, UserCog } from 'lucide-react'

// Firebase config (mismo proyecto, instancia secundaria para no desloguear al admin)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Crea el usuario en Auth usando una app secundaria (no toca la sesión del admin)
async function crearAuthAislado(email: string, password: string): Promise<string> {
  const nombre = `user-creation-${Date.now()}`
  const secondary = getApps().find(a => a.name === nombre) ?? initializeApp(firebaseConfig, nombre)
  const secondaryAuth = getAuth(secondary)
  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password)
    const uid = cred.user.uid
    await signOut(secondaryAuth)
    return uid
  } finally {
    await deleteApp(secondary).catch(() => {})
  }
}

const ROL_BADGE: Record<Rol, { bg: string; color: string; border: string }> = {
  el_faro: { bg: 'rgba(241,90,36,0.14)', color: '#ff7a45', border: 'rgba(241,90,36,0.3)' },
  bureau:  { bg: 'rgba(59,130,246,0.14)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  socio:   { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80', border: 'rgba(34,197,94,0.28)' },
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<string | null>(null)
  const [nombreEdit, setNombreEdit] = useState('')

  const cargar = async () => {
    setLoading(true)
    const data = await getUsuarios()
    setUsuarios(data)
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const handleCambiarRol = async (uid: string, rol: Rol) => {
    try {
      await actualizarUsuario(uid, { rol })
      toast.success('Rol actualizado')
      cargar()
    } catch {
      toast.error('Error al cambiar rol')
    }
  }

  const guardarNombre = async (uid: string) => {
    if (!nombreEdit.trim()) { toast.error('El nombre no puede estar vacío'); return }
    try {
      await actualizarUsuario(uid, { nombre: nombreEdit.trim() })
      toast.success('Nombre actualizado')
      setEditando(null)
      cargar()
    } catch {
      toast.error('Error al actualizar')
    }
  }

  const handleEliminar = async (u: Usuario) => {
    if (!confirm(`¿Dar de baja a ${u.email}?\n\nSe le quita el acceso al sistema (se elimina su rol). La cuenta de login sigue existiendo en Firebase pero no podrá ingresar.`)) return
    try {
      await eliminarUsuario(u.uid)
      toast.success('Usuario dado de baja')
      cargar()
    } catch {
      toast.error('Error al dar de baja')
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-title mb-1">Gestión</p>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Usuarios</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{usuarios.length} usuarios registrados</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={15} />
          Nuevo usuario
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--orange)', borderTopColor: 'transparent' }} />
          Cargando...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usuarios.map(u => {
            const badge = ROL_BADGE[u.rol]
            return (
              <div key={u.uid} className="kpi-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-2)' }}>
                      <UserCog size={17} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div className="min-w-0">
                      {editando === u.uid ? (
                        <div className="flex items-center gap-1">
                          <input autoFocus value={nombreEdit} onChange={e => setNombreEdit(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && guardarNombre(u.uid)}
                            className="input" style={{ padding: '4px 8px', fontSize: '13px', width: '130px' }} />
                          <button onClick={() => guardarNombre(u.uid)} className="transition hover:opacity-80" style={{ color: 'var(--green)' }}>
                            <Check size={16} />
                          </button>
                          <button onClick={() => setEditando(null)} className="transition hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold truncate" style={{ color: 'var(--text)' }}>{u.nombre}</span>
                          <button onClick={() => { setEditando(u.uid); setNombreEdit(u.nombre) }}
                            className="transition hover:opacity-80 shrink-0" style={{ color: 'var(--icon)' }}>
                            <Pencil size={12} />
                          </button>
                        </div>
                      )}
                      <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                  <button onClick={() => handleEliminar(u)} className="transition hover:text-red-400 shrink-0" style={{ color: 'var(--icon)' }} title="Dar de baja">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="badge" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                    {ROLES[u.rol]}
                  </span>
                  <select
                    value={u.rol}
                    onChange={e => handleCambiarRol(u.uid, e.target.value as Rol)}
                    className="input"
                    style={{ width: 'auto', padding: '5px 10px', fontSize: '12px', background: 'var(--bg-input)' }}
                  >
                    {(Object.entries(ROLES) as [Rol, string][]).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && <NuevoUsuarioModal onClose={() => setShowModal(false)} onCreated={cargar} />}
    </div>
  )
}

function NuevoUsuarioModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState<Rol>('socio')
  const [loading, setLoading] = useState(false)

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const uid = await crearAuthAislado(email, password)
      await crearUsuario(uid, { email, nombre, rol })
      toast.success('Usuario creado')
      onCreated()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear usuario'
      toast.error(msg.replace('Firebase:', '').trim())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.65)' }}>
      <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border-2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: 'var(--text)' }}>Nuevo usuario</h3>
          <button onClick={onClose} className="transition hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleCrear} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>Nombre</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} required className="input" placeholder="Nombre completo" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input" placeholder="usuario@ejemplo.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="input" placeholder="Mínimo 6 caracteres" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>Rol</label>
            <select value={rol} onChange={e => setRol(e.target.value as Rol)} className="input">
              {(Object.entries(ROLES) as [Rol, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2" style={{ padding: '10px' }}>
            {loading ? 'Creando...' : 'Crear usuario'}
          </button>
        </form>
      </div>
    </div>
  )
}
