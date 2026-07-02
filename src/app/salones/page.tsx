'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Socio, SalonData } from '@/types'
import { Check, X, Users, Square, Tv, Music, Lightbulb, Volume2, UtensilsCrossed, Car, Accessibility, Layers } from 'lucide-react'

type SocioSalon = Socio & { salonData: SalonData }

const BRAND = '#1a3a6b'

function Badge({ ok }: { ok: boolean }) {
  return ok
    ? <Check size={14} className="mx-auto" style={{ color: '#22c55e' }} />
    : <X size={14} className="mx-auto" style={{ color: '#334155' }} />
}

function Row({ label, cells }: { label: string; cells: React.ReactNode[] }) {
  return (
    <tr style={{ borderBottom: '1px solid #1a2235' }}>
      <td className="px-4 py-2.5 text-xs font-medium whitespace-nowrap" style={{ color: '#64748b', minWidth: '160px' }}>{label}</td>
      {cells.map((c, i) => (
        <td key={i} className="px-4 py-2.5 text-center text-sm" style={{ color: '#f1f5f9' }}>{c}</td>
      ))}
    </tr>
  )
}

function CapacityBar({ value, max }: { value: number | null; max: number }) {
  if (!value) return <span style={{ color: '#334155' }}>—</span>
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-bold text-sm" style={{ color: '#f1f5f9' }}>{value}</span>
      <div className="w-16 h-1.5 rounded-full" style={{ background: '#1a2235' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#2563eb,#60a5fa)' }} />
      </div>
    </div>
  )
}

export default function SalonesPage() {
  const [salones, setSalones] = useState<SocioSalon[]>([])
  const [loading, setLoading] = useState(true)
  const [seleccionados, setSeleccionados] = useState<string[]>([])

  useEffect(() => {
    const cargar = async () => {
      const snap = await getDocs(query(collection(db, 'socios'), where('categoria', '==', 'salon'), where('activo', '==', true)))
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Socio))
        .filter(s => s.salonData) as SocioSalon[]
      setSalones(data)
      setLoading(false)
    }
    cargar()
  }, [])

  const toggle = (id: string) => {
    setSeleccionados(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 3 ? [...prev, id] : prev
    )
  }

  const comparados = salones.filter(s => seleccionados.includes(s.id))
  const maxCap = Math.max(...salones.map(s => s.salonData?.capacidadPie ?? 0), 1)

  return (
    <div style={{ minHeight: '100vh', background: '#080c18', color: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background: BRAND, padding: '20px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Mendoza Bureau</p>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>Comparador de Salones de Eventos</h1>
          </div>
          {seleccionados.length > 0 && (
            <button onClick={() => setSeleccionados([])}
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              Limpiar selección
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Selector */}
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
          Seleccioná hasta 3 salones para comparar
        </p>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', padding: '40px 0' }}>
            <div style={{ width: 20, height: 20, border: '2px solid #1e293b', borderTop: '2px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Cargando salones...
          </div>
        ) : salones.length === 0 ? (
          <div style={{ background: '#0d1225', border: '1px solid #1a2235', borderRadius: '12px', padding: '48px', textAlign: 'center', color: '#334155' }}>
            No hay salones de eventos activos registrados.
          </div>
        ) : (
          <>
            {/* Cards selector */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '32px' }}>
              {salones.map(s => {
                const sel = seleccionados.includes(s.id)
                const disabled = !sel && seleccionados.length >= 3
                return (
                  <button
                    key={s.id}
                    onClick={() => !disabled && toggle(s.id)}
                    style={{
                      background: sel ? 'rgba(37,99,235,0.15)' : '#0d1225',
                      border: `1px solid ${sel ? '#3b82f6' : '#1a2235'}`,
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'left',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.4 : 1,
                      transition: 'all 0.15s',
                    }}
                  >
                    {s.fotoPortada && (
                      <img src={s.fotoPortada} alt={s.razonSocial}
                        style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px', border: '1px solid #1a2235' }} />
                    )}
                    <p style={{ fontWeight: 700, fontSize: '13px', color: sel ? '#60a5fa' : '#f1f5f9', margin: '0 0 4px' }}>{s.razonSocial}</p>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{s.direccion}</p>
                    {s.salonData?.capacidadSentados && (
                      <p style={{ fontSize: '11px', color: '#475569', margin: '6px 0 0' }}>
                        <span style={{ color: '#f97316', fontWeight: 700 }}>{s.salonData.capacidadSentados}</span> personas sentadas
                      </p>
                    )}
                    {sel && (
                      <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(59,130,246,0.4)', borderRadius: '99px', padding: '2px 8px', fontSize: '10px', fontWeight: 700, color: '#60a5fa' }}>
                        ✓ Seleccionado
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Tabla comparativa */}
            {comparados.length >= 2 && (
              <div style={{ background: '#0d1225', border: '1px solid #1a2235', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #1a2235' }}>
                  <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f97316', margin: 0 }}>Comparativa detallada</p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1a2235' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#475569', minWidth: '160px' }}>Característica</th>
                        {comparados.map(s => (
                          <th key={s.id} style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#f1f5f9' }}>
                            {s.fotoPortada && (
                              <img src={s.fotoPortada} alt={s.razonSocial}
                                style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '6px', margin: '0 auto 6px', display: 'block', border: '1px solid #1a2235' }} />
                            )}
                            {s.razonSocial}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Capacidades */}
                      <tr style={{ background: 'rgba(249,115,22,0.04)' }}>
                        <td colSpan={comparados.length + 1} style={{ padding: '8px 16px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#f97316', letterSpacing: '0.08em' }}>
                          <Users size={11} style={{ display: 'inline', marginRight: '6px' }} />Capacidades
                        </td>
                      </tr>
                      <Row label="Sentados" cells={comparados.map(s => <CapacityBar key={s.id} value={s.salonData.capacidadSentados} max={maxCap} />)} />
                      <Row label="Cóctel" cells={comparados.map(s => <CapacityBar key={s.id} value={s.salonData.capacidadCoctel} max={maxCap} />)} />
                      <Row label="De pie" cells={comparados.map(s => <CapacityBar key={s.id} value={s.salonData.capacidadPie} max={maxCap} />)} />

                      {/* Espacio */}
                      <tr style={{ background: 'rgba(59,130,246,0.04)' }}>
                        <td colSpan={comparados.length + 1} style={{ padding: '8px 16px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#60a5fa', letterSpacing: '0.08em' }}>
                          <Square size={11} style={{ display: 'inline', marginRight: '6px' }} />Espacio
                        </td>
                      </tr>
                      <Row label="Metros² cubiertos" cells={comparados.map(s => s.salonData.metrosCuadrados ? `${s.salonData.metrosCuadrados} m²` : '—')} />
                      <Row label="Cantidad de baños" cells={comparados.map(s => s.salonData.cantidadBanios ?? '—')} />
                      <Row label="Cantidad de salones" cells={comparados.map(s => s.salonData.cantidadSalones ?? '—')} />
                      <Row label="Salón divisible" cells={comparados.map(s => <Badge key={s.id} ok={s.salonData.dividible} />)} />
                      <Row label="Escenario" cells={comparados.map(s => s.salonData.tieneEscenario ? (s.salonData.dimensionesEscenario || '✓') : <Badge key={s.id} ok={false} />)} />

                      {/* Equipamiento */}
                      <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
                        <td colSpan={comparados.length + 1} style={{ padding: '8px 16px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#a78bfa', letterSpacing: '0.08em' }}>
                          <Tv size={11} style={{ display: 'inline', marginRight: '6px' }} />Equipamiento técnico
                        </td>
                      </tr>
                      <Row label="Música" cells={comparados.map(s => <Badge key={s.id} ok={s.salonData.tieneMusica} />)} />
                      <Row label="Iluminación profesional" cells={comparados.map(s => <Badge key={s.id} ok={s.salonData.tieneLuces} />)} />
                      <Row label="Sonido" cells={comparados.map(s => <Badge key={s.id} ok={s.salonData.tieneSonido} />)} />
                      <Row label="Proyector" cells={comparados.map(s => <Badge key={s.id} ok={s.salonData.tieneProyector} />)} />
                      <Row label="Pantalla" cells={comparados.map(s => <Badge key={s.id} ok={s.salonData.tienePantalla} />)} />

                      {/* Servicios */}
                      <tr style={{ background: 'rgba(34,197,94,0.04)' }}>
                        <td colSpan={comparados.length + 1} style={{ padding: '8px 16px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#4ade80', letterSpacing: '0.08em' }}>
                          <UtensilsCrossed size={11} style={{ display: 'inline', marginRight: '6px' }} />Servicios
                        </td>
                      </tr>
                      <Row label="Catering incluido" cells={comparados.map(s => <Badge key={s.id} ok={s.salonData.incluyeCatering} />)} />
                      <Row label="Estacionamiento" cells={comparados.map(s => <Badge key={s.id} ok={s.salonData.tieneEstacionamiento} />)} />
                      <Row label="Accesibilidad" cells={comparados.map(s => <Badge key={s.id} ok={s.salonData.tieneAccesibilidad} />)} />

                      {/* Contacto */}
                      <tr style={{ background: 'rgba(249,115,22,0.04)' }}>
                        <td colSpan={comparados.length + 1} style={{ padding: '8px 16px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#f97316', letterSpacing: '0.08em' }}>
                          Contacto
                        </td>
                      </tr>
                      <Row label="Dirección" cells={comparados.map(s => <span key={s.id} style={{ fontSize: '11px', color: '#64748b' }}>{s.direccion || '—'}</span>)} />
                      <Row label="WhatsApp" cells={comparados.map(s =>
                        s.contacto?.whatsapp
                          ? <a key={s.id} href={`https://wa.me/${s.contacto.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ color: '#4ade80', fontSize: '12px' }}>{s.contacto.whatsapp}</a>
                          : '—'
                      )} />
                      <Row label="Web" cells={comparados.map(s =>
                        s.contacto?.web
                          ? <a key={s.id} href={s.contacto.web} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontSize: '12px' }}>Ver sitio</a>
                          : '—'
                      )} />

                      {/* Observaciones */}
                      {comparados.some(s => s.salonData.observaciones) && (
                        <Row
                          label="Observaciones"
                          cells={comparados.map(s => (
                            <span key={s.id} style={{ fontSize: '11px', color: '#64748b', textAlign: 'left', display: 'block' }}>
                              {s.salonData.observaciones || '—'}
                            </span>
                          ))}
                        />
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {comparados.length === 1 && (
              <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', padding: '16px 20px', color: '#60a5fa', fontSize: '13px' }}>
                Seleccioná al menos un salón más para ver la comparativa.
              </div>
            )}
          </>
        )}
      </div>

      <p style={{ textAlign: 'center', fontSize: '11px', color: '#1e293b', padding: '24px' }}>
        Mendoza Bureau · Convention & Visitors Bureau
      </p>
    </div>
  )
}
