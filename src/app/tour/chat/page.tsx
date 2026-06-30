'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { collection, getDocs, orderBy, query, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Send, Utensils, Hotel, Wrench, Package, Wine } from 'lucide-react'

function renderMensaje(texto: string) {
  const partes = texto.split('\n')
  return partes.map((linea, i) => {
    // Heading ## o ###
    if (/^#{1,3}\s/.test(linea)) {
      const txt = linea.replace(/^#+\s/, '')
      return <p key={i} className="font-bold text-white text-[13px] mt-1">{renderInline(txt)}</p>
    }
    // Línea vacía
    if (linea.trim() === '') return <div key={i} className="h-1" />
    return <p key={i} className="text-[13px] leading-relaxed">{renderInline(linea)}</p>
  })
}

function renderInline(texto: string) {
  // Split by URLs and **bold**
  const regex = /(\*\*[^*]+\*\*|https?:\/\/[^\s]+)/g
  const parts = texto.split(regex)
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => {
            e.preventDefault()
            try { window.top!.location.href = part } catch { window.open(part, '_blank') }
          }}
          className="underline font-medium break-all"
          style={{ color: '#93C5FD' }}
        >
          {part}
        </a>
      )
    }
    return <span key={i}>{part}</span>
  })
}

interface Socio {
  id: string
  razonSocial: string
  categoria: string
  etiqueta: string
  infoGeneral: string
  direccion: string
  urlInternaTour: string
  activo: boolean
  contacto?: { whatsapp?: string; web?: string; email?: string }
}

interface ChatbotConfig {
  tono: string
  modelo: string
  promptSistema: string
  bienvenida: string
}

interface Mensaje {
  rol: 'user' | 'assistant' | 'system'
  contenido: string
  botones?: { label: string; valor: string }[]
}

const CAT_ICONS: Record<string, React.ReactNode> = {
  bodega: <Wine size={18} />,
  restaurante: <Utensils size={18} />,
  hotel: <Hotel size={18} />,
  alojamiento: <Hotel size={18} />,
  servicio: <Wrench size={18} />,
  otro: <Package size={18} />,
}

const CAT_LABELS: Record<string, string> = {
  bodega: 'Bodegas',
  restaurante: 'Restaurantes',
  hotel: 'Hoteles',
  alojamiento: 'Alojamiento',
  servicio: 'Servicios',
  otro: 'Otros',
}

const CAT_COLORS: Record<string, string> = {
  bodega: '#A855F7',
  restaurante: '#F59E0B',
  hotel: '#3B82F6',
  alojamiento: '#10B981',
  servicio: '#6366F1',
  otro: '#6B7280',
}

const CACHE_KEY = 'tour_socios_cache'
const CACHE_TTL = 5 * 60 * 1000
const CONFIG_KEY = 'tour_chatbot_config_cache'

const CONFIG_DEFAULT: ChatbotConfig = {
  tono: 'amigable',
  modelo: 'claude-haiku-4-5',
  promptSistema: 'Sos un asistente turístico experto en Mendoza, Argentina. Respondés preguntas sobre bodegas, restaurantes, hoteles y servicios de la región.',
  bienvenida: '¡Hola! Soy tu guía virtual de Mendoza. ¿En qué te puedo ayudar hoy?',
}

