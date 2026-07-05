'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Socio, SalonIndividual } from '@/types'
import {
  CATEGORIAS, TIPOS_SALON, TIPOS_CATERING,
  CATEGORIAS_HOTEL, RANGO_PRECIO, SUBZONAS_MENDOZA, TIPOS_ALOJAMIENTO,
} from '@/types'
import { Check, ChevronDown, ChevronUp, Star, MapPin, Globe, Phone, Mail, Instagram } from 'lucide-react'
import { useWebframeTracking } from '@/lib/analytics'

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  orange: '#fb923c',
  blue: '#60a5fa',
  green: '#4ade80',
  purple: '#c4b5fd',
  text: '#f1f5f9',
  sub: '#cbd5e1',       // subtítulos legibles
  muted: '#94a3b8',     // texto secundario con contraste
  label: '#64748b',     // labels de campos — mínimo visible
  border: 'rgba(255,255,255,0.1)',
  divider: 'rgba(255,255,255,0.07)',
  cardBg: '#0d1225',
  glass: 'rgba(255,255,255,0.04)',
  row: 'rgba(255,255,255,0.03)',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const Divider = () => (
  <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)', margin: '18px 0' }} />
)

const SecLabel = ({ color, children }: { color: string; children: React.ReactNode }) => (
  <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color, margin: '0 0 10px', opacity: 0.95 }}>
    {children}
  </p>
)

const KV = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', borderRadius: '7px', background: T.row, gap: '12px', marginBottom: '3px' }}>
    <span style={{ fontSize: '12px', color: T.muted, flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: '12px', color: T.text, fontWeight: 600, textAlign: 'right' as const }}>{value}</span>
  </div>
)

const Chip = ({ label }: { label: string }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.22)', borderRadius: '6px', padding: '4px 9px' }}>
    <Check size={9} style={{ color: T.green, flexShrink: 0 }} />
    <span style={{ fontSize: '11px', color: '#bbf7d0', fontWeight: 500 }}>{label}</span>
  </div>
)

const ChipGrid = ({ items }: { items: { label: string; ok: boolean | undefined | null }[] }) => {
  const active = items.filter(i => i.ok)
  if (!active.length) return <span style={{ fontSize: '12px', color: T.muted, fontStyle: 'italic' }}>No especificado</span>
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {active.map(i => <Chip key={i.label} label={i.label} />)}
    </div>
  )
}

