'use client'

import { useState } from 'react'
import type { SalonIndividual, TipoSalon, TipoCatering } from '@/types'
import { TIPOS_SALON, TIPOS_CATERING, SALON_VACIO } from '@/types'
import { Plus, Trash2, ChevronDown, ChevronUp, Building2 } from 'lucide-react'

const lbl = 'block text-xs font-semibold uppercase tracking-wide mb-1.5'
const lbl_c = { color: '#64748b' }
const inp_s = { background: '#111827', border: '1px solid #1e293b', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', color: '#f1f5f9', outline: 'none', width: '100%' }

function Num({ label, value, onChange, placeholder }: { label: string; value: number | null; onChange: (v: number | null) => void; placeholder?: string }) {
  return (
    <div>
      <label style={{ ...lbl_c, display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '5px' }}>{label}</label>
      <input type="number" min={0} value={value ?? ''} onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
        placeholder={placeholder} style={inp_s} />
    </div>
  )
}

function Chk({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ width: '15px', height: '15px', accentColor: '#3b82f6', flexShrink: 0 }} />
      <span style={{ fontSize: '13px', color: '#94a3b8' }}>{label}</span>
    </label>
  )
}

function Txt({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label style={{ ...lbl_c, display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '5px' }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inp_s} />
    </div>
  )
}

function SubTitle({ label }: { label: string }) {
  return (
    <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#f97316', marginBottom: '12px', marginTop: '4px', borderTop: '1px solid #1a2235', paddingTop: '16px' }}>
      {label}
    </p>
  )
}

interface SalonEditorProps {
  salon: SalonIndividual
  index: number
  onChange: (s: SalonIndividual) => void
  onDelete: () => void
  expanded: boolean
  onToggle: () => void
}

