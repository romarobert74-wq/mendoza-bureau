'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard,
  Users,
  MapPin,
  Settings,
  LogOut,
  Map,
  Bot,
  Globe,
} from 'lucide-react'
import type { Rol } from '@/types'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['el_faro', 'bureau', 'socio'] as Rol[],
  },
  {
    href: '/dashboard/socios',
    label: 'Socios',
    icon: MapPin,
    roles: ['el_faro', 'bureau'] as Rol[],
  },
  {
    href: '/dashboard/tour-madre',
    label: 'Tour Madre',
    icon: Map,
    roles: ['el_faro'] as Rol[],
  },
  {
    href: '/dashboard/web-bureau',
    label: 'Web Institucional',
    icon: Globe,
    roles: ['el_faro', 'bureau'] as Rol[],
  },
  {
    href: '/dashboard/chat-ia',
    label: 'Chat IA',
    icon: Bot,
    roles: ['el_faro'] as Rol[],
  },
  {
    href: '/dashboard/usuarios',
    label: 'Usuarios',
    icon: Users,
    roles: ['el_faro'] as Rol[],
  },
  {
    href: '/dashboard/configuracion',
    label: 'Configuración',
    icon: Settings,
    roles: ['el_faro'] as Rol[],
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, usuario, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl p-8 shadow text-center max-w-sm">
          <p className="text-gray-700 font-medium mb-2">Tu cuenta no tiene perfil asignado</p>
          <p className="text-gray-400 text-sm mb-4">
            El administrador debe crear tu documento en Firestore con el rol correspondiente.
          </p>
          <button
            onClick={async () => { await signOut(auth); router.push('/login') }}
            className="text-sm text-primary-600 hover:underline"
          >
            Volver al login
          </button>
        </div>
      </div>
    )
  }

  const visibleNav = navItems.filter(item => item.roles.includes(usuario.rol))

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="font-bold text-lg">Mendoza Bureau</h1>
          <p className="text-gray-400 text-xs mt-1 truncate">{usuario.email}</p>
          <span className="inline-block mt-2 px-2 py-0.5 bg-primary-600 rounded text-xs font-medium">
            {usuario.rol === 'el_faro' ? 'El Faro' : usuario.rol === 'bureau' ? 'Bureau' : 'Socio'}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {visibleNav.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  active
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition w-full"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
