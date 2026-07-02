'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Socio, SalonData } from '@/types'
import { Check, X } from 'lucide-react'

type SocioSalon = Socio & { salonData: SalonData }

function Badge({ ok }: { ok: boolean }) {
  return ok
    ? <Check size={13} style={{ color: '#22c55e', display: 'inline' }} />
    : <X size={13} style={{ color: '#475569', display: 'inline' }} />
}

export default function TourSalonesPage() {
  const [salones, setSalones] = useState<SocioSalon[]>([])
  const [loading, setLoading] = useState(true)
  const [sel, setSel] = useState<string[]>([])

  useEffect(() => {
    document.documentElement.setAttribute('data-tour', 'true')
    document.body.style.background = 'transparent'
    document.documentElement.style.background = 'transparent'
    const cargar = async () => {
      const snap = await getDocs(query(collection(db, 'socios'), where('categoria', '==', 'salon'), where('activo', '==', true)))
      setSalones(snap.docs.filter(d => d.data().salonData).map(d => ({ id: d.id, ...d.data() } as SocioSalon)))
      setLoading(false)
    }
    cargar()
  }, [])

  const toggle = (id: string) =>
    setSel(p => p.includes(id) ? p.filter(x => x !== id) : p.length < 3 ? [...p, id] : p)

  const comparados = salones.filter(s => sel.includes(s.id))

  const s: Record<string, React.CSSProperties> = {
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
    <div style={s.wrap}>
      <div style={s.header}>
        <p style={s.title}>Comparador de Salones</p>
        <p style={s.sub}>Seleccioná hasta 3 para comparar</p>
      </div>

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', padding: '24px', textAlign: 'center' }}>Cargando...</p>
        ) : salones.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', padding: '24px', textAlign: 'center' }}>No hay salones disponibles.</p>
        ) : (
          <>
            {/* Selector cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px', marginBottom: '8px' }}>
              {salones.map(s2 => {
                const selected = sel.includes(s2.id)
                const disabled = !selected && sel.length >= 3
                return (
                  <button
                    key={s2.id}
                    onClick={() => !disabled && toggle(s2.id)}
                    style={{ ...s.card, ...(selected ? s.cardSel : {}), opacity: disabled ? 0.35 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
                  >
                    {s2.fotoPortada && (
                      <img src={s2.fotoPortada} alt="" style={{ width: '100%', height: '56px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />
                    )}
                    <p style={{ fontWeight: 700, fontSize: '12px', color: selected ? '#60a5fa' : '#f1f5f9', margin: '0 0 3px' }}>{s2.razonSocial}</p>
                    {s2.salonData?.capacidadSentados && (
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                        <span style={{ color: '#fb923c', fontWeight: 700 }}>{s2.salonData.capacidadSentados}</span> sentados
                      </p>
                    )}
                  </button>
                )
              })}
            </div>

            {comparados.length >= 2 && (
              <div style={{ background: 'rgba(13,18,37,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={{ ...s.th, textAlign: 'left', minWidth: '130px', color: 'rgba(255,255,255,0.4)' }}></th>
                        {comparados.map(c => <th key={c.id} style={s.th}>{c.razonSocial}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: 'Sentados', get: (c: SocioSalon) => c.salonData.capacidadSentados ?? '—' },
                        { label: 'Cóctel', get: (c: SocioSalon) => c.salonData.capacidadCoctel ?? '—' },
                        { label: 'De pie', get: (c: SocioSalon) => c.salonData.capacidadPie ?? '—' },
                        { label: 'Metros²', get: (c: SocioSalon) => c.salonData.metrosCuadrados ? `${c.salonData.metrosCuadrados}m²` : '—' },
                        { label: 'Baños', get: (c: SocioSalon) => c.salonData.cantidadBanios ?? '—' },
                      ].map(row => (
                        <tr key={row.label}>
                          <td style={s.td}>{row.label}</td>
                          {comparados.map(c => <td key={c.id} style={s.tdVal}>{row.get(c)}</td>)}
                        </tr>
                      ))}
                      {[
                        { label: 'Escenario', get: (c: SocioSalon) => <Badge ok={c.salonData.tieneEscenario} /> },
                        { label: 'Música', get: (c: SocioSalon) => <Badge ok={c.salonData.tieneMusica} /> },
                        { label: 'Sonido prof.', get: (c: SocioSalon) => <Badge ok={c.salonData.tieneSonido} /> },
                        { label: 'Luces prof.', get: (c: SocioSalon) => <Badge ok={c.salonData.tieneLuces} /> },
                        { label: 'Proyector', get: (c: SocioSalon) => <Badge ok={c.salonData.tieneProyector} /> },
                        { label: 'Pantalla', get: (c: SocioSalon) => <Badge ok={c.salonData.tienePantalla} /> },
                        { label: 'Catering', get: (c: SocioSalon) => <Badge ok={c.salonData.incluyeCatering} /> },
                        { label: 'Estacionamiento', get: (c: SocioSalon) => <Badge ok={c.salonData.tieneEstacionamiento} /> },
                        { label: 'Accesibilidad', get: (c: SocioSalon) => <Badge ok={c.salonData.tieneAccesibilidad} /> },
                      ].map(row => (
                        <tr key={row.label}>
                          <td style={s.td}>{row.label}</td>
                          {comparados.map(c => <td key={c.id} style={s.tdVal}>{row.get(c)}</td>)}
                        </tr>
                      ))}
                      {comparados.some(c => c.contacto?.whatsapp) && (
                        <tr>
                          <td style={s.td}>WhatsApp</td>
                          {comparados.map(c => (
                            <td key={c.id} style={s.tdVal}>
                              {c.contacto?.whatsapp
                                ? <a href={`https://wa.me/${c.contacto.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ color: '#4ade80', fontSize: '11px' }}>Contactar</a>
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
