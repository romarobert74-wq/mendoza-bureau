'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Socio, SalonIndividual } from '@/types'
import {
  TIPOS_SALON, TIPOS_CATERING, CATEGORIAS_HOTEL, RANGO_PRECIO, SUBZONAS_MENDOZA, TIPOS_ALOJAMIENTO,
} from '@/types'
import { Check, X, ChevronDown, ChevronUp, Star } from 'lucide-react'

// ── Shared UI ─────────────────────────────────────────────────────────────────
const OK = ({ v }: { v: boolean }) =>
  v ? <Check size={12} style={{ color: '#22c55e', display: 'inline', flexShrink: 0 }} />
    : <X size={12} style={{ color: '#334155', display: 'inline', flexShrink: 0 }} />

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: '8px' }}>
    <span style={{ fontSize: '11px', color: '#64748b', flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: '11px', color: '#f1f5f9', fontWeight: 500, textAlign: 'right' as const }}>{value}</span>
  </div>
)

const Badge = ({ ok, label }: { ok: boolean; label: string }) => ok ? (
  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '6px', padding: '4px 8px' }}>
    <Check size={10} style={{ color: '#22c55e', flexShrink: 0 }} />
    <span style={{ fontSize: '10px', color: '#86efac' }}>{label}</span>
  </div>
) : null

const Sec = ({ title, color, children }: { title: string; color: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '14px' }}>
    <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color, margin: '0 0 8px' }}>{title}</p>
    {children}
  </div>
)

const BadgeGrid = ({ items }: { items: { label: string; ok: boolean }[] }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
    {items.filter(i => i.ok).map(i => <Badge key={i.label} ok={true} label={i.label} />)}
    {items.every(i => !i.ok) && <span style={{ fontSize: '11px', color: '#334155' }}>—</span>}
  </div>
)

