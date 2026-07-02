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

export interface SalonIndividual {
  id: string                        // UUID local para gestión en lista
  nombre: string                    // "Salón Principal", "Salón VIP"
  tipo: TipoSalon

  // ── Capacidades por configuración de montaje (MICE standard) ──
  capacidadTeatro: number | null    // Sillas en filas, frente al escenario
  capacidadEscuela: number | null   // Mesas en filas con sillas
  capacidadBanquete: number | null  // Mesas redondas
  capacidadCoctel: number | null    // De pie, mesas altas
  capacidadImperial: number | null  // Mesa rectangular continua
  capacidadHerraduraU: number | null // Mesas en U
  capacidadDirectorio: number | null // Mesa ejecutiva rectangular

  // ── Espacio físico ──
  metrosCuadrados: number | null
  cantidadBanios: number | null
  luzNatural: boolean
  dividible: boolean                // ¿Se puede subdividir?
  pisoAlto: boolean                 // ¿Requiere ascensor?

  // ── Escenario ──
  tieneEscenario: boolean
  dimensionesEscenario: string      // "8m x 4m x 0.8m"

  // ── Tecnología y AV ──
  tieneProyector: boolean
  cantidadProyectores: number | null
  tienePantalla: boolean
  dimensionesPantalla: string       // "3m x 2m"
  tienePantallaLED: boolean
  tieneSonidoProfesional: boolean
  tieneMicrofono: boolean
  tiposMicrofono: string            // "Inalámbrico de mano, solapa, micrófono de pie"
  tieneStreaming: boolean
  tieneVideoconferencia: boolean
  tieneIluminacionEscenica: boolean
  tieneWifi: boolean
  velocidadWifi: string             // "100 Mbps simétrico"
  tienePizarron: boolean

  // ── Climatización ──
  tieneAireAcondicionado: boolean
  tieneCalefaccion: boolean

  // ── Catering ──
  tipoCatering: TipoCatering
  incluyeCoffeeBreak: boolean
  incluyeAlmuerzo: boolean
  incluyeCena: boolean

  // ── Accesos y servicios ──
  tieneEstacionamiento: boolean
  lugaresEstacionamiento: number | null
  tieneValet: boolean
  tieneGuardarropas: boolean
  tieneSalaVIP: boolean
  tieneAccesibilidad: boolean       // Acceso personas con movilidad reducida

  // ── Precio y observaciones ──
  precioDesde: string               // "Consultar", "Desde $500.000"
  observaciones: string
}

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
  salones?: SalonIndividual[]       // Múltiples salones por socio
  creadoEn: Timestamp
  actualizadoEn: Timestamp
}

export type SocioFormData = Omit<Socio, 'id' | 'creadoEn' | 'actualizadoEn'>

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
