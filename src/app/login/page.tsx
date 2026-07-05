'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/dashboard')
    } catch {
      toast.error('Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
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
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="input" placeholder="tu@email.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="input" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2" style={{ padding: '10px' }}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
