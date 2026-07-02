import { Timestamp } from 'firebase/firestore'

export type Rol = 'el_faro' | 'bureau' | 'socio'

export type CategoriaSocio =
  | 'bodega'
  | 'restaurante'
  | 'hotel'
  | 'alojamiento'
  | 'salon'
  | 'servicio'
  | 'otro'

export type TipoSalon =
  | 'banquetes'
  | 'conferencias'
  | 'multiusos'
  | 'auditorio'
  | 'gala'
  | 'exterior'
  | 'otro'

export type TipoCatering =
  | 'propio'
  | 'proveedor_exclusivo'
  | 'libre_eleccion'
  | 'no_incluye'

// ── Salon de Eventos ──────────────────────────────────────────────────────────
export interface SalonIndividual {
  id: string
  nombre: string
  tipo: TipoSalon

  capacidadTeatro: number | null
  capacidadEscuela: number | null
  capacidadBanquete: number | null
  capacidadCoctel: number | null
  capacidadImperial: number | null
  capacidadHerraduraU: number | null
  capacidadDirectorio: number | null

  metrosCuadrados: number | null
  cantidadBanios: number | null
  luzNatural: boolean
  dividible: boolean
  pisoAlto: boolean

  tieneEscenario: boolean
  dimensionesEscenario: string

  tieneProyector: boolean
  cantidadProyectores: number | null
  tienePantalla: boolean
  dimensionesPantalla: string
  tienePantallaLED: boolean
  tieneSonidoProfesional: boolean
  tieneMicrofono: boolean
  tiposMicrofono: string
  tieneStreaming: boolean
  tieneVideoconferencia: boolean
  tieneIluminacionEscenica: boolean
  tieneWifi: boolean
  velocidadWifi: string
  tienePizarron: boolean

  tieneAireAcondicionado: boolean
  tieneCalefaccion: boolean

  tipoCatering: TipoCatering
  incluyeCoffeeBreak: boolean
  incluyeAlmuerzo: boolean
  incluyeCena: boolean

  tieneEstacionamiento: boolean
  lugaresEstacionamiento: number | null
  tieneValet: boolean
  tieneGuardarropas: boolean
  tieneSalaVIP: boolean
  tieneAccesibilidad: boolean

  precioDesde: string
  observaciones: string
}

// ── Hotel ─────────────────────────────────────────────────────────────────────
export type CategoriaHotel = 'boutique' | 'resort' | 'business' | 'apart' | 'rural' | 'otro'
export type PlanAlojamiento = 'solo_habitacion' | 'desayuno' | 'media_pension' | 'pension_completa' | 'todo_incluido'

export interface HotelData {
  estrellas: number | null          // 1-5
  categoriaHotel: CategoriaHotel
  totalHabitaciones: number | null
  habitacionesSimples: number | null
  habitacionesDobles: number | null
  habitacionesSuites: number | null
  habitacionesJuniorSuite: number | null
  habitacionesAccesibles: number | null
  capacidadMaxima: number | null    // huéspedes totales

  // Servicios
  tienePool: boolean
  tieneGym: boolean
  tieneSpa: boolean
  tieneRestaurante: boolean
  tieneBar: boolean
  tieneCasino: boolean
  tieneBusinessCenter: boolean
  tieneEstacionamiento: boolean
  tieneTransferAeropuerto: boolean
  tieneWifi: boolean
  velocidadWifi: string
  tieneServicioHabitaciones: boolean
  tieneLavanderia: boolean
  admiteMascotas: boolean
  recepcion24h: boolean

  // Planes disponibles
  planSoloHabitacion: boolean
  planDesayuno: boolean
  planMediaPension: boolean
  planPensionCompleta: boolean
  planTodoIncluido: boolean

  checkIn: string
  checkOut: string
  idiomasAtencion: string
  certificaciones: string
  cadenaHotelera: string
  precioDesde: string
  observaciones: string
}

export const HOTEL_VACIO = (): HotelData => ({
  estrellas: null,
  categoriaHotel: 'otro',
  totalHabitaciones: null,
  habitacionesSimples: null,
  habitacionesDobles: null,
  habitacionesSuites: null,
  habitacionesJuniorSuite: null,
  habitacionesAccesibles: null,
  capacidadMaxima: null,
  tienePool: false,
  tieneGym: false,
  tieneSpa: false,
  tieneRestaurante: false,
  tieneBar: false,
  tieneCasino: false,
  tieneBusinessCenter: false,
  tieneEstacionamiento: false,
  tieneTransferAeropuerto: false,
  tieneWifi: false,
  velocidadWifi: '',
  tieneServicioHabitaciones: false,
  tieneLavanderia: false,
  admiteMascotas: false,
  recepcion24h: false,
  planSoloHabitacion: false,
  planDesayuno: false,
  planMediaPension: false,
  planPensionCompleta: false,
  planTodoIncluido: false,
  checkIn: '',
  checkOut: '',
  idiomasAtencion: '',
  certificaciones: '',
  cadenaHotelera: '',
  precioDesde: '',
  observaciones: '',
})