// ── Salon accordion ───────────────────────────────────────────────────────────
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
    <div style={{ border: `1px solid ${T.border}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '8px', background: 'rgba(255,255,255,0.03)' }}>
      <button type="button" onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: 'transparent', border: 'none', cursor: 'pointer', color: T.text, textAlign: 'left' as const }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: '14px', margin: 0, color: T.text }}>
            {salon.nombre || `Salón ${index + 1}`}
            {total > 1 && <span style={{ fontSize: '11px', color: T.muted, marginLeft: '8px' }}>({index + 1}/{total})</span>}
          </p>
          <p style={{ fontSize: '11px', color: T.muted, margin: '2px 0 0' }}>{TIPOS_SALON[salon.tipo]}</p>
        </div>
        {open ? <ChevronUp size={15} color={T.muted} /> : <ChevronDown size={15} color={T.muted} />}
      </button>

      {open && (
        <div style={{ padding: '4px 16px 16px', borderTop: `1px solid ${T.divider}` }}>
          {caps.length > 0 && (
            <>
              <div style={{ paddingTop: '12px', marginBottom: '10px' }}>
                <SecLabel color={T.orange}>Capacidades por montaje</SecLabel>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '14px' }}>
                {caps.map(c => (
                  <div key={c.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.12)', borderRadius: '8px', padding: '7px 10px' }}>
                    <span style={{ fontSize: '11px', color: T.muted }}>{c.k}</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: T.orange }}>{c.v}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {salon.metrosCuadrados && <KV label="Superficie cubierta" value={`${salon.metrosCuadrados} m²`} />}
          {salon.tipoCatering && <KV label="Catering" value={TIPOS_CATERING[salon.tipoCatering]} />}

          <div style={{ marginTop: '14px', marginBottom: '10px' }}>
            <SecLabel color={T.purple}>AV y tecnología</SecLabel>
            <ChipGrid items={[
              { label: 'Proyector', ok: salon.tieneProyector },
              { label: 'Pantalla LED', ok: salon.tienePantallaLED },
              { label: 'Sonido profesional', ok: salon.tieneSonidoProfesional },
              { label: 'Streaming', ok: salon.tieneStreaming },
              { label: 'Videoconferencia', ok: salon.tieneVideoconferencia },
              { label: 'WiFi', ok: salon.tieneWifi },
              { label: 'Iluminación escénica', ok: salon.tieneIluminacionEscenica },
              { label: 'Aire acondicionado', ok: salon.tieneAireAcondicionado },
            ]} />
          </div>

          <div style={{ marginTop: '14px', marginBottom: '10px' }}>
            <SecLabel color={T.green}>Servicios incluidos</SecLabel>
            <ChipGrid items={[
              { label: 'Estacionamiento', ok: salon.tieneEstacionamiento },
              { label: 'Valet parking', ok: salon.tieneValet },
              { label: 'Sala VIP', ok: salon.tieneSalaVIP },
              { label: 'Accesibilidad', ok: salon.tieneAccesibilidad },
              { label: 'Divisible', ok: salon.dividible },
              { label: 'Luz natural', ok: salon.luzNatural },
              { label: 'Escenario', ok: salon.tieneEscenario },
            ]} />
          </div>

          {salon.precioDesde && (
            <div style={{ marginTop: '14px', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.18)', borderRadius: '10px', padding: '10px 14px' }}>
              <p style={{ fontSize: '10px', color: T.muted, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Precio desde</p>
              <p style={{ fontSize: '16px', fontWeight: 800, color: T.blue, margin: 0 }}>{salon.precioDesde}</p>
            </div>
          )}

          {salon.observaciones && (
            <p style={{ fontSize: '12px', color: T.sub, marginTop: '12px', lineHeight: 1.7 }}>{salon.observaciones}</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Category data sections ────────────────────────────────────────────────────
function HotelSection({ socio }: { socio: Socio }) {
  if (socio.categoria !== 'hotel') return null
  const d = (socio.hotelData ?? {}) as Partial<NonNullable<Socio['hotelData']>>
  const planes = [
    { label: 'Solo habitación', ok: d.planSoloHabitacion },
    { label: 'Desayuno (BB)', ok: d.planDesayuno },
    { label: 'Media pensión (HB)', ok: d.planMediaPension },
    { label: 'Pensión completa (FB)', ok: d.planPensionCompleta },
    { label: 'Todo incluido (AI)', ok: d.planTodoIncluido },
  ]
  return (
    <div>
        <SecLabel color={T.orange}>Hotel · {d.categoriaHotel ? CATEGORIAS_HOTEL[d.categoriaHotel] : ''}</SecLabel>

        {d.estrellas && (
          <div style={{ display: 'flex', gap: '3px', marginBottom: '12px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={15} style={{ color: i < d.estrellas! ? '#fbbf24' : '#1e293b', fill: i < d.estrellas! ? '#fbbf24' : '#1e293b' }} />
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '14px' }}>
          {d.totalHabitaciones && (
            <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '12px' }}>
              <p style={{ fontSize: '22px', fontWeight: 800, color: T.text, margin: 0 }}>{d.totalHabitaciones}</p>
              <p style={{ fontSize: '10px', color: T.muted, margin: '2px 0 0' }}>habitaciones</p>
            </div>
          )}
          {d.capacidadMaxima && (
            <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '12px' }}>
              <p style={{ fontSize: '22px', fontWeight: 800, color: T.text, margin: 0 }}>{d.capacidadMaxima}</p>
              <p style={{ fontSize: '10px', color: T.muted, margin: '2px 0 0' }}>huéspedes máx.</p>
            </div>
          )}
        </div>

        {(d.habitacionesSimples || d.habitacionesDobles || d.habitacionesSuites) && (
          <div style={{ marginBottom: '12px' }}>
            {d.habitacionesSimples && <KV label="Simples" value={d.habitacionesSimples} />}
            {d.habitacionesDobles && <KV label="Dobles" value={d.habitacionesDobles} />}
            {d.habitacionesJuniorSuite && <KV label="Junior Suites" value={d.habitacionesJuniorSuite} />}
            {d.habitacionesSuites && <KV label="Suites" value={d.habitacionesSuites} />}
            {d.habitacionesAccesibles && <KV label="Accesibles" value={d.habitacionesAccesibles} />}
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <SecLabel color={T.blue}>Instalaciones</SecLabel>
          <ChipGrid items={[
            { label: 'Piscina', ok: d.tienePool },
            { label: 'Gimnasio', ok: d.tieneGym },
            { label: 'Spa', ok: d.tieneSpa },
            { label: 'Restaurante', ok: d.tieneRestaurante },
            { label: 'Bar / Lounge', ok: d.tieneBar },
            { label: 'Casino', ok: d.tieneCasino },
            { label: 'Business Center', ok: d.tieneBusinessCenter },
            { label: 'Estacionamiento', ok: d.tieneEstacionamiento },
            { label: 'Transfer aeropuerto', ok: d.tieneTransferAeropuerto },
            { label: 'WiFi', ok: d.tieneWifi },
            { label: 'Servicio habitaciones', ok: d.tieneServicioHabitaciones },
            { label: 'Recepción 24hs', ok: d.recepcion24h },
            { label: 'Admite mascotas', ok: d.admiteMascotas },
          ]} />
        </div>

        <div>
          <SecLabel color={T.green}>Planes disponibles</SecLabel>
          <ChipGrid items={planes} />
        </div>

        {(d.checkIn || d.checkOut) && (
          <div style={{ marginTop: '12px' }}>
            {d.checkIn && <KV label="Check-in" value={d.checkIn} />}
            {d.checkOut && <KV label="Check-out" value={d.checkOut} />}
          </div>
        )}

        {d.precioDesde && (
          <div style={{ marginTop: '12px', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '8px 12px' }}>
            <p style={{ fontSize: '9px', color: T.muted, margin: '0 0 1px' }}>Precio desde</p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#60a5fa', margin: 0 }}>{d.precioDesde}</p>
          </div>
        )}
    </div>
  )
}

function RestauranteSection({ socio }: { socio: Socio }) {
  if (socio.categoria !== 'restaurante') return null
  const d = (socio.restauranteData ?? {}) as Partial<NonNullable<Socio['restauranteData']>>
  return (
    <div>
        <SecLabel color={T.orange}>Restaurante</SecLabel>

        <div style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.18)', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px' }}>
          <p style={{ fontSize: '15px', fontWeight: 700, color: T.text, margin: '0 0 3px' }}>{d.tipoCocina}</p>
          {d.rangoPrecio && <p style={{ fontSize: '11px', color: T.muted, margin: 0 }}>{RANGO_PRECIO[d.rangoPrecio!]}</p>}
        </div>

        {(d.cubiertos || d.cubiertosPrivado) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '14px' }}>
            {d.cubiertos && (
              <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '12px' }}>
                <p style={{ fontSize: '22px', fontWeight: 800, color: T.text, margin: 0 }}>{d.cubiertos}</p>
                <p style={{ fontSize: '10px', color: T.muted, margin: '2px 0 0' }}>cubiertos</p>
              </div>
            )}
            {d.cubiertosPrivado && (
              <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '12px' }}>
                <p style={{ fontSize: '22px', fontWeight: 800, color: T.text, margin: 0 }}>{d.cubiertosPrivado}</p>
                <p style={{ fontSize: '10px', color: T.muted, margin: '2px 0 0' }}>sala privada</p>
              </div>
            )}
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <SecLabel color={T.blue}>Experiencias</SecLabel>
          <ChipGrid items={[
            { label: 'Menú degustación', ok: d.tieneMenuDegustacion },
            { label: 'Carta de vinos', ok: d.tieneCartaVinos },
            { label: 'Sommelier', ok: d.tieneSomelier },
            { label: 'Sala privada', ok: d.tieneSalaPrivada },
            { label: 'Terraza', ok: d.tieneTerraza },
            { label: 'Música en vivo', ok: d.tieneMusicaEnVivo },
            { label: 'Eventos privados', ok: d.tieneEventosPrivados },
            { label: 'Business Lunch', ok: d.tieneBusinessLunch },
            { label: 'Brunch', ok: d.tieneBrunch },
            { label: 'Estacionamiento', ok: d.tieneEstacionamiento },
            { label: 'Accesibilidad', ok: d.tieneAccesibilidad },
          ]} />
        </div>

        <div>
          <SecLabel color={T.green}>Opciones dietarias</SecLabel>
          <ChipGrid items={[
            { label: 'Vegetariana', ok: d.opcionVegetariana },
            { label: 'Vegana', ok: d.opcionVegana },
            { label: 'Sin TACC', ok: d.opcionCeliaca },
            { label: 'Kosher', ok: d.opcionKosher },
            { label: 'Halal', ok: d.opcionHalal },
          ]} />
        </div>

        {d.horario && (
          <div style={{ marginTop: '12px' }}>
            <KV label="Horario" value={d.horario} />
            {d.diasCierre && <KV label="Cierra" value={d.diasCierre} />}
            {d.reservaRequerida && <KV label="Reserva" value="Requerida" />}
          </div>
        )}
    </div>
  )
}

function BodegaSection({ socio }: { socio: Socio }) {
  if (socio.categoria !== 'bodega') return null
  const d = (socio.bodegaData ?? {}) as Partial<NonNullable<Socio['bodegaData']>>
  return (
    <div>
        <SecLabel color={T.orange}>Bodega{d.subzona ? ` · ${SUBZONAS_MENDOZA[d.subzona]}` : ''}</SecLabel>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', marginBottom: '14px' }}>
          {d.añoFundacion && (
            <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '10px 12px' }}>
              <p style={{ fontSize: '18px', fontWeight: 800, color: T.text, margin: 0 }}>{d.añoFundacion}</p>
              <p style={{ fontSize: '10px', color: T.muted, margin: '2px 0 0' }}>fundación</p>
            </div>
          )}
          {d.hectareas && (
            <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '10px 12px' }}>
              <p style={{ fontSize: '18px', fontWeight: 800, color: T.text, margin: 0 }}>{d.hectareas}</p>
              <p style={{ fontSize: '10px', color: T.muted, margin: '2px 0 0' }}>hectáreas</p>
            </div>
          )}
        </div>

        {d.varietalesPrincipales && (
          <div style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.18)', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
            <p style={{ fontSize: '9px', color: T.orange, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px' }}>Varietales</p>
            <p style={{ fontSize: '12px', color: T.text, margin: 0 }}>{d.varietalesPrincipales}</p>
          </div>
        )}

        {d.produccionAnual && <KV label="Producción anual" value={d.produccionAnual} />}
        {d.certificacionesCalidad && <KV label="Certificaciones" value={d.certificacionesCalidad} />}
        {d.exporta && d.mercadosExportacion && <KV label="Exporta a" value={d.mercadosExportacion} />}

        {d.tieneVisitasGuiadas && (
          <div style={{ marginTop: '12px' }}>
            <SecLabel color={T.blue}>Visitas y turismo</SecLabel>
            {d.idiomasVisita && <KV label="Idiomas" value={d.idiomasVisita} />}
            {d.duracionVisita && <KV label="Duración" value={d.duracionVisita} />}
            {d.capacidadGrupoVisita && <KV label="Grupo máximo" value={`${d.capacidadGrupoVisita} personas`} />}
            {d.precioVisitaDesde && <KV label="Precio desde" value={d.precioVisitaDesde} />}
          </div>
        )}

        <div style={{ marginTop: '12px' }}>
          <SecLabel color={T.green}>Experiencias MICE</SecLabel>
          <ChipGrid items={[
            { label: 'Sala de cata', ok: d.tieneSalaDeCata },
            { label: 'Restaurante propio', ok: d.tieneRestaurante },
            { label: 'Alojamiento en bodega', ok: d.tieneAlojamiento },
            { label: 'Vendimia / Cosecha', ok: d.tieneVisitaVendimia },
            { label: 'Team Building', ok: d.tieneTeamBuilding },
            { label: 'Eventos corporativos', ok: d.tieneEventosCorporativos },
          ]} />
        </div>
    </div>
  )
}

function AlojamientoSection({ socio }: { socio: Socio }) {
  if (socio.categoria !== 'alojamiento') return null
  const d = (socio.alojamientoData ?? {}) as Partial<NonNullable<Socio['alojamientoData']>>
  return (
    <div>
        <SecLabel color={T.orange}>Alojamiento{d.tipoAlojamiento ? ` · ${TIPOS_ALOJAMIENTO[d.tipoAlojamiento]}` : ''}</SecLabel>

        {(d.totalUnidades || d.capacidadTotal) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '14px' }}>
            {d.totalUnidades && (
              <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '12px' }}>
                <p style={{ fontSize: '22px', fontWeight: 800, color: T.text, margin: 0 }}>{d.totalUnidades}</p>
                <p style={{ fontSize: '10px', color: T.muted, margin: '2px 0 0' }}>unidades</p>
              </div>
            )}
            {d.capacidadTotal && (
              <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '12px' }}>
                <p style={{ fontSize: '22px', fontWeight: 800, color: T.text, margin: 0 }}>{d.capacidadTotal}</p>
                <p style={{ fontSize: '10px', color: T.muted, margin: '2px 0 0' }}>huéspedes máx.</p>
              </div>
            )}
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <SecLabel color={T.blue}>Servicios</SecLabel>
          <ChipGrid items={[
            { label: 'Desayuno incluido', ok: d.incluyeDesayuno },
            { label: 'Piscina', ok: d.tienePiscina },
            { label: 'Parrilla', ok: d.tieneParrilla },
            { label: 'Fogón', ok: d.tieneFogon },
            { label: 'Jacuzzi', ok: d.tieneJacuzzi },
            { label: 'Cocina / Kitchenette', ok: d.tieneCocinaMinicocina },
            { label: 'WiFi', ok: d.tieneWifi },
            { label: 'Estacionamiento', ok: d.tieneEstacionamiento },
            { label: 'Admite mascotas', ok: d.admiteMascotas },
            { label: 'Self check-in', ok: d.selfCheckin },
          ]} />
        </div>

        {d.estanciaMinima && <KV label="Estadía mínima" value={`${d.estanciaMinima} noches`} />}
        {d.horarioCheckin && <KV label="Check-in" value={d.horarioCheckin} />}
        {d.horarioCheckout && <KV label="Check-out" value={d.horarioCheckout} />}

        {d.precioDesde && (
          <div style={{ marginTop: '12px', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '8px 12px' }}>
            <p style={{ fontSize: '9px', color: T.muted, margin: '0 0 1px' }}>Precio desde</p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#60a5fa', margin: 0 }}>{d.precioDesde}</p>
          </div>
        )}
    </div>
  )
}

function ServicioSection({ socio }: { socio: Socio }) {
  if (socio.categoria !== 'servicio') return null
  const d = (socio.servicioData ?? {}) as Partial<NonNullable<Socio['servicioData']>>
  return (
    <div>
        <SecLabel color={T.orange}>Proveedor de Servicios</SecLabel>

        {d.tiposServicio && (
          <div style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.18)', borderRadius: '10px', padding: '12px 14px', marginBottom: '12px' }}>
            <p style={{ fontSize: '9px', color: T.orange, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Servicios</p>
            <p style={{ fontSize: '13px', color: T.text, margin: 0 }}>{d.tiposServicio}</p>
          </div>
        )}

        {d.especializacionMICE && (
          <div style={{ background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.18)', borderRadius: '10px', padding: '12px 14px', marginBottom: '12px' }}>
            <p style={{ fontSize: '9px', color: T.blue, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Especialización MICE</p>
            <p style={{ fontSize: '13px', color: T.text, margin: 0 }}>{d.especializacionMICE}</p>
          </div>
        )}

        {d.capacidadMaximaPax && <KV label="Capacidad máx." value={`${d.capacidadMaximaPax} pax`} />}
        {d.cantidadGuias && <KV label="Guías / staff" value={d.cantidadGuias} />}
        {d.coberturaGeografica && <KV label="Cobertura" value={d.coberturaGeografica} />}
        {d.idiomasServicio && <KV label="Idiomas" value={d.idiomasServicio} />}
        {d.tieneFlota && d.descripcionFlota && <KV label="Flota" value={d.descripcionFlota} />}
        {d.modeloPrecio && <KV label="Precio" value={d.modeloPrecio} />}
    </div>
  )
}

// ── Accordion wrapper ─────────────────────────────────────────────────────────
function AccordionCard({ emoji, title, badge, defaultOpen = true, children }: {
  emoji: string; title: string; badge?: string; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: '16px', overflow: 'hidden', marginBottom: '10px', background: T.cardBg }}>
      <button type="button" onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', background: open ? 'rgba(255,255,255,0.02)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' as const, transition: 'background 0.15s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <span style={{ fontSize: '20px', lineHeight: 1 }}>{emoji}</span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: T.text, letterSpacing: '-0.01em' }}>{title}</span>
          {badge && (
            <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.orange, background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.22)', borderRadius: '5px', padding: '2px 7px' }}>
              {badge}
            </span>
          )}
        </div>
        <div style={{ color: T.muted, flexShrink: 0, marginLeft: '12px' }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>
      {open && (
        <div style={{ padding: '2px 20px 20px', borderTop: `1px solid ${T.divider}` }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
function FichaPage() {
  const params = useSearchParams()
  const id = params.get('id')
  const salonIdx = params.get('salon')

  const [socio, setSocio] = useState<Socio | null>(null)
  const [loading, setLoading] = useState(true)

  // Analytics: cuenta la visita al tour del socio y mide el tiempo de permanencia
  useWebframeTracking(id)

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
      <div style={{ width: 26, height: 26, border: '2px solid #1e293b', borderTop: `2px solid ${T.blue}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!socio) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px', background: 'transparent' }}>
      Socio no encontrado.
    </div>
  )

  const salonesAMostrar = (() => {
    if (!socio.salones?.length) return []
    if (salonIdx !== null) {
      const byUUID = socio.salones.find(s => s.id === salonIdx)
      if (byUUID) return [byUUID]
      const n = parseInt(salonIdx)
      if (!isNaN(n) && socio.salones[n]) return [socio.salones[n]]
    }
    return socio.salones
  })()

  const CATEGORY_EMOJI: Record<string, string> = {
    hotel: '🏨', restaurante: '🍽️', bodega: '🍷', alojamiento: '🏡', servicio: '🎯',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', color: T.text, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0 0 32px' }}>

        {/* ── Hero ── */}
        {socio.fotoPortada && (
          <div style={{ position: 'relative' }}>
            <img src={socio.fotoPortada} alt={socio.razonSocial}
              style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(8,12,24,0.95) 100%)' }} />
            {/* Title overlay on hero */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 18px', display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
              {socio.logoUrl && (
                <img src={socio.logoUrl} alt="logo"
                  style={{ width: '52px', height: '52px', objectFit: 'contain', borderRadius: '10px', border: `1px solid ${T.border}`, background: 'rgba(8,12,24,0.8)', flexShrink: 0, padding: '4px' }} />
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.orange, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '4px', padding: '2px 7px' }}>
                    {CATEGORY_EMOJI[socio.categoria]} {CATEGORIAS[socio.categoria]}
                  </span>
                  {socio.activo && (
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#4ade80', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '4px', padding: '2px 7px' }}>
                      ● Activo
                    </span>
                  )}
                </div>
                <h1 style={{ fontWeight: 800, fontSize: '20px', color: '#fff', margin: 0, lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>{socio.razonSocial}</h1>
              </div>
            </div>
          </div>
        )}

        {/* ── Header sin foto ── */}
        {!socio.fotoPortada && (
          <div style={{ background: T.cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${T.border}`, borderRadius: '14px', marginBottom: '10px', padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            {socio.logoUrl && (
              <img src={socio.logoUrl} alt="logo"
                style={{ width: '52px', height: '52px', objectFit: 'contain', borderRadius: '10px', border: `1px solid ${T.border}`, background: 'rgba(255,255,255,0.04)', flexShrink: 0, padding: '4px' }} />
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.orange, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: '4px', padding: '2px 7px' }}>
                  {CATEGORY_EMOJI[socio.categoria]} {CATEGORIAS[socio.categoria]}
                </span>
                {socio.activo && (
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#4ade80', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '4px', padding: '2px 7px' }}>
                    ● Activo
                  </span>
                )}
              </div>
              <h1 style={{ fontWeight: 800, fontSize: '20px', color: T.text, margin: 0, lineHeight: 1.2 }}>{socio.razonSocial}</h1>
            </div>
          </div>
        )}

        {/* Gap after hero */}
        <div style={{ height: '10px' }} />

        {/* ── Dirección (fuera del acordeón, siempre visible) ── */}
        {socio.direccion && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 4px', marginBottom: '10px' }}>
            <MapPin size={12} style={{ color: T.muted, flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: T.muted }}>{socio.direccion}</span>
          </div>
        )}

        {/* ── Acordeón: Sobre nosotros ── */}
        {socio.infoGeneral && (
          <AccordionCard emoji="📋" title="Sobre nosotros" defaultOpen={true}>
            <p style={{ fontSize: '13px', color: T.muted, lineHeight: 1.8, margin: '12px 0 0' }}>{socio.infoGeneral}</p>
          </AccordionCard>
        )}

        {/* ── Acordeón: Ficha técnica (por categoría) ── */}
        <AccordionCard
          emoji={CATEGORY_EMOJI[socio.categoria] ?? '📄'}
          title="Ficha técnica"
          badge={CATEGORIAS[socio.categoria]}
          defaultOpen={true}
        >
          <div style={{ paddingTop: '12px' }}>
            <HotelSection socio={socio} />
            <RestauranteSection socio={socio} />
            <BodegaSection socio={socio} />
            <AlojamientoSection socio={socio} />
            <ServicioSection socio={socio} />
          </div>
        </AccordionCard>

        {/* ── Acordeón: Salones ── */}
        {salonesAMostrar.length > 0 && (
          <AccordionCard emoji="🏛️" title="Salones de Eventos" badge={`${salonesAMostrar.length} salón${salonesAMostrar.length > 1 ? 'es' : ''}`} defaultOpen={true}>
            <div style={{ paddingTop: '12px' }}>
              {salonesAMostrar.map((s, i) => (
                <SalonCard key={s.id} salon={s} index={i} total={salonesAMostrar.length} />
              ))}
            </div>
          </AccordionCard>
        )}

        {/* ── Acordeón: Contacto ── */}
        {(socio.contacto?.whatsapp || socio.contacto?.email || socio.contacto?.web || socio.contacto?.redes || socio.ubicacionUrl) && (
          <AccordionCard emoji="📞" title="Contacto" defaultOpen={true}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px' }}>
              {socio.contacto?.whatsapp && (
                <a href={`https://wa.me/${socio.contacto.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Quisiera consultar sobre ${socio.razonSocial}.`)}`}
                  target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '12px 14px', color: '#4ade80', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  <Phone size={15} style={{ flexShrink: 0 }} />
                  <span>WhatsApp · {socio.contacto.whatsapp}</span>
                </a>
              )}
              {socio.contacto?.email && (
                <a href={`mailto:${socio.contacto.email}?subject=Consulta ${socio.razonSocial}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', padding: '12px 14px', color: '#60a5fa', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  <Mail size={15} style={{ flexShrink: 0 }} />
                  <span>{socio.contacto.email}</span>
                </a>
              )}
              {socio.contacto?.web && (
                <a href={socio.contacto.web} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', background: T.glass, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '12px 14px', color: T.muted, fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
                  <Globe size={15} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{socio.contacto.web}</span>
                </a>
              )}
              {socio.contacto?.redes && (
                <a href={socio.contacto.redes.startsWith('http') ? socio.contacto.redes : `https://instagram.com/${socio.contacto.redes.replace('@', '')}`}
                  target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', background: T.glass, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '12px 14px', color: T.muted, fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
                  <Instagram size={15} style={{ flexShrink: 0 }} />
                  <span>{socio.contacto.redes}</span>
                </a>
              )}
              {socio.ubicacionUrl && (
                <a href={socio.ubicacionUrl} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', background: T.glass, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '12px 14px', color: T.muted, fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
                  <MapPin size={15} style={{ flexShrink: 0 }} />
                  <span>Ver en Google Maps</span>
                </a>
              )}
            </div>
          </AccordionCard>
        )}

        <p style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.1)', padding: '12px 0 0' }}>
          Mendoza Bureau · Convention & Visitors Bureau
        </p>
      </div>
    </div>
  )
}

export default function TourFichaPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
        <div style={{ width: 26, height: 26, border: '2px solid #1e293b', borderTop: '2px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <FichaPage />
    </Suspense>
  )
}
