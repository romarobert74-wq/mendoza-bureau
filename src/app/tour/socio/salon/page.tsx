'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Socio, SalonIndividual } from '@/types'
import { TIPOS_SALON, TIPOS_CATERING } from '@/types'
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react'

const OK = ({ v }: { v: boolean }) =>
  v ? <Check size={13} style={{ color: '#22c55e', display: 'inline' }} />
    : <X size={13} style={{ color: '#334155', display: 'inline' }} />

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <span style={{ fontSize: '12px', color: '#64748b' }}>{label}</span>
    <span style={{ fontSize: '12px', color: '#f1f5f9', fontWeight: 500, textAlign: 'right' as const }}>{value}</span>
  </div>
)

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '12px' }}>
    <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#f97316', margin: '0 0 8px' }}>{title}</p>
    {children}
  </div>
)

function SalonCard({ salon, index, total }: { salon: SalonIndividual; index: number; total: number }) {
  const [open, setOpen] = useState(index === 0)

  const caps = [
    { k: 'Teatro 🎭', v: salon.capacidadTeatro },
    { k: 'Escuela 📚', v: salon.capacidadEscuela },
    { k: 'Banquete 🍽️', v: salon.capacidadBanquete },
    { k: 'Cóctel 🥂', v: salon.capacidadCoctel },
    { k: 'Imperial', v: salon.capacidadImperial },
    { k: 'Herradura / U', v: salon.capacidadHerraduraU },
    { k: 'Directorio', v: salon.capacidadDirectorio },
  ].filter(c => c.v)

  return (
    <div style={{ background: 'rgba(13,18,37,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
      {/* Header */}
      <button type="button" onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#f1f5f9', textAlign: 'left' as const }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: '13px', margin: 0, color: '#f1f5f9' }}>
            {salon.nombre || `Salón ${index + 1}`}
            {total > 1 && <span style={{ fontSize: '10px', color: '#475569', marginLeft: '6px' }}>({index + 1}/{total})</span>}
          </p>
          <p style={{ fontSize: '10px', color: '#475569', margin: 0 }}>{TIPOS_SALON[salon.tipo]}</p>
        </div>
        {open ? <ChevronUp size={15} color="#475569" /> : <ChevronDown size={15} color="#475569" />}
      </button>

      {open && (
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Foto si tiene */}

          {/* Capacidades */}
          {caps.length > 0 && (
            <Section title="Capacidades por montaje">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                {caps.map(c => (
                  <div key={c.k} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', padding: '5px 8px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{c.k}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#fb923c' }}>{c.v}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Espacio */}
          <Section title="Espacio físico">
            {salon.metrosCuadrados && <Row label="Metros² cubiertos" value={`${salon.metrosCuadrados} m²`} />}
            {salon.cantidadBanios && <Row label="Baños" value={salon.cantidadBanios} />}
            <Row label="Luz natural" value={<OK v={salon.luzNatural} />} />
            {salon.dividible && <Row label="Salón divisible" value={<OK v={true} />} />}
            {salon.tieneEscenario && (
              <Row label="Escenario" value={salon.dimensionesEscenario || '✓'} />
            )}
          </Section>

          {/* AV */}
          <Section title="Tecnología AV">
            {[
              { label: 'Proyector', v: salon.tieneProyector, extra: salon.cantidadProyectores ? `× ${salon.cantidadProyectores}` : '' },
              { label: 'Pantalla', v: salon.tienePantalla, extra: salon.dimensionesPantalla },
              { label: 'Pantalla LED', v: salon.tienePantallaLED },
              { label: 'Sonido profesional', v: salon.tieneSonidoProfesional },
              { label: 'Micrófono', v: salon.tieneMicrofono, extra: salon.tiposMicrofono },
              { label: 'Streaming / transmisión', v: salon.tieneStreaming },
              { label: 'Videoconferencia', v: salon.tieneVideoconferencia },
              { label: 'Iluminación escénica', v: salon.tieneIluminacionEscenica },
              { label: 'WiFi', v: salon.tieneWifi, extra: salon.velocidadWifi },
              { label: 'Pizarrón / Flip chart', v: salon.tienePizarron },
            ].filter(r => r.v || r.v === false).map(r => (
              <Row key={r.label} label={r.label} value={
                r.v
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <OK v={true} />
                    {r.extra && <span style={{ fontSize: '11px', color: '#64748b' }}>{r.extra}</span>}
                  </span>
                  : <OK v={false} />
              } />
            ))}
            {[
              { label: 'Aire acondicionado', v: salon.tieneAireAcondicionado },
              { label: 'Calefacción', v: salon.tieneCalefaccion },
            ].map(r => <Row key={r.label} label={r.label} value={<OK v={r.v} />} />)}
          </Section>

          {/* Catering */}
          <Section title="Catering y gastronomía">
            <Row label="Tipo de catering" value={TIPOS_CATERING[salon.tipoCatering]} />
            {salon.incluyeCoffeeBreak && <Row label="Coffee break" value={<OK v={true} />} />}
            {salon.incluyeAlmuerzo && <Row label="Almuerzo / Lunch" value={<OK v={true} />} />}
            {salon.incluyeCena && <Row label="Cena / Gala" value={<OK v={true} />} />}
          </Section>

          {/* Servicios */}
          <Section title="Servicios adicionales">
            {salon.tieneEstacionamiento && (
              <Row label="Estacionamiento" value={salon.lugaresEstacionamiento ? `${salon.lugaresEstacionamiento} lugares` : '✓'} />
            )}
            {[
              { label: 'Valet parking', v: salon.tieneValet },
              { label: 'Guardarropas', v: salon.tieneGuardarropas },
              { label: 'Sala VIP / Green room', v: salon.tieneSalaVIP },
              { label: 'Acceso movilidad reducida', v: salon.tieneAccesibilidad },
            ].filter(r => r.v).map(r => <Row key={r.label} label={r.label} value={<OK v={true} />} />)}
          </Section>

          {/* Precio y obs */}
          {salon.precioDesde && (
            <div style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '10px 12px' }}>
              <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 2px' }}>Precio</p>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#60a5fa', margin: 0 }}>{salon.precioDesde}</p>
            </div>
          )}
          {salon.observaciones && (
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>{salon.observaciones}</p>
          )}
        </div>
      )}
    </div>
  )
}

function SalonPage() {
  const params = useSearchParams()
  const id = params.get('id')
  const [socio, setSocio] = useState<Socio | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.documentElement.setAttribute('data-tour', 'true')
    document.body.style.background = 'transparent'
    document.documentElement.style.background = 'transparent'
    if (!id) { setLoading(false); return }
    getDoc(doc(db, 'socios', id)).then(snap => {
      if (snap.exists()) setSocio({ id: snap.id, ...snap.data() } as Socio)
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
      <div style={{ width: 28, height: 28, border: '2px solid #1e293b', borderTop: '2px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!socio || !socio.salones?.length) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px', background: 'transparent' }}>
      Sin información de salones disponible.
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', color: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'rgba(13,18,37,0.92)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '12px 14px', marginBottom: '12px' }}>
        {socio.fotoPortada && (
          <img src={socio.fotoPortada} alt={socio.razonSocial}
            style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.08)' }} />
        )}
        <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f97316', margin: '0 0 3px' }}>
          Salones de Eventos
        </p>
        <p style={{ fontWeight: 800, fontSize: '15px', color: '#f1f5f9', margin: 0 }}>{socio.razonSocial}</p>
        {socio.direccion && <p style={{ fontSize: '11px', color: '#475569', margin: '2px 0 0' }}>📍 {socio.direccion}</p>}
      </div>

      {/* Salones */}
      <div style={{ padding: '0 12px 20px' }}>
        {socio.salones.map((s, i) => (
          <SalonCard key={s.id} salon={s} index={i} total={socio.salones!.length} />
        ))}

        {/* Contacto */}
        {(socio.contacto?.whatsapp || socio.contacto?.email) && (
          <div style={{ background: 'rgba(13,18,37,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '14px', marginTop: '8px' }}>
            <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f97316', margin: '0 0 10px' }}>Solicitar cotización</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {socio.contacto.whatsapp && (
                <a href={`https://wa.me/${socio.contacto.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Quisiera consultar por los salones de eventos de ${socio.razonSocial}.`)}`}
                  target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '8px', padding: '10px 12px', color: '#4ade80', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  📱 Consultar por WhatsApp
                </a>
              )}
              {socio.contacto.email && (
                <a href={`mailto:${socio.contacto.email}?subject=Consulta salones ${socio.razonSocial}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '10px 12px', color: '#60a5fa', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  ✉️ Enviar email
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TourSalonPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
        <div style={{ width: 28, height: 28, border: '2px solid #1e293b', borderTop: '2px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <SalonPage />
    </Suspense>
  )
}
