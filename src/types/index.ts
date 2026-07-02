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

export interface Usuario {
  uid: string
  email: string
  nombre: string
  rol: Rol
  socioId?: string
  creadoEn: Timestamp
}

export interface SalonData {
  capacidadSentados: number | null
  capacidadCoctel: number | null
  capacidadPie: number | null
  metrosCuadrados: number | null
  cantidadBanios: number | null
  tieneEscenario: boolean
  dimensionesEscenario: string
  tieneMusica: boolean
  tieneLuces: boolean
  tieneSonido: boolean
  tieneProyector: boolean
  tienePantalla: boolean
  incluyeCatering: boolean
  tieneEstacionamiento: boolean
  tieneAccesibilidad: boolean
  cantidadSalones: number | null
  dividible: boolean
  observaciones: string
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
  salonData?: SalonData
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

export const ROLES: Record<Rol, string> = {
  el_faro: 'El Faro (Superadmin)',
  bureau: 'Bureau (Admin)',
  socio: 'Socio',
}

export const SALON_DATA_DEFAULT: SalonData = {
  capacidadSentados: null,
  capacidadCoctel: null,
  capacidadPie: null,
  metrosCuadrados: null,
  cantidadBanios: null,
  tieneEscenario: false,
  dimensionesEscenario: '',
  tieneMusica: false,
  tieneLuces: false,
  tieneSonido: false,
  tieneProyector: false,
  tienePantalla: false,
  incluyeCatering: false,
  tieneEstacionamiento: false,
  tieneAccesibilidad: false,
  cantidadSalones: null,
  dividible: false,
  observaciones: '',
}
