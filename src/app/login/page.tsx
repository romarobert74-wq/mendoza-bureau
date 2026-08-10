'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import toast from 'react-hot-toast'

/* Bloqueo por intentos fallidos (anti fuerza bruta, del lado del cliente).
   A partir del 3er intento fallido, hay que esperar un tiempo que escala:
   3 fallos → 30s · 4 → 1 min · 5+ → 5 min.
   Se guarda en el navegador para que sobreviva a un refresh. */
const LS_KEY = 'mb-login-guard'
const MAX_LIBRES = 2 // 2 intentos libres; al 3ro empieza la espera

function esperaPara(fallos: number): number {
  if (fallos >= 5) return 300
  if (fallos === 4) return 60
  if (fallos >= 3) return 30
  return 0
}

type Guard = { fallos: number; bloqueoHasta: number }

function leerGuard(): Guard {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw) as Guard
  } catch { /* noop */ }
  return { fallos: 0, bloqueoHasta: 0 }
}

function guardarGuard(g: Guard) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(g)) } catch { /* noop */ }
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [restante, setRestante] = useState(0) // segundos que faltan del bloqueo
  const router = useRouter()

  // Recalcula el tiempo restante de bloqueo cada segundo
  const tick = useCallback(() => {
    const g = leerGuard()
    const seg = Math.max(0, Math.ceil((g.bloqueoHasta - Date.now()) / 1000))
    setRestante(seg)
  }, [])

  useEffect(() => {
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tick])

  const bloqueado = restante > 0

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (bloqueado || loading) return
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      guardarGuard({ fallos: 0, bloqueoHasta: 0 }) // éxito → reseteo
      router.push('/dashboard')
    } catch {
      // Mensaje genérico: no revelamos si el email existe o no
      const prev = leerGuard()
      const fallos = prev.fallos + 1
      const espera = esperaPara(fallos)
      const bloqueoHasta = espera > 0 ? Date.now() + espera * 1000 : 0
      guardarGuard({ fallos, bloqueoHasta })
      tick()
      if (espera > 0) {
        toast.error(`Demasiados intentos. Esperá ${espera >= 60 ? `${Math.round(espera / 60)} min` : `${espera}s`} antes de reintentar.`)
      } else {
        const rest = MAX_LIBRES - fallos + 1
        toast.error(`Email o contraseña incorrectos.${rest > 0 ? ` Te ${rest === 1 ? 'queda' : 'quedan'} ${rest} intento${rest === 1 ? '' : 's'}.` : ''}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const mmss = (s: number) => {
    const m = Math.floor(s / 60), r = s % 60
    return m > 0 ? `${m}:${String(r).padStart(2, '0')}` : `${r}s`
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(circle at 50% 0%, #1a1a1d 0%, #0a0a0b 60%)' }}>
      <div className="rounded-2xl p-8 w-full max-w-sm"
        style={{ background: 'var(--bg-elev)', border: '1px solid var(--border-2)', boxShadow: '0 24px 70px rgba(0,0,0,0.6)' }}>
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#f15a24,#ff7a45)', boxShadow: '0 0 24px rgba(241,90,36,0.45)' }}>
            <span className="text-white text-lg font-black">MB</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Mendoza Bureau</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Panel de Administración</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={bloqueado}
              autoComplete="username" className="input" placeholder="tu@email.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={bloqueado}
              autoComplete="current-password" className="input" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading || bloqueado} className="btn-primary w-full justify-center mt-2" style={{ padding: '10px' }}>
            {bloqueado ? `Bloqueado — reintentá en ${mmss(restante)}` : loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {bloqueado && (
          <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
            Por seguridad, el acceso se pausa temporalmente tras varios intentos fallidos.
          </p>
        )}
      </div>
    </div>
  )
}