export const CATEGORIAS_HOTEL: Record<CategoriaHotel, string> = {
  boutique: 'Hotel Boutique',
  resort: 'Resort',
  business: 'Hotel de Negocios',
  apart: 'Apart Hotel',
  rural: 'Hotel Rural / Estancia',
  otro: 'Otro',
}

// ── Restaurante ───────────────────────────────────────────────────────────────
export type RangoPrecio = 'economico' | 'moderado' | 'premium' | 'exclusivo'

export interface RestauranteData {
  tipoCocina: string
  cubiertos: number | null
  cubiertosPrivado: number | null
  rangoPrecio: RangoPrecio

  // Experiencia MICE
  tieneMenuDegustacion: boolean
  tieneCartaVinos: boolean
  tieneSomelier: boolean
  tieneSalaPrivada: boolean
  tieneTerraza: boolean
  tieneMusicaEnVivo: boolean
  tieneEventosPrivados: boolean
  tieneBusinessLunch: boolean
  tieneBrunch: boolean

  // Dietas especiales
  opcionVegetariana: boolean
  opcionVegana: boolean
  opcionCeliaca: boolean
  opcionKosher: boolean
  opcionHalal: boolean

  // Operación
  horario: string
  diasCierre: string
  reservaRequerida: boolean
  grupoMinimoPersonas: number | null
  grupoMaximoPersonas: number | null
  idiomasAtencion: string
  tieneEstacionamiento: boolean
  tieneAccesibilidad: boolean
  observaciones: string
}

export const RESTAURANTE_VACIO = (): RestauranteData => ({
  tipoCocina: '',
  cubiertos: null,
  cubiertosPrivado: null,
  rangoPrecio: 'moderado',
  tieneMenuDegustacion: false,
  tieneCartaVinos: false,
  tieneSomelier: false,
  tieneSalaPrivada: false,
  tieneTerraza: false,
  tieneMusicaEnVivo: false,
  tieneEventosPrivados: false,
  tieneBusinessLunch: false,
  tieneBrunch: false,
  opcionVegetariana: false,
  opcionVegana: false,
  opcionCeliaca: false,
  opcionKosher: false,
  opcionHalal: false,
  horario: '',
  diasCierre: '',
  reservaRequerida: false,
  grupoMinimoPersonas: null,
  grupoMaximoPersonas: null,
  idiomasAtencion: '',
  tieneEstacionamiento: false,
  tieneAccesibilidad: false,
  observaciones: '',
})

export const RANGO_PRECIO: Record<RangoPrecio, string> = {
  economico: '$ Económico',
  moderado: '$$ Moderado',
  premium: '$$$ Premium',
  exclusivo: '$$$$ Exclusivo',
}

// ── Bodega ────────────────────────────────────────────────────────────────────
export type SubzonaMendoza =
  | 'lujan_de_cuyo'
  | 'valle_de_uco'
  | 'maipu'
  | 'san_martin'
  | 'rivadavia'
  | 'lavalle'
  | 'otro'

export interface BodegaData {
  añoFundacion: number | null
  hectareas: number | null
  produccionAnual: string           // "500.000 botellas/año"
  subzona: SubzonaMendoza
  varietalesPrincipales: string     // "Malbec, Cabernet Sauvignon, Torrontés"
  exporta: boolean
  mercadosExportacion: string
  certificacionesCalidad: string    // orgánico, biodinámico, HACCP...

  // Visitas y turismo
  tieneVisitasGuiadas: boolean
  idiomasVisita: string
  duracionVisita: string            // "2 horas"
  capacidadGrupoVisita: number | null
  requiereReserva: boolean
  tieneVisitaVendimia: boolean      // experiencia de cosecha

  // Experiencias MICE
  tieneSalaDeCata: boolean
  capacidadSalaCata: number | null
  tieneRestaurante: boolean
  cubiertosRestaurante: number | null
  tieneAlojamiento: boolean
  tieneTeamBuilding: boolean
  tieneEventosCorporativos: boolean

  precioVisitaDesde: string
  observaciones: string
}

