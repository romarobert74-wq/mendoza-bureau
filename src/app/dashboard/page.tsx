'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getSocios, getUsuarios } from '@/lib/firestore'
import { MapPin, Users, CheckCircle, XCircle } from 'lucide-react'

interface Stats {
  totalSocios: number
  sociosActivos: number
  totalUsuarios: number
}

export default function DashboardPage() {
  const { usuario } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!usuario) return
      const socios = await getSocios()
      const s: Stats = {
        totalSocios: socios.length,
        sociosActivos: socios.filter(s => s.activo).length,
        totalUsuarios: 0,
      }
      if (usuario.rol === 'el_faro' || usuario.rol === 'bureau') {
        const usuarios = await getUsuarios()
        s.totalUsuarios = usuarios.length
      }
      setStats(s)
    }
    load()
  }, [usuario])

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Bienvenido, {usuario?.nombre}
      </h2>
      <p className="text-gray-500 mb-8">Panel de administración Mendoza Bureau</p>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Total Socios"
            value={stats.totalSocios}
            icon={<MapPin className="text-primary-500" size={24} />}
            color="bg-primary-50"
          />
          <StatCard
            label="Socios Activos"
            value={stats.sociosActivos}
            icon={<CheckCircle className="text-green-500" size={24} />}
            color="bg-green-50"
          />
          {(usuario?.rol === 'el_faro' || usuario?.rol === 'bureau') && (
            <StatCard
              label="Usuarios del sistema"
              value={stats.totalUsuarios}
              icon={<Users className="text-blue-500" size={24} />}
              color="bg-blue-50"
            />
          )}
        </div>
      )}

      {!stats && (
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          Cargando datos...
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }: {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className={`rounded-xl p-6 ${color} border border-gray-100`}>
      <div className="flex items-center justify-between mb-3">
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
  )
}
