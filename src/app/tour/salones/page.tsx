'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Socio, SalonIndividual } from '@/types'
import { TIPOS_SALON } from '@/types'
import { Check, X } from 'lucide-react'

function Badge({ ok }: { ok: boolean }) {
  return ok
    ? <Check size={13} style={{ color: '#22c55e', display: 'inline' }} />
    : <X size={13} style={{ color: '#475569', display: 'inline' }} />
}

function bestSalon(socio: Socio): SalonIndividual | null {
  if (!socio.salones?.length) return null
  return [...socio.salones].sort((a, b) => (b.capacidadCoctel ?? 0) - (a.capacidadCoctel ?? 0))[0]
}

export default function TourSalonesPage() {
  const [socios, setSocios] = useState<Socio[]>([])
  const [loading, setLoading] = useState(true)
  const [sel, setSel] = useState<string[]>([])

  useEffect(() => {
    document.documentElement.setAttribute('data-tour', 'true')
    document.body.style.background = 'transparent'
    document.documentElement.style.background = 'transparent'
    const cargar = async () => {
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

  const st: Record<string, React.CSSProperties> = {
    wrap: { minHeight: '100vh', background: 'transparent', color: '#f1f5f9', fontFamily: 'system-ui, sans-serif', fontSize: '13px' },
    header: { background: 'rgba(15,20,40,0.92)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px' },
    title: { fontWeight: 800, fontSize: '14px', color: '#f1f5f9', margin: 0 },
    sub: { fontSize: '10px', color: 'rgba(255,255,255,0.45)', margin: 0 },
    card: { background: 'rgba(13,18,37,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', cursor: 'pointer', textAlign: 'left' as const, width: '100%', color: '#f1f5f9', transition: 'all 0.15s' },
    cardSel: { border: '1px solid #3b82f6', background: 'rgba(37,99,235,0.2)' },
    table: { width: '100%', borderCollapse: 'collapse' as const },
    th: { padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#f1f5f9', textAlign: 'center' as const, borderBottom: '1px solid rgba(255,255,255,0.1)' },
    td: { padding: '7px 12px', fontSize: '11px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.06)' },
    tdVal: { padding: '7px 12px', fontSize: '12px', color: '#f1f5f9', textAlign: 'center' as const, borderBottom: '1px solid rgba(255,255,255,0.06)' },
  }

  return (
    <div style={st.wrap}>
      <div style={st.header}>
        <p style={st.title}>Comparador de Salones</p>
        <p style={st.sub}>Seleccioná hasta 3 para comparar</p>
      </div>

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', padding: '24px', textAlign: 'center' }}>Cargando...</p>
        ) : socios.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', padding: '24px', textAlign: 'center' }}>No hay salones disponibles.</p>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px', marginBottom: '8px' }}>
              {socios.map(socio => {
                const selected = sel.includes(socio.id)
                const disabled = !selected && sel.length >= 3
                const main = bestSalon(socio)
                return (
                  <button
                    key={socio.id}
                    onClick={() => !disabled && toggle(socio.id)}
                    style={{ ...st.card, ...(selected ? st.cardSel : {}), opacity: disabled ? 0.35 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
                  >
                    {socio.fotoPortada && (
                      <img src={socio.fotoPortada} alt="" style={{ width: '100%', height: '56px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />
                    )}
                    <p style={{ fontWeight: 700, fontSize: '12px', color: selected ? '#60a5fa' : '#f1f5f9', margin: '0 0 2px' }}>{socio.razonSocial}</p>
                    {main && (
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                        {TIPOS_SALON[main.tipo]}
                        {main.capacidadCoctel ? ` · ${main.capacidadCoctel} cóctel` : ''}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>

            {comparados.length >= 2 && (
              <div style={{ background: 'rgba(13,18,37,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={st.table}>
                    <thead>
                      <tr>
                        <th style={{ ...st.th, textAlign: 'left', minWidth: '130px', color: 'rgba(255,255,255,0.4)' }}></th>
                        {comparados.map(c => (
                          <th key={c.id} style={st.th}>
                            {c.razonSocial}
                            {bestSalon(c) && <div style={{ fontSize: '9px', color: '#475569', fontWeight: 400 }}>{TIPOS_SALON[bestSalon(c)!.tipo]}</div>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: 'Teatro', get: (c: Socio) => bestSalon(c)?.capacidadTeatro ?? '—' },
                        { label: 'Banquete', get: (c: Socio) => bestSalon(c)?.capacidadBanquete ?? '—' },
                        { label: 'Cóctel', get: (c: Socio) => bestSalon(c)?.capacidadCoctel ?? '—' },
                        { label: 'Escuela', get: (c: Socio) => bestSalon(c)?.capacidadEscuela ?? '—' },
                        { label: 'Metros²', get: (c: Socio) => bestSalon(c)?.metrosCuadrados ? `${bestSalon(c)!.metrosCuadrados}m²` : '—' },
                      ].map(row => (
                        <tr key={row.label}>
                          <td style={st.td}>{row.label}</td>
                          {comparados.map(c => <td key={c.id} style={st.tdVal}>{row.get(c)}</td>)}
                        </tr>
                      ))}
                      {[
                        { label: 'Proyector', get: (c: Socio) => <Badge ok={!!bestSalon(c)?.tieneProyector} /> },
                        { label: 'Sonido', get: (c: Socio) => <Badge ok={!!bestSalon(c)?.tieneSonidoProfesional} /> },
                        { label: 'Streaming', get: (c: Socio) => <Badge ok={!!bestSalon(c)?.tieneStreaming} /> },
                        { label: 'WiFi', get: (c: Socio) => <Badge ok={!!bestSalon(c)?.tieneWifi} /> },
                        { label: 'Estacionamiento', get: (c: Socio) => <Badge ok={!!bestSalon(c)?.tieneEstacionamiento} /> },
                        { label: 'Accesibilidad', get: (c: Socio) => <Badge ok={!!bestSalon(c)?.tieneAccesibilidad} /> },
                      ].map(row => (
                        <tr key={row.label}>
                          <td style={st.td}>{row.label}</td>
                          {comparados.map(c => <td key={c.id} style={st.tdVal}>{row.get(c)}</td>)}
                        </tr>
                      ))}
                      {comparados.some(c => c.contacto?.whatsapp) && (
                        <tr>
                          <td style={st.td}>WhatsApp</td>
                          {comparados.map(c => (
                            <td key={c.id} style={st.tdVal}>
                              {c.contacto?.whatsapp
                                ? <a href={`https://wa.me/${c.contacto.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ color: '#4ade80', fontSize: '11px' }}>Contactar</a>
                                : '—'}
                            </td>
                          ))}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {sel.length === 1 && (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px', padding: '8px' }}>
                Seleccioná otro salón para comparar
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