// ── Salon Card (same as existing but inline here for the unified page) ─────────
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
      <button type="button" onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#f1f5f9', textAlign: 'left' as const }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: '13px', margin: 0 }}>
            {salon.nombre || `Salón ${index + 1}`}
            {total > 1 && <span style={{ fontSize: '10px', color: '#475569', marginLeft: '6px' }}>({index + 1}/{total})</span>}
          </p>
          <p style={{ fontSize: '10px', color: '#475569', margin: 0 }}>{TIPOS_SALON[salon.tipo]}</p>
        </div>
        {open ? <ChevronUp size={14} color="#475569" /> : <ChevronDown size={14} color="#475569" />}
      </button>
      {open && (
        <div style={{ padding: '0 14px 14px' }}>
          {caps.length > 0 && (
            <Sec title="Capacidades por montaje" color="#f97316">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                {caps.map(c => (
                  <div key={c.k} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', padding: '5px 8px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>{c.k}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#fb923c' }}>{c.v}</span>
                  </div>
                ))}
              </div>
            </Sec>
          )}
          <Sec title="AV y tecnología" color="#a78bfa">
            <BadgeGrid items={[
              { label: 'Proyector', ok: salon.tieneProyector },
              { label: 'Pantalla LED', ok: salon.tienePantallaLED },
              { label: 'Sonido profesional', ok: salon.tieneSonidoProfesional },
              { label: 'Streaming', ok: salon.tieneStreaming },
              { label: 'Videoconferencia', ok: salon.tieneVideoconferencia },
              { label: 'WiFi', ok: salon.tieneWifi },
              { label: 'Iluminación escénica', ok: salon.tieneIluminacionEscenica },
            ]} />
          </Sec>
          <Sec title="Servicios" color="#4ade80">
            <BadgeGrid items={[
              { label: 'Estacionamiento', ok: salon.tieneEstacionamiento },
              { label: 'Valet parking', ok: salon.tieneValet },
              { label: 'Sala VIP', ok: salon.tieneSalaVIP },
              { label: 'Accesibilidad', ok: salon.tieneAccesibilidad },
              { label: 'Divisible', ok: salon.dividible },
              { label: 'Luz natural', ok: salon.luzNatural },
            ]} />
            {salon.metrosCuadrados && <Row label="Superficie cubierta" value={`${salon.metrosCuadrados} m²`} />}
            {salon.tipoCatering && <Row label="Catering" value={TIPOS_CATERING[salon.tipoCatering]} />}
          </Sec>
          {salon.precioDesde && (
            <div style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '8px 12px', marginTop: '8px' }}>
              <p style={{ fontSize: '9px', color: '#64748b', margin: '0 0 1px' }}>Precio</p>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#60a5fa', margin: 0 }}>{salon.precioDesde}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Hotel View ────────────────────────────────────────────────────────────────
function HotelView({ socio }: { socio: Socio }) {
  const d = socio.hotelData
  if (!d) return null
  const planes = [
    { label: 'Solo habitación', ok: d.planSoloHabitacion },
    { label: 'Desayuno incluido', ok: d.planDesayuno },
    { label: 'Media pensión', ok: d.planMediaPension },
    { label: 'Pensión completa', ok: d.planPensionCompleta },
    { label: 'Todo incluido', ok: d.planTodoIncluido },
  ]
  return (
    <div style={{ padding: '0 12px 20px' }}>
      {/* Estrellas + categoría */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        {d.estrellas && (
          <div style={{ display: 'flex', gap: '2px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} style={{ color: i < d.estrellas! ? '#fbbf24' : '#1e293b', fill: i < d.estrellas! ? '#fbbf24' : '#1e293b' }} />
            ))}
          </div>
        )}
        {d.categoriaHotel && <span style={{ fontSize: '11px', color: '#64748b' }}>{CATEGORIAS_HOTEL[d.categoriaHotel]}</span>}
      </div>

      <Sec title="Habitaciones" color="#f97316">
        {d.totalHabitaciones && <Row label="Total" value={d.totalHabitaciones} />}
        {d.capacidadMaxima && <Row label="Capacidad máx." value={`${d.capacidadMaxima} huéspedes`} />}
        {d.habitacionesSimples && <Row label="Simples" value={d.habitacionesSimples} />}
        {d.habitacionesDobles && <Row label="Dobles" value={d.habitacionesDobles} />}
        {d.habitacionesJuniorSuite && <Row label="Junior Suites" value={d.habitacionesJuniorSuite} />}
        {d.habitacionesSuites && <Row label="Suites" value={d.habitacionesSuites} />}
        {d.habitacionesAccesibles && <Row label="Accesibles" value={d.habitacionesAccesibles} />}
      </Sec>

      <Sec title="Instalaciones y servicios" color="#60a5fa">
        <BadgeGrid items={[
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
          { label: 'Lavandería', ok: d.tieneLavanderia },
          { label: 'Admite mascotas', ok: d.admiteMascotas },
          { label: 'Recepción 24hs', ok: d.recepcion24h },
        ]} />
      </Sec>

      <Sec title="Planes disponibles" color="#4ade80">
        <BadgeGrid items={planes} />
      </Sec>

      {(d.checkIn || d.checkOut) && (
        <Sec title="Check-in / Check-out" color="#a78bfa">
          {d.checkIn && <Row label="Check-in" value={d.checkIn} />}
          {d.checkOut && <Row label="Check-out" value={d.checkOut} />}
        </Sec>
      )}

      {d.precioDesde && (
        <div style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px' }}>
          <p style={{ fontSize: '9px', color: '#64748b', margin: '0 0 1px' }}>Precio desde</p>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#60a5fa', margin: 0 }}>{d.precioDesde}</p>
        </div>
      )}
    </div>
  )
}

// ── Restaurante View ──────────────────────────────────────────────────────────
function RestauranteView({ socio }: { socio: Socio }) {
  const d = socio.restauranteData
  if (!d) return null
  return (
    <div style={{ padding: '0 12px 20px' }}>
      {d.tipoCocina && (
        <div style={{ marginBottom: '14px', padding: '10px 12px', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '8px' }}>
          <p style={{ fontSize: '9px', color: '#f97316', margin: '0 0 2px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cocina</p>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{d.tipoCocina}</p>
          {d.rangoPrecio && <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>{RANGO_PRECIO[d.rangoPrecio]}</p>}
        </div>
      )}

      <Sec title="Capacidad" color="#f97316">
        {d.cubiertos && <Row label="Cubiertos totales" value={d.cubiertos} />}
        {d.cubiertosPrivado && <Row label="Sala privada" value={`${d.cubiertosPrivado} cubiertos`} />}
        {d.grupoMinimoPersonas && <Row label="Grupo mínimo" value={`${d.grupoMinimoPersonas} personas`} />}
        {d.grupoMaximoPersonas && <Row label="Grupo máximo" value={`${d.grupoMaximoPersonas} personas`} />}
      </Sec>

      <Sec title="Experiencias" color="#60a5fa">
        <BadgeGrid items={[
          { label: 'Menú degustación', ok: d.tieneMenuDegustacion },
          { label: 'Carta de vinos', ok: d.tieneCartaVinos },
          { label: 'Sommelier', ok: d.tieneSomelier },
          { label: 'Sala privada', ok: d.tieneSalaPrivada },
          { label: 'Terraza exterior', ok: d.tieneTerraza },
          { label: 'Música en vivo', ok: d.tieneMusicaEnVivo },
          { label: 'Eventos privados', ok: d.tieneEventosPrivados },
          { label: 'Business Lunch', ok: d.tieneBusinessLunch },
          { label: 'Brunch', ok: d.tieneBrunch },
          { label: 'Estacionamiento', ok: d.tieneEstacionamiento },
          { label: 'Accesibilidad', ok: d.tieneAccesibilidad },
        ]} />
      </Sec>

      <Sec title="Opciones dietarias" color="#4ade80">
        <BadgeGrid items={[
          { label: 'Vegetariana', ok: d.opcionVegetariana },
          { label: 'Vegana', ok: d.opcionVegana },
          { label: 'Sin TACC', ok: d.opcionCeliaca },
          { label: 'Kosher', ok: d.opcionKosher },
          { label: 'Halal', ok: d.opcionHalal },
        ]} />
      </Sec>

      {d.horario && <Sec title="Horario" color="#94a3b8"><p style={{ fontSize: '12px', color: '#cbd5e1' }}>{d.horario}</p></Sec>}
    </div>
  )
}

// ── Bodega View ───────────────────────────────────────────────────────────────
function BodegaView({ socio }: { socio: Socio }) {
  const d = socio.bodegaData
  if (!d) return null
  return (
    <div style={{ padding: '0 12px 20px' }}>
      <Sec title="Perfil de la bodega" color="#f97316">
        {d.subzona && <Row label="Subzona" value={SUBZONAS_MENDOZA[d.subzona]} />}
        {d.añoFundacion && <Row label="Fundación" value={d.añoFundacion} />}
        {d.hectareas && <Row label="Hectáreas de viñedo" value={`${d.hectareas} ha`} />}
        {d.produccionAnual && <Row label="Producción anual" value={d.produccionAnual} />}
        {d.varietalesPrincipales && <Row label="Varietales" value={d.varietalesPrincipales} />}
        {d.certificacionesCalidad && <Row label="Certificaciones" value={d.certificacionesCalidad} />}
        {d.exporta && d.mercadosExportacion && <Row label="Exporta a" value={d.mercadosExportacion} />}
      </Sec>

      {d.tieneVisitasGuiadas && (
        <Sec title="Turismo y visitas" color="#60a5fa">
          {d.idiomasVisita && <Row label="Idiomas" value={d.idiomasVisita} />}
          {d.duracionVisita && <Row label="Duración" value={d.duracionVisita} />}
          {d.capacidadGrupoVisita && <Row label="Grupo máximo" value={`${d.capacidadGrupoVisita} personas`} />}
          <Row label="Requiere reserva" value={<OK v={d.requiereReserva} />} />
          <Row label="Experiencia vendimia" value={<OK v={d.tieneVisitaVendimia} />} />
          {d.precioVisitaDesde && <Row label="Precio desde" value={d.precioVisitaDesde} />}
        </Sec>
      )}

      <Sec title="Experiencias MICE" color="#4ade80">
        <BadgeGrid items={[
          { label: 'Sala de cata', ok: d.tieneSalaDeCata },
          { label: 'Restaurante propio', ok: d.tieneRestaurante },
          { label: 'Alojamiento en bodega', ok: d.tieneAlojamiento },
          { label: 'Team Building', ok: d.tieneTeamBuilding },
          { label: 'Eventos corporativos', ok: d.tieneEventosCorporativos },
        ]} />
        {d.tieneSalaDeCata && d.capacidadSalaCata && <Row label="Cap. sala de cata" value={`${d.capacidadSalaCata} personas`} />}
        {d.tieneRestaurante && d.cubiertosRestaurante && <Row label="Cubiertos restaurante" value={d.cubiertosRestaurante} />}
      </Sec>
    </div>
  )
}

// ── Alojamiento View ──────────────────────────────────────────────────────────
function AlojamientoView({ socio }: { socio: Socio }) {
  const d = socio.alojamientoData
  if (!d) return null
  return (
    <div style={{ padding: '0 12px 20px' }}>
      <Sec title="Tipo y capacidad" color="#f97316">
        <Row label="Tipo" value={TIPOS_ALOJAMIENTO[d.tipoAlojamiento]} />
        {d.categoriaEquivalente && <Row label="Categoría" value={d.categoriaEquivalente} />}
        {d.totalUnidades && <Row label="Unidades totales" value={d.totalUnidades} />}
        {d.capacidadTotal && <Row label="Cap. máx. huéspedes" value={d.capacidadTotal} />}
      </Sec>

      <Sec title="Unidades disponibles" color="#60a5fa">
        <BadgeGrid items={[
          { label: 'Habitación simple', ok: d.tieneHabitacionSimple },
          { label: 'Habitación doble', ok: d.tieneHabitacionDoble },
          { label: 'Cabaña simple', ok: d.tieneCabañaSimple },
          { label: 'Cabaña familiar', ok: d.tieneCabañaFamiliar },
          { label: 'Suite especial', ok: d.tieneSuiteEspecial },
          { label: 'Dormitorio compartido', ok: d.tieneDormitorioCompartido },
        ]} />
      </Sec>

      <Sec title="Servicios" color="#4ade80">
        <BadgeGrid items={[
          { label: 'Desayuno incluido', ok: d.incluyeDesayuno },
          { label: 'Cocina / Kitchenette', ok: d.tieneCocinaMinicocina },
          { label: 'Piscina', ok: d.tienePiscina },
          { label: 'Parrilla', ok: d.tieneParrilla },
          { label: 'Fogón', ok: d.tieneFogon },
          { label: 'Jacuzzi', ok: d.tieneJacuzzi },
          { label: 'Estacionamiento', ok: d.tieneEstacionamiento },
          { label: 'WiFi', ok: d.tieneWifi },
          { label: 'Servicio de limpieza', ok: d.tieneServicioLimpieza },
          { label: 'Admite mascotas', ok: d.admiteMascotas },
          { label: 'Self check-in', ok: d.selfCheckin },
        ]} />
      </Sec>

      {(d.horarioCheckin || d.horarioCheckout || d.estanciaMinima) && (
        <Sec title="Política" color="#a78bfa">
          {d.estanciaMinima && <Row label="Estadía mínima" value={`${d.estanciaMinima} noches`} />}
          {d.horarioCheckin && <Row label="Check-in" value={d.horarioCheckin} />}
          {d.horarioCheckout && <Row label="Check-out" value={d.horarioCheckout} />}
        </Sec>
      )}

      {d.precioDesde && (
        <div style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '8px 12px' }}>
          <p style={{ fontSize: '9px', color: '#64748b', margin: '0 0 1px' }}>Precio desde</p>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#60a5fa', margin: 0 }}>{d.precioDesde}</p>
        </div>
      )}
    </div>
  )
}

// ── Servicio View ─────────────────────────────────────────────────────────────
function ServicioView({ socio }: { socio: Socio }) {
  const d = socio.servicioData
  if (!d) return null
  return (
    <div style={{ padding: '0 12px 20px' }}>
      {d.tiposServicio && (
        <div style={{ marginBottom: '14px', padding: '10px 12px', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '8px' }}>
          <p style={{ fontSize: '9px', color: '#f97316', margin: '0 0 2px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Servicios</p>
          <p style={{ fontSize: '13px', color: '#f1f5f9', margin: 0 }}>{d.tiposServicio}</p>
        </div>
      )}

      {d.especializacionMICE && (
        <div style={{ marginBottom: '14px', padding: '10px 12px', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '8px' }}>
          <p style={{ fontSize: '9px', color: '#60a5fa', margin: '0 0 2px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Especialización MICE</p>
          <p style={{ fontSize: '13px', color: '#f1f5f9', margin: 0 }}>{d.especializacionMICE}</p>
        </div>
      )}

      <Sec title="Capacidad operativa" color="#4ade80">
        {d.añosOperacion && <Row label="Años de operación" value={d.añosOperacion} />}
        {d.capacidadMaximaPax && <Row label="Capacidad máx." value={`${d.capacidadMaximaPax} pax`} />}
        {d.grupoMinimoRequerido && <Row label="Grupo mínimo" value={`${d.grupoMinimoRequerido} personas`} />}
        {d.cantidadGuias && <Row label="Guías / staff" value={d.cantidadGuias} />}
        {d.tieneFlota && d.descripcionFlota && <Row label="Flota" value={d.descripcionFlota} />}
      </Sec>

      <Sec title="Cobertura" color="#a78bfa">
        {d.coberturaGeografica && <Row label="Área de cobertura" value={d.coberturaGeografica} />}
        {d.idiomasServicio && <Row label="Idiomas" value={d.idiomasServicio} />}
        {d.certificaciones && <Row label="Certificaciones" value={d.certificaciones} />}
        <Row label="Seguro de responsabilidad" value={<OK v={d.tieneSeguroResponsabilidad} />} />
      </Sec>

      {d.modeloPrecio && <Sec title="Precios" color="#f97316">
        <Row label="Modelo" value={d.modeloPrecio} />
        {d.precioDesde && <Row label="Desde" value={d.precioDesde} />}
      </Sec>}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
function FichaPage() {
  const params = useSearchParams()
  const id = params.get('id')
  const vista = params.get('vista') ?? 'auto'
  const salonIdx = params.get('salon')  // índice o UUID del salon específico

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
      <div style={{ width: 26, height: 26, border: '2px solid #1e293b', borderTop: '2px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!socio) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px', background: 'transparent' }}>
      Socio no encontrado.
    </div>
  )

  // Determina qué sección mostrar
  const efectivaVista = vista === 'auto' ? socio.categoria : vista

  // Si es salon específico, filtramos
  const salonesAMostrar = (() => {
    if (!socio.salones?.length) return []
    if (salonIdx !== null) {
      const byUUID = socio.salones.find(s => s.id === salonIdx)
      if (byUUID) return [byUUID]
      const byIdx = socio.salones[parseInt(salonIdx)]
      if (byIdx) return [byIdx]
    }
    return socio.salones
  })()

  const showHeader = vista !== 'salon' || salonIdx === null

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', color: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>
      {showHeader && (
        <div style={{ background: 'rgba(13,18,37,0.92)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '12px 14px', marginBottom: '12px' }}>
          {socio.fotoPortada && (
            <img src={socio.fotoPortada} alt={socio.razonSocial}
              style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.08)' }} />
          )}
          <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f97316', margin: '0 0 3px' }}>
            {CATEGORIAS_LABEL[efectivaVista] ?? 'Ficha Técnica'}
          </p>
          <p style={{ fontWeight: 800, fontSize: '15px', color: '#f1f5f9', margin: 0 }}>{socio.razonSocial}</p>
          {socio.direccion && <p style={{ fontSize: '11px', color: '#475569', margin: '2px 0 0' }}>📍 {socio.direccion}</p>}
        </div>
      )}

      {/* Info general */}
      {socio.infoGeneral && efectivaVista !== 'salon' && (
        <div style={{ padding: '0 12px 4px' }}>
          <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>{socio.infoGeneral}</p>
        </div>
      )}

      {/* Vista seleccionada */}
      {(efectivaVista === 'hotel') && <HotelView socio={socio} />}
      {(efectivaVista === 'restaurante') && <RestauranteView socio={socio} />}
      {(efectivaVista === 'bodega') && <BodegaView socio={socio} />}
      {(efectivaVista === 'alojamiento') && <AlojamientoView socio={socio} />}
      {(efectivaVista === 'servicio') && <ServicioView socio={socio} />}
      {(efectivaVista === 'salon' || efectivaVista === 'auto') && salonesAMostrar.length > 0 && (
        <div style={{ padding: '0 12px 12px' }}>
          {efectivaVista === 'auto' && salonesAMostrar.length > 0 && (
            <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f97316', margin: '0 0 10px', padding: '0 0 0' }}>
              Salones de Eventos
            </p>
          )}
          {salonesAMostrar.map((s, i) => (
            <SalonCard key={s.id} salon={s} index={i} total={salonesAMostrar.length} />
          ))}
        </div>
      )}

      {/* Contacto */}
      {(socio.contacto?.whatsapp || socio.contacto?.email) && (
        <div style={{ padding: '0 12px 20px' }}>
          <div style={{ background: 'rgba(13,18,37,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '14px' }}>
            <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f97316', margin: '0 0 10px' }}>Contacto</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {socio.contacto.whatsapp && (
                <a href={`https://wa.me/${socio.contacto.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Quisiera consultar sobre ${socio.razonSocial}.`)}`}
                  target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '8px', padding: '10px 12px', color: '#4ade80', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  📱 Consultar por WhatsApp
                </a>
              )}
              {socio.contacto.email && (
                <a href={`mailto:${socio.contacto.email}?subject=Consulta ${socio.razonSocial}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '10px 12px', color: '#60a5fa', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  ✉️ Enviar email
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const CATEGORIAS_LABEL: Record<string, string> = {
  hotel: 'Hotel',
  restaurante: 'Restaurante',
  bodega: 'Bodega',
  alojamiento: 'Alojamiento',
  servicio: 'Proveedor de Servicios',
  salon: 'Salones de Eventos',
  otro: 'Ficha Técnica',
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
