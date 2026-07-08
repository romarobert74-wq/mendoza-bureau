'use client'

import type {
  CategoriaSocio,
  HotelData, RestauranteData, BodegaData, AlojamientoData, ServicioData,
  CategoriaHotel, RangoPrecio, SubzonaMendoza, TipoAlojamiento,
} from '@/types'
import {
  CATEGORIAS_HOTEL, RANGO_PRECIO, SUBZONAS_MENDOZA, TIPOS_ALOJAMIENTO,
  HOTEL_VACIO, RESTAURANTE_VACIO, BODEGA_VACIA, ALOJAMIENTO_VACIO, SERVICIO_VACIO,
  SUBCATEGORIAS_SERVICIO,
} from '@/types'

// ── Shared helpers ────────────────────────────────────────────────────────────
const lbl = 'block text-xs font-semibold uppercase tracking-wide mb-1.5'
const lbl_c = { color: '#94a3b8' }

function Sec({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#f97316' }}>{title}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{sub}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

function Num({ label, value, onChange, placeholder }: { label: string; value: number | null; onChange: (v: number | null) => void; placeholder?: string }) {
  return (
    <div>
      <label className={lbl} style={lbl_c}>{label}</label>
      <input type="number" min={0} className="input" placeholder={placeholder ?? '0'}
        value={value ?? ''} onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))} />
    </div>
  )
}