export default function TourChatPage() {
  const [socios, setSocios] = useState<Socio[]>([])
  const [config, setConfig] = useState<ChatbotConfig>(CONFIG_DEFAULT)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [listo, setListo] = useState(false)
  const mensajesRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.body.style.background = 'transparent'
    document.documentElement.style.background = 'transparent'
  }, [])

  // Load socios + config
  useEffect(() => {
    const init = async () => {
      // Socios from cache or Firestore
      let sociosData: Socio[] = []
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { data, ts } = JSON.parse(cached)
          if (Date.now() - ts < CACHE_TTL) { sociosData = data }
        }
      } catch {}
      if (sociosData.length === 0) {
        try {
          const q = query(collection(db, 'socios'), orderBy('razonSocial', 'asc'))
          const snap = await getDocs(q)
          sociosData = snap.docs.map(d => ({ id: d.id, ...d.data() } as Socio)).filter(s => s.activo !== false)
          try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data: sociosData, ts: Date.now() })) } catch {}
        } catch {}
      }
      setSocios(sociosData)

      // Config from cache or Firestore
      let cfg = CONFIG_DEFAULT
      try {
        const cc = localStorage.getItem(CONFIG_KEY)
        if (cc) {
          const { data, ts } = JSON.parse(cc)
          if (Date.now() - ts < CACHE_TTL) { cfg = data }
        }
      } catch {}
      if (cfg === CONFIG_DEFAULT) {
        try {
          const snap = await getDoc(doc(db, 'configuracion', 'chatbot'))
          if (snap.exists()) {
            cfg = { ...CONFIG_DEFAULT, ...snap.data() } as ChatbotConfig
            try { localStorage.setItem(CONFIG_KEY, JSON.stringify({ data: cfg, ts: Date.now() })) } catch {}
          }
        } catch {}
      }
      setConfig(cfg)

      // Initial greeting with category buttons
      const cats = Array.from(new Set(sociosData.map(s => s.categoria))).filter(c => CAT_LABELS[c])
      setMensajes([{
        rol: 'assistant',
        contenido: cfg.bienvenida,
        botones: [
          ...cats.map(c => ({ label: `${CAT_LABELS[c]}`, valor: `Mostrame los ${CAT_LABELS[c].toLowerCase()}` })),
          { label: '¿Cómo llego?', valor: '¿Cómo llego a los socios?' },
          { label: 'Recomendame algo', valor: 'Recomendame un lugar para visitar en Mendoza' },
        ],
      }])
      setListo(true)
    }
    init()
  }, [])

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight
    }
  }, [mensajes])

  const enviar = useCallback(async (texto: string) => {
    const t = texto.trim()
    if (!t || enviando) return
    setInput('')

    const historial: Mensaje[] = [...mensajes, { rol: 'user', contenido: t }]
    setMensajes(historial)
    setEnviando(true)

    try {
      const sociosResumen = socios.map(s => ({
        nombre: s.razonSocial,
        categoria: CAT_LABELS[s.categoria] ?? s.categoria,
        descripcion: s.etiqueta || s.infoGeneral,
        direccion: s.direccion,
        urlTour: s.urlInternaTour,
        whatsapp: s.contacto?.whatsapp,
        web: s.contacto?.web,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensajes: historial
            .filter(m => m.rol !== 'system')
            .map(m => ({ rol: m.rol, contenido: m.contenido })),
          config: { modelo: config.modelo, promptSistema: config.promptSistema, tono: config.tono },
          socios: sociosResumen,
        }),
      })
      const data = await res.json()
      setMensajes(m => [...m, { rol: 'assistant', contenido: data.respuesta ?? 'No pude obtener una respuesta.' }])
    } catch {
      setMensajes(m => [...m, { rol: 'assistant', contenido: 'Hubo un error. Intentá de nuevo.' }])
    } finally {
      setEnviando(false)
      inputRef.current?.focus()
    }
  }, [mensajes, enviando, socios, config])

  const bg = 'rgba(15, 15, 25, 0.82)'
  const border = 'rgba(255,255,255,0.18)'

  return (
    <div
      className="min-h-screen w-full flex items-end justify-end p-3 sm:items-start"
      style={{ background: 'transparent' }}
    >
      <div
        className="flex flex-col rounded-2xl overflow-hidden"
        style={{
          width: '100%',
          maxWidth: '380px',
          height: '92vh',
          maxHeight: '650px',
          background: bg,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: `1px solid ${border}`,
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ borderBottom: `1px solid ${border}`, background: 'rgba(255,255,255,0.05)' }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
            style={{ background: 'linear-gradient(135deg,#A855F7,#3B82F6)' }}
          >
            🤖
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight">Guía Mendoza Bureau</p>
            <p className="text-white/50 text-[11px]">Asistente virtual · Siempre disponible</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-green-400 text-[11px] font-medium">En línea</span>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={mensajesRef}
          className="flex-1 overflow-y-auto px-3 py-3 space-y-3"
          style={{ overscrollBehavior: 'contain' }}
        >
          {!listo ? (
            <div className="flex justify-center items-center h-full">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          ) : (
            mensajes.map((m, i) => (
              <div key={i}>
                <div className={`flex ${m.rol === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                  {m.rol === 'assistant' && (
                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs mb-0.5"
                      style={{ background: 'linear-gradient(135deg,#A855F7,#3B82F6)' }}>
                      🤖
                    </div>
                  )}
                  <div
                    className="max-w-[85%] px-3 py-2.5 rounded-2xl"
                    style={m.rol === 'user' ? {
                      background: 'linear-gradient(135deg,#7C3AED,#4F46E5)',
                      color: 'white',
                      borderBottomRightRadius: 4,
                    } : {
                      background: 'rgba(255,255,255,0.12)',
                      color: 'rgba(255,255,255,0.85)',
                      borderBottomLeftRadius: 4,
                    }}
                  >
                    {m.rol === 'user'
                      ? <p className="text-[13px] leading-relaxed">{m.contenido}</p>
                      : renderMensaje(m.contenido)
                    }
                  </div>
                </div>

                {/* Quick reply buttons */}
                {m.botones && m.botones.length > 0 && i === mensajes.length - 1 && !enviando && (
                  <div className="ml-8 mt-2 flex flex-wrap gap-1.5">
                    {m.botones.map((b, bi) => (
                      <button
                        key={bi}
                        onClick={() => enviar(b.valor)}
                        className="text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95"
                        style={{
                          background: 'rgba(255,255,255,0.12)',
                          border: '1px solid rgba(255,255,255,0.25)',
                          color: 'rgba(255,255,255,0.85)',
                        }}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Category cards when showing socios */}
          {enviando && (
            <div className="flex justify-start items-end gap-2">
              <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs"
                style={{ background: 'linear-gradient(135deg,#A855F7,#3B82F6)' }}>🤖</div>
              <div className="px-3 py-2.5 rounded-2xl rounded-bl-sm" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category quick-access strip */}
        {listo && mensajes.length <= 1 && (
          <div className="px-3 pb-2 flex gap-2 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
            {Array.from(new Set(socios.map(s => s.categoria))).filter(c => CAT_LABELS[c]).map(cat => (
              <button
                key={cat}
                onClick={() => enviar(`Mostrame los ${CAT_LABELS[cat].toLowerCase()}`)}
                className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', minWidth: 64 }}
              >
                <span style={{ color: CAT_COLORS[cat] }}>{CAT_ICONS[cat]}</span>
                <span className="text-white/75 text-[10px] font-semibold">{CAT_LABELS[cat]}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-3 pb-3 pt-2 flex-shrink-0" style={{ borderTop: `1px solid ${border}` }}>
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviar(input)}
              placeholder="Escribí tu pregunta..."
              className="flex-1 bg-transparent text-white placeholder-white/35 text-[13px] outline-none"
              disabled={!listo}
            />
            <button
              onClick={() => enviar(input)}
              disabled={enviando || !input.trim() || !listo}
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
          <p className="text-white/25 text-[10px] text-center mt-1.5">Mendoza Bureau · Asistente IA</p>
        </div>
      </div>
    </div>
  )
}
