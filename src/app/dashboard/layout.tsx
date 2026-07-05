'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getConfigSistema } from '@/lib/firestore'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, Users, MapPin, Settings,
  LogOut, Map, Bot, Globe,
} from 'lucide-react'
import type { Rol } from '@/types'

const navItems = [
  { href: '/dashboard',               label: 'Dashboard',         icon: LayoutDashboard, roles: ['el_faro', 'bureau', 'socio'] as Rol[] },
  { href: '/dashboard/socios',        label: 'Socios',            icon: MapPin,           roles: ['el_faro', 'bureau'] as Rol[] },
  { href: '/dashboard/tour-madre',    label: 'Tour Madre',        icon: Map,              roles: ['el_faro'] as Rol[] },
  { href: '/dashboard/web-bureau',    label: 'Web Institucional', icon: Globe,            roles: ['el_faro', 'bureau'] as Rol[] },
  { href: '/dashboard/chat-ia',       label: 'Chat IA',           icon: Bot,              roles: ['el_faro'] as Rol[] },
  { href: '/dashboard/usuarios',      label: 'Usuarios',          icon: Users,            roles: ['el_faro'] as Rol[] },
  { href: '/dashboard/configuracion', label: 'Configuración',     icon: Settings,         roles: ['el_faro'] as Rol[] },
]

const ROL_LABEL: Record<Rol, string> = {
  el_faro: 'El Faro',
  bureau: 'Bureau',
  socio: 'Socio',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, usuario, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [logoUrl, setLogoUrl] = useState('')

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    getConfigSistema().then(cfg => { if (cfg?.logoUrl) setLogoUrl(cfg.logoUrl) }).catch(() => {})
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="card p-8 text-center max-w-sm">
          <p className="font-medium mb-2" style={{ color: 'var(--text)' }}>Sin perfil asignado</p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>El administrador debe asignarte un rol.</p>
          <button
            onClick={async () => { await signOut(auth); router.push('/login') }}
            className="text-sm transition" style={{ color: 'var(--blue-3)' }}
          >
            Volver al login
          </button>
        </div>
      </div>
    )
  }

  const visibleNav = navItems.filter(item => item.roles.includes(usuario.rol))

  return (
    <div className="dashboard-scope min-h-screen flex" style={{ background: 'var(--bg)' }}>

      {/* Sidebar */}
      <aside className="w-60 flex flex-col shrink-0" style={{
        background: 'var(--bg-elev)',
        borderRight: '1px solid var(--border)',
      }}>
        {/* Logo */}
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain shrink-0"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-2)' }} />
            ) : (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#f15a24,#ff7a45)', border: '1px solid #ff7a45', boxShadow: '0 0 14px rgba(241,90,36,0.4)' }}>
                <span className="text-white text-xs font-black">MB</span>
              </div>
            )}
            <span className="font-bold text-sm tracking-wide" style={{ color: 'var(--text)' }}>Mendoza Bureau</span>
          </div>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{usuario.email}</p>
          <span className="badge badge-orange mt-2">{ROL_LABEL[usuario.rol]}</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {visibleNav.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition group ${active ? 'nav-active' : ''}`}
                style={active ? {} : {
                  color: 'var(--text-muted)',
                  border: '1px solid transparent',
                }}
              >
                <item.icon size={16} style={active ? { color: 'var(--orange-2)' } : {}} />
                <span style={active ? { color: 'var(--orange-2)', fontWeight: 600 } : {}}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={async () => { await signOut(auth); router.push('/login') }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition w-full"
            style={{ color: 'var(--text-muted)' }}
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto" style={{ background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}
