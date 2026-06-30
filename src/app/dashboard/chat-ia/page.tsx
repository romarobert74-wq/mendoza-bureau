'use client'

import { useEffect, useState, useRef } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Bot, Save, Send, Trash2, Upload, X, FileText, Loader2 } from 'lucide-react'

interface ChatbotConfig {
  tono: string
  modelo: string
  promptSistema: string
  bienvenida: string
  documentos: { nombre: string; contenido: string }[]
  updatedAt?: string
}

const CONFIG_DEFAULT: ChatbotConfig = {
  tono: 'amigable',
  modelo: 'claude-haiku-4-5',
  promptSistema:
    'Sos un asistente turístico experto en Mendoza, Argentina. Respondés preguntas sobre bodegas, restaurantes, hoteles y servicios de la región. Sés amable, conciso y útil. Siempre respondés en español.',
  bienvenida: '¡Hola! Soy tu guía virtual de Mendoza. ¿En qué te puedo ayudar hoy?',
  documentos: [],
}

const TONOS = [
  { value: 'amigable', label: 'Amigable' },
  { value: 'profesional', label: 'Profesional' },
  { value: 'entusiasta', label: 'Entusiasta' },
  { value: 'formal', label: 'Formal' },
]

const MODELOS = [
  { value: 'claude-haiku-4-5', label: 'Haiku 4.5 — Rápido y económico' },
  { value: 'claude-sonnet-4-6', label: 'Sonnet 4.6 — Balance velocidad/calidad' },
  { value: 'claude-opus-4-8', label: 'Opus 4.8 — Máxima calidad' },
]

interface Mensaje {
  rol: 'user' | 'assistant'
  contenido: string
}

export default function ChatIAPage() {
  const { usuario, loading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'config' | 'conocimiento' | 'probar'>('config')
  const [config, setConfig] = useState<ChatbotConfig>(CONFIG_DEFAULT)
  const [guardando, setGuardando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const mensajesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loading && usuario?.rol !== 'el_faro') {
      router.replace('/dashboard')
    }
  }, [usuario, loading, router])

  useEffect(() => {
    const cargar = async () => {
      try {
        const snap = await getDoc(doc(db, 'configuracion', 'chatbot'))
        if (snap.exists()) {
          setConfig({ ...CONFIG_DEFAULT, ...(snap.data() as ChatbotConfig) })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight
    }
  }, [mensajes])

  const guardar = async () => {
    setGuardando(true)
    try {
      await setDoc(doc(db, 'configuracion', 'chatbot'), {
        ...config,
        updatedAt: new Date().toISOString(),
      })
      toast.success('Configuración guardada')
    } catch (err) {
      console.error(err)
      toast.error('Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const subirPDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast.error('Solo se permiten archivos PDF')
      return
    }
    if (file.size > 1_000_000) {
      toast.error('El archivo no puede superar 1 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]
      setConfig(c => ({
        ...c,
        documentos: [...c.documentos, { nombre: file.name, contenido: base64 }],
      }))
      toast.success(`"${file.name}" agregado`)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const eliminarDoc = (idx: number) => {
    setConfig(c => ({
      ...c,
      documentos: c.documentos.filter((_, i) => i !== idx),
    }))
  }

  const enviarMensaje = async () => {
    const texto = input.trim()
    if (!texto || enviando) return
    setInput('')
    const nuevos: Mensaje[] = [...mensajes, { rol: 'user', contenido: texto }]
    setMensajes(nuevos)
    setEnviando(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensajes: nuevos,
          config: {
            modelo: config.modelo,
            promptSistema: config.promptSistema,
            tono: config.tono,
          },
        }),
      })
      if (!res.ok) throw new Error('Error en la respuesta')
      const data = await res.json()
      setMensajes(m => [...m, { rol: 'assistant', contenido: data.respuesta }])
    } catch (err) {
      console.error(err)
      toast.error('Error al enviar el mensaje')
    } finally {
      setEnviando(false)
    }
  }

  if (loading || cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Bot size={28} className="text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat IA</h1>
          <p className="text-gray-500 text-sm">Configurá el asistente virtual para el tour</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-6">
        {([
          { key: 'config', label: 'Configuración' },
          { key: 'conocimiento', label: 'Conocimiento' },
          { key: 'probar', label: 'Probar' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 text-sm font-semibold transition border-b-2 -mb-px ${
              tab === t.key
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'config' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Tono del asistente
              </label>
              <div className="flex gap-2 flex-wrap">
                {TONOS.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setConfig(c => ({ ...c, tono: t.value }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      config.tono === t.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Modelo de IA
              </label>
              <select
                value={config.modelo}
                onChange={e => setConfig(c => ({ ...c, modelo: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
              >
                {MODELOS.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Prompt del sistema
              </label>
              <textarea
                rows={5}
                value={config.promptSistema}
                onChange={e => setConfig(c => ({ ...c, promptSistema: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                placeholder="Instrucciones base para el asistente..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mensaje de bienvenida
              </label>
              <input
                type="text"
                value={config.bienvenida}
                onChange={e => setConfig(c => ({ ...c, bienvenida: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Mensaje inicial que verá el usuario..."
              />
            </div>
          </div>

          <button
            onClick={guardar}
            disabled={guardando}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-60"
          >
            {guardando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {guardando ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </div>
      )}

      {tab === 'conocimiento' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-1">Documentos de conocimiento</h3>
            <p className="text-gray-500 text-sm mb-4">
              Subí PDFs con información turística, menús, tarifas, etc. (máx. 1 MB por archivo)
            </p>

            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition w-fit">
              <Upload size={16} />
              Subir PDF
              <input type="file" accept="application/pdf" onChange={subirPDF} className="hidden" />
            </label>

            {config.documentos.length === 0 ? (
              <p className="text-gray-400 text-sm mt-4">No hay documentos cargados aún.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {config.documentos.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText size={16} className="text-primary-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate max-w-xs">{doc.nombre}</span>
                    </div>
                    <button
                      onClick={() => eliminarDoc(idx)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-800 space-y-1.5">
            <p className="font-semibold">Fuentes de información automáticas</p>
            <p className="text-blue-700">El asistente también usa estos datos en tiempo real:</p>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Lista de socios activos con sus categorías y descripciones</li>
              <li>Links de tour virtual de cada socio</li>
            </ul>
          </div>

          <button
            onClick={guardar}
            disabled={guardando}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-60"
          >
            {guardando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      )}

      {tab === 'probar' && (
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col" style={{ height: '60vh' }}>
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-sm font-medium text-gray-700">
                {MODELOS.find(m => m.value === config.modelo)?.label ?? config.modelo}
              </span>
            </div>
            <button
              onClick={() => setMensajes([])}
              className="text-gray-400 hover:text-gray-600 transition flex items-center gap-1 text-xs"
            >
              <Trash2 size={13} />
              Limpiar
            </button>
          </div>

          <div ref={mensajesRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {mensajes.length === 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-700 max-w-sm">
                  {config.bienvenida}
                </div>
              </div>
            )}
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm max-w-sm whitespace-pre-wrap ${
                    m.rol === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}
                >
                  {m.contenido}
                </div>
              </div>
            ))}
            {enviando && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviarMensaje()}
                placeholder="Escribí tu mensaje..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <button
                onClick={enviarMensaje}
                disabled={enviando || !input.trim()}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl transition disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