export const BODEGA_VACIA = (): BodegaData => ({
  añoFundacion: null,
  hectareas: null,
  produccionAnual: '',
  subzona: 'lujan_de_cuyo',
  varietalesPrincipales: '',
  exporta: false,
  mercadosExportacion: '',
  certificacionesCalidad: '',
  tieneVisitasGuiadas: false,
  idiomasVisita: '',
  duracionVisita: '',
  capacidadGrupoVisita: null,
  requiereReserva: false,
  tieneVisitaVendimia: false,
  tieneSalaDeCata: false,
  capacidadSalaCata: null,
  tieneRestaurante: false,
  cubiertosRestaurante: null,
  tieneAlojamiento: false,
  tieneTeamBuilding: false,
  tieneEventosCorporativos: false,
  precioVisitaDesde: '',
  observaciones: '',
})

export const SUBZONAS_MENDOZA: Record<SubzonaMendoza, string> = {
  lujan_de_cuyo: 'Luján de Cuyo',
  valle_de_uco: 'Valle de Uco',
  maipu: 'Maipú',
  san_martin: 'San Martín',
  rivadavia: 'Rivadavia',
  lavalle: 'Lavalle',
  otro: 'Otra zona',
}

// ── Alojamiento ───────────────────────────────────────────────────────────────
export type TipoAlojamiento =
  | 'posada'
  | 'cabanas'
  | 'hostel'
  | 'apart'
  | 'glamping'
  | 'estancia'
  | 'lodge'
  | 'otro'

export interface AlojamientoData {
  tipoAlojamiento: TipoAlojamiento
  categoriaEquivalente: string      // "3 estrellas", "superior", etc.
  totalUnidades: number | null
  capacidadTotal: number | null

  // Tipos de unidades
  tieneHabitacionSimple: boolean
  tieneHabitacionDoble: boolean
  tieneCabañaSimple: boolean
  tieneCabañaFamiliar: boolean
  tieneSuiteEspecial: boolean
  tieneDormitorioCompartido: boolean

  // Servicios incluidos
  incluyeDesayuno: boolean
  tieneCocinaMinicocina: boolean
  tienePiscina: boolean
  tieneParrilla: boolean
  tieneFogon: boolean
  tieneJacuzzi: boolean
  tieneEstacionamiento: boolean
  tieneWifi: boolean
  tieneServicioLimpieza: boolean
  admiteMascotas: boolean
  selfCheckin: boolean

  // Política
  estanciaMinima: number | null
  horarioCheckin: string
  horarioCheckout: string
  idiomasAtencion: string
  precioDesde: string
  observaciones: string
}

export const ALOJAMIENTO_VACIO = (): AlojamientoData => ({
  tipoAlojamiento: 'otro',
  categoriaEquivalente: '',
  totalUnidades: null,
  capacidadTotal: null,
  tieneHabitacionSimple: false,
  tieneHabitacionDoble: false,
  tieneCabañaSimple: false,
  tieneCabañaFamiliar: false,
  tieneSuiteEspecial: false,
  tieneDormitorioCompartido: false,
  incluyeDesayuno: false,
  tieneCocinaMinicocina: false,
  tienePiscina: false,
  tieneParrilla: false,
  tieneFogon: false,
  tieneJacuzzi: false,
  tieneEstacionamiento: false,
  tieneWifi: false,
  tieneServicioLimpieza: false,
  admiteMascotas: false,
  selfCheckin: false,
  estanciaMinima: null,
  horarioCheckin: '',
  horarioCheckout: '',
  idiomasAtencion: '',
  precioDesde: '',
  observaciones: '',
})

export const TIPOS_ALOJAMIENTO: Record<TipoAlojamiento, string> = {
  posada: 'Posada / B&B',
  cabanas: 'Cabañas',
  hostel: 'Hostel',
  apart: 'Apart Hotel',
  glamping: 'Glamping',
  estancia: 'Estancia / Finca',
  lodge: 'Lodge / Ecolodge',
  otro: 'Otro',
}

// ── Servicio ──────────────────────────────────────────────────────────────────
export interface ServicioData {
  tiposServicio: string             // "Transfers, guías, producción de eventos"
  especializacionMICE: string       // "Incentivos, gala dinners, team building"
  añosOperacion: number | null

  // Capacidad operativa
  tieneFlota: boolean
  descripcionFlota: string          // "3 vans 8 pax, 1 bus 50 pax"
  capacidadMaximaPax: number | null
  grupoMinimoRequerido: number | null

  // Cobertura
  coberturaGeografica: string       // "Gran Mendoza, Valle de Uco, regional"
  idiomasServicio: string
  cantidadGuias: number | null

