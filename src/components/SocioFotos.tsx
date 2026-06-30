'use client'

import { useEffect, useState, useRef } from 'react'
import { getFotosSocio, addFotoSocio, deleteFotoSocio, reorderFotosSocio, FotoSocio } from '@/lib/firestore'
import toast from 'react-hot-toast'
import { Upload, Trash2, GripVertical, Loader2, ImageIcon } from 'lucide-react'

const MAX_FOTOS = 25
const MAX_PX = 1200

function resizeImage(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, MAX_PX / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      res(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = rej
    img.src = url
  })
}

export function SocioFotos({ socioId }: { socioId: string }) {
  const [fotos, setFotos] = useState<FotoSocio[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const dragIdx = useRef<number | null>(null)
  const dropIdx = useRef<number | null>(null)

  const cargar = async () => {
    setLoading(true)
    try { setFotos(await getFotosSocio(socioId)) } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { cargar() }, [socioId])

  const subirArchivos = async (files: FileList | null) => {
    if (!files) return
    const arr = Array.from(files)
    const disponibles = MAX_FOTOS - fotos.length
    if (disponibles <= 0) { toast.error(`Máximo ${MAX_FOTOS} fotos`); return }
    const toUpload = arr.slice(0, disponibles)
    if (arr.length > disponibles) toast(`Se subirán solo ${disponibles} foto${disponibles !== 1 ? 's' : ''} (límite ${MAX_FOTOS})`, { icon: 'ℹ️' })
    setUploading(true)
    try {
      await Promise.all(toUpload.map(async (file, i) => {
        const url = await resizeImage(file)
        await addFotoSocio(socioId, { url, orden: fotos.length + i, nombre: file.name })
      }))
      toast.success(`${toUpload.length} foto${toUpload.length !== 1 ? 's' : ''} subida${toUpload.length !== 1 ? 's' : ''}`)
      cargar()
    } catch { toast.error('Error al subir fotos') }
    setUploading(false)
  }

  const eliminar = async (foto: FotoSocio) => {
    if (!confirm('¿Eliminar esta foto?')) return
    try {
      await deleteFotoSocio(socioId, foto.id)
      setFotos(f => f.filter(x => x.id !== foto.id))
      toast.success('Foto eliminada')
    } catch { toast.error('Error al eliminar') }
  }

  // Drag-to-reorder
  const onDragStart = (i: number) => { dragIdx.current = i }
  const onDragEnter = (i: number) => { dropIdx.current = i }
  const onDragEnd = async () => {
    const from = dragIdx.current; const to = dropIdx.current
    if (from === null || to === null || from === to) { dragIdx.current = null; dropIdx.current = null; return }
    const reordered = [...fotos]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    setFotos(reordered)
    dragIdx.current = null; dropIdx.current = null
    try { await reorderFotosSocio(socioId, reordered) }
    catch { toast.error('Error al reordenar'); cargar() }
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Galería de fotos</h3>
          <p className="text-gray-400 text-xs mt-0.5">{fotos.length} / {MAX_FOTOS} fotos · arrastrá para reordenar</p>
        </div>
        {fotos.length < MAX_FOTOS && (
          <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg text-sm font-semibold transition ${uploading ? 'opacity-60 pointer-events-none' : 'bg-primary-600 hover:bg-primary-700 text-white'}`}>
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {uploading ? 'Subiendo...' : 'Subir fotos'}
            <input type="file" accept="image/*" multiple className="hidden" onChange={e => subirArchivos(e.target.files)} />
          </label>
        )}
      </div>

      {/* Drop zone */}
      {fotos.length === 0 && !loading && (
        <label
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); subirArchivos(e.dataTransfer.files) }}
          className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-12 cursor-pointer transition ${dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
        >
          <ImageIcon size={32} className="text-gray-300" />
          <p className="text-sm text-gray-400">Arrastrá fotos aquí o hacé clic para seleccionar</p>
          <p className="text-xs text-gray-300">Máximo {MAX_FOTOS} fotos · JPG, PNG, WEBP</p>
          <input type="file" accept="image/*" multiple className="hidden" onChange={e => subirArchivos(e.target.files)} />
        </label>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-2">
          {fotos.map((foto, i) => (
            <div
              key={foto.id}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragEnter={() => onDragEnter(i)}
              onDragEnd={onDragEnd}
              onDragOver={e => e.preventDefault()}
              className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all"
            >
              <img src={foto.url} alt={foto.nombre} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => eliminar(foto)}
                  type="button"
                  className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <GripVertical size={11} className="text-white" />
              </div>
              <div className="absolute bottom-1 right-1.5 bg-black/50 text-white text-[10px] font-bold rounded px-1">
                {i + 1}
              </div>
            </div>
          ))}

          {/* Add more button */}
          {fotos.length > 0 && fotos.length < MAX_FOTOS && (
            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition">
              <Upload size={18} className="text-gray-300" />
              <span className="text-xs text-gray-400">Agregar</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={e => subirArchivos(e.target.files)} />
            </label>
          )}
        </div>
      )}
    </section>
  )
}