function SalonEditor({ salon, index, onChange, onDelete, expanded, onToggle }: SalonEditorProps) {
  const set = <K extends keyof SalonIndividual>(k: K, v: SalonIndividual[K]) =>
    onChange({ ...salon, [k]: v })

  return (
    <div style={{ background: '#080c18', border: '1px solid #1a2235', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Header del salón */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer', background: expanded ? 'rgba(37,99,235,0.06)' : 'transparent' }}
        onClick={onToggle}>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Building2 size={13} color="#60a5fa" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: '14px', color: '#f1f5f9', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {salon.nombre || `Salón ${index + 1}`}
          </p>
          {salon.tipo && (
            <p style={{ fontSize: '11px', color: '#475569', margin: 0 }}>{TIPOS_SALON[salon.tipo]}</p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button type="button" onClick={e => { e.stopPropagation(); onDelete() }}
            style={{ padding: '4px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Trash2 size={13} color="#f87171" />
          </button>
          {expanded ? <ChevronUp size={16} color="#475569" /> : <ChevronDown size={16} color="#475569" />}
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Identificación */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Txt label="Nombre del salón *" value={salon.nombre} onChange={v => set('nombre', v)} placeholder='Ej: Salón Principal, Salón VIP' />
            <div>
              <label style={{ ...lbl_c, display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '5px' }}>Tipo</label>
              <select value={salon.tipo} onChange={e => set('tipo', e.target.value as TipoSalon)} style={{ ...inp_s, background: '#111827' }}>
                {(Object.entries(TIPOS_SALON) as [TipoSalon, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Capacidades por montaje */}
          <div>
            <SubTitle label="Capacidades por configuración de montaje" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
              <Num label="Teatro 🎭" value={salon.capacidadTeatro} onChange={v => set('capacidadTeatro', v)} placeholder="200" />
              <Num label="Escuela 📚" value={salon.capacidadEscuela} onChange={v => set('capacidadEscuela', v)} placeholder="120" />
              <Num label="Banquete 🍽️" value={salon.capacidadBanquete} onChange={v => set('capacidadBanquete', v)} placeholder="150" />
              <Num label="Cóctel 🥂" value={salon.capacidadCoctel} onChange={v => set('capacidadCoctel', v)} placeholder="300" />
              <Num label="Imperial 👑" value={salon.capacidadImperial} onChange={v => set('capacidadImperial', v)} placeholder="60" />
              <Num label="Herradura / U" value={salon.capacidadHerraduraU} onChange={v => set('capacidadHerraduraU', v)} placeholder="40" />
              <Num label="Directorio 💼" value={salon.capacidadDirectorio} onChange={v => set('capacidadDirectorio', v)} placeholder="20" />
            </div>
          </div>

          {/* Espacio físico */}
          <div>
            <SubTitle label="Espacio físico" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <Num label="Metros² cubiertos" value={salon.metrosCuadrados} onChange={v => set('metrosCuadrados', v)} placeholder="450" />
              <Num label="Cantidad de baños" value={salon.cantidadBanios} onChange={v => set('cantidadBanios', v)} placeholder="4" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
              <Chk label="Luz natural" checked={salon.luzNatural} onChange={v => set('luzNatural', v)} />
              <Chk label="Salón divisible" checked={salon.dividible} onChange={v => set('dividible', v)} />
              <Chk label="Piso alto (requiere ascensor)" checked={salon.pisoAlto} onChange={v => set('pisoAlto', v)} />
              <Chk label="Tiene escenario" checked={salon.tieneEscenario} onChange={v => set('tieneEscenario', v)} />
            </div>
            {salon.tieneEscenario && (
              <div style={{ marginTop: '12px' }}>
                <Txt label="Dimensiones del escenario" value={salon.dimensionesEscenario} onChange={v => set('dimensionesEscenario', v)} placeholder="Ej: 8m × 4m × 0.8m" />
              </div>
            )}
          </div>

          {/* Tecnología y AV */}
          <div>
            <SubTitle label="Tecnología y equipamiento AV" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginBottom: '12px' }}>
              <Chk label="Proyector" checked={salon.tieneProyector} onChange={v => set('tieneProyector', v)} />
              <Chk label="Pantalla de proyección" checked={salon.tienePantalla} onChange={v => set('tienePantalla', v)} />
              <Chk label="Pantalla LED" checked={salon.tienePantallaLED} onChange={v => set('tienePantallaLED', v)} />
              <Chk label="Sonido profesional" checked={salon.tieneSonidoProfesional} onChange={v => set('tieneSonidoProfesional', v)} />
              <Chk label="Micrófono" checked={salon.tieneMicrofono} onChange={v => set('tieneMicrofono', v)} />
              <Chk label="Streaming / transmisión" checked={salon.tieneStreaming} onChange={v => set('tieneStreaming', v)} />
              <Chk label="Videoconferencia" checked={salon.tieneVideoconferencia} onChange={v => set('tieneVideoconferencia', v)} />
              <Chk label="Iluminación escénica" checked={salon.tieneIluminacionEscenica} onChange={v => set('tieneIluminacionEscenica', v)} />
              <Chk label="WiFi" checked={salon.tieneWifi} onChange={v => set('tieneWifi', v)} />
              <Chk label="Pizarrón / Flip chart" checked={salon.tienePizarron} onChange={v => set('tienePizarron', v)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {salon.tieneProyector && (
                <Num label="Cantidad de proyectores" value={salon.cantidadProyectores} onChange={v => set('cantidadProyectores', v)} placeholder="2" />
              )}
              {salon.tienePantalla && (
                <Txt label="Dimensiones pantalla" value={salon.dimensionesPantalla} onChange={v => set('dimensionesPantalla', v)} placeholder="3m × 2m" />
              )}
              {salon.tieneMicrofono && (
                <Txt label="Tipos de micrófono" value={salon.tiposMicrofono} onChange={v => set('tiposMicrofono', v)} placeholder="Inalámbrico, solapa, pie" />
              )}
              {salon.tieneWifi && (
                <Txt label="Velocidad WiFi" value={salon.velocidadWifi} onChange={v => set('velocidadWifi', v)} placeholder="100 Mbps simétrico" />
              )}
            </div>
          </div>

          {/* Climatización */}
          <div>
            <SubTitle label="Climatización" />
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Chk label="Aire acondicionado" checked={salon.tieneAireAcondicionado} onChange={v => set('tieneAireAcondicionado', v)} />
              <Chk label="Calefacción" checked={salon.tieneCalefaccion} onChange={v => set('tieneCalefaccion', v)} />
            </div>
          </div>

          {/* Catering */}
          <div>
            <SubTitle label="Catering y gastronomía" />
            <div style={{ marginBottom: '12px' }}>
              <label style={{ ...lbl_c, display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '5px' }}>Tipo de catering</label>
              <select value={salon.tipoCatering} onChange={e => set('tipoCatering', e.target.value as TipoCatering)} style={{ ...inp_s, background: '#111827', maxWidth: '360px' }}>
                {(Object.entries(TIPOS_CATERING) as [TipoCatering, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Chk label="Incluye coffee break" checked={salon.incluyeCoffeeBreak} onChange={v => set('incluyeCoffeeBreak', v)} />
              <Chk label="Incluye almuerzo / lunch" checked={salon.incluyeAlmuerzo} onChange={v => set('incluyeAlmuerzo', v)} />
              <Chk label="Incluye cena / gala" checked={salon.incluyeCena} onChange={v => set('incluyeCena', v)} />
            </div>
          </div>

          {/* Accesos y servicios */}
          <div>
            <SubTitle label="Accesos y servicios adicionales" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '10px', marginBottom: '12px' }}>
              <Chk label="Estacionamiento propio" checked={salon.tieneEstacionamiento} onChange={v => set('tieneEstacionamiento', v)} />
              {salon.tieneEstacionamiento && (
                <Num label="Lugares de estacionamiento" value={salon.lugaresEstacionamiento} onChange={v => set('lugaresEstacionamiento', v)} placeholder="50" />
              )}
              <Chk label="Valet parking" checked={salon.tieneValet} onChange={v => set('tieneValet', v)} />
              <Chk label="Guardarropas" checked={salon.tieneGuardarropas} onChange={v => set('tieneGuardarropas', v)} />
              <Chk label="Sala VIP / Green room" checked={salon.tieneSalaVIP} onChange={v => set('tieneSalaVIP', v)} />
              <Chk label="Acceso para movilidad reducida" checked={salon.tieneAccesibilidad} onChange={v => set('tieneAccesibilidad', v)} />
            </div>
          </div>

          {/* Precio y observaciones */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <Txt label="Precio desde" value={salon.precioDesde} onChange={v => set('precioDesde', v)} placeholder='Ej: "Consultar" o "Desde $500.000"' />
            <div>
              <label style={{ ...lbl_c, display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '5px' }}>Observaciones / Servicios adicionales</label>
              <textarea value={salon.observaciones} onChange={e => set('observaciones', e.target.value)} rows={2}
                placeholder="Ej: Incluye guardarropas, sala VIP privada, terraza exterior con vista a los viñedos..."
                style={{ ...inp_s, resize: 'none' as const }} />
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
interface Props {
  salones: SalonIndividual[]
  onChange: (salones: SalonIndividual[]) => void
}

export function SalonesEditor({ salones, onChange }: Props) {
  const [expanded, setExpanded] = useState<string | null>(salones[0]?.id ?? null)

  const agregar = () => {
    const nuevo = SALON_VACIO()
    onChange([...salones, nuevo])
    setExpanded(nuevo.id)
  }

  const actualizar = (id: string, s: SalonIndividual) =>
    onChange(salones.map(x => x.id === id ? s : x))

  const eliminar = (id: string) => {
    const next = salones.filter(x => x.id !== id)
    onChange(next)
    if (expanded === id) setExpanded(next[0]?.id ?? null)
  }

  return (
    <section style={{ background: '#0d1225', border: '1px solid #1a2235', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f97316', margin: '0 0 2px' }}>
            Salones de Eventos
          </p>
          <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
            {salones.length === 0 ? 'Sin salones cargados' : `${salones.length} salón${salones.length > 1 ? 'es' : ''} cargado${salones.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <button type="button" onClick={agregar}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#fff', background: '#2563eb', border: '1px solid #3b82f6', cursor: 'pointer' }}>
          <Plus size={14} />
          Agregar salón
        </button>
      </div>

      {salones.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#334155', border: '1px dashed #1a2235', borderRadius: '10px' }}>
          <Building2 size={28} style={{ margin: '0 auto 10px', display: 'block', color: '#1e293b' }} />
          <p style={{ fontSize: '13px', margin: 0 }}>Hacé clic en "Agregar salón" para cargar el primero</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {salones.map((s, i) => (
            <SalonEditor
              key={s.id}
              salon={s}
              index={i}
              expanded={expanded === s.id}
              onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
              onChange={updated => actualizar(s.id, updated)}
              onDelete={() => eliminar(s.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