  // Certificaciones
  certificaciones: string           // habilitación municipal, IATA, seguros...
  tieneSeguroResponsabilidad: boolean

  // Comercial
  modeloPrecio: string              // "por persona", "tarifa plana", "a consultar"
  precioDesde: string
  observaciones: string
}

export const SERVICIO_VACIO = (): ServicioData => ({
  tiposServicio: '',
  especializacionMICE: '',
  añosOperacion: null,
  tieneFlota: false,
  descripcionFlota: '',
  capacidadMaximaPax: null,
  grupoMinimoRequerido: null,
  coberturaGeografica: '',
  idiomasServicio: '',
  cantidadGuias: null,
  certificaciones: '',
  tieneSeguroResponsabilidad: false,
  modeloPrecio: '',
  precioDesde: '',
  observaciones: '',
})

// ── Interfaces core ───────────────────────────────────────────────────────────
export interface Usuario {
  uid: string
  email: string
  nombre: string
  rol: Rol
  socioId?: string
  creadoEn: Timestamp
}

export interface Socio {
  id: string
  razonSocial: string
  etiqueta: string
  categoria: CategoriaSocio
  direccion: string
  contacto: {
    whatsapp: string
    email: string
    web: string
    redes: string
  }
  infoGeneral: string
  fotoPortada: string
  logoUrl: string
  activo: boolean
  ubicacionUrl: string
  urlInternaTour: string
  urlInternaVuelta: string
  urlDrive: string
  // Datos por categoría (solo se llena el correspondiente)
  salones?: SalonIndividual[]
  hotelData?: HotelData
  restauranteData?: RestauranteData
  bodegaData?: BodegaData
  alojamientoData?: AlojamientoData
  servicioData?: ServicioData
  creadoEn: Timestamp
  actualizadoEn: Timestamp
}

export type SocioFormData = Omit<Socio, 'id' | 'creadoEn' | 'actualizadoEn'>

// ── Lookup maps ───────────────────────────────────────────────────────────────
export const CATEGORIAS: Record<CategoriaSocio, string> = {
  bodega: 'Bodega',
  restaurante: 'Restaurante',
  hotel: 'Hotel',
  alojamiento: 'Alojamiento',
  salon: 'Salón de Eventos',
  servicio: 'Servicio',
  otro: 'Otro',
}

export const TIPOS_SALON: Record<TipoSalon, string> = {
  banquetes: 'Salón de Banquetes',
  conferencias: 'Sala de Conferencias',
  multiusos: 'Sala Multiusos',
  auditorio: 'Auditorio',
  gala: 'Salón de Gala',
  exterior: 'Espacio Exterior',
  otro: 'Otro',
}

export const TIPOS_CATERING: Record<TipoCatering, string> = {
  propio: 'Catering propio (in-house)',
  proveedor_exclusivo: 'Proveedor exclusivo',
  libre_eleccion: 'Libre elección de proveedor',
  no_incluye: 'No incluye catering',
}

export const ROLES: Record<Rol, string> = {
  el_faro: 'El Faro (Superadmin)',
  bureau: 'Bureau (Admin)',
  socio: 'Socio',
}

export const SALON_VACIO = (): SalonIndividual => ({
  id: crypto.randomUUID(),
  nombre: '',
  tipo: 'multiusos',
  capacidadTeatro: null,
  capacidadEscuela: null,
  capacidadBanquete: null,
  capacidadCoctel: null,
  capacidadImperial: null,
  capacidadHerraduraU: null,
  capacidadDirectorio: null,
  metrosCuadrados: null,
  cantidadBanios: null,
  luzNatural: false,
  dividible: false,
  pisoAlto: false,
  tieneEscenario: false,
  dimensionesEscenario: '',
  tieneProyector: false,
  cantidadProyectores: null,
  tienePantalla: false,
  dimensionesPantalla: '',
  tienePantallaLED: false,
  tieneSonidoProfesional: false,
  tieneMicrofono: false,
  tiposMicrofono: '',
  tieneStreaming: false,
  tieneVideoconferencia: false,
  tieneIluminacionEscenica: false,
  tieneWifi: false,
  velocidadWifi: '',
  tienePizarron: false,
  tieneAireAcondicionado: false,
  tieneCalefaccion: false,
  tipoCatering: 'no_incluye',
  incluyeCoffeeBreak: false,
  incluyeAlmuerzo: false,
  incluyeCena: false,
  tieneEstacionamiento: false,
  lugaresEstacionamiento: null,
  tieneValet: false,
  tieneGuardarropas: false,
  tieneSalaVIP: false,
  tieneAccesibilidad: false,
  precioDesde: '',
  observaciones: '',
})
