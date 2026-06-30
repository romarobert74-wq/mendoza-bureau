'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSocios, eliminarSocio } from '@/lib/firestore'
import { useAuth } from '@/context/AuthContext'
import { CATEGORIAS } from '@/types'
import type { Socio } from '@/types'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, CheckCircle, XCircle, ExternalLink } from 'lucide-react'

export default function SociosPage() {
  const { usuario } = useAuth()
  const [socios, setSocios] = useState<Socio[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')

  const cargar = async () => {
    setLoading(true)
    const data = await getSocios()
    setSocios(data)
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const handleEliminar = async (socio: Socio) => {
    if (!confirm(`¿Eliminar a ${socio.razonSocial}? Esta acción no se puede deshacer.`)) return
    try {
      await eliminarSocio(socio.id)
      toast.success('Socio eliminado')
      cargar()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const filtrados = socios.filter(s =>
    s.razonSocial.toLowerCase().includes(filtro.toLowerCase()) ||
    s.etiqueta.toLowerCase().includes(filtro.toLowerCase())
  )

  const puedeEditar = usuario?.rol === 'el_faro' || usuario?.rol === 'bureau'
  const puedeEliminar = usuario?.rol === 'el_faro'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Socios</h2>
          <p className="text-gray-500 text-sm mt-1">{socios.length} socios registrados</p>
        </div>
        {puedeEditar && (
          <Link
            href="/dashboard/socios/nuevo"
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <Plus size={16} />
            Nuevo socio
          </Link>
        )}
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre o etiqueta..."
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
        className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          Cargando...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Socio</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Categoría</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Dirección</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Estado</th>
                {puedeEditar && (
                  <th className="text-right px-4 py-3 text-gray-600 font-medium">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-8">
                    No hay socios registrados
                  </td>
                </tr>
              ) : (
                filtrados.map(socio => (
                  <tr key={socio.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{socio.razonSocial}</div>
                      <div className="text-gray-400 text-xs">{socio.etiqueta}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium">
                        {CATEGORIAS[socio.categoria]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{socio.direccion}</td>
                    <td className="px-4 py-3">
                      {socio.activo ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs">
                          <CheckCircle size={14} /> Activo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <XCircle size={14} /> Inactivo
                        </span>
                      )}
                    </td>
                    {puedeEditar && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {socio.urlInternaTour && (
                            <a
                              href={socio.urlInternaTour}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-primary-600 transition"
                              title="Ver tour"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
                          <Link
                            href={`/dashboard/socios/${socio.id}`}
                            className="text-gray-400 hover:text-primary-600 transition"
                          >
                            <Pencil size={16} />
                          </Link>
                          {puedeEliminar && (
                            <button
                              onClick={() => handleEliminar(socio)}
                              className="text-gray-400 hover:text-red-500 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
