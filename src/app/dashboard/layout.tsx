'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, Users, MapPin, Settings,
  LogOut, Map, Bot, Globe,
} from 'lucide-react'
import type { Rol } from '@/types'

const navItems = [
  { href: '/dashboard',               label: 'Dashboard',        icon: LayoutDashboard, roles: ['el_faro', 'bureau', 'socio'] as Rol[] },
  { href: '/dashboard/socios',        label: 'Socios',           icon: MapPin,          roles: ['el_faro', 'bureau'] as Rol[] },
  { href: '/dashboard/tour-madre',    label: 'Tour Madre',       icon: Map,             roles: ['el_faro'] as Rol[] },
  { href: '/dashboard/web-bureau',    label: 'Web Institucional',icon: Globe,           roles: ['el_faro', 'bureau'] as Rol[] },
  { href: '/dashboard/chat-ia',       label: 'Chat IA',          icon: Bot,             roles: ['el_faro'] as Rol[] },
  { href: '/dashboard/usuarios',      label: 'Usuarios',         icon: Users,           roles: ['el_faro'] as Rol[] },
  { href: '/dashboard/configuracion', label: 'Configuración',    icon: Settings,        roles: ['el_faro'] as Rol[] },
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

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080c18' }}>
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080c18' }}>
        <div className="card p-8 text-center max-w-sm">
          <p className="text-white font-medium mb-2">Sin perfil asignado</p>
          <p className="text-slate-400 text-sm mb-4">El administrador debe asignarte un rol.</p>
          <button
            onClick={async () => { await signOut(auth); router.push('/login') }}
            className="text-sm text-blue-400 hover:text-blue-300 transition"
          >
            Volver al login
          </button>
        </div>
      </div>
    )
  }

  const visibleNav = navItems.filter(item => item.roles.includes(usuario.rol))

  return (
    <div className="min-h-screen flex" style={{ background: '#080c18' }}>

      {/* Sidebar */}
      <aside className="w-60 flex flex-col shrink-0" style={{
        background: '#0d1225',
        borderRight: '1px solid #1a2235',
      }}>
        {/* Logo */}
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid #1a2235' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', border: '1px solid #3b82f6' }}>
              <span className="text-white text-xs font-black">MB</span>
            </div>
            <span className="font-bold text-white text-sm tracking-wide">Mendoza Bureau</span>
          </div>
          <p className="text-slate-500 text-xs truncate">{usuario.email}</p>
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
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition group"
                style={active ? {
                  background: 'rgba(37,99,235,0.18)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59,130,246,0.25)',
                } : {
                  color: '#64748b',
                  border: '1px solid transparent',
                }}
              >
                <item.icon size={16} style={active ? { color: '#60a5fa' } : {}} />
                <span className={active ? 'text-blue-400 font-medium' : 'group-hover:text-slate-300 transition'}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid #1a2235' }}>
          <button
            onClick={async () => { await signOut(auth); router.push('/login') }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition w-full"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto" style={{ background: '#080c18' }}>
        {children}
      </main>
    </div>
  )
}
