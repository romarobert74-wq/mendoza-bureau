'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Socio, SalonIndividual } from '@/types'
import { TIPOS_SALON } from '@/types'
import { Check, X } from 'lucide-react'

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

function CapBar({ value, max }: { value: number | null; max: number }) {
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

// Para el comparador tomamos el primer salón de cada socio con mayor capacidad
function bestSalon(socio: Socio): SalonIndividual | null {
  if (!socio.salones?.length) return null
  return [...socio.salones].sort((a, b) => (b.capacidadCoctel ?? 0) - (a.capacidadCoctel ?? 0))[0]
}

export default function SalonesPage() {
  const [socios, setSocios] = useState<Socio[]>([])
  const [loading, setLoading] = useState(true)
  const [sel, setSel] = useState<string[]>([])

  useEffect(() => {
    const cargar = async () => {
      // Fetch socios with at least one salon
      const snap = await getDocs(collection(db, 'socios'))
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Socio))
        .filter(s => s.activo && s.salones && s.salones.length > 0)
      setSocios(data)
      setLoading(false)
    }
    cargar()
  }, [])

  const toggle = (id: string) =>
    setSel(p => p.includes(id) ? p.filter(x => x !== id) : p.length < 3 ? [...p, id] : p)

  const comparados = socios.filter(s => sel.includes(s.id))
  const maxCap = Math.max(...socios.flatMap(s => s.salones?.map(sl => sl.capacidadCoctel ?? 0) ?? [0]), 1)

  return (
    <div style={{ minHeight: '100vh', background: '#080c18', color: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background: BRAND, padding: '20px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Mendoza Bureau</p>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>Comparador de Salones de Eventos</h1>
          </div>
          {sel.length > 0 && (
            <button onClick={() => setSel([])}
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              Limpiar selección
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Seleccioná hasta 3 locaciones para comparar</p>

        {loading ? (
          <div style={{ color: '#475569', padding: '40px', textAlign: 'center' }}>Cargando salones...</div>
        ) : socios.length === 0 ? (
          <div style={{ background: '#0d1225', border: '1px solid #1a2235', borderRadius: '12px', padding: '48px', textAlign: 'center', color: '#334155' }}>
            No hay locaciones con salones de eventos activos registrados.
          </div>
        ) : (
          <>
            {/* Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '32px' }}>
              {socios.map(s => {
                const selected = sel.includes(s.id)
                const disabled = !selected && sel.length >= 3
                const mainSalon = bestSalon(s)
                return (
                  <button key={s.id} onClick={() => !disabled && toggle(s.id)}
                    style={{ background: selected ? 'rgba(37,99,235,0.15)' : '#0d1225', border: `1px solid ${selected ? '#3b82f6' : '#1a2235'}`, borderRadius: '12px', padding: '16px', textAlign: 'left', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, transition: 'all 0.15s', color: '#f1f5f9' }}>
                    {s.fotoPortada && (
                      <img src={s.fotoPortada} alt={s.razonSocial} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px', border: '1px solid #1a2235' }} />
                    )}
                    <p style={{ fontWeight: 700, fontSize: '13px', color: selected ? '#60a5fa' : '#f1f5f9', margin: '0 0 3px' }}>{s.razonSocial}</p>
                    <p style={{ fontSize: '11px', color: '#475569', margin: '0 0 6px' }}>{s.direccion}</p>
                    <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>
                      {s.salones!.length} salón{s.salones!.length > 1 ? 'es' : ''}
                      {mainSalon?.capacidadBanquete ? ` · hasta ${mainSalon.capacidadBanquete} en banquete` : ''}
                    </p>
                    {selected && (
                      <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(59,130,246,0.4)', borderRadius: '99px', padding: '2px 8px', fontSize: '10px', fontWeight: 700, color: '#60a5fa' }}>
                        ✓ Seleccionado
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Tabla */}
            {comparados.length >= 2 && (
              <div style={{ background: '#0d1225', border: '1px solid #1a2235', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #1a2235' }}>
                  <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f97316', margin: 0 }}>
                    Comparativa · salón principal de cada locación
                  </p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1a2235' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#475569', minWidth: '160px' }}></th>
                        {comparados.map(s => {
                          const sl = bestSalon(s)
                          return (
                            <th key={s.id} style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#f1f5f9' }}>
                              {s.fotoPortada && <img src={s.fotoPortada} alt={s.razonSocial} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '6px', margin: '0 auto 6px', display: 'block', border: '1px solid #1a2235' }} />}
                              {s.razonSocial}
                              {sl && <div style={{ fontSize: '10px', color: '#475569', fontWeight: 400, marginTop: '2px' }}>{TIPOS_SALON[sl.tipo]}</div>}
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ background: 'rgba(249,115,22,0.04)' }}>
                        <td colSpan={comparados.length + 1} style={{ padding: '8px 16px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#f97316', letterSpacing: '0.08em' }}>Capacidades por montaje</td>
                      </tr>
                      {[
                        { label: 'Teatro 🎭', key: 'capacidadTeatro' as keyof SalonIndividual },
                        { label: 'Escuela 📚', key: 'capacidadEscuela' as keyof SalonIndividual },
                        { label: 'Banquete 🍽️', key: 'capacidadBanquete' as keyof SalonIndividual },
                        { label: 'Cóctel 🥂', key: 'capacidadCoctel' as keyof SalonIndividual },
                        { label: 'Imperial', key: 'capacidadImperial' as keyof SalonIndividual },
                        { label: 'Herradura / U', key: 'capacidadHerraduraU' as keyof SalonIndividual },
                      ].map(row => (
                        <Row key={row.label} label={row.label}
                          cells={comparados.map(s => <CapBar key={s.id} value={(bestSalon(s)?.[row.key] as number | null) ?? null} max={maxCap} />)} />
                      ))}

                      <tr style={{ background: 'rgba(59,130,246,0.04)' }}>
                        <td colSpan={comparados.length + 1} style={{ padding: '8px 16px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#60a5fa', letterSpacing: '0.08em' }}>Espacio</td>
                      </tr>
                      <Row label="Metros² cubiertos" cells={comparados.map(s => { const sl = bestSalon(s); return sl?.metrosCuadrados ? `${sl.metrosCuadrados} m²` : '—' })} />
                      <Row label="Total de salones" cells={comparados.map(s => s.salones!.length)} />
                      <Row label="Salón divisible" cells={comparados.map(s => <Badge key={s.id} ok={!!bestSalon(s)?.dividible} />)} />

                      <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
                        <td colSpan={comparados.length + 1} style={{ padding: '8px 16px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#a78bfa', letterSpacing: '0.08em' }}>Tecnología AV</td>
                      </tr>
                      {[
                        { label: 'Proyector', key: 'tieneProyector' },
                        { label: 'Pantalla LED', key: 'tienePantallaLED' },
                        { label: 'Sonido profesional', key: 'tieneSonidoProfesional' },
                        { label: 'Streaming', key: 'tieneStreaming' },
                        { label: 'Videoconferencia', key: 'tieneVideoconferencia' },
                        { label: 'WiFi', key: 'tieneWifi' },
                      ].map(row => (
                        <Row key={row.label} label={row.label}
                          cells={comparados.map(s => <Badge key={s.id} ok={!!(bestSalon(s)?.[row.key as keyof SalonIndividual])} />)} />
                      ))}

                      <tr style={{ background: 'rgba(34,197,94,0.04)' }}>
                        <td colSpan={comparados.length + 1} style={{ padding: '8px 16px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#4ade80', letterSpacing: '0.08em' }}>Servicios</td>
                      </tr>
                      {[
                        { label: 'Catering propio', key: 'tipoCatering', fn: (s: Socio) => bestSalon(s)?.tipoCatering === 'propio' },
                        { label: 'Estacionamiento', key: 'tieneEstacionamiento', fn: (s: Socio) => !!bestSalon(s)?.tieneEstacionamiento },
                        { label: 'Valet parking', key: 'tieneValet', fn: (s: Socio) => !!bestSalon(s)?.tieneValet },
                        { label: 'Sala VIP', key: 'tieneSalaVIP', fn: (s: Socio) => !!bestSalon(s)?.tieneSalaVIP },
                        { label: 'Accesibilidad', key: 'tieneAccesibilidad', fn: (s: Socio) => !!bestSalon(s)?.tieneAccesibilidad },
                      ].map(row => (
                        <Row key={row.label} label={row.label}
                          cells={comparados.map(s => <Badge key={s.id} ok={row.fn(s)} />)} />
                      ))}

                      <tr style={{ background: 'rgba(249,115,22,0.04)' }}>
                        <td colSpan={comparados.length + 1} style={{ padding: '8px 16px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#f97316', letterSpacing: '0.08em' }}>Contacto</td>
                      </tr>
                      <Row label="WhatsApp" cells={comparados.map(s =>
                        s.contacto?.whatsapp
                          ? <a key={s.id} href={`https://wa.me/${s.contacto.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ color: '#4ade80', fontSize: '12px' }}>{s.contacto.whatsapp}</a>
                          : '—'
                      )} />
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {sel.length === 1 && (
              <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', padding: '14px 18px', color: '#60a5fa', fontSize: '13px' }}>
                Seleccioná al menos una locación más para ver la comparativa.
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