function Txt({ label, value, onChange, placeholder, span2 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; span2?: boolean }) {
  return (
    <div className={span2 ? 'md:col-span-2' : ''}>
      <label className={lbl} style={lbl_c}>{label}</label>
      <input type="text" className="input" placeholder={placeholder ?? ''} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

const IDIOMAS_COMUNES = ['Español', 'Inglés', 'Portugués', 'Francés', 'Italiano', 'Alemán']

// Selector de idiomas: botones toggle + campo "Otros". El valor se guarda como
// string separado por comas (compatible con lo ya cargado).
function Idiomas({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const seleccionados = value.split(',').map(s => s.trim()).filter(Boolean)
  const otros = seleccionados.filter(s => !IDIOMAS_COMUNES.some(c => c.toLowerCase() === s.toLowerCase()))
  const otrosStr = otros.join(', ')

  const toggle = (idioma: string) => {
    const activo = seleccionados.some(s => s.toLowerCase() === idioma.toLowerCase())
    const base = seleccionados.filter(s => s.toLowerCase() !== idioma.toLowerCase())
    const nuevos = activo ? base : [...base, idioma]
    onChange(nuevos.join(', '))
  }

  const setOtros = (txt: string) => {
    const comunes = seleccionados.filter(s => IDIOMAS_COMUNES.some(c => c.toLowerCase() === s.toLowerCase()))
    const extras = txt.split(',').map(s => s.trim()).filter(Boolean)
    onChange([...comunes, ...extras].join(', '))
  }

  return (
    <div className="md:col-span-2">
      <label className={lbl} style={lbl_c}>{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {IDIOMAS_COMUNES.map(idioma => {
          const activo = seleccionados.some(s => s.toLowerCase() === idioma.toLowerCase())
          return (
            <button key={idioma} type="button" onClick={() => toggle(idioma)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition"
              style={activo
                ? { background: 'rgba(241,90,36,0.16)', color: '#ff7a45', border: '1px solid rgba(241,90,36,0.4)' }
                : { background: '#111827', color: '#94a3b8', border: '1px solid #1e293b' }}>
              {idioma}
            </button>
          )
        })}
      </div>
      <input type="text" className="input" placeholder="Otros idiomas (separados por coma)"
        value={otrosStr} onChange={e => setOtros(e.target.value)} />
    </div>
  )
}

function Sel<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: Record<T, string> }) {
  return (
    <div>
      <label className={lbl} style={lbl_c}>{label}</label>
      <select className="input" style={{ background: '#111827' }} value={value} onChange={e => onChange(e.target.value as T)}>
        {(Object.entries(options) as [T, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
    </div>
  )
}

function Chk({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 rounded accent-blue-500 cursor-pointer flex-shrink-0" />
      <span className="text-sm" style={{ color: '#94a3b8' }}>{label}</span>
    </label>
  )
}

function ChkGrid({ items }: { items: React.ReactNode[] }) {
  return <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">{items}</div>
}

function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="md:col-span-2">
      <label className={lbl} style={lbl_c}>{label}</label>
      <textarea className="input resize-none" rows={3} placeholder={placeholder ?? ''} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

// ── Hotel Editor ──────────────────────────────────────────────────────────────
export function HotelEditor({ data, onChange }: { data: HotelData; onChange: (d: HotelData) => void }) {
  const s = <K extends keyof HotelData>(k: K, v: HotelData[K]) => onChange({ ...data, [k]: v })

  return (
    <div className="space-y-6">
      <Sec title="Clasificación y habitaciones" sub="Tipo de hotel y composición de la planta">
        <div>
          <label className={lbl} style={lbl_c}>Estrellas</label>
          <div className="flex gap-2 mt-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} type="button" onClick={() => s('estrellas', n === data.estrellas ? null : n)}
                className="w-9 h-9 rounded-lg text-base font-bold transition-all"
                style={{
                  background: (data.estrellas ?? 0) >= n ? 'rgba(251,191,36,0.2)' : '#111827',
                  border: `1px solid ${(data.estrellas ?? 0) >= n ? '#fbbf24' : '#1e293b'}`,
                  color: (data.estrellas ?? 0) >= n ? '#fbbf24' : '#475569',
                }}>★</button>
            ))}
          </div>
        </div>
        <Sel label="Categoría" value={data.categoriaHotel} onChange={v => s('categoriaHotel', v as CategoriaHotel)} options={CATEGORIAS_HOTEL} />
        <Num label="Total habitaciones" value={data.totalHabitaciones} onChange={v => s('totalHabitaciones', v)} />
        <Num label="Capacidad máx. huéspedes" value={data.capacidadMaxima} onChange={v => s('capacidadMaxima', v)} />
        <Num label="Habitaciones simples" value={data.habitacionesSimples} onChange={v => s('habitacionesSimples', v)} />
        <Num label="Habitaciones dobles" value={data.habitacionesDobles} onChange={v => s('habitacionesDobles', v)} />
        <Num label="Junior Suites" value={data.habitacionesJuniorSuite} onChange={v => s('habitacionesJuniorSuite', v)} />
        <Num label="Suites" value={data.habitacionesSuites} onChange={v => s('habitacionesSuites', v)} />
        <Num label="Habitaciones accesibles" value={data.habitacionesAccesibles} onChange={v => s('habitacionesAccesibles', v)} />
        <Txt label="Cadena hotelera" value={data.cadenaHotelera} onChange={v => s('cadenaHotelera', v)} placeholder="Ej: Accor, Hyatt (o dejar vacío)" />
      </Sec>

      <Sec title="Servicios e instalaciones">
        <ChkGrid items={[
          <Chk key="pool" label="Piscina" value={data.tienePool} onChange={v => s('tienePool', v)} />,
          <Chk key="gym" label="Gimnasio" value={data.tieneGym} onChange={v => s('tieneGym', v)} />,
          <Chk key="spa" label="Spa" value={data.tieneSpa} onChange={v => s('tieneSpa', v)} />,
          <Chk key="rest" label="Restaurante propio" value={data.tieneRestaurante} onChange={v => s('tieneRestaurante', v)} />,
          <Chk key="bar" label="Bar / Lounge" value={data.tieneBar} onChange={v => s('tieneBar', v)} />,
          <Chk key="casino" label="Casino" value={data.tieneCasino} onChange={v => s('tieneCasino', v)} />,
          <Chk key="biz" label="Business Center" value={data.tieneBusinessCenter} onChange={v => s('tieneBusinessCenter', v)} />,
          <Chk key="park" label="Estacionamiento" value={data.tieneEstacionamiento} onChange={v => s('tieneEstacionamiento', v)} />,
          <Chk key="transfer" label="Transfer aeropuerto" value={data.tieneTransferAeropuerto} onChange={v => s('tieneTransferAeropuerto', v)} />,
          <Chk key="wifi" label="WiFi" value={data.tieneWifi} onChange={v => s('tieneWifi', v)} />,
          <Chk key="room" label="Servicio habitaciones" value={data.tieneServicioHabitaciones} onChange={v => s('tieneServicioHabitaciones', v)} />,
          <Chk key="lav" label="Lavandería" value={data.tieneLavanderia} onChange={v => s('tieneLavanderia', v)} />,
          <Chk key="pets" label="Admite mascotas" value={data.admiteMascotas} onChange={v => s('admiteMascotas', v)} />,
          <Chk key="24h" label="Recepción 24hs" value={data.recepcion24h} onChange={v => s('recepcion24h', v)} />,
        ]} />
        {data.tieneWifi && <Txt label="Velocidad WiFi" value={data.velocidadWifi} onChange={v => s('velocidadWifi', v)} placeholder="Ej: 100 Mbps simétrico" />}
      </Sec>

      <Sec title="Planes de alojamiento disponibles">
        <ChkGrid items={[
          <Chk key="ro" label="Solo habitación (Room Only)" value={data.planSoloHabitacion} onChange={v => s('planSoloHabitacion', v)} />,
          <Chk key="bb" label="Bed & Breakfast (con desayuno)" value={data.planDesayuno} onChange={v => s('planDesayuno', v)} />,
          <Chk key="hb" label="Media pensión (HB)" value={data.planMediaPension} onChange={v => s('planMediaPension', v)} />,
          <Chk key="fb" label="Pensión completa (FB)" value={data.planPensionCompleta} onChange={v => s('planPensionCompleta', v)} />,
          <Chk key="ai" label="Todo incluido (AI)" value={data.planTodoIncluido} onChange={v => s('planTodoIncluido', v)} />,
        ]} />
      </Sec>

      <Sec title="Operación y contacto">
        <Txt label="Check-in" value={data.checkIn} onChange={v => s('checkIn', v)} placeholder="Ej: 14:00 hs" />
        <Txt label="Check-out" value={data.checkOut} onChange={v => s('checkOut', v)} placeholder="Ej: 11:00 hs" />
        <Idiomas label="Idiomas de atención" value={data.idiomasAtencion} onChange={v => s('idiomasAtencion', v)} />
        <Txt label="Certificaciones / Sustentabilidad" value={data.certificaciones} onChange={v => s('certificaciones', v)} placeholder="ISO 14001, Green Globe..." span2 />
        <Txt label="Precio desde" value={data.precioDesde} onChange={v => s('precioDesde', v)} placeholder="Consultar / Desde $XXX" />
        <TextArea label="Observaciones" value={data.observaciones} onChange={v => s('observaciones', v)} placeholder="Información adicional relevante para grupos MICE..." />
      </Sec>
    </div>
  )
}

// ── Restaurante Editor ────────────────────────────────────────────────────────
export function RestauranteEditor({ data, onChange }: { data: RestauranteData; onChange: (d: RestauranteData) => void }) {
  const s = <K extends keyof RestauranteData>(k: K, v: RestauranteData[K]) => onChange({ ...data, [k]: v })

  return (
    <div className="space-y-6">
      <Sec title="Perfil gastronómico">
        <Txt label="Tipo de cocina" value={data.tipoCocina} onChange={v => s('tipoCocina', v)} placeholder="Ej: Argentina contemporánea, Mediterránea, fusión..." span2 />
        <Num label="Cubiertos (capacidad total)" value={data.cubiertos} onChange={v => s('cubiertos', v)} placeholder="120" />
        <Num label="Cubiertos sala privada" value={data.cubiertosPrivado} onChange={v => s('cubiertosPrivado', v)} placeholder="30" />
        <Sel label="Rango de precio" value={data.rangoPrecio} onChange={v => s('rangoPrecio', v as RangoPrecio)} options={RANGO_PRECIO} />
      </Sec>

      <Sec title="Experiencias MICE y eventos">
        <ChkGrid items={[
          <Chk key="md" label="Menú degustación" value={data.tieneMenuDegustacion} onChange={v => s('tieneMenuDegustacion', v)} />,
          <Chk key="cv" label="Carta de vinos" value={data.tieneCartaVinos} onChange={v => s('tieneCartaVinos', v)} />,
          <Chk key="som" label="Sommelier" value={data.tieneSomelier} onChange={v => s('tieneSomelier', v)} />,
          <Chk key="sp" label="Sala privada" value={data.tieneSalaPrivada} onChange={v => s('tieneSalaPrivada', v)} />,
          <Chk key="ter" label="Terraza exterior" value={data.tieneTerraza} onChange={v => s('tieneTerraza', v)} />,
          <Chk key="mus" label="Música en vivo" value={data.tieneMusicaEnVivo} onChange={v => s('tieneMusicaEnVivo', v)} />,
          <Chk key="ev" label="Eventos privados" value={data.tieneEventosPrivados} onChange={v => s('tieneEventosPrivados', v)} />,
          <Chk key="bl" label="Business Lunch" value={data.tieneBusinessLunch} onChange={v => s('tieneBusinessLunch', v)} />,
          <Chk key="br" label="Brunch" value={data.tieneBrunch} onChange={v => s('tieneBrunch', v)} />,
          <Chk key="park" label="Estacionamiento" value={data.tieneEstacionamiento} onChange={v => s('tieneEstacionamiento', v)} />,
          <Chk key="acc" label="Acceso movilidad reducida" value={data.tieneAccesibilidad} onChange={v => s('tieneAccesibilidad', v)} />,
        ]} />
      </Sec>

      <Sec title="Opciones dietarias">
        <ChkGrid items={[
          <Chk key="veg" label="Opción vegetariana" value={data.opcionVegetariana} onChange={v => s('opcionVegetariana', v)} />,
          <Chk key="vgn" label="Opción vegana" value={data.opcionVegana} onChange={v => s('opcionVegana', v)} />,
          <Chk key="cel" label="Sin TACC (celíaco)" value={data.opcionCeliaca} onChange={v => s('opcionCeliaca', v)} />,
          <Chk key="kos" label="Kosher" value={data.opcionKosher} onChange={v => s('opcionKosher', v)} />,
          <Chk key="hal" label="Halal" value={data.opcionHalal} onChange={v => s('opcionHalal', v)} />,
        ]} />
      </Sec>

      <Sec title="Operación y grupos">
        <Txt label="Horario" value={data.horario} onChange={v => s('horario', v)} placeholder="Ej: 12:00–15:00 / 20:00–24:00" />
        <Txt label="Días de cierre" value={data.diasCierre} onChange={v => s('diasCierre', v)} placeholder="Ej: Lunes" />
        <Num label="Grupo mínimo (personas)" value={data.grupoMinimoPersonas} onChange={v => s('grupoMinimoPersonas', v)} />
        <Num label="Grupo máximo (personas)" value={data.grupoMaximoPersonas} onChange={v => s('grupoMaximoPersonas', v)} />
        <Idiomas label="Idiomas de atención" value={data.idiomasAtencion} onChange={v => s('idiomasAtencion', v)} />
        <div className="md:col-span-2">
          <Chk label="Requiere reserva previa" value={data.reservaRequerida} onChange={v => s('reservaRequerida', v)} />
        </div>
        <TextArea label="Observaciones" value={data.observaciones} onChange={v => s('observaciones', v)} placeholder="Opciones de branding, decoración personalizada, menús a medida..." />
      </Sec>
    </div>
  )
}

// ── Bodega Editor ─────────────────────────────────────────────────────────────
export function BodegaEditor({ data, onChange }: { data: BodegaData; onChange: (d: BodegaData) => void }) {
  const s = <K extends keyof BodegaData>(k: K, v: BodegaData[K]) => onChange({ ...data, [k]: v })

  return (
    <div className="space-y-6">
      <Sec title="Perfil de la bodega">
        <Num label="Año de fundación" value={data.añoFundacion} onChange={v => s('añoFundacion', v)} placeholder="1902" />
        <Num label="Hectáreas de viñedo" value={data.hectareas} onChange={v => s('hectareas', v)} placeholder="120" />
        <Txt label="Producción anual" value={data.produccionAnual} onChange={v => s('produccionAnual', v)} placeholder="500.000 botellas/año" />
        <Sel label="Subzona de Mendoza" value={data.subzona} onChange={v => s('subzona', v as SubzonaMendoza)} options={SUBZONAS_MENDOZA} />
        <Txt label="Varietales principales" value={data.varietalesPrincipales} onChange={v => s('varietalesPrincipales', v)} placeholder="Malbec, Cabernet Sauvignon, Torrontés" span2 />
        <Txt label="Certificaciones" value={data.certificacionesCalidad} onChange={v => s('certificacionesCalidad', v)} placeholder="Orgánico, Biodinámico, HACCP..." span2 />
        <div className="md:col-span-2">
          <Chk label="Exporta a mercados internacionales" value={data.exporta} onChange={v => s('exporta', v)} />
        </div>
        {data.exporta && <Txt label="Mercados de exportación" value={data.mercadosExportacion} onChange={v => s('mercadosExportacion', v)} placeholder="EE.UU., Brasil, Europa, Asia" span2 />}
      </Sec>

      <Sec title="Turismo y visitas">
        <ChkGrid items={[
          <Chk key="vis" label="Visitas guiadas" value={data.tieneVisitasGuiadas} onChange={v => s('tieneVisitasGuiadas', v)} />,
          <Chk key="res" label="Requiere reserva previa" value={data.requiereReserva} onChange={v => s('requiereReserva', v)} />,
          <Chk key="vend" label="Experiencia vendimia / cosecha" value={data.tieneVisitaVendimia} onChange={v => s('tieneVisitaVendimia', v)} />,
        ]} />
        {data.tieneVisitasGuiadas && (
          <>
            <Idiomas label="Idiomas de visita" value={data.idiomasVisita} onChange={v => s('idiomasVisita', v)} />
            <Txt label="Duración estimada" value={data.duracionVisita} onChange={v => s('duracionVisita', v)} placeholder="2 horas" />
            <Num label="Capacidad máx. grupo" value={data.capacidadGrupoVisita} onChange={v => s('capacidadGrupoVisita', v)} placeholder="40" />
          </>
        )}
      </Sec>

      <Sec title="Experiencias MICE y corporativas">
        <ChkGrid items={[
          <Chk key="cata" label="Sala de cata" value={data.tieneSalaDeCata} onChange={v => s('tieneSalaDeCata', v)} />,
          <Chk key="rest" label="Restaurante propio" value={data.tieneRestaurante} onChange={v => s('tieneRestaurante', v)} />,
          <Chk key="aloj" label="Alojamiento en bodega" value={data.tieneAlojamiento} onChange={v => s('tieneAlojamiento', v)} />,
          <Chk key="tb" label="Team Building" value={data.tieneTeamBuilding} onChange={v => s('tieneTeamBuilding', v)} />,
          <Chk key="ev" label="Eventos corporativos" value={data.tieneEventosCorporativos} onChange={v => s('tieneEventosCorporativos', v)} />,
        ]} />
        {data.tieneSalaDeCata && <Num label="Capacidad sala de cata" value={data.capacidadSalaCata} onChange={v => s('capacidadSalaCata', v)} placeholder="30" />}
        {data.tieneRestaurante && <Num label="Cubiertos restaurante" value={data.cubiertosRestaurante} onChange={v => s('cubiertosRestaurante', v)} placeholder="80" />}
        <Txt label="Precio visita desde" value={data.precioVisitaDesde} onChange={v => s('precioVisitaDesde', v)} placeholder="Consultar / $X por persona" />
        <TextArea label="Observaciones" value={data.observaciones} onChange={v => s('observaciones', v)} placeholder="Paquetes especiales, grupos incentivos, maridaje, etc." />
      </Sec>
    </div>
  )
}

// ── Alojamiento Editor ────────────────────────────────────────────────────────
export function AlojamientoEditor({ data, onChange }: { data: AlojamientoData; onChange: (d: AlojamientoData) => void }) {
  const s = <K extends keyof AlojamientoData>(k: K, v: AlojamientoData[K]) => onChange({ ...data, [k]: v })

  return (
    <div className="space-y-6">
      <Sec title="Tipo y capacidad">
        <Sel label="Tipo de alojamiento" value={data.tipoAlojamiento} onChange={v => s('tipoAlojamiento', v as TipoAlojamiento)} options={TIPOS_ALOJAMIENTO} />
        <Txt label="Categoría / calificación" value={data.categoriaEquivalente} onChange={v => s('categoriaEquivalente', v)} placeholder="3 estrellas, Premium, Superior..." />
        <Num label="Total de unidades / habitaciones" value={data.totalUnidades} onChange={v => s('totalUnidades', v)} />
        <Num label="Capacidad máx. huéspedes" value={data.capacidadTotal} onChange={v => s('capacidadTotal', v)} />
      </Sec>

      <Sec title="Tipos de unidades disponibles">
        <ChkGrid items={[
          <Chk key="hs" label="Habitación simple" value={data.tieneHabitacionSimple} onChange={v => s('tieneHabitacionSimple', v)} />,
          <Chk key="hd" label="Habitación doble" value={data.tieneHabitacionDoble} onChange={v => s('tieneHabitacionDoble', v)} />,
          <Chk key="cs" label="Cabaña simple" value={data.tieneCabañaSimple} onChange={v => s('tieneCabañaSimple', v)} />,
          <Chk key="cf" label="Cabaña familiar" value={data.tieneCabañaFamiliar} onChange={v => s('tieneCabañaFamiliar', v)} />,
          <Chk key="su" label="Suite / Unidad especial" value={data.tieneSuiteEspecial} onChange={v => s('tieneSuiteEspecial', v)} />,
          <Chk key="dc" label="Dormitorio compartido" value={data.tieneDormitorioCompartido} onChange={v => s('tieneDormitorioCompartido', v)} />,
        ]} />
      </Sec>

      <Sec title="Servicios">
        <ChkGrid items={[
          <Chk key="des" label="Desayuno incluido" value={data.incluyeDesayuno} onChange={v => s('incluyeDesayuno', v)} />,
          <Chk key="coc" label="Cocina / Kitchenette" value={data.tieneCocinaMinicocina} onChange={v => s('tieneCocinaMinicocina', v)} />,
          <Chk key="pis" label="Piscina" value={data.tienePiscina} onChange={v => s('tienePiscina', v)} />,
          <Chk key="par" label="Parrilla" value={data.tieneParrilla} onChange={v => s('tieneParrilla', v)} />,
          <Chk key="fog" label="Fogón" value={data.tieneFogon} onChange={v => s('tieneFogon', v)} />,
          <Chk key="jac" label="Jacuzzi / Bañera de hidromasaje" value={data.tieneJacuzzi} onChange={v => s('tieneJacuzzi', v)} />,
          <Chk key="est" label="Estacionamiento" value={data.tieneEstacionamiento} onChange={v => s('tieneEstacionamiento', v)} />,
          <Chk key="wif" label="WiFi" value={data.tieneWifi} onChange={v => s('tieneWifi', v)} />,
          <Chk key="lim" label="Servicio de limpieza" value={data.tieneServicioLimpieza} onChange={v => s('tieneServicioLimpieza', v)} />,
          <Chk key="mas" label="Admite mascotas" value={data.admiteMascotas} onChange={v => s('admiteMascotas', v)} />,
          <Chk key="sci" label="Self check-in (sin recepción)" value={data.selfCheckin} onChange={v => s('selfCheckin', v)} />,
        ]} />
      </Sec>

      <Sec title="Política y precios">
        <Num label="Estadía mínima (noches)" value={data.estanciaMinima} onChange={v => s('estanciaMinima', v)} placeholder="2" />
        <Idiomas label="Idiomas de atención" value={data.idiomasAtencion} onChange={v => s('idiomasAtencion', v)} />
        <Txt label="Horario check-in" value={data.horarioCheckin} onChange={v => s('horarioCheckin', v)} placeholder="Ej: 14:00 hs" />
        <Txt label="Horario check-out" value={data.horarioCheckout} onChange={v => s('horarioCheckout', v)} placeholder="Ej: 10:00 hs" />
        <Txt label="Precio desde" value={data.precioDesde} onChange={v => s('precioDesde', v)} placeholder="Consultar / $X la noche" />
        <TextArea label="Observaciones" value={data.observaciones} onChange={v => s('observaciones', v)} placeholder="Descripción del entorno, atractivos cercanos, política de grupos..." />
      </Sec>
    </div>
  )
}

// ── Servicio Editor ───────────────────────────────────────────────────────────
export function ServicioEditor({ data, onChange }: { data: ServicioData; onChange: (d: ServicioData) => void }) {
  const s = <K extends keyof ServicioData>(k: K, v: ServicioData[K]) => onChange({ ...data, [k]: v })

  const subs = data.subcategorias ?? []
  const toggleSub = (sub: string) => {
    const activo = subs.includes(sub)
    s('subcategorias', activo ? subs.filter(x => x !== sub) : [...subs, sub])
  }
  const otrasSub = subs.filter(x => !SUBCATEGORIAS_SERVICIO.includes(x))
  const setOtrasSub = (txt: string) => {
    const predef = subs.filter(x => SUBCATEGORIAS_SERVICIO.includes(x))
    const extras = txt.split(',').map(x => x.trim()).filter(Boolean)
    s('subcategorias', [...predef, ...extras])
  }

  return (
    <div className="space-y-6">
      <Sec title="Rubros del servicio" sub="Seleccioná uno o más rubros que ofrecés">
        <div className="md:col-span-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {SUBCATEGORIAS_SERVICIO.map(sub => {
              const activo = subs.includes(sub)
              return (
                <button key={sub} type="button" onClick={() => toggleSub(sub)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition"
                  style={activo
                    ? { background: 'rgba(241,90,36,0.16)', color: '#ff7a45', border: '1px solid rgba(241,90,36,0.4)' }
                    : { background: '#111827', color: '#94a3b8', border: '1px solid #1e293b' }}>
                  {sub}
                </button>
              )
            })}
          </div>
          <input type="text" className="input" placeholder="Otros rubros (separados por coma)"
            value={otrasSub.join(', ')} onChange={e => setOtrasSub(e.target.value)} />
        </div>
      </Sec>

      <Sec title="Descripción del servicio">
        <Txt label="Tipos de servicio ofrecidos" value={data.tiposServicio} onChange={v => s('tiposServicio', v)} placeholder="Transfers, guías turísticos, producción de eventos, catering..." span2 />
        <Txt label="Especialización MICE" value={data.especializacionMICE} onChange={v => s('especializacionMICE', v)} placeholder="Incentivos, gala dinners, team building, product launches..." span2 />
        <Num label="Años de operación" value={data.añosOperacion} onChange={v => s('añosOperacion', v)} placeholder="15" />
      </Sec>

      <Sec title="Capacidad operativa">
        <ChkGrid items={[
          <Chk key="flota" label="Cuenta con flota propia" value={data.tieneFlota} onChange={v => s('tieneFlota', v)} />,
          <Chk key="seg" label="Seguro de responsabilidad civil" value={data.tieneSeguroResponsabilidad} onChange={v => s('tieneSeguroResponsabilidad', v)} />,
        ]} />
        {data.tieneFlota && <Txt label="Descripción de flota" value={data.descripcionFlota} onChange={v => s('descripcionFlota', v)} placeholder="3 vans 8 pax, 1 bus 50 pax..." span2 />}
        <Num label="Capacidad máx. pasajeros / pax" value={data.capacidadMaximaPax} onChange={v => s('capacidadMaximaPax', v)} placeholder="200" />
        <Num label="Grupo mínimo requerido" value={data.grupoMinimoRequerido} onChange={v => s('grupoMinimoRequerido', v)} placeholder="10" />
        <Num label="Cantidad de guías / staff" value={data.cantidadGuias} onChange={v => s('cantidadGuias', v)} placeholder="8" />
      </Sec>

      <Sec title="Cobertura y certificaciones">
        <Txt label="Cobertura geográfica" value={data.coberturaGeografica} onChange={v => s('coberturaGeografica', v)} placeholder="Gran Mendoza, Valle de Uco, regional, nacional" span2 />
        <Idiomas label="Idiomas de servicio" value={data.idiomasServicio} onChange={v => s('idiomasServicio', v)} />
        <Txt label="Certificaciones / Habilitaciones" value={data.certificaciones} onChange={v => s('certificaciones', v)} placeholder="Habilitación SECTUR, IATA, ISO..." />
      </Sec>

      <Sec title="Precios">
        <Txt label="Modelo de precio" value={data.modeloPrecio} onChange={v => s('modeloPrecio', v)} placeholder="Por persona / Tarifa plana / A consultar" />
        <Txt label="Precio desde" value={data.precioDesde} onChange={v => s('precioDesde', v)} placeholder="Consultar" />
        <TextArea label="Observaciones" value={data.observaciones} onChange={v => s('observaciones', v)} placeholder="Información adicional, condiciones especiales para grupos corporativos..." />
      </Sec>
    </div>
  )
}

// ── Category Router ───────────────────────────────────────────────────────────
interface CategoryEditorProps {
  categoria: CategoriaSocio
  hotelData: HotelData
  restauranteData: RestauranteData
  bodegaData: BodegaData
  alojamientoData: AlojamientoData
  servicioData: ServicioData
  onChange: (updates: {
    hotelData?: HotelData
    restauranteData?: RestauranteData
    bodegaData?: BodegaData
    alojamientoData?: AlojamientoData
    servicioData?: ServicioData
  }) => void
}

const CATEGORY_LABELS: Partial<Record<CategoriaSocio, { title: string; sub: string; emoji: string }>> = {
  hotel: { title: 'Datos del Hotel', sub: 'Completá la ficha técnica para el directorio y comparador', emoji: '🏨' },
  restaurante: { title: 'Datos del Restaurante', sub: 'Completá la ficha técnica para el directorio corporativo', emoji: '🍽️' },
  bodega: { title: 'Datos de la Bodega', sub: 'Completá la ficha técnica para el turismo MICE y comparador', emoji: '🍷' },
  alojamiento: { title: 'Datos del Alojamiento', sub: 'Completá la ficha técnica para el directorio', emoji: '🏡' },
  servicio: { title: 'Datos del Servicio', sub: 'Completá la ficha técnica del proveedor', emoji: '🚌' },
}

export function CategoryEditor({ categoria, hotelData, restauranteData, bodegaData, alojamientoData, servicioData, onChange }: CategoryEditorProps) {
  const meta = CATEGORY_LABELS[categoria]
  if (!meta) return null

  return (
    <section className="rounded-xl p-6 space-y-6" style={{ background: '#0d1225', border: '1px solid #1a2235' }}>
      <div>
        <p className="section-title">{meta.emoji} {meta.title}</p>
        <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{meta.sub}</p>
      </div>

      {categoria === 'hotel' && (
        <HotelEditor data={hotelData} onChange={d => onChange({ hotelData: d })} />
      )}
      {categoria === 'restaurante' && (
        <RestauranteEditor data={restauranteData} onChange={d => onChange({ restauranteData: d })} />
      )}
      {categoria === 'bodega' && (
        <BodegaEditor data={bodegaData} onChange={d => onChange({ bodegaData: d })} />
      )}
      {categoria === 'alojamiento' && (
        <AlojamientoEditor data={alojamientoData} onChange={d => onChange({ alojamientoData: d })} />
      )}
      {categoria === 'servicio' && (
        <ServicioEditor data={servicioData} onChange={d => onChange({ servicioData: d })} />
      )}
    </section>
  )
}
