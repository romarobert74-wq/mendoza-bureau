'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUsuario } from '@/lib/firestore'
import type { Usuario } from '@/types'

interface AuthContextType {
  user: User | null
  usuario: Usuario | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  usuario: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          const data = await getUsuario(firebaseUser.uid)
          setUsuario(data)
        } catch (err) {
          console.error('[Auth] error leyendo usuario Firestore:', err)
          setUsuario(null)
        }
      } else {
        setUsuario(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  return (
    <AuthContext.Provider value={{ user, usuario, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
